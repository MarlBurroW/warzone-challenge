import { Meteor } from 'meteor/meteor'
import { Players } from '../collections/Players'
Meteor.publish('players', function () {
  return Players.find()
})
