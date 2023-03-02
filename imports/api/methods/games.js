import { check } from "meteor/check";
import Game from "../collections/Games.js";
import Players from "../collections/Players.js";
import { computePlayerScoreFromBacklog } from "../utils.js";

function updatePlayerScores() {
  // Fetch players

  const players = Players.find().fetch();

  // Fetch updated game backlog

  const games = Game.find().fetch();

  // Compute player scores from backlog

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    computePlayerScoreFromBacklog(player, games);
  }
}

Meteor.methods({
  createGame(scores) {
    const gameCreated = Game.insert({
      createdAt: new Date(),
      scores,
    });

    updatePlayerScores();

    return gameCreated;
  },
  deleteGame(id) {
    Game.remove(id);
    updatePlayerScores();
  },
});
console.log("Game methods registered");
