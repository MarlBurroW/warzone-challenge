import Players from "./collections/Players.js";
import Games from "./collections/Games.js";
import moment from "moment";

export { updatePlayerScores };

const updatePlayerScores = function () {
  // Fetch players
  const players = Players.find({ active: true }).fetch();
  // Fetch updated game backlog
  const games = Games.find({ active: true }).fetch();

  // Compute player scores from backlog

  for (const player of players) {
    computePlayerScoreFromBacklog(player, games);
  }
};

export const computeGames = function () {
  let games = Games.find().fetch();

  let sessionCounter = 1;

  // Sort games by createdDate asc to compute in the right order

  games = games.sort((a, b) => {
    return a.createdAt - b.createdAt;
  });

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    const currentGameDate = moment(game.createdAt);

    const previousGame = games[i - 1];

    if (previousGame) {
      const previousGameDate = moment(previousGame.createdAt);

      const diff = currentGameDate.diff(previousGameDate, "minutes");

      if (diff >= 60) {
        sessionCounter = sessionCounter + 1;
      }
    }

    // Ensure all kills are numbers, if string, cast to number

    for (let key in game.scores) {
      if (typeof game.scores[key] === "string") {
        game.scores[key] = parseInt(game.scores[key]);
      }
    }

    Games.update(game._id, {
      $set: {
        scores: game.scores,
        sessionId: sessionCounter,
      },
    });
  }
};

export const computePlayerScoreFromBacklog = function (player, games) {
  // Order games by createdDate asc

  // Reset player attributes

  player.balance = 0;
  player.lastGameKills = 0;
  player.requiredKills = 1;
  player.requiredBalanceToUpgrade = 2;
  player.level = 0;
  player.totalKills = 0;
  player.gamesPlayed = 0;
  player.mrr = 0;
  player.pourcentNextLevel = 0;
  player.topPlayer = 0;

  // Sort games by createdDate asc to compute in the right order

  games = games.sort((a, b) => {
    return a.createdAt - b.createdAt;
  });

  // Iterate over games

  const gameRankList = [];
  const playerKillList = [];
  const bonus = [];

  // Reset player attributes if no games

  if (games.length === 0) {
    Players.update(player._id, {
      $set: {
        lastGameKills: 0,
        level: 0,
        totalKills: 0,
        gamesPlayed: 0,
        mmr: 0,
        lastMmr: 0,
        currentSessionAvgKg: 0,
        CurrentSessionTrending: 0,
        avgKg: 0,
        kgTrending: 0,
        pourcentNextLevel: 0,
        topPlayer: 0,
        standardDeviation: 0,
        urrentSessionStandardDeviation: 0,
      },
    });

    return;
  }

  games.forEach((game, i) => {
    if (
      game.rank != null &&
      game.scores.hasOwnProperty(player._id) &&
      game.scores[player._id] !== null
    ) {
      const gameRank = Number(game.rank);
      gameRankList.push(gameRank);
      if (gameRank === 1) {
        bonus.push(5);
      } else if (gameRank === 2) {
        bonus.push(3);
      } else if (gameRank === 3) {
        bonus.push(2);
      } else if (gameRank > 3 && gameRank <= 5) {
        bonus.push(1);
      } else if (gameRank >= 12) {
        bonus.push(-1);
      }
    }
    // Check if player has played in this game, and only compute score if so

    if (
      game.scores.hasOwnProperty(player._id) &&
      game.scores[player._id] !== null
    ) {
      const arrScores = Object.values(game.scores);
      const maxScore = Math.max(...arrScores);
      if (game.scores[player._id] >= maxScore) {
        player.topPlayer++;
      }
      const playerKills = game.scores[player._id];

      // Retreiving player data from previous iteration to work on it

      playerKillList.push(playerKills);

      // Update some player attributes directly

      player.gamesPlayed = player.gamesPlayed + 1;
      player.totalKills = Number(player.totalKills) + Number(playerKills);
    }

    if (player.gamesPlayed >= 5) {
      if (i === games.length - 2) {
        player.lastMmr = calculateMmr(bonus, gameRankList, playerKillList);
      }
      if (i === games.length - 1) {
        player.mmr = calculateMmr(bonus, gameRankList, playerKillList);
      }
    } else {
      player.mmr = 0;
      player.lastMmr = 0;
    }
  });

  // calculate mmr

  player.level = getLeagueNumber(player.mmr);
  player.pourcentNextLevel = getPourcentNextLevel(player.mmr, player.level);

  const latestSessionGames = games.filter((game) => {
    return game.sessionId === games[games.length - 1].sessionId;
  });

  const playerCurrentSessionKillList = latestSessionGames.map((game) => {
    return game.scores[player._id];
  });

  // Calculate player statistics

  player.standardDeviation = getStandardDeviation(playerKillList);
  player.kgTrending = getPlayerKGTrending(playerKillList);
  player.avgKg = getAvg(playerKillList);

  player.currentSessionStandardDeviation = getStandardDeviation(
    playerCurrentSessionKillList
  );
  player.CurrentSessionTrending = getPlayerKGTrending(
    playerCurrentSessionKillList
  );
  player.currentSessionAvgKg = getAvg(playerCurrentSessionKillList);

  // Update player

  Players.update(player._id, {
    $set: {
      balance: player.balance,
      lastGameKills: player.lastGameKills,
      requiredKills: player.requiredKills,
      requiredBalanceToUpgrade: player.requiredBalanceToUpgrade,
      level: player.level,
      gamesPlayed: player.gamesPlayed,
      totalKills: player.totalKills,
      mmr: player.mmr,
      lastMmr: player.lastMmr,
      pourcentNextLevel: player.pourcentNextLevel,
      currentSessionAvgKg: player.currentSessionAvgKg,
      CurrentSessionTrending: player.CurrentSessionTrending,
      avgKg: player.avgKg,
      kgTrending: player.kgTrending,
      topPlayer: player.topPlayer,
      standardDeviation: player.standardDeviation,
      currentSessionStandardDeviation: player.currentSessionStandardDeviation,
    },
  });
};

