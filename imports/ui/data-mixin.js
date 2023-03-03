import Games from "../api/collections/Games";
import Players from "../api/collections/Players";
import _ from "lodash";
import moment from "moment";

export default {
  meteor: {
    $subscribe: {
      games: [],
      players: [],
    },
    games() {
      return Games.find({});
    },
    players() {
      return Players.find({});
    },
  },

  computed: {
    groupedComputedGames() {
      // return computedGames grouped by sessionId in an array

      const groupedGames = _.groupBy(this.computedGames, "sessionId");

      const groupedGamesArray = [];

      for (let key in groupedGames) {
        groupedGamesArray.push(groupedGames[key]);
      }

      return groupedGamesArray;
    },
    computedGames() {
      const games = [];

      for (let i = 0; i < this.games.length; i++) {
        const game = this.games[i];

        const computedGame = {
          _id: game._id,
          sessionId: game.sessionId,
          scores: [],
          date:
            moment(game.createdAt).format("DD/MM HH:mm") +
            " (" +
            moment(game.createdAt).fromNow() +
            ")",
          createdAt: game.createdAt,
          rank: game.rank,
          bestPlayerId: null,
          worstPlayerId: null,
        };

        for (let j = 0; j < this.players.length; j++) {
          const player = this.players[j];
          computedGame.scores.push({
            score: game.scores.hasOwnProperty(player._id)
              ? game.scores[player._id]
              : null,
            nickname: player.nickname,
            playerId: player._id,
          });

          // Find the best player of the game by comparing all scores and add this id to the game object

          if (
            !computedGame.bestPlayerId ||
            game.scores[computedGame.bestPlayerId] < game.scores[player._id]
          ) {
            computedGame.bestPlayerId = player._id;
          }

          // Find the worst player of the game by comparing all scores and add this id to the game object

          if (
            !computedGame.worstPlayerId ||
            game.scores[computedGame.worstPlayerId] > game.scores[player._id]
          ) {
            computedGame.worstPlayerId = player._id;
          }
        }

        games.push(computedGame);
      }

      return games.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
  },
};
