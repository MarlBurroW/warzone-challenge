import { Games, IComputedGame, IComputedScore } from '../api/collections/Games';
import { Players, Player } from '../api/collections/Players';
import { ComponentOptionsMixin } from 'vue';
import _, { toArray } from 'lodash';

export interface IDataMixin extends ComponentOptionsMixin {
  activeOnly: boolean;
}
const dataMixin: IDataMixin = {
  activeOnly: false,
  meteor: {
    $subscribe: {
      games: [],
      players: [],
    },

    activePlayers() {
      return Players.find({ active: true });
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
    getRankIndicator(rank: number): string {
      switch (rank) {
        case 1:
          return '🥇';
        case 2:
          return '🥈';
        case 3:
          return '🥉';
        default:
          return '';
      }
    },
    getPlayerColorByPlayerId(playerId: string): string {
      const player = this.players.find((player: { _id: string }) => {
        return player._id === playerId;
      });

      return player ? player.color : '#000000';
    },
  },
  computed: {
    groupedComputedGames(): { [sessionId: string]: IComputedGame[] } {
      // return computedGames grouped by sessionId in an array
      return _.groupBy(this.computedGames, 'sessionId');
    },
    computedGames() {
      const games: IComputedGame[] = [];

      const allGames = this.activeOnly ? this.activeGames : this.games;
      for (let i = 0; i < allGames.length; i++) {
        const game = allGames[i];
        const computedGame: IComputedGame = {
          _id: game._id,
          sessionId: game.sessionId,
          createdAt: game.createdAt,
          scores: [] as IComputedScore[],
          rank: game.rank,
          bestNumberKill: 0,
          active: game.active,
        };
        for (let j = 0; j < this.players.length; j++) {
          const player = this.players[j];

          const score: IComputedScore = {
            score: Object.prototype.hasOwnProperty.call(game.scores, player._id)
              ? game.scores[player._id]
              : null,
            nickname: player.nickname,
            playerId: player._id,
          };
          computedGame.scores.push(score);

          // Find the best number of kills
          // TODO: find a better way to do this
          /* if (
            !computedGame.bestNumberKill ||
            computedGame.bestNumberKill < game.scores[player._id]
          ) {
            computedGame.bestNumberKill = game.scores[player._id];
          }*/
        }

        games.push(computedGame);
      }

      return games.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    },
  },
};

export default dataMixin;
