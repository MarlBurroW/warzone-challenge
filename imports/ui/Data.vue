<template>
  <div class="p-5 py-10">
    <h1 class="font-bold text-3xl mb-10 text-white text-center">Players</h1>

    <div class="mx-auto mb-10">
      <form
          @submit.prevent="addPlayer"
          class="flex w-full mb-10 mx-auto w-[400px]"
      >
        <input
            class="px-5 py-2 text-white bg-zinc-500 rounded-md mr-5 ring-gray-600 focus:ring-1 grow"
            aria-label="nickname"
            id="nickname"
            type="text"
            v-model="nickname"
            placeholder="Nickname"
        />

        <button
            class="bg-gray-400 px-5 py-2 rounded-md text-white hover:text-black hover:bg-gray-300 transition-all"
            type="submit"
        >
          Add player
        </button>
      </form>
      <div class="w-full flex justify-center">
        <div
            class="text-white mx-2 bg-zinc-700 w-96 rounded-md p-5 mb-5 flex justify-between"
            v-for="player in players"
            :key="player._id"
        >
          <span>{{ player.nickname }}</span>

          <XMarkIcon
              @click="deletePlayer(player._id)"
              class="h-8 w-8 cursor-pointer"
          ></XMarkIcon>
        </div>
      </div>
    </div>

    <h1 class="font-bold text-3xl mb-10 text-white text-center">
      Games backlog
    </h1>
    <form class="flex flex-col items-center p-5 mb-5" @submit.prevent="addGame">
      <div class="flex mb-5 gap-2 text-center w-full">
        <div class="w-full" key="player._id" v-for="player in players">
          <div class="font-bold mb-2 text-white">{{ player.nickname }}</div>
          <input
              class="px-5 py-5 text-white bg-zinc-500 text-xl font-bold
            w-full text-center rounded-md ring-gray-600 focus:ring-1"
              aria-label="game_score"
              placeholder="Kills (Leave empty if not played)"
              v-model="gameScore[player._id]"
          />
        </div>
      </div>

      <div class="flex mb-5 gap-2 text-center">
        <div class="">
          <div class="font-bold mb-2 text-white">Ranking</div>
          <input
              class="px-5 py-5 text-white bg-zinc-500 text-xl font-bold
            w-full text-center rounded-md ring-gray-600 focus:ring-1"
              type="number"
              aria-label="game_rank"
              placeholder="Ranking"
              v-model="gameRank"
          />
        </div>
      </div>
      <div class="w-full flex justify-center">
        <button
            class="bg-gray-400 px-5 py-2 rounded-md text-white hover:text-black hover:bg-gray-300 transition-all"
            type="submit"
        >
          Add game
        </button>
      </div>
    </form>
    <table class="w-full table-fixed" aria-label="session_lists">
      <tbody>
      <template
          v-for="(session, sessionIndex) in groupedComputedGames
            .slice()
            .reverse()"
          :key="sessionIndex"
      >
        <tr>
          <td
              class="bg-zinc-800 uppercase text-center text-white p-8 text-2xl font-bold text-center"
              :colspan="players.length + 4"
          >
            Session {{ groupedComputedGames.length - sessionIndex }} ({{
              session.length
            }}
            games)
          </td>
        </tr>
        <tr>
          <th scope="col"
              class="w-96 bg-zinc-600 uppercase text-center text-white p-2 font-bold"
          >
            Date
          </th>
          <th
              scope="col"
              :style="{ backgroundColor: getPlayersColors(index) }"
              class="text-left uppercase text-center text-white p-2 font-bold"
              v-for="(player, index) in players"
              :key="player._id"
          >
            {{ player.nickname }}
          </th>
          <th scope="col"
              class="bg-zinc-600 uppercase text-center text-white p-2 font-bold"
          >
            Rank
          </th>
          <th scope="col"
              class="bg-zinc-600 uppercase text-center text-white p-2 font-bold"
          >
            Total
          </th>
          <th scope="col"
              class="w-40 bg-zinc-600 uppercase text-center text-white p-2 font-bold"
          >
            Actions
          </th>
        </tr>
        <tr>
          <td class="bg-zinc-500 text-center text-white p-2 font-bold">
            Session total
          </td>

          <td
              class="bg-zinc-400 text-center text-white p-2 font-bold"
              v-for="player in players"
              :key="player._id"
          >
            {{ getSessionTotalKills(session, player) }}
            ({{
              numeral(
                  getSessionTotalKills(session, player) / session.length
              ).format("0,0.00")
            }}
            avg)
          </td>

          <td
              class="bg-zinc-500 text-center text-xl text-white p-2 font-bold"
          >
            {{ numeral(getAverageSessionRank(session)).format("0,0.00") }}
            (avg)
          </td>
          <td
              class="bg-zinc-500 text-center text-xl text-white p-2 font-bold"
          >
            {{ getSessionTotalKills(session) }}
            ({{
              numeral(getSessionTotalKills(session) / session.length).format(
                  "0,0.00"
              )
            }}
            avg)
          </td>
          <td class="bg-zinc-500 text-center text-white p-2 font-bold">
            <button @click="toggleActiveGames()">
              Tout activer / désactiver
            </button>
          </td>
        </tr>

        <tr v-for="(game, index) in session" :key="game._id" class="group">
          <td
              class="text-center group-hover:bg-gray-600 bg-gray-700 text-center text-white p-2 items-center"
          >
            <div class="flex">
              <ClockIcon
                  class="h-6 w-6 text-white-300 cursor-pointer mr-3"
              ></ClockIcon>
              {{ game.date }}
            </div>
          </td>
          <td
              v-for="(score, index) in game.scores"
              :key="index"
              :style="`background-color: ${tinycolor(
                getPlayersColors(index)
              ).setAlpha(0.6)};`"
              :class="`bg-opacity-0 p-2 px-6 group-hover:bg-gray-500 text-white font-bold justify-between items-center`"
          >
            <div class="flex">
              <div
                  class="grow"
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
                  <span
                      class="h-6 w-6 text-yellow-500"
                      v-if="score && score.score === game.bestNumberKill"
                  >
                      <StarIcon
                          class="h-6 w-6 text-yellow-400 inline"
                      ></StarIcon>
                    </span>

                  <span v-if="score">{{ getHotIndicator(score.score) }}</span>
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
                        class="bg-gray-400 w-full text-center px-2 py-1 rounded-md text-white mr-2"
                        id="`{{game._id}}-{{score.playerId}}"
                        aria-label="`{{game._id}}-{{score.playerId}}"
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
              <div class="grow font-normal text-white" v-else>Not played</div>

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
                  class="h-6 w-6 text-white cursor-pointer"
              />
            </div>
          </td>
          <td
              class="bg-gray-600 group-hover:bg-gray-500 text-left text-white p-2 px-6 font-bold items-center"
          >
            <div class="flex">
              <div
                  class="grow"
                  v-if="
                    (game && game.rank != null) ||
                    editedCells[game._id + '-rank']
                  "
              >
                <div
                    class="inline text-xl"
                    v-if="!editedCells[game._id + '-rank']"
                >
                  {{ game.rank }}
                  <span>{{ getRankIndicator(game.rank) }}</span>
                </div>
                <div v-else>
                  <form
                      @submit.prevent="
                        updateRank(game._id, editedValues[game._id + '-rank'])
                      "
                      class="flex items-center"
                  >
                    <input
                        class="bg-gray-400 w-full text-center px-2 py-1 rounded-md text-white mr-2"
                        type="number"
                        aria-label="`{{game._id}}-rank"
                        :value="game.rank"
                        :ref="game._id + '-rank'"
                        @input="
                          editedValues[game._id + '-rank'] = $event.target.value
                        "
                    />
                    <XCircleIcon
                        @click="editedCells[game._id + '-rank'] = false"
                        class="h-8 w-8 text-red-300 cursor-pointer"
                    />
                    <CheckCircleIcon
                        @click="
                          updateRank(game._id, editedValues[game._id + '-rank'])
                        "
                        class="h-8 w-8 text-green-300 cursor-pointer"
                    />
                  </form>
                </div>
              </div>

              <div class="grow font-normal text-red-400" v-else>
                Not defined
              </div>

              <PencilIcon
                  v-if="!editedCells[game._id + '-rank']"
                  @click="
                    ($event) => {
                      focusInput(game._id + '-rank');

                      editedCells[game._id + '-rank'] = true;
                      editedValues[game._id + '-rank'] = game.rank;
                    }
                  "
                  class="h-6 w-6 text-white cursor-pointer"
              />
            </div>
          </td>
          <td
              class="bg-gray-700 group-hover:bg-gray-600 text-center font-bold text-white p-2 text-2xl"
          >
            {{ game.scores.map((s) => s.score).reduce((a, b) => a + b, 0) }}
          </td>

          <td class="bg-gray-700 group-hover:bg-gray-600 px-2">
            <div class="flex gap-2 justify-center">
              <button
                  class="flex-1 bg-red-500 px-5 py-2 flex items-center text-white hover:bg-red-400 transition-all"
                  @click="deleteGame(game._id)"
              >
                <XMarkIcon class="h-4 w-4 text-white cursor-pointer mr-4"/>
                Supprimer
              </button>

              <button
                  @click="toggleActiveGame(game)"
                  :class="`${
                    game.active
                      ? 'bg-green-500 hover:bg-green-400'
                      : 'bg-zinc-600 hover:zinc-500'
                  } flex-1 px-5 py-2  text-white transition-all`"
              >
                {{ game.active ? "Active" : "Disabled" }}
              </button>
            </div>
          </td>
        </tr>
      </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import numeral from "numeral";
import {
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
  StarIcon,
} from "@heroicons/vue/24/solid";
import tinycolor from "tinycolor2";
</script>

<script>
import dataMixin from "./data-mixin.js";

export default {
  mixins: [dataMixin],

  methods: {
    getSessionTotalKills(session, player) {
      let totalKills = 0;
      if (player) {
        for (const game of session) {
          const playerScore = game.scores.find(
              s => s.playerId === player._id,
          );
          if (playerScore && playerScore.score) {
            totalKills += playerScore.score;
          }
        }
      } else {
        session.forEach(game => {
          game.scores.forEach(score => {
            if (score.score) {
              totalKills += score.score;
            }
          });
        });
      }
      return totalKills;
    },
    getAverageSessionRank(session) {
      let result = null;
      if (session && session.length > 0) {
        let totalRank = 0;
        let notDefined = 0;
        for (const game of session) {
          if (game.rank) {
            totalRank += Number(game.rank);
          } else {
            notDefined++;
          }
        }
        result = totalRank / (session.length - notDefined);
      }
      return result;
    },
    focusInput(ref) {
      setTimeout(() => {
        // Focus and select the input
        this.$refs[ref][0].focus();
        this.$refs[ref][0].select();
      }, 1);
    },
    updateScore(gameId, playerId, score) {
      Meteor.call("updateGameScore", gameId, playerId, score);
      this.editedCells[`${gameId}-${playerId}`] = false;
    },
    updateRank(gameId, rank) {
      Meteor.call("updateGameRank", gameId, rank);
      this.editedCells[gameId + "-rank"] = false;
    },
    getHotIndicator(kills) {
      switch (true) {
        case kills >= 12:
          return "🔥🔥🔥";
        case kills >= 9:
          return "🔥🔥";
        case kills >= 6:
          return "🔥";
        case kills <= 1:
          return "💩";
        case kills <= 2:
          return "🤢";
        default:
          return "";
      }
    },
    getRankIndicator(rank) {
      switch (rank) {
        case "1":
          return "🥇";
        case "2":
          return "🥈";
        case "3":
          return "🥉";
        default:
          return "";
      }
    },
    deleteGame(gameId) {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette partie ?")) {
        Meteor.call("deleteGame", gameId);
      }
    },
    addGame() {
      Meteor.call("createGame", this.gameScore, this.gameRank);
      this.gameScore = {};
      this.gameRank = null;
    },
    deletePlayer(playerId) {
      if (confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) {
        this.gameScore = {};
        Meteor.call("deletePlayer", playerId);
      }
    },

    addPlayer() {
      if (!this.nickname.length < 1) {
        Meteor.call("createPlayer", this.nickname);
        this.nickname = "";
      }
    },
    toggleActiveGame(game) {
      Meteor.call("updateGameActiveStatus", game._id, !!!game.active);
    },
    toggleActiveGames() {
      Meteor.call("updateGamesActiveStatus", !this.activeGames);
      this.activeGames = !this.activeGames;
    },
  },
  data() {
    return {
      nickname: "",
      gameScore: {},
      gameRank: null,
      editedCells: {},
      editedValues: {},
      activeGames: true,
    };
  },
};
</script>
