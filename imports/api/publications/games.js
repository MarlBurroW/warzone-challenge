import Games from "../collections/Games.js";

Meteor.publish("games", function () {
  return Games.find();
});
