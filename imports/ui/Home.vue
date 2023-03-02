<template>
  <div class="bg-[#181107] p-5 rounded-md">

    <div class="flex justify-center p-5">
      <img class="justify-center" src="https://www.zupimages.net/up/23/09/hybm.png">
    </div>
    <h1 class="text-center mb-10 text-5xl font-bold text-white">
      WARZONE CHALLENGE
    </h1>



    <div class="bg-[#EEEEEE] p-5 rounded-md mb-5">
      <h1 class="font-bold text-3xl mb-10 text-center">Players</h1>

      <div class="flex w-full justify-center">
        <div
          key="player._id"
          v-for="player in players"
          class="bg-[#24281E] relative p-2 m-2 mb-10 rounded-md flex flex-col text-center justify-between text-white px-12 py-10"
        >
          <div class="w-[100px] absolute -top-12 right-5">
            <img class="" :src="getLevelLogo(player.level)" />
          </div>
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
            </div>
          </div>
          <div class="flex gap-2 mb-5 w-full">
            <div class="flex flex-col bg-orange-400 p-2 rounded-lg flex-1">
              <span class="mb-3">Required kills per game</span>

              <span class="text-4xl font-bold">{{ player.requiredKills }}</span>
            </div>

            <div class="flex flex-col bg-pink-400 p-2 rounded-lg flex-1">
              <span class="mb-3">Required balance to level up</span>

              <div class="flex justify-center items-center">
                <span class="text-4xl font-bold mr-5">{{
                  player.requiredBalanceToUpgrade
                }}</span>

                <img class="w-8" :src="getLevelLogo(player.level + 1)" />
              </div>
            </div>
          </div>

          <div class="flex gap-2 mb-5 w-full">
            <div class="flex flex-col bg-teal-500 p-2 rounded-lg flex-1">
              <span class="mb-3"
                >Kill(s) needed to level up in the next game</span
              >

              <span class="text-4xl font-bold">{{
                player.requiredBalanceToUpgrade -
                player.balance +
                player.requiredKills
              }}</span>
            </div>
          </div>
          <!-- <div class="flex flex-col">
            <span>Last game kills</span>

            <span class="text-2xl font-bold">{{ player.lastGameKills }}</span>
          </div> -->

          <div
            class="lex flex-col bg-fuchsia-400 p-2 rounded-lg flex-col flex mb-5"
          >
            <span class="mb-3 font-bold">Last/Current session stats</span>
            <span
              >Game played:
              <strong>{{
                numeral(currentSessionStats[player._id].totalGames).format("0")
              }}</strong></span
            >

            <span
              >Total kill::
              <strong>{{
                numeral(currentSessionStats[player._id].totalKill).format("0")
              }}</strong></span
            >
            <span class="mb-3"
              >Avg kills/game:
              <strong>{{
                numeral(currentSessionStats[player._id].averageKill).format(
                  "0,0.00"
                )
              }}</strong></span
            >
          </div>
          <div
            class="lex flex-col bg-purple-400 p-2 rounded-lg flex-col flex mb-5"
          >
            <span class="mb-3 font-bold">Global stats</span>
            <span
              >Game played:
              <strong>{{
                numeral(player.gamesPlayed).format("0")
              }}</strong></span
            >

            <span
              >Total kill:
              <strong>{{
                numeral(player.totalKills).format("0")
              }}</strong></span
            >
            <span class="mb-3"
              >Avg kills/game:
              <strong>{{
                numeral(player.avgKills).format("0,0.00")
              }}</strong></span
            >
          </div>

          <button
            class="bg-red-500 text-white flex items-center justify-center px-5 py-2 rounded-md hover:bg-red-300 transition-all"
            @click="deletePlayer(player._id)"
          >
            <XMarkIcon class="h-4 w-4 text-white cursor-pointer mr-4" />
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
      <h1 class="font-bold text-3xl mb-10 text-center">Games backlog</h1>
      <form
        class="flex flex-col items-center bg-blue-100 p-5 mb-5"
        @submit.prevent="addGame"
      >
        <div class="flex mb-5 gap-2 text-center w-full">
          <div class="w-full" key="player._id" v-for="player in players">
            <div class="font-bold mb-2">{{ player.nickname }}</div>
            <input
              class="px-5 py-5 text-xl font-bold w-full text-center rounded-md ring-blue-600 focus:ring-1"
              type="number"
              placeholder="Kills (Leave empty if not played)"
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
          <th class="w-96">
            <div
              class="bg-purple-500 uppercase text-center text-white p-2 rounded-lg font-bold"
            >
              Date
            </div>
          </th>
          <th class="text-left" v-for="player in players" :key="player._id">
            <div
              class="bg-purple-400 uppercase text-center text-white p-2 rounded-lg font-bold"
            >
              {{ player.nickname }}
            </div>
          </th>
          <th>
            <div
              class="bg-purple-500 uppercase text-center text-white p-2 rounded-lg font-bold"
            >
              Total
            </div>
          </th>
          <th class="w-40">
            <div
              class="bg-purple-500 uppercase text-center text-white p-2 rounded-lg font-bold"
            >
              Actions
            </div>
          </th>
        </thead>
        <tbody>
          <template
            v-for="(session, sessionIndex) in groupedComputedGames"
            :key="sessionIndex"
          >
            <tr>
              <td>
                <div
                  class="bg-teal-500 uppercase text-center text-white p-2 rounded-lg font-bold"
                >
                  -
                </div>
              </td>
              <td class="text-center" :colspan="players.length">
                <div
                  class="bg-teal-400 uppercase text-center text-white p-2 rounded-lg font-bold"
                >
                  Session {{ groupedComputedGames.length - sessionIndex }}
                </div>
              </td>
              <td colspan="2">
                <div
                  class="bg-teal-500 uppercase text-center text-white p-2 rounded-lg font-bold"
                >
                  -
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div
                  class="bg-teal-500 text-center text-white p-2 rounded-lg font-bold"
                >
                  Session total
                </div>
              </td>
              <td v-for="player in players" :key="player._id">
                <div
                  class="bg-teal-400 text-center text-white p-2 rounded-lg font-bold"
                >
                  {{ getSessionTotalKills(session, player) }}
                </div>
              </td>
              <td>
                <div
                  class="bg-teal-500 text-center text-xl text-white p-2 rounded-lg font-bold"
                >
                  {{ getSessionTotalKills(session) }}
                </div>
              </td>
              <td>
                <div
                  class="bg-teal-500 text-center text-white p-2 rounded-lg font-bold"
                >
                  -
                </div>
              </td>
            </tr>

            <tr v-for="(game, index) in session" :key="game._id">
              <td class="text-center">
                <div
                  class="bg-blue-400 text-center text-white p-2 flex rounded-lg items-center"
                >
                  <ClockIcon
                    class="h-6 w-6 text-white-300 cursor-pointer mr-3"
                  ></ClockIcon>
                  {{ game.date }}
                </div>
              </td>
              <td
                v-for="(score, index) in game.scores"
                :key="index"
                class="p-1"
              >
                <div
                  class="bg-blue-300 text-center text-white p-2 rounded-lg font-bold flex justify-between items-center"
                >
                  <div
                    v-if="
                      (score && score.score != null) ||
                      editedCells[game._id + '-' + score.playerId]
                    "
                  >
                    <div
                      class="inline text-xl"
                      v-if="!editedCells[game._id + '-' + score.playerId]"
                    >
                      {{ score ? score.score : "-" }}
                      <span v-if="score && score.playerId == game.bestPlayerId"
                        >👑</span
                      >

                      <span v-if="score">{{
                        getHotIndicator(score.score)
                      }}</span>
                    </div>
                    <div v-else>
                      <form
                        @submit.prevent="
                          updateScore(
                            game._id,
                            score.playerId,
                            editedValues[game._id + '-' + score.playerId]
                          )
                        "
                        class="flex items-center"
                      >
                        <input
                          class="bg-blue-400 w-full text-center px-2 py-1 rounded-md text-white mr-2"
                          type="number"
                          :value="score.score"
                          :ref="game._id + '-' + score.playerId"
                          @input="
                            editedValues[game._id + '-' + score.playerId] =
                              $event.target.value
                          "
                        />
                        <XCircleIcon
                          @click="
                            editedCells[game._id + '-' + score.playerId] = false
                          "
                          class="h-8 w-8 text-red-300 cursor-pointer"
                        />
                        <CheckCircleIcon
                          @click="
                            updateScore(
                              game._id,
                              score.playerId,
                              editedValues[game._id + '-' + score.playerId]
                            )
                          "
                          class="h-8 w-8 text-green-300 cursor-pointer"
                        />
                      </form>
                    </div>
                  </div>
                  <div v-else>Not played</div>
                  <PencilIcon
                    v-if="!editedCells[game._id + '-' + score.playerId]"
                    @click="
                      ($event) => {
                        focusInput(game._id + '-' + score.playerId);

                        editedCells[game._id + '-' + score.playerId] = true;
                        editedValues[game._id + '-' + score.playerId] =
                          score.score;
                      }
                    "
                    class="h-6 w-6 text-blue-500 cursor-pointer"
                  />
                </div>
              </td>
              <td>
                <div
                  class="bg-blue-400 text-center font-bold text-white p-2 rounded-lg text-2xl"
                >
                  {{
                    game.scores.map((s) => s.score).reduce((a, b) => a + b, 0)
                  }}
                </div>
              </td>

              <td>
                <button
                  class="bg-red-500 px-5 py-2 flex items-center rounded-md text-white hover:bg-blue-200 transition-all w-full"
                  @click="deleteGame(game._id)"
                >
                  <XMarkIcon class="h-4 w-4 text-white cursor-pointer mr-4" />
                  Supprimer
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
</script>

