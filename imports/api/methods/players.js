import { check } from "meteor/check";
import Players from "../collections/Players.js";

Meteor.methods({
  createPlayer(nickname) {
    check(nickname, String);

    return Players.insert({
      nickname,
      requiredKills: 1,
      requiredBalanceToUpgrade: 2,
      balance: 0,
      lastGameKills: 0,
      level: 1,
    });
  },

  deletePlayer(id) {
    Players.remove(id);
  },
});
console.log("Player methods registered");
