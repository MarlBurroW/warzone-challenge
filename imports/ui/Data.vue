<template>
  <div class="p-5 py-10">
    <h1 class="font-bold text-3xl mb-10 text-white text-center">Players</h1>

    <div class="mx-auto mb-10">
      <form
        class="flex w-[25rem] mb-10 mx-auto w-[400px]"
        @submit.prevent="addPlayer"
      >
        <input
          id="nickname"
          v-model="nickname"
          class="px-5 py-2 text-white bg-zinc-500 rounded-md mr-5 ring-gray-600 focus:ring-1 grow"
          aria-label="nickname"
          type="text"
          placeholder="Nickname"
        />

        <button
          class="bg-[#7ec92e] hover:bg-[#94eb36] px-5 py-2 rounded-md text-white transition-all"
          type="submit"
        >
          Add player
        </button>
      </form>
      <div class="flex justify-center">
        <div
          v-for="player in players"
          :key="player._id"
          :style="{ borderColor: player.color }"
          class="text-white border-[0.3rem] mx-2 bg-zinc-700 w-96 font-bold rounded-md p-5 mb-5 flex justify-between items-center"
        >
          <div
            :style="{
              borderColor: player.color,
              color: player.color,
            }"
            :class="`h-8 w-8 cursor-pointer rounded-md border-[1px] border-white mr-4 `"
            @click="toggleActivePlayer(player)"
          >
            <CheckIcon v-if="player.active"></CheckIcon>
          </div>
          <span>{{ player.nickname }}</span>

          <div class="grow"></div>

          <TrashIcon
            class="h-5 w-5 cursor-pointer"
            @click="deletePlayer(player._id)"
          ></TrashIcon>
        </div>
      </div>
    </div>

    <h1 class="font-bold text-3xl mb-10 text-white text-center">
      Games backlog
    </h1>
    <form class="flex flex-col items-center p-5 mb-5" @submit.prevent="addGame">
      <div class="flex mb-5 gap-2 text-center w-full">
        <div v-for="player in activePlayers" :key="player._id" class="w-full">
          <div class="font-bold mb-2 text-white">{{ player.nickname }}</div>
          <input
            v-model="gameScore[player._id]"
            type="number"
            class="px-5 py-5 text-white bg-zinc-500 font-bold w-full text-center rounded-md ring-gray-600 focus:ring-1"
            aria-label="game_score"
            placeholder="Kills (Leave empty if not played)"
          />
        </div>
      </div>

      <div class="flex mb-5 gap-2 text-center">
        <div class="">
          <div class="font-bold mb-2 text-white">Ranking</div>
          <input
            v-model="gameRank"
            class="px-5 py-5 text-white bg-zinc-500 font-bold w-full text-center rounded-md ring-gray-600 focus:ring-1"
            type="number"
            aria-label="game_rank"
            placeholder="Ranking"
          />
        </div>
      </div>
      <div class="w-full flex justify-center">
        <button
          class="bg-[#7ec92e] hover:bg-[#94eb36] px-5 py-2 rounded-md text-white transition-all"
          type="submit"
        >
          Add game
        </button>
      </div>
    </form>

    <div
      class="flex justify-end bg-zinc-700 text-center text-white p-3 text-center gap-5 items-center"
    >
      <div>
        <button
          class="px-5 py-1 text-white bg-zinc-500 text-white"
          @click="toggleActiveGames()"
        >
          Activate/Deactivate all games
        </button>
      </div>

      <div>
        <label for="displayedSessionsCount" class="mr-2"
          >Sessions to display:</label
        >
        <select
          id="displayedSessionsCount"
          v-model="displayedSessionsCount"
          class="px-5 py-1 text-white bg-zinc-500 text-white"
        >
          <option
            v-for="option in displayedSessionsCountOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>

    <table class="w-full mb-[20rem]" aria-label="session_lists">
      <tbody>
        <template
          v-for="(session, sessionIndex) in limitedGroupedGames
            .slice()
            .reverse()"
          :key="sessionIndex"
        >
          <tr>
            <td
              class="bg-zinc-800 uppercase text-center text-white p-8 text-2xl font-bold text-center"
              :colspan="activePlayers.length + 4"
            >
              Session {{ groupedComputedGames.length - sessionIndex }} ({{
                session.length
              }}
              games)
            </td>
          </tr>
          <tr>
            <th
              scope="col"
              class="w-[20rem] bg-zinc-600 uppercase text-center text-white p-2 font-bold"
            >
              Date
            </th>
            <th
              v-for="player in activePlayers"
              :key="player._id"
              scope="col"
              :style="{ backgroundColor: player.color }"
              class="w-[13rem] text-left uppercase text-center text-white p-2 font-bold"
            >
              {{ player.nickname }}
            </th>
            <th
              scope="col"
              class="w-[12rem] bg-zinc-600 uppercase text-center text-white p-2 font-bold"
            >
              Rank
            </th>
            <th
              scope="col"
              class="bg-zinc-600 uppercase text-center text-white p-2 font-bold"
            >
              Total
            </th>
            <th
              scope="col"
              class="w-[10rem] bg-zinc-600 uppercase text-center text-white p-2 font-bold"
            >
              Actions
            </th>
          </tr>
          <tr>
            <td class="bg-zinc-500 text-center text-white p-2 font-bold">
              Session total
            </td>

            <td
              v-for="player in activePlayers"
              :key="player._id"
              class="bg-zinc-400 text-center text-white p-2 font-bold"
            >
              {{ getSessionTotalKills(session, player) }}
              ({{
                numeral(
                  getSessionTotalKills(session, player) / session.length
                ).format('0,0.00')
              }}
              avg)
            </td>

            <td class="bg-zinc-500 text-center text-white p-2 font-bold">
              {{ numeral(getAverageSessionRank(session)).format('0,0.00') }}
              (avg)
            </td>
            <td class="bg-zinc-500 text-center text-white p-2 font-bold">
              {{ getSessionTotalKills(session) }}
              ({{
                numeral(getSessionTotalKills(session) / session.length).format(
                  '0,0.00'
                )
              }}
              avg)
            </td>
            <td class="bg-zinc-500 text-center text-white p-2 font-bold"></td>
          </tr>

          <tr v-for="game in session" :key="game._id" class="group">
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
              v-for="(score, index) in game.scores.filter(() => {
                return activePlayers
                  .map((player) => player._id)
                  .includes(score.playerId);
              })"
              :key="index"
              :style="`background-color: ${tinycolor(
                getPlayerColorByPlayerId(score.playerId)
              ).setAlpha(0.6)};`"
              :class="`bg-opacity-0 p-2 px-6 group-hover:bg-gray-500 text-white font-bold justify-between items-center`"
            >
              <div class="flex">
                <div
                  v-if="
                    (score && score.score != null) ||
                    editedCells[game._id + '-' + score.playerId]
                  "
                  class="grow"
                >
                  <div
                    v-if="!editedCells[game._id + '-' + score.playerId]"
                    class="inline text-xl"
                  >
                    {{ score ? score.score : '-' }}
                    <span
                      v-if="score && score.score === game.bestNumberKill"
                      class="h-6 w-6 text-yellow-500"
                    >
                      <StarIcon
                        class="h-6 w-6 text-yellow-400 inline"
                      ></StarIcon>
                    </span>

                    <span v-if="score">{{ getHotIndicator(score.score) }}</span>
                  </div>
                  <div v-else>
                    <form
                      class="flex items-center"
                      @submit.prevent="
                        updateScore(
                          game._id,
                          score.playerId,
                          editedValues[game._id + '-' + score.playerId]
                        )
                      "
                    >
                      <input
                        id="`{{game._id}}-{{score.playerId}}"
                        :ref="game._id + '-' + score.playerId"
                        class="bg-gray-400 w-full text-center px-2 py-1 rounded-md text-white mr-2"
                        aria-label="`{{game._id}}-{{score.playerId}}"
                        type="number"
                        :value="score.score"
                        @input="
                          editedValues[game._id + '-' + score.playerId] =
                            $event.target.value
                        "
                      />
                      <XCircleIcon
                        class="h-8 w-8 text-red-300 cursor-pointer"
                        @click="
                          editedCells[game._id + '-' + score.playerId] = false
                        "
                      />
                      <CheckCircleIcon
                        class="h-8 w-8 text-green-300 cursor-pointer"
                        @click="
                          updateScore(
                            game._id,
                            score.playerId,
                            editedValues[game._id + '-' + score.playerId]
                          )
                        "
                      />
                    </form>
                  </div>
                </div>
                <div v-else class="grow font-normal text-white">Not played</div>

                <PencilIcon
                  v-if="!editedCells[game._id + '-' + score.playerId]"
                  class="h-6 w-6 text-white cursor-pointer"
                  @click="
                    ($event) => {
                      focusInput(game._id + '-' + score.playerId);

                      editedCells[game._id + '-' + score.playerId] = true;
                      editedValues[game._id + '-' + score.playerId] =
                        score.score;
                    }
                  "
                />
              </div>
            </td>
            <td
              class="bg-gray-600 group-hover:bg-gray-500 text-left text-white p-2 px-6 font-bold items-center"
            >
              <div class="flex">
                <div
                  v-if="
                    (game && game.rank != null) ||
                    editedCells[game._id + '-rank']
                  "
                  class="grow"
                >
                  <div
                    v-if="!editedCells[game._id + '-rank']"
                    class="inline text-xl"
                  >
                    {{ game.rank }}
                    <span>{{ getRankIndicator(game.rank) }}</span>
                  </div>
                  <div v-else>
                    <form
                      class="flex items-center"
                      @submit.prevent="
                        updateRank(game._id, editedValues[game._id + '-rank'])
                      "
                    >
                      <input
                        :ref="game._id + '-rank'"
                        class="bg-gray-400 w-full text-center px-2 py-1 rounded-md text-white mr-2"
                        type="number"
                        aria-label="`{{game._id}}-rank"
                        :value="game.rank"
                        @input="
                          editedValues[game._id + '-rank'] = $event.target.value
                        "
                      />
                      <XCircleIcon
                        class="h-8 w-8 text-red-300 cursor-pointer"
                        @click="editedCells[game._id + '-rank'] = false"
                      />
                      <CheckCircleIcon
                        class="h-8 w-8 text-green-300 cursor-pointer"
                        @click="
                          updateRank(game._id, editedValues[game._id + '-rank'])
                        "
                      />
                    </form>
                  </div>
                </div>

                <div v-else class="grow font-normal text-red-400">
                  Not defined
                </div>

                <PencilIcon
                  v-if="!editedCells[game._id + '-rank']"
                  class="h-6 w-6 text-white cursor-pointer"
                  @click="
                    ($event) => {
                      focusInput(game._id + '-rank');

                      editedCells[game._id + '-rank'] = true;
                      editedValues[game._id + '-rank'] = game.rank;
                    }
                  "
                />
              </div>
            </td>
            <td
              class="bg-gray-700 group-hover:bg-gray-600 text-center font-bold text-white p-2 text-xl"
            >
              {{
                game.scores
                  .map((s) => s.score)
                  .reduce((a, b) => Number(a) + Number(b), 0)
              }}
            </td>

            <td
              class="whitespace-nowrap bg-gray-800 group-hover:bg-gray-600 px-2"
            >
              <div class="flex items-center justify-end gap-2">
                <button
                  class="flex bg-red-500 px-5 py-2 items-center text-white hover:bg-red-400 transition-all"
                  @click="deleteGame(game._id)"
                >
                  <TrashIcon class="h-4 w-4 text-white cursor-pointer mr-4" />
                  Delete
                </button>

                <button
                  :class="`${
                    game.active
                      ? 'bg-green-500 hover:bg-green-400'
                      : 'bg-zinc-600 hover:zinc-500'
                  }  px-5 py-2  text-white transition-all`"
                  @click="toggleActiveGame(game)"
                >
                  {{ game.active ? 'Active' : 'Disabled' }}
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import numeral from 'numeral';
import {
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/vue/24/solid';
import tinycolor from 'tinycolor2';
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import dataMixin from './data-mixin';
import { Meteor } from 'meteor/meteor';
import { Player } from '../api/collections/Players';
import { Game, Score } from '../api/collections/Games';

export default defineComponent({
  mixins: [dataMixin],
  data() {
    return {
      nickname: '',
      gameScore: {},
      gameRank: null,
      editedCells: {},
      editedValues: {},
      activeGames: true,
      displayedSessionsCount: 1,
      displayedSessionsCountOptions: [
        { text: 'Only latest', value: 1 },
        { text: '3 Latest', value: 3 },
        { text: '6 Latest', value: 6 },
        { text: '9 Latest', value: 9 },
        { text: '12 Latest', value: 12 },
        { text: 'All (not recommanded)', value: Infinity },
      ],
    };
  },
  computed: {
    limitedGroupedGames() {
      // Get latest element in this.groupedComputedGames limited by this.displayedSessionsCount
      return this.groupedComputedGames.slice(-this.displayedSessionsCount);
    },
  },
  methods: {
    getSessionTotalKills(session: any[], player: Player) {
      let totalKills = 0;
      if (player) {
        for (const game of session) {
          const playerScore = game.scores.find(
            (s: { playerId: string }) => s.playerId === player._id
          );
          if (playerScore && playerScore.score) {
            totalKills += Number(playerScore.score);
          }
        }
      } else {
        session.forEach((game) => {
          game.scores.forEach((score) => {
            if (score.score) {
              totalKills += Number(score.score);
            }
          });
        });
      }
      return totalKills;
    },
    getAverageSessionRank(session: string | any[]) {
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
    focusInput(ref: string | number) {
      setTimeout(() => {
        // Focus and select the input
        this.$refs[ref][0].focus();
        this.$refs[ref][0].select();
      }, 1);
    },
    updateScore(gameId: string, playerId: string, score: number) {
      Meteor.call('updateGameScore', gameId, playerId, score);
      this.editedCells[`${gameId}-${playerId}`] = false;
    },
    updateRank(gameId: string, rank: number) {
      Meteor.call('updateGameRank', gameId, rank);
      this.editedCells[gameId + '-rank'] = false;
    },
    getHotIndicator(kills: number): string {
      switch (true) {
        case kills >= 12:
          return '🔥🔥🔥';
        case kills >= 9:
          return '🔥🔥';
        case kills >= 6:
          return '🔥';
        case kills <= 1:
          return '💩';
        case kills <= 2:
          return '🤢';
        default:
          return '';
      }
    },

    deleteGame(gameId: string) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette partie ?')) {
        Meteor.call('deleteGame', gameId);
      }
    },
    addGame() {
      console.log('addGame', this.gameScore);
      const score: Score[] = this.gameScore;
      Meteor.call('createGame', score, this.gameRank);
      this.gameScore = {};
      this.gameRank = null;
    },
    deletePlayer(playerId: string) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
        this.gameScore = {};
        Meteor.call('deletePlayer', playerId);
      }
    },

    addPlayer() {
      if (this.nickname.length >= 1) {
        Meteor.call('createPlayer', this.nickname);
        this.nickname = '';
      }
    },

    toggleActivePlayer(player: Player) {
      Meteor.call('updatePlayerActiveStatus', player._id, !player.active);
    },
    toggleActiveGame(game: Game) {
      Meteor.call('updateGameActiveStatus', game._id, !game.active);
    },
    toggleActiveGames() {
      Meteor.call('updateGamesActiveStatus', !this.activeGames);
      this.activeGames = !this.activeGames;
    },
  },
});
</script>
