import { check } from "meteor/check";
import Players from "../collections/Players.js";
import {
  updatePlayerScores,
  computeGames,
  assignPlayersColors,
} from "../utils.js";

Meteor.methods({
  createPlayer(nickname) {
    check(nickname, String);

    const player = Players.insert({
      nickname,
      lastGameKills: 0,
      level: 0,
      totalKills: 0,
      gamesPlayed: 0,
      lastMmr: 0,
      mmr: 0,
      avgKg15LastGames: 0,
      kg15LastGamesTrending: 0,
      avgKg: 0,
      kgTrending: 0,
      pourcentNextLevel: 0,
      topPlayer: 0,
      star: 0,
      active: true,
      color: "#000000",
    });
    assignPlayersColors();

    return player;
  },

  deletePlayer(id) {
    Players.remove(id);
    assignPlayersColors();
  },
  updatePlayerActiveStatus(playerId, active) {
    Players.update(playerId, {
      $set: {
        active: active,
      },
    });

    updatePlayerScores();
    computeGames();
  },
});
console.log("Player methods registered");
