import { check } from "meteor/check";
import Games from "../collections/Games.js";
import Players from "../collections/Players.js";
import { computePlayerScoreFromBacklog, computeGames } from "../utils.js";

function updatePlayerScores() {
  // Fetch players

  const players = Players.find().fetch();

  // Fetch updated game backlog

  const games = Games.find({ active: true }).fetch();

  // Compute player scores from backlog

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    computePlayerScoreFromBacklog(player, games);
  }
}

Meteor.methods({
  createGame(scores, rank) {
    const gameCreated = Games.insert({
      createdAt: new Date(),
      active: true,
      scores,
      rank: null,
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

  updateGameRank(gameId, rank) {
    if (rank == 0) {
      rank = null;
    }
    Games.update(gameId, {
      $set: {
        rank: rank,
      },
    });
    updatePlayerScores();
    computeGames();
  },

  updateGameActiveStatus(gameId, active) {
    Games.update(gameId, {
      $set: {
        active: active,
      },
    });

    updatePlayerScores();
    computeGames();
  },
});
console.log("Game methods registered");
