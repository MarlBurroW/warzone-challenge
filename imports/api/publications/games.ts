import { Meteor } from 'meteor/meteor';
import { Games } from '../collections/Games';
Meteor.publish('games', function () {
  return Games.find();
});
