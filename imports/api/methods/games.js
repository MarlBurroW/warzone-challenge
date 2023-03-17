import { check } from "meteor/check";
import Games from "../collections/Games.js";
import Players from "../collections/Players.js";
import { updatePlayerScores, computeGames } from "../utils.js";

Meteor.methods({
  createGame(scores, rank) {
    const gameCreated = Games.insert({
      createdAt: new Date(),
      active: true,
      scores,
      rank: rank,
    });

    computeGames();
    updatePlayerScores();
    return gameCreated;
  },
  deleteGame(id) {
    Games.remove(id);
    computeGames();
    updatePlayerScores();
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
    computeGames();
    updatePlayerScores();
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
    computeGames();
    updatePlayerScores();
  },

  updateGameActiveStatus(gameId, active) {
    Games.update(gameId, {
      $set: {
        active: active,
      },
    });
    computeGames();
    updatePlayerScores();
  },
  updateGamesActiveStatus(active) {
    Games.update(
      {}, //match all
      {
        $set: {
          active: active,
        },
      },
      {
        multi: true,
      }
    );
    computeGames();
    updatePlayerScores();
  },
});
console.log("Game methods registered");
