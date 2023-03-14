import "./games";
import "./players";
import Games from "../collections/Games.js";
import Players from "../collections/Players.js";

Meteor.methods({
  importData(data) {
    checkImport(data);

    // Delete all players
    Players.remove({});

    // Delete all games
    Games.remove({});

    // Insert players
    data.players.forEach((player) => {
      Players.insert(player);
    });

    // Insert games
    data.games.forEach((game) => {
      Games.insert(game);
    });

    // Update player scores
    updatePlayerScores();

    // Compute games
    computeGames();

    // Assign players colors
    assignPlayersColors();
  },
  resetData() {
    // Delete all players
    Players.remove({});

    // Delete all games
    Games.remove({});

    // Assign players colors
    assignPlayersColors();
    computeGames();
    updatePlayerScores();
  },
});

function checkImport(data) {
  // Check if data is valid
  if (!data || !data.players || !data.games) {
    throw new Meteor.Error("Invalid data");
  }

  // Check if players are valid
  data.players.forEach((player) => {
    if (!player._id || !player.nickname) {
      throw new Meteor.Error("Invalid player");
    }
  });

  // Check if games are valid
  data.games.forEach((game) => {
    if (!game._id || !game.createdAt || !game.hasOwnProperty("scores")) {
      throw new Meteor.Error(`Game ${game._id} is invalid`);
    }
  });
}
