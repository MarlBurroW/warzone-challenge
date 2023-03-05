import Players from "./collections/Players.js";
import Games from "./collections/Games.js";
import moment from "moment";

export function computeGames() {
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
}

export function computePlayerScoreFromBacklog(player, games) {
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

  let gameRankList = [];
  let playerKillList = [];
  let bonus = [];

  // Reset player attributes if no games

  if (games.length == 0) {
    Players.update(player._id, {
      $set: {
        lastGameKills: 0,
        level: 0,
        totalKills: 0,
        gamesPlayed: 0,
        mmr: 0,
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

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    if (game.rank != null) {
      if (
        game.scores.hasOwnProperty(player._id) &&
        game.scores[player._id] !== null
      ) {
        gameRankList.push(game.rank);
        // set bonus
        if (game.rank == 1) {
          bonus.push(4);
        } else if (game.rank == 2) {
          bonus.push(2);
        } else if (game.rank == 3) {
          bonus.push(1);
        } else if (game.rank > 10) {
          bonus.push(-1);
        }
      }
    }

    // Check if player has played in this game, and only compute score if so

    if (
      game.scores.hasOwnProperty(player._id) &&
      game.scores[player._id] !== null
    ) {
      let arrScores = Object.values(game.scores);
      let maxScore = Math.max(...arrScores);
      if (game.scores[player._id] >= maxScore) {
        if (player.topPlayer) {
          player.topPlayer++;
        } else {
          player.topPlayer = 1;
        }
      }
      let playerKills = game.scores[player._id];

      // Retreiving player data from previous iteration to work on it

      playerKillList.push(playerKills);

      // Update some player attributes directly

      player.gamesPlayed = player.gamesPlayed + 1;
      player.totalKills = player.totalKills + playerKills;

      // Calculate the trend (up/stable/down) of kills/games from the beginning*

      player.avgKg15LastGames = getAvgKg(playerKillList.slice(-15));
      player.kg15LastGamesTrending = getPlayerKGTrending(
        playerKillList.slice(-15)
      );

      player.avgKg = getAvgKg(playerKillList);
      player.kgTrending = getPlayerKGTrending(playerKillList);
    }
    // Bonus
  }

  let averageBonus =
    bonus.reduce((x, y) => {
      return Number(x) + Number(y);
    }, 0) / bonus.length;

  let recentAverageBonus =
    bonus.slice(-15).reduce((x, y) => {
      return Number(x) + Number(y);
    }, 0) / 15;

  let ponderatedAverageBonus = (averageBonus + recentAverageBonus * 3) / 4;

  let totalGameRankAverage =
    gameRankList.reduce((x, y) => {
      return Number(x) + Number(y);
    }, 0) / gameRankList.length;
  let recentGameRankAverage =
    gameRankList.slice(-15).reduce((x, y) => {
      return Number(x) + Number(y);
    }, 0) / 15;

  let recentPlayerKillAverage =
    playerKillList.slice(-15).reduce((x, y) => {
      return Number(x) + Number(y);
    }, 0) / 15;
  let ponderatedAverageRank =
    (totalGameRankAverage + recentGameRankAverage * 3) / 4;
  let ponderatedPlayerKillAverage =
    (player.avgKg + recentPlayerKillAverage * 3) / 4 + ponderatedAverageBonus;
  player.mmr =
    (ponderatedPlayerKillAverage * 3 - ponderatedAverageRank + 100) * 10;
  player.level = getLeagueNumber(player.mmr);
  player.pourcentNextLevel = getPourcentNextLevel(player.mmr, player.level);
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
      pourcentNextLevel: player.pourcentNextLevel,
      avgKg15LastGames: player.avgKg15LastGames,
      kg15LastGamesTrending: player.kg15LastGamesTrending,
      avgKg: player.avgKg,
      kgTrending: player.kgTrending,
      topPlayer: player.topPlayer,
    },
  });
}

export default {
  computePlayerScoreFromBacklog,
};

function getLeagueNumber(mmr) {
  if (mmr < 950) return 0;
  if (mmr < 965) return 1;
  if (mmr < 980) return 2;
  if (mmr < 995) return 3;
  if (mmr < 1010) return 4;
  if (mmr < 1025) return 5;
  if (mmr < 1040) return 6;
  if (mmr < 1055) return 7;
  if (mmr < 1070) return 8;
  if (mmr < 1085) return 9;
  if (mmr < 1100) return 10;
  if (mmr < 1115) return 11;
  if (mmr < 1130) return 12;
  if (mmr < 1145) return 13;
  if (mmr < 1160) return 14;
  if (mmr < 1175) return 15;
  if (mmr < 1190) return 16;
  if (mmr < 1205) return 17;
  if (mmr < 1235) return 18;
  if (mmr >= 1235) return 19;
}

function getPourcentNextLevel(mmr, level) {
  if (level >= 19) return 100;
  let l = level;
  let test = false;
  let increment = 0;
  if (mmr && level) {
    while (!test) {
      if (getLeagueNumber(mmr + increment) != level) {
        test = true;
      } else {
        increment++;
      }
    }
    if (level == 18) {
      return Math.trunc((30 - increment) * 100) / 30;
    } else {
      return Math.trunc((15 - increment) * 100) / 15;
    }
  }
  return 0;
}

function getPlayerKGTrending(playerKillList) {
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
}

function getAvgKg(playerKillList) {
  let avgKg = 0;

  if (playerKillList.length > 0) {
    avgKg =
      playerKillList.reduce((x, y) => {
        return Number(x) + Number(y);
      }, 0) / playerKillList.length;
  } else {
    avgKg = 0;
  }

  return avgKg;
}
