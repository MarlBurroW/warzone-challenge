import { Document } from 'bson';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Players } from '../collections/Players';
import {
  updatePlayerScores,
  computeGames,
  assignPlayersColors,
} from '../utils';

Meteor.methods({
  createPlayer(nickname: string) {
    check(nickname, String);

    const player = Players.insert({
      createdAt: new Date(),
      rank: 0,
      nickname: nickname,
      lastGameKills: 0,
      level: 0,
      totalKills: 0,
      gamesPlayed: 0,
      lastMmr: 0,
      mmr: 0,
      currentSessionAvgKg: 0,
      CurrentSessionTrending: 0,
      avgKg: 0,
      kgTrending: 0,
      pourcentNextLevel: 0,
      topPlayer: 0,
      star: 0,
      active: true,
      color: '#000000',
      coefficientOfVariation: 0,
      currentSessionStandardDeviation: 0,
    });
    assignPlayersColors();

    return player;
  },

  deletePlayer(id: string | Mongo.ObjectID | Mongo.Selector<Document>) {
    Players.remove(id);
    assignPlayersColors();
  },
  updatePlayerActiveStatus(
    playerId: string | Mongo.ObjectID | Mongo.Selector<Document>,
    active: boolean
  ) {
    Players.update(playerId, {
      $set: {
        active: active,
      },
    });

    updatePlayerScores();
    computeGames();
  },
});