<script>
import Games from "../api/collections/Games";
import Players from "../api/collections/Players";
import moment from "moment";
import numeral from "numeral";
import _ from "lodash";

// load a
// switch between locales
numeral.locale("fr");
export default {
  data() {
    return {
      nickname: "",
      gameScore: {},
      editedCells: {},
      editedValues: {},
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

    currentSessionStats() {
      const stats = {};

      if (this.currentSession) {
        for (let i = 0; i < this.players.length; i++) {
          const player = this.players[i];

          stats[player._id] = {
            totalKill: 0,
            totalGames: 0,
            averageKill: 0,
          };

          const playedGames = this.currentSession
            .filter((game) =>
              game.scores.map((s) => s.playerId).includes(player._id)
            )
            .filter(
              (game) =>
                game.scores.find((s) => s.playerId == player._id).score !== null
            );

          stats[player._id].totalGames = playedGames.length;
          stats[player._id].totalKill = playedGames
            .map(
              (game) => game.scores.find((s) => s.playerId === player._id).score
            )
            .reduce((a, b) => a + b, 0);
          stats[player._id].averageKill =
            stats[player._id].totalKill / stats[player._id].totalGames;
        }
      }

      return stats;
    },

    currentSession() {
      return this.groupedComputedGames[0] ? this.groupedComputedGames[0] : null;
    },

    groupedComputedGames() {
      // return computedGames grouped by sessionId in an array

      const groupedGames = _.groupBy(this.computedGames, "sessionId");

      const groupedGamesArray = [];

      for (let key in groupedGames) {
        groupedGamesArray.push(groupedGames[key]);
      }

      return groupedGamesArray.reverse();
    },

    computedGames() {
      const games = [];

      for (let i = 0; i < this.games.length; i++) {
        const game = this.games[i];

        const computedGame = {
          _id: game._id,
          sessionId: game.sessionId,
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
          computedGame.scores.push({
            score: game.scores.hasOwnProperty(player._id)
              ? game.scores[player._id]
              : null,
            nickname: player.nickname,
            playerId: player._id,
          });

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
    numeral,

    getSessionTotalKills(session, player) {
      let totalKills = 0;

      if (player) {
        for (let i = 0; i < session.length; i++) {
          const game = session[i];

          const playerScore = game.scores.find(
            (s) => s.playerId === player._id
          );

          if (playerScore && playerScore.score) {
            totalKills += playerScore.score;
          }
        }
      } else {
        for (let i = 0; i < session.length; i++) {
          const game = session[i];

          for (let j = 0; j < game.scores.length; j++) {
            const score = game.scores[j];

            if (score.score) {
              totalKills += score.score;
            }
          }
        }
      }

      return totalKills;
    },

    focusInput(ref) {
      setTimeout(() => {
        // Focus and select the input
        this.$refs[ref][0].focus();
        this.$refs[ref][0].select();
      }, 1);
    },
    updateScore(gameId, playerId, score) {
      console.log(gameId, playerId, score);
      Meteor.call("updateGameScore", gameId, playerId, score);

      this.editedCells[gameId + "-" + playerId] = false;
    },

    getHotIndicator(kills) {
      if (kills >= 12) return "🔥🔥🔥";
      if (kills >= 9) return "🔥🔥";
      if (kills >= 6) return "🔥";

      if (kills <= 1) return "💩";
      if (kills <= 2) return "🤢";
    },

    getLevelLogo(level) {
      const map = {
        0: "https://i.ibb.co/7jBTZ0B/image.png",
        1: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45ura4-0e4d9cc8-a76d-4300-8708-166143429f8a.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXJhNC0wZTRkOWNjOC1hNzZkLTQzMDAtODcwOC0xNjYxNDM0MjlmOGEucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.S9y6fk1WxMUBX_SQWXtQ8SwjCmCtNa3rjzat8UfkqHQ",
        2: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45us0s-3b0c0b21-dc76-4f6a-a219-91fdd9c39320.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXMwcy0zYjBjMGIyMS1kYzc2LTRmNmEtYTIxOS05MWZkZDljMzkzMjAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.NmrL-u0gJQsXx65G7LgQpqLlRR2gquSa-3r8dwPionU",
        3: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45utzv-ba626858-bd36-4afb-a797-eb534bdbea05.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXR6di1iYTYyNjg1OC1iZDM2LTRhZmItYTc5Ny1lYjUzNGJkYmVhMDUucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.13cEdl7joHu4UPxrRLuQcK5xlzsl0Wd8WFqDQ6Onn0Q",
        4: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d45uqbc-1dc02a2c-781f-4924-a198-fde181d92580.png/v1/fill/w_900,h_1026,strp/platinum_league_icon_starcraft_by_corydbhs15_d45uqbc-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNiIsInBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ1dXFiYy0xZGMwMmEyYy03ODFmLTQ5MjQtYTE5OC1mZGUxODFkOTI1ODAucG5nIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.QysRMWLimjfROpT9HRXEQQ7xzTJ9xtOQ5ROaM35xQwU",
        5: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d464sdf-004cdad7-135c-44c4-b4e2-256ec8fb099f.png/v1/fill/w_900,h_1019,strp/diamond_league_icon_by_corydbhs15_d464sdf-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAxOSIsInBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ2NHNkZi0wMDRjZGFkNy0xMzVjLTQ0YzQtYjRlMi0yNTZlYzhmYjA5OWYucG5nIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.pzhUvckoJxV33MD037stOYqRwBNQoje72dOxATTyFDU",
        6: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/d930a4ef-ff7f-46db-86ab-fdc00e874e22/d47nbzv-b59850d7-0589-40e1-8b6b-25f4dc6c2dc1.png/v1/fill/w_900,h_1026,strp/masters_league_icon_by_corydbhs15_d47nbzv-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNiIsInBhdGgiOiJcL2ZcL2Q5MzBhNGVmLWZmN2YtNDZkYi04NmFiLWZkYzAwZTg3NGUyMlwvZDQ3bmJ6di1iNTk4NTBkNy0wNTg5LTQwZTEtOGI2Yi0yNWY0ZGM2YzJkYzEucG5nIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.dAnURLWIxWeB5wNrFhDcbIVj4HE0tPy-aWh-_Geqxx8",
        7: "https://www.zupimages.net/up/23/09/al8o.png"
      };

      return map[level];
    },

    deleteGame(gameId) {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cette partie ?")) return;
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
