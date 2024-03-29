import { Games } from '../api/collections/Games'
import { Players, Player } from '../api/collections/Players'
import { ComponentOptionsMixin } from 'vue'
import _ from 'lodash'
import moment from 'moment'

export interface IDataMixin extends ComponentOptionsMixin {
  activeOnly: boolean
}
const dataMixin: IDataMixin = {
  activeOnly: false,
  meteor: {
    $subscribe: {
      games: [],
      players: [],
    },

    activePlayers() {
      return Players.find({ active: true })
    },
    activeGames() {
      return Games.find({ active: true })
    },
    games() {
      return Games.find({})
    },
    players() {
      return Players.find({})
    },
  },
  methods: {
    getRankIndicator(rank: number): string {
      switch (rank) {
        case 1:
          return '🥇'
        case 2:
          return '🥈'
        case 3:
          return '🥉'
        default:
          return ''
      }
    },
    getPlayerColorByPlayerId(playerId: string): string {
      const player = this.players.find((player: Player) => {
        return player._id === playerId
      })

      return player ? player.color : '#000000'
    },
  },
  computed: {
    groupedComputedGames() {
      const groupedGames = _.groupBy(this.computedGames, 'sessionId')

      const groupedGamesArray = []

      for (const key in groupedGames) {
        groupedGamesArray.push(groupedGames[key])
      }

      return groupedGamesArray
    },
    computedGames() {
      const games = []

      const allGames = this.activeOnly ? this.activeGames : this.games

      for (let i = 0; i < allGames.length; i++) {
        const game = allGames[i]

        const computedGame = {
          _id: game._id,
          sessionId: game.sessionId,
          scores: [],
          date:
            moment(game.createdAt).format('DD/MM HH:mm') +
            ' (' +
            moment(game.createdAt).fromNow() +
            ')',
          createdAt: game.createdAt,
          rank: game.rank,
          bestNumberKill: null,
          active: game.active,
        }

        for (let j = 0; j < this.players.length; j++) {
          const player = this.players[j]
          computedGame.scores.push({
            score: game.scores.hasOwnProperty(player._id)
              ? game.scores[player._id]
              : null,
            nickname: player.nickname,
            playerId: player._id,
          })

          // Find the best number of kills

          if (
            !computedGame.bestNumberKill ||
            computedGame.bestNumberKill < game.scores[player._id]
          ) {
            computedGame.bestNumberKill = game.scores[player._id]
          }
        }
        games.push(computedGame)
      }

      return games.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    },
  },
}

export default dataMixin
