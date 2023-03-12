import Players from "./collections/Players.js";
import Games from "./collections/Games.js";
import moment from "moment";

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

    Games.update(game._id, {
      $set: {
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
        avgKg15LastGames: 0,
        kg15LastGamesTrending: 0,
        avgKg: 0,
        kgTrending: 0,
        pourcentNextLevel: 0,
        topPlayer: 0,
      },
    });

    return;
  }

  for (const game of games) {
    if (
      game.rank != null &&
      game.scores.hasOwnProperty(player._id) &&
      game.scores[player._id] !== null
    ) {
      const gameRank = Number(game.rank);
      gameRankList.push(gameRank);
      if (gameRank === 1) {
        bonus.push(4);
      } else if (gameRank === 2) {
        bonus.push(2);
      } else if (gameRank > 2 && gameRank <= 5) {
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
      // Calculate the trend (up/stable/down) of kills/games from the beginning*

      player.avgKg15LastGames = getAvgKg(playerKillList.slice(-15));
      player.kg15LastGamesTrending = getPlayerKGTrending(
        playerKillList.slice(-15)
      );

      player.avgKg = getAvgKg(playerKillList);
      player.kgTrending = getPlayerKGTrending(playerKillList);
    }
  }
  // calculate mmr
  if (player.gamesPlayed >= 5) {
    const averageBonus =
      bonus.reduce((x, y) => {
        return +x + +y;
      }, 0) / bonus.length;

    const recentAverageBonus =
      bonus.slice(-15).reduce((x, y) => {
        return +x + +y;
      }, 0) / 15;

    let ponderatedAverageBonus = (averageBonus + recentAverageBonus * 3) / 4;

    const totalGameRankAverage =
      gameRankList.reduce((x, y) => {
        return +x + +y;
      }, 0) / gameRankList.length;
    const recentGameRankAverage =
      gameRankList.slice(-15).reduce((x, y) => {
        return Number(x) + Number(y);
      }, 0) / 15;

    const recentPlayerKillAverage =
      playerKillList.slice(-15).reduce((x, y) => {
        return Number(x) + Number(y);
      }, 0) / 15;
    const ponderatedAverageRank =
      (totalGameRankAverage + recentGameRankAverage * 2) / 3;
    if (isNaN(ponderatedAverageBonus)) {
      ponderatedAverageBonus = 0;
    }
    const ponderatedPlayerKillAverage =
      (player.avgKg + recentPlayerKillAverage * 2) / 3 + ponderatedAverageBonus;

    player.lastMmr = player.mmr;
    player.mmr =
      (ponderatedPlayerKillAverage * 3 - ponderatedAverageRank + 100) * 10;
    player.level = getLeagueNumber(player.mmr);
    player.pourcentNextLevel = getPourcentNextLevel(player.mmr, player.level);
  } else {
    player.level = 0;
  }
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
      avgKg15LastGames: player.avgKg15LastGames,
      kg15LastGamesTrending: player.kg15LastGamesTrending,
      avgKg: player.avgKg,
      kgTrending: player.kgTrending,
      topPlayer: player.topPlayer,
    },
  });
};

export default {};

const getLeagueNumber = function (mmr) {
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

const getAvgKg = function (playerKillList) {
  let avgKg = 0;

  if (playerKillList.length > 0) {
    avgKg =
      playerKillList.reduce((x, y) => {
        return +x + +y;
      }, 0) / playerKillList.length;
  }

  return avgKg;
};
