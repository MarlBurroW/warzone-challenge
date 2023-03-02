import Players from "../collections/Players.js";

Meteor.publish("players", function () {
  return Players.find();
});
