import { check } from "meteor/check";
import Games from "../collections/Games.js";
import Players from "../collections/Players.js";
import { computePlayerScoreFromBacklog, computeGames } from "../utils.js";

function updatePlayerScores() {
  // Fetch players

  const players = Players.find().fetch();

  // Fetch updated game backlog

  const games = Games.find().fetch();

  // Compute player scores from backlog

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    computePlayerScoreFromBacklog(player, games);
  }
}

Meteor.methods({
  createGame(scores) {
    const gameCreated = Games.insert({
      createdAt: new Date(),
      scores,
    });

    updatePlayerScores();
    computeGames();

    return gameCreated;
  },
  deleteGame(id) {
    Games.remove(id);
    updatePlayerScores();
    computeGames();
  },

  updateGameScore(gameId, playerId, score) {
    let newScore = parseInt(score);

    if (isNaN(newScore)) {
      newScore = null;
    }

    Games.update(gameId, {
      $set: {
        [`scores.${playerId}`]: newScore,
      },
    });
    updatePlayerScores();
    computeGames();
  },
});
console.log("Game methods registered");
