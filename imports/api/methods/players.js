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
      level: 0,
      totalKills: 0,
      avgKills: 0,
      gamesPlayed: 0,
      mmr: 0,
      avgKg15LastGames: 0,
      kg15LastGamesTrending: 0,
      avgKg: 0,
      kgTrending: 0,
      pourcentNextLevel: 0,
    });
  },

  deletePlayer(id) {
    Players.remove(id);
  },
});
console.log("Player methods registered");
