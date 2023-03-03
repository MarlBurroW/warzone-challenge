<template>
  <div class="bg-zinc-700 p-5 mb-5">
    <h1 class="font-bold text-3xl mb-[50px] text-center text-white">Players</h1>

    <div class="flex w-full justify-center flex-wrap">
      <div
        key="player._id"
        v-for="player in players"
        class="bg-zinc-800 border-t-4 border-green-400 w-[400px] relative p-2 m-2 mb-10 rounded-md flex flex-col text-center justify-between text-white px-12 py-10"
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
          <div
            class="flex flex-col bg-zinc-700 p-2 rounded-lg flex-1 border-l-4 border-blue-400"
          >
            <span class="mb-3"
              >Required kills<br />
              per game</span
            >

            <span class="text-4xl font-bold">{{ player.requiredKills }}</span>
          </div>

          <div
            class="flex flex-col bg-zinc-700 p-2 flex-1 rounded-md border-l-4 border-green-400"
          >
            <span class="mb-3">Required balance to level down/up</span>

            <div class="flex justify-center items-center">
              <img
                v-if="player.level != 0"
                class="w-8 mr-2"
                :src="getLevelLogo(player.level - 1)"
              />

              <span v-if="player.level != 0" class="text-2xl font-bold">{{
                -player.requiredBalanceToUpgrade
              }}</span
              ><span class="text-2xl font-bold" v-if="player.level != 0"
                >&nbsp;/&nbsp;</span
              >

              <span class="text-2xl font-bold mr-2">{{
                player.requiredBalanceToUpgrade
              }}</span>

              <img class="w-8" :src="getLevelLogo(player.level + 1)" />
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-5 w-full">
          <div
            class="flex flex-col bg-zinc-700 p-2 rounded-lg flex-1 border-l-4 border-purple-400"
          >
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

        <div
          class="lex flex-col bg-zinc-600 p-2 border-l-4 border-amber-500 rounded-lg flex-col flex mb-5"
        >
          <span class="mb-3 font-bold">Latest/Current session stats</span>
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
          class="lex flex-col bg-zinc-600 p-2 border-l-4 border-indigo-400 rounded-lg flex-col flex mb-5"
        >
          <span class="mb-3 font-bold">Global stats</span>
          <span
            >Game played:
            <strong>{{ numeral(player.gamesPlayed).format("0") }}</strong></span
          >

          <span
            >Total kill:
            <strong>{{ numeral(player.totalKills).format("0") }}</strong></span
          >
          <span class="mb-3"
            >Avg kills/game:
            <strong>{{
              numeral(player.avgKills).format("0,0.00")
            }}</strong></span
          >
        </div>
        <div
          class="lex flex-col bg-zinc-600 p-2 border-l-4 border-pink-400 rounded-lg flex-col flex mb-5"
        >
          <Bar
            class="mb-3"
            :options="chartOptions"
            :data="playerChartData[player._id].avgKills"
          />

          <Bar
            class="mb-3"
            :options="chartOptions"
            :data="playerChartData[player._id].latestSessionKills"
          />
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
        class="px-5 py-2 text-white bg-zinc-500 rounded-md mr-5 ring-gray-600 focus:ring-1 grow"
        type="text"
        v-model="nickname"
        placeholder="Nickname"
      />

      <button
        class="bg-gray-400 px-5 py-2 rounded-md text-white hover:bg-gray-200 transition-all"
        type="submit"
      >
        Add player
      </button>
    </form>
  </div>
</template>

<script setup>
import { XMarkIcon } from "@heroicons/vue/24/solid";
</script>

<script>
import dataMixin from "./data-mixin.js";

import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

import moment from "moment";
import numeral from "numeral";
import _ from "lodash";

// load a
// switch between locales
numeral.locale("fr");
export default {
  components: { Bar },
  mixins: [dataMixin],
  data() {
    return {
      nickname: "",

      chartOptions: {
        animation: true,
        scales: {
          y: {
            ticks: { color: "white", beginAtZero: true },
          },
          x: {
            ticks: { color: "white", beginAtZero: true },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "white",

              font: {
                size: 15,
              },
            },
          },
        },
      },
    };
  },

  computed: {
    playerChartData() {
      const options = {};

      const sessions = this.groupedComputedGames;

      const sessionsStats = sessions.map((s) => this.getSessionStats(s));

      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];

        const playerSessionsKills = sessions.map((s) => {
          return s
            .map((g) => {
              const score = g.scores.find((s) => s.playerId == player._id);
              return score ? score.score : 0;
            })
            .reverse();
        });

        const latestSessionKills =
          playerSessionsKills[playerSessionsKills.length - 1];

        const playerStats = sessionsStats.map((s) => s[player._id]);

        options[player._id] = {
          avgKills: {
            labels: [...playerStats.map((s, index) => `Session ${index + 1}`)],
            datasets: [
              {
                label: "Avg kills / game",
                backgroundColor: "#60a5fa",
                data: playerStats.map((s) => s.averageKill),
              },
            ],
          },
          latestSessionKills: {
            labels: [...latestSessionKills.map((s, index) => index + 1)],
            datasets: [
              {
                label: "Latest/current session kills / games",
                backgroundColor: "#60a5fa",

                data: latestSessionKills,
              },
            ],
          },
        };
      }
      return options;
    },

    currentSessionStats() {
      const stats = {};

      return this.getSessionStats(this.currentSession);

      return stats;
    },

    currentSession() {
      // return last session of this.groupedComputedGames

      return this.groupedComputedGames[this.groupedComputedGames.length - 1];
    },
  },

  methods: {
    numeral,
    getSessionStats(session) {
      const stats = {};
      if (session) {
        for (let i = 0; i < this.players.length; i++) {
          const player = this.players[i];

          stats[player._id] = {
            totalKill: 0,
            totalGames: 0,
            averageKill: 0,
          };

          const playedGames = session
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

    getLevelLogo(level) {
      const map = {
        0: "/images/vomit.png",
        1: "/images/bronze.png",
        2: "/images/silver.png",
        3: "/images/gold.png",
        4: "/images/platine.png",
        5: "/images/diamond.png",
        6: "/images/master.png",
        7: "/images/gm.png",
      };

      return map[level];
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
};
</script>
