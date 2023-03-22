import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Game, Games, Score } from '../collections/Games'
import { updatePlayerScores, computeGames } from '../utils'

Meteor.methods({
  createGame(scores: Score[], rank: number) {
    const gameCreated = Games.insert({
      createdAt: new Date(),
      active: true,
      scores,
      rank: rank,
    })
    computeGames()
    updatePlayerScores()

    return gameCreated
  },
  deleteGame(id: string | Mongo.ObjectID | Mongo.Selector<Game>) {
    Games.remove(id)
    computeGames()
    updatePlayerScores()
  },

  updateGameScore(
    gameId: string | Mongo.ObjectID | Mongo.Selector<Game>,
    playerId: string,
    score: string
  ) {
    const newScore: number = parseInt(score)

    Games.update(gameId, {
      $set: {
        [`scores.${playerId}`]: newScore,
      },
    })
    computeGames()
    updatePlayerScores()
  },

  updateGameRank(
    gameId: string | Mongo.ObjectID | Mongo.Selector<Game>,
    rank: number | undefined
  ) {
    if (rank == 0) {
      rank = undefined
    }
    Games.update(gameId, {
      $set: {
        rank: rank,
      },
    })
    computeGames()
    updatePlayerScores()
  },

  updateGameActiveStatus(
    gameId: string | Mongo.ObjectID | Mongo.Selector<Game>,
    active: boolean
  ) {
    Games.update(gameId, {
      $set: {
        active: active,
      },
    })
    computeGames()
    updatePlayerScores()
  },
  updateGamesActiveStatus(active: boolean) {
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
    )
    computeGames()
    updatePlayerScores()
  },
})
