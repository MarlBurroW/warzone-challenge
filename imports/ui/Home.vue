<template>
  <div class="bg-blue-300 p-5 rounded-md">
    <h1 class="text-center mb-10 text-5xl font-bold text-white">
      WARZONE CHALLENGE
    </h1>

    <div class="bg-blue-200 p-5 rounded-md mb-5">
      <h1 class="font-bold text-xl mb-5">Players</h1>

      <div class="flex w-full justify-center">
        <div
          key="player._id"
          v-for="player in players"
          class="bg-blue-300 p-2 m-2 mb-10 rounded-md flex flex-col text-center justify-between text-white px-12 py-10"
        >
          <span class="text-3xl mb-3 font-black">{{ player.nickname }}</span>

          <div class="flex flex-col mb-5">
            <span class="mb-4">Current balance</span>
            <div class="flex justify-center items-center">
              <span
                :class="`text-9xl font-black mr-5 ${
                  player.balance < 0 ? 'text-red-500' : 'text-green-300'
                }`"
                >{{ player.balance }}</span
              >
              <div class="w-[100px]">
                <img :src="getLevelLogo(player.level)" />
              </div>
            </div>
          </div>
          <div class="flex gap-2 mb-5 w-full">
            <div class="flex flex-col bg-orange-400 p-2 rounded-lg flex-1">
              <span>Required kills per game</span>

              <span class="text-4xl font-bold">{{ player.requiredKills }}</span>
            </div>

            <div class="flex flex-col bg-pink-400 p-2 rounded-lg flex-1">
              <span>Required balance to levelup</span>

              <span class="text-4xl font-bold">{{
                player.requiredBalanceToUpgrade
              }}</span>
            </div>
          </div>
          <!-- <div class="flex flex-col">
            <span>Last game kills</span>

            <span class="text-2xl font-bold">{{ player.lastGameKills }}</span>
          </div> -->
          <div
            class="lex flex-col bg-purple-400 p-2 rounded-lg flex-col flex mb-5"
          >
            <span
              >Game played:
              <strong>{{ stats[player._id]?.totalGames }}</strong></span
            >

            <span
              >Total kill:
              <strong>{{ stats[player._id]?.totalKill }}</strong></span
            >
            <span class="mb-3"
              >Avg kills/game:
              <strong>{{ stats[player._id]?.averageKill }}</strong></span
            >
          </div>
          <button class="text-red-600 mb-3" @click="deletePlayer(player._id)">
            Supprimer
          </button>
        </div>
      </div>
      <form @submit.prevent="addPlayer" class="flex w-full">
        <input
          class="px-5 py-2 rounded-md mr-5 ring-blue-600 focus:ring-1 grow"
          type="text"
          v-model="nickname"
          placeholder="Nickname"
        />

        <button
          class="bg-blue-400 px-5 py-2 rounded-md text-white hover:bg-blue-200 transition-all"
          type="submit"
        >
          Add player
        </button>
      </form>
    </div>
    <div class="bg-blue-200 p-5 rounded-md">
      <h1 class="font-bold text-xl mb-5">Games backlog</h1>
      <form
        class="flex flex-col items-center bg-blue-100 p-5 mb-5"
        @submit.prevent="addGame"
      >
        <div class="flex justify-between mb-5 gap-2 text-center">
          <div key="player._id" v-for="player in players">
            <div class="font-bold">{{ player.nickname }}</div>
            <input
              class="px-5 py-2 rounded-md ring-blue-600 focus:ring-1"
              type="number"
              placeholder="Kill(s)"
              v-model="gameScore[player._id]"
            />
          </div>
        </div>
        <div class="w-full flex justify-center">
          <button
            class="bg-blue-400 px-5 py-2 rounded-md text-white hover:bg-blue-200 transition-all"
            type="submit"
          >
            Add game
          </button>
        </div>
      </form>

      <table class="w-full table-fixed">
        <thead>
          <th class="w-96">Date</th>
          <th v-for="player in players" :key="player._id">
            {{ player.nickname }}
          </th>
          <th class="w-xs">Actions</th>
        </thead>
        <tbody>
          <tr v-for="game in computedGames" :key="game._id">
            <td class="text-center">
              {{ game.date }}
            </td>
            <td v-for="(score, index) in game.scores" :key="index" class="p-1">
              <div
                class="bg-blue-300 text-center text-white p-2 rounded-lg font-bold"
              >
                {{ score ? score.score : "-" }}

                <div class="inline">
                  <span v-if="score && score.playerId == game.bestPlayerId"
                    >👑</span
                  >

                  <span v-if="score">{{ getHotIndicator(score.score) }}</span>
                </div>
              </div>
            </td>
            <td class="w-xs">
              <button
                class="bg-blue-400 px-5 py-2 rounded-md text-white hover:bg-blue-200 transition-all w-full"
                @click="deleteGame(game._id)"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Games from "../api/collections/Games";
import Players from "../api/collections/Players";
import moment from "moment";
import numeral from "numeral";

// load a
// switch between locales
numeral.locale("fr");
export default {
  data() {
    return {
      nickname: "",
      gameScore: {},
    };
  },

  computed: {
    stats() {
      const playersStats = {};

      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];

        const playerStats = {
          totalKill: 0,
        };

        // Count total kill for each player by iterate over all games and sum all scores

        let totalKill = 0;
        let totalGames = 0;

        for (let j = 0; j < this.games.length; j++) {
          const game = this.games[j];

          if (game.scores.hasOwnProperty(player._id)) {
            totalKill += game.scores[player._id];
            totalGames++;
          }
        }
        playerStats.totalGames = numeral(totalGames).format("0,0");
        playerStats.averageKill = numeral(totalKill / totalGames).format(
          "0,0.00"
        );

        playerStats.totalKill = numeral(totalKill).format("0,0");

        playersStats[player._id] = playerStats;
      }

      return playersStats;
    },

    computedGames() {
      const games = [];

      for (let i = 0; i < this.games.length; i++) {
        const game = this.games[i];

        const computedGame = {
          _id: game._id,
          scores: [],
          date:
            moment(game.createdAt).format("DD/MM/YYYY HH:mm") +
            " (" +
            moment(game.createdAt).fromNow() +
            ")",
          createdAt: game.createdAt,
          bestPlayerId: null,
          worstPlayerId: null,
        };

        for (let j = 0; j < this.players.length; j++) {
          const player = this.players[j];

          if (game.scores.hasOwnProperty(player._id)) {
            computedGame.scores.push({
              score: game.scores[player._id],
              nickname: player.nickname,
              playerId: player._id,
            });
          } else {
            computedGame.scores.push(null);
          }

          // Find the best player of the game by comparing all scores and add this id to the game object

          if (
            !computedGame.bestPlayerId ||
            game.scores[computedGame.bestPlayerId] < game.scores[player._id]
          ) {
            computedGame.bestPlayerId = player._id;
          }

          // Find the worst player of the game by comparing all scores and add this id to the game object

          if (
            !computedGame.worstPlayerId ||
            game.scores[computedGame.worstPlayerId] > game.scores[player._id]
          ) {
            computedGame.worstPlayerId = player._id;
          }
        }

        games.push(computedGame);
      }

      return games.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
  },

  meteor: {
    $subscribe: {
      games: [],
      players: [],
    },
    games() {
      return Games.find({});
    },
    players() {
      return Players.find({});
    },
  },
  methods: {
    getHotIndicator(kills) {
      if (kills >= 12) return "🔥🔥🔥";
      if (kills >= 9) return "🔥🔥";
      if (kills >= 6) return "🔥";

      if (kills <= 1) return "💩";
      if (kills <= 2) return "🤢";
    },

    getLevelLogo(level) {
      const map = {
        1: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45ura4-0e4d9cc8-a76d-4300-8708-166143429f8a.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXJhNC0wZTRkOWNjOC1hNzZkLTQzMDAtODcwOC0xNjYxNDM0MjlmOGEucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.S9y6fk1WxMUBX_SQWXtQ8SwjCmCtNa3rjzat8UfkqHQ",
        2: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45us0s-3b0c0b21-dc76-4f6a-a219-91fdd9c39320.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXMwcy0zYjBjMGIyMS1kYzc2LTRmNmEtYTIxOS05MWZkZDljMzkzMjAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.NmrL-u0gJQsXx65G7LgQpqLlRR2gquSa-3r8dwPionU",
        3: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45utzv-ba626858-bd36-4afb-a797-eb534bdbea05.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXR6di1iYTYyNjg1OC1iZDM2LTRhZmItYTc5Ny1lYjUzNGJkYmVhMDUucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.13cEdl7joHu4UPxrRLuQcK5xlzsl0Wd8WFqDQ6Onn0Q",
        4: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45uqbc-1dc02a2c-781f-4924-a198-fde181d92580.png/v1/fill/w_900,h_1026,strp/platinum_league_icon_starcraft_by_corydbhs15_d45uqbc-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNiIsInBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXFiYy0xZGMwMmEyYy03ODFmLTQ5MjQtYTE5OC1mZGUxODFkOTI1ODAucG5nIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.QysRMWLimjfROpT9HRXEQQ7xzTJ9xtOQ5ROaM35xQwU",
        5: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d464sdf-004cdad7-135c-44c4-b4e2-256ec8fb099f.png/v1/fill/w_900,h_1019,strp/diamond_league_icon_by_corydbhs15_d464sdf-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAxOSIsInBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ2NHNkZi0wMDRjZGFkNy0xMzVjLTQ0YzQtYjRlMi0yNTZlYzhmYjA5OWYucG5nIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.pzhUvckoJxV33MD037stOYqRwBNQoje72dOxATTyFDU",
        6: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d47nbzv-b59850d7-0589-40e1-8b6b-25f4dc6c2dc1.png/v1/fill/w_900,h_1026,strp/masters_league_icon_by_corydbhs15_d47nbzv-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNiIsInBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ3bmJ6di1iNTk4NTBkNy0wNTg5LTQwZTEtOGI2Yi0yNWY0ZGM2YzJkYzEucG5nIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.dAnURLWIxWeB5wNrFhDcbIVj4HE0tPy-aWh-_Geqxx8",
      };

      return map[level];
    },

    deleteGame(gameId) {
      // if (!confirm("Êtes-vous sûr de vouloir supprimer cette partie ?")) return;
      Meteor.call("deleteGame", gameId);
    },
    deletePlayer(playerId) {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;
      this.gameScore = {};

      Meteor.call("deletePlayer", playerId);
    },
    addGame() {
      Meteor.call("createGame", this.gameScore);
      this.gameScore = {};
    },
    addPlayer(e) {
      if (this.nickname.length < 1) return;
      Meteor.call("createPlayer", this.nickname);

      this.nickname = "";
    },
  },
};
</script>
