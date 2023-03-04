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
            class="px-5 py-5 text-white bg-zinc-500 text-xl font-bold w-full text-center rounded-md ring-gray-600 focus:ring-1"
            type="number"
            placeholder="Kills (Leave empty if not played)"
            v-model="gameScore[player._id]"
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
    <table class="w-full table-fixed">
      <tbody>
        <template
          v-for="(session, sessionIndex) in groupedComputedGames
            .slice()
            .reverse()"
          :key="sessionIndex"
        >
          <tr>
            <td>
              <div
                class="bg-zinc-500 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                -
              </div>
            </td>
            <td class="text-center" :colspan="players.length">
              <div
                class="bg-zinc-400 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                Session {{ groupedComputedGames.length - sessionIndex }} ({{
                  session.length
                }}
                games)
              </div>
            </td>
            <td colspan="3">
              <div
                class="bg-zinc-500 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                -
              </div>
            </td>
          </tr>
          <tr>
            <th class="w-96">
              <div
                class="bg-green-500 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                Date
              </div>
            </th>
            <th class="text-left" v-for="player in players" :key="player._id">
              <div
                class="bg-green-400 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                {{ player.nickname }}
              </div>
            </th>
            <th>
              <div
                class="bg-green-500 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                Rank
              </div>
            </th>
            <th>
              <div
                class="bg-green-500 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                Total
              </div>
            </th>
            <th class="w-40">
              <div
                class="bg-green-500 uppercase text-center text-white p-2 rounded-lg font-bold"
              >
                Actions
              </div>
            </th>
          </tr>
          <tr>
            <td>
              <div
                class="bg-zinc-500 text-center text-white p-2 rounded-lg font-bold"
              >
                Session total
              </div>
            </td>

            <td v-for="player in players" :key="player._id">
              <div
                class="bg-zinc-400 text-center text-white p-2 rounded-lg font-bold"
              >
                {{ getSessionTotalKills(session, player) }}
                ({{
                  numeral(
                    getSessionTotalKills(session, player) / session.length
                  ).format("0,0.00")
                }}
                avg)
              </div>
            </td>

            <td>
              <div
                class="bg-zinc-500 text-center text-xl text-white p-2 rounded-lg font-bold"
              >
                {{ numeral(getAverageSessionRank(session)).format("0,0.00") }}
                (avg)
              </div>
            </td>
            <td>
              <div
                class="bg-zinc-500 text-center text-xl text-white p-2 rounded-lg font-bold"
              >
                {{ getSessionTotalKills(session) }}
                ({{
                  numeral(
                    getSessionTotalKills(session) / session.length
                  ).format("0,0.00")
                }}
                avg)
              </div>
            </td>
            <td>
              <div
                class="bg-zinc-500 text-center text-white p-2 rounded-lg font-bold"
              >
                -
              </div>
            </td>
          </tr>

          <tr v-for="(game, index) in session" :key="game._id">
            <td class="text-center">
              <div
                class="bg-gray-700 text-center text-white p-2 flex rounded-lg items-center"
              >
                <ClockIcon
                  class="h-6 w-6 text-white-300 cursor-pointer mr-3"
                ></ClockIcon>
                {{ game.date }}
              </div>
            </td>
            <td v-for="(score, index) in game.scores" :key="index" class="p-1">
              <div
                class="bg-gray-600 text-center text-white p-2 rounded-lg font-bold flex justify-between items-center"
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
                  class="h-6 w-6 text-white cursor-pointer"
                />
              </div>
            </td>
            <td>
              <div
                class="bg-gray-600 text-center text-white p-2 rounded-lg font-bold flex justify-between items-center"
              >
                <div
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
                    <span>{{ getRankIndicator(game.rank)}}</span>
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
                <div v-else>Not defined</div>
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
            <td>
              <div
                class="bg-gray-700 text-center font-bold text-white p-2 rounded-lg text-2xl"
              >
                {{ game.scores.map((s) => s.score).reduce((a, b) => a + b, 0) }}
              </div>
            </td>

            <td>
              <button
                class="bg-red-500 px-5 py-2 flex items-center rounded-md text-white hover:bg-gray-200 transition-all w-full"
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
</template>

<script setup>
import numeral from "numeral";
import _ from "lodash";
import {
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
</script>

<script>
import dataMixin from "./data-mixin.js";

export default {
  mixins: [dataMixin],

  methods: {
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
    getAverageSessionRank(session) {
      if (session && session.length > 0) {
        let totalRank = 0;
        let notDefined = 0;
        for (let i = 0; i < session.length; i++) {
          const game = session[i];
          if (game.rank) {
            totalRank += Number(game.rank);
          } else {
            notDefined++;
          }
        }
        return totalRank / (session.length - notDefined);
      }
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
    updateRank(gameId, rank) {
      Meteor.call("updateGameRank", gameId, rank);
      this.editedCells[gameId + "-rank"] = false;
    },
    getHotIndicator(kills) {
      if (kills >= 12) return "🔥🔥🔥";
      if (kills >= 9) return "🔥🔥";
      if (kills >= 6) return "🔥";

      if (kills <= 1) return "💩";
      if (kills <= 2) return "🤢";
    },
    getRankIndicator(rank) {
      if (rank === "1") return "🥇";
      if (rank === "2") return "🥈";
      if (rank === "3") return "🥉";
    },
    deleteGame(gameId) {
      if (!confirm("Êtes-vous sûr de vouloir supprimer cette partie ?")) return;
      Meteor.call("deleteGame", gameId);
    },
    addGame() {
      Meteor.call("createGame", this.gameScore);
      this.gameScore = {};
    },
    deletePlayer(playerId) {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;
      this.gameScore = {};

      Meteor.call("deletePlayer", playerId);
    },

    addPlayer(e) {
      if (this.nickname.length < 1) return;
      Meteor.call("createPlayer", this.nickname);

      this.nickname = "";
    },
  },
  data() {
    return {
      nickname: "",
      gameScore: {},
      editedCells: {},
      editedValues: {},
    };
  },
};
</script>

<style scoped></style>
