import { Mongo } from 'meteor/mongo';
export interface Score {
  [key: string]: number | null;
}

export interface IComputedScore {
  score: number;
  nickname: string;
  playerId: string;
}

export interface IComputedGame {
  _id: number;
  sessionId: string;
  createdAt: Date;
  scores: IComputedScore[];
  rank: number;
  bestNumberKill: number;
  active: boolean;
}
export interface Game {
  _id: string;
  active: boolean;
  createdAt: Date;
  scores: Score[];
  sessionId?: number;
  rank?: number;
  bestNumberKill?: number;
}

export const Games = new Mongo.Collection<Game>('games');
/*Meteor.methods({
  insertResult(game: Game) {
    game.createdAt = new Date();
    Games.insert(game);
  },
});*/
