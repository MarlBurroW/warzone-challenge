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
    updatePlayerScores();
    computeGames();
  },
});
console.log("Game methods registered");
