import { check } from "meteor/check";
import Players from "../collections/Players.js";

Meteor.methods({
  createPlayer(nickname) {
    check(nickname, String);

    return Players.insert({
      nickname,
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
      star:0,
    });
  },

  deletePlayer(id) {
    Players.remove(id);
  },
});
console.log("Player methods registered");
