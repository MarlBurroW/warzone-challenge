import Games from "../api/collections/Games";
import Players from "../api/collections/Players";
import _ from "lodash";
import moment from "moment";

export default {

  data() {
    return {
      activeOnly: false,
    };
  },
  meteor: {
    $subscribe: {
      games: [],
      players: [],
    },
    activeGames() {
      return Games.find({ active: true });
    },
    games() {
      return Games.find({});
    },
    players() {
      return Players.find({});
    },
  },
  methods: {
    getPlayersColors(index = null){
      const playerColors = [
        "#0ea5e9",
        "#f87171",
        "#fbbf24",
        "#a3e635",
        "#10b981",
        "#6366f1",
        "#d946ef",
        "#f43f5e",
      ];
      if(index === null){
        return playerColors;
      }
      return playerColors[index];
    }
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

      const allGames = this.activeOnly ? this.activeGames : this.games;

      for (let i = 0; i < allGames.length; i++) {
        const game = allGames[i];

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
          bestNumberKill: null,
          active: game.active,
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

          // Find the best number of kills

          if (
            !computedGame.bestNumberKill ||
            computedGame.bestNumberKill < game.scores[player._id]
          ) {
            computedGame.bestNumberKill = game.scores[player._id];
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
