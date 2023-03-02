import Players from "./collections/Players.js";
// Constants

const UPGRADE_FACTOR = 0.5;

export function computePlayerScoreFromBacklog(player, games) {
  // Order games by createdDate asc

  // Reset player attributes

  player.balance = 0;
  player.lastGameKills = 0;
  player.requiredKills = 1;
  player.requiredBalanceToUpgrade = 2;
  player.level = 1;

  games = games.sort((a, b) => {
    return a.createdDate - b.createdDate;
  });

  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    if (game.scores.hasOwnProperty(player._id)) {
      playerKills = game.scores[player._id];

      // Variables

      let newBalance = player.balance + playerKills - player.requiredKills;
      let newLastGameKills = playerKills;
      let newRequiredKills = player.requiredKills;
      let newRequiredBalanceToUpgrade = player.requiredBalanceToUpgrade;
      let newLevel = player.level;
      let levelChanged = false;

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

      if (newRequiredKills <= 2) {
        newLevel = 1;
      } else if (newRequiredKills <= 3) {
        newLevel = 2;
      } else if (newRequiredKills <= 4) {
        newLevel = 3;
      } else if (newRequiredKills <= 5) {
        newLevel = 4;
      } else if (newRequiredKills <= 6) {
        newLevel = 5;
      } else {
        newLevel = 6;
      }

      player.balance = newBalance;
      player.lastGameKills = newLastGameKills;
      player.requiredKills = newRequiredKills;
      player.requiredBalanceToUpgrade = newRequiredBalanceToUpgrade;
      player.level = newLevel;
    }
  }

  Players.update(player._id, {
    $set: {
      balance: player.balance,
      lastGameKills: player.lastGameKills,
      requiredKills: player.requiredKills,
      requiredBalanceToUpgrade: player.requiredBalanceToUpgrade,
      level: player.level,
    },
  });
}

export default {
  computePlayerScoreFromBacklog,
};
