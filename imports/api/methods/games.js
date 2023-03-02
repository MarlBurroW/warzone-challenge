import { check } from "meteor/check";
import Game from "../collections/Games.js";
import Players from "../collections/Players.js";

Meteor.methods({
  createGame(scores) {
    const gameCreated = Game.insert({
      createdAt: new Date(),
      scores,
    });

    const players = Players.find().fetch();

    for (let i = 0; i < players.length; i++) {
      const player = players[i];

      if (scores.hasOwnProperty(player._id)) {
        playerKills = scores[player._id];

        // Constants

        const UPGRADE_FACTOR = 0.5;

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

        // Update player

        Players.update(player._id, {
          $set: {
            balance: newBalance,
            lastGameKills: newLastGameKills,
            requiredKills: newRequiredKills,
            requiredBalanceToUpgrade: newRequiredBalanceToUpgrade,
            level: newLevel,
          },
        });
      }
    }

    return gameCreated;
  },
  deleteGame(id) {
    Game.remove(id);
  },
});
console.log("Game methods registered");