export default {};

const calculateMmr = function (bonus, gameRankList, playerKillList) {
  const smoothingBonus = getAvg(bonus);
  const smoothingRecentBonus = smoothing(bonus.slice(-20));
  const WeightedBonus = (smoothingBonus + smoothingRecentBonus * 3) / 4;

  const smoothingGameRankAverage = getAvg(gameRankList);
  const smoothingRecentGameAverage = smoothing(gameRankList.slice(-20));
  const WeightedGameRank =
    (smoothingGameRankAverage + smoothingRecentGameAverage * 3) / 4;

  const smoothingPlayerKill = getAvg(playerKillList);
  const smoothingRecentPlayerKill = smoothing(playerKillList.slice(-20));
  const WeightedPlayerKill =
    (smoothingPlayerKill + smoothingRecentPlayerKill * 3) / 4;

  const WeightedPlayerKillAndBonus = WeightedPlayerKill + WeightedBonus;

  return Math.round(
    (WeightedPlayerKillAndBonus * 3 - WeightedGameRank + 100) * 10
  );
};

const smoothing = function (param) {
  const result = [];
  if (Array.isArray(param)) {
    param.forEach((element, i) => {
      let index = 0;
      while (index < i + 1) {
        result.push(element);
        index++;
      }
    });
    return getAvg(result);
  } else {
    return [];
  }
};

const getLeagueNumber = function (mmr) {
  if (mmr === 0) {
    return 0;
  }
  switch (true) {
    case mmr < 950:
      return 1;
    case mmr < 965:
      return 2;
    case mmr < 980:
      return 3;
    case mmr < 995:
      return 4;
    case mmr < 1010:
      return 5;
    case mmr < 1025:
      return 6;
    case mmr < 1040:
      return 7;
    case mmr < 1055:
      return 8;
    case mmr < 1070:
      return 9;
    case mmr < 1085:
      return 10;
    case mmr < 1100:
      return 11;
    case mmr < 1115:
      return 12;
    case mmr < 1130:
      return 13;
    case mmr < 1145:
      return 14;
    case mmr < 1160:
      return 15;
    case mmr < 1175:
      return 16;
    case mmr < 1190:
      return 17;
    case mmr < 1205:
      return 18;
    case mmr < 1220:
      return 19;
    case mmr >= 1235:
      return 20;
    default:
      return 0;
  }
};

const getPourcentNextLevel = function (mmr, level) {
  if (level >= 19) {
    return 100;
  }
  let test = false;
  let increment = 0;
  if (mmr && level) {
    while (!test) {
      if (getLeagueNumber(mmr + increment) !== level) {
        test = true;
      } else {
        increment++;
      }
    }
    if (level === 19) {
      return Math.trunc((30 - increment) * 100) / 30;
    } else {
      return Math.trunc((15 - increment) * 100) / 15;
    }
  }
  return 0;
};

const getPlayerKGTrending = function (playerKillList) {
  let kgTrending = 0;

  if (playerKillList.length > 1) {
    // Compute the trend of kills/games

    let kgTrend = 0;

    for (let i = 0; i < playerKillList.length - 1; i++) {
      kgTrend = kgTrend + playerKillList[i + 1] - playerKillList[i];

      if (kgTrend > 0) {
        kgTrending = 1;
      } else if (kgTrend < 0) {
        kgTrending = -1;
      } else {
        kgTrending = 0;
      }
    }
  }
  return kgTrending;
};

const getAvg = function (param) {
  if (Array.isArray(param) && param.length > 0) {
    return (
      param.reduce((x, y) => {
        return Number(x) + Number(y);
      }, 0) / param.length
    );
  } else {
    return 0;
  }
};

export function assignPlayersColors() {
  const playerColors = [
    "#0ea5e9",
    "#f87171",
    "#fbbf24",
    "#a3e635",
    "#10b981",
    "#6366f1",
    "#d946ef",
    "#f43f5e",
  ];

  const players = Players.find().fetch();

  players.forEach((player, index) => {
    Players.update(player._id, {
      $set: {
        color: playerColors[index],
      },
    });
  });
}

function getStandardDeviation(array) {
  const n = array.length;
  const mean = array.reduce((acc, val) => acc + val, 0) / n;
  const variance =
    array.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (n - 1);
  const standardDeviation = Math.sqrt(variance);
  return standardDeviation;
}
