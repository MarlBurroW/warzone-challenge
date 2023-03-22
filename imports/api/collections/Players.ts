import { Mongo } from 'meteor/mongo'

export interface Player {
  _id: string
  CurrentSessionTrending?: number
  active: boolean
  sessionId?: number
  avgKg15LastGames?: number
  avgKills15LastGames?: number
  balance?: number
  coefficientOfVariation?: number
  color?: string
  currentSessionAvgKg?: number
  currentSessionCoefficientOfVariation?: number
  gamesPlayed: number
  kg15LastGamesTrending?: number
  kgTrending?: number
  lastGameKills?: number
  lastMmr?: number
  level?: number
  mmr?: number
  nickname?: string
  pourcentNextLevel?: number
  standardDeviation?: number
  topPlayer: number
  totalKills: number
  currentSessionStandardDeviation?: number
  avgKg?: number
  createdAt: Date
  rank: number
  star?: number
}

export const Players = new Mongo.Collection<Player>('players')
/*Meteor.methods({
  insertResult(player: Player) {
    //player.date = new Date();
    Players.insert(player);
  },
});
*/
