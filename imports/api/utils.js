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
  // Constants

  const UPGRADE_FACTOR = 0.5;

  // Order games by createdDate asc

  // Reset player attributes

  player.balance = 0;
  player.lastGameKills = 0;
  player.requiredKills = 1;
  player.requiredBalanceToUpgrade = 2;
  player.level = 0;
  player.totalKills = 0;
  player.avgKills = 0;
  player.gamesPlayed = 0;
  player.mrr = 0;

  // Sort games by createdDate asc to compute in the right order

  games = games.sort((a, b) => {
    return a.createdAt - b.createdAt;
  });

  // Iterate over games

  let gameRankList = [];
  let playerKillList = [];
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    if(game.rank != null){
      if(player._id in game.scores){
        gameRankList.push(game.rank);
      }
    }
    // Check if player has played in this game, and only compute score if so

    if (
      game.scores.hasOwnProperty(player._id) &&
      game.scores[player._id] !== null
    ) {
      let playerKills = game.scores[player._id];

      // Bonus
      let bonus = 0;
      if (game.rank == 1) {
        bonus = 3;
      } else if (game.rank == 2) {
        bonus = 2;
      } else if (game.rank == 3) {
        bonus = 1;
      } else if (game.rank > 10) {
        bonus = -3;
      }

      // Retreiving player data from previous iteration to work on it

      playerKills += bonus;
      playerKillList.push(playerKills);
      let newBalance = player.balance + playerKills - player.requiredKills;
      let newLastGameKills = playerKills;
      let newRequiredKills = player.requiredKills;
      let newRequiredBalanceToUpgrade = player.requiredBalanceToUpgrade;
      let newLevel = player.level;
      let levelChanged = false;

      // Update some player attributes directly

      player.gamesPlayed = player.gamesPlayed + 1;
      player.totalKills = player.totalKills + playerKills;
      if (player.gamesPlayed > 0) {
        player.avgKills = player.totalKills / player.gamesPlayed;
      } else {
        player.avgKills = 0;
      }


      // Check level up/down

      if (newBalance >= player.requiredBalanceToUpgrade) {
        // Goal reachded
        newRequiredKills = newRequiredKills + 1;
        levelChanged = true;
      } else if (newBalance <= -player.requiredBalanceToUpgrade) {
        newRequiredKills = newRequiredKills - 1;
        levelChanged = true;
      }

      // Limit minimum required kills to 1

      newRequiredKills = newRequiredKills < 1 ? 1 : newRequiredKills;

      // Compute required balance to upgrade

      if (levelChanged) {
        newRequiredBalanceToUpgrade =
          newRequiredKills + Math.ceil(newRequiredKills * UPGRADE_FACTOR);

        newBalance = 0;
      }

      // Limit minimum required balance to upgrade to 1

      newRequiredBalanceToUpgrade =
        newRequiredBalanceToUpgrade < 1 ? 1 : newRequiredBalanceToUpgrade;

      // Compute level

      if (newRequiredKills <= 1) {
        newLevel = 0;
      } else if (newRequiredKills <= 2) {
        newLevel = 1;
      } else if (newRequiredKills <= 3) {
        newLevel = 2;
      } else if (newRequiredKills <= 4) {
        newLevel = 3;
      } else if (newRequiredKills <= 5) {
        newLevel = 4;
      } else if (newRequiredKills <= 6) {
        newLevel = 5;
      } else if (newRequiredKills <= 7) {
        newLevel = 6;
      } else {
        newLevel = 7;
      }

      player.balance = newBalance;
      player.lastGameKills = newLastGameKills;
      player.requiredKills = newRequiredKills;
      player.requiredBalanceToUpgrade = newRequiredBalanceToUpgrade;
      player.level = newLevel;

    }
  }

  let totalGameRankAverage = gameRankList.reduce((x,y) => {
    return Number(x) + Number(y);
  }) / gameRankList.length;
  let recentGameRankAverage = gameRankList.slice(-15).reduce((x,y) => {
    return Number(x) + Number(y);
  } ) / 15;

  let recentPlayerKillAverage = playerKillList.slice(-15).reduce((x,y) => {
    return Number(x) + Number(y);
  }) / 15;
  let ponderatedAverageRank = (totalGameRankAverage + (recentGameRankAverage * 3)) / 4;
  let ponderatedPlayerKillAverage = (player.avgKills + (recentPlayerKillAverage * 3)) / 4;
  player.mmr = ((((ponderatedPlayerKillAverage * 3) - ponderatedAverageRank) + 100))* 10;

  Players.update(player._id, {
    $set: {
      balance: player.balance,
      lastGameKills: player.lastGameKills,
      requiredKills: player.requiredKills,
      requiredBalanceToUpgrade: player.requiredBalanceToUpgrade,
      level: player.level,
      gamesPlayed: player.gamesPlayed,
      totalKills: player.totalKills,
      avgKills: player.avgKills,
      mmr: player.mmr,
    },
  });
}

export default {
  computePlayerScoreFromBacklog,
};
