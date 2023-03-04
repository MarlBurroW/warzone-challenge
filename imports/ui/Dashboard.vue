<template>
  <div class="bg-zinc-700 p-10 mb-5">
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
          <div class="flex justify-center flex-col items-center">
            <span
              :class="`text-9xl font-black mr-5 mb-6 ${
                player.balance < 0 ? 'text-red-500' : 'text-green-300'
              }`"
              >{{ player.balance }}</span
            >

            <div class="flex justify-center items-center mb-10">
              <img
                v-if="player.level != 0"
                class="w-12 mr-6"
                :src="getLevelLogo(player.level - 1)"
              />

              <span
                v-if="player.level != 0"
                class="text-3xl font-bold text-red-500"
                >{{ -player.requiredBalanceToUpgrade }}</span
              ><span class="text-3xl font-bold" v-if="player.level != 0"
                >&nbsp;/&nbsp;</span
              >

              <span class="text-3xl font-bold mr-6 text-green-300">{{
                player.requiredBalanceToUpgrade
              }}</span>

              <img class="w-12" :src="getLevelLogo(player.level + 1)" />
            </div>
          </div>
        </div>
        <div class="flex gap-2 mb-5 w-full">
          <div
            class="flex flex-col bg-zinc-700 p-2 rounded-lg flex-1 border-l-4 border-blue-400"
          >
            <span class="mb-3">Required point(s) per game</span>

            <span class="text-4xl font-bold">{{ player.requiredKills }}</span>
          </div>
          <div
            class="flex flex-col bg-zinc-700 p-2 rounded-lg flex-1 border-l-4 border-purple-400"
          >
            <span class="mb-3"
              >Points(s) needed to level up in the next game</span
            >

            <span class="text-4xl font-bold">{{
              player.requiredBalanceToUpgrade -
              player.balance +
              player.requiredKills
            }}</span>
          </div>
        </div>

        <div
          class="lex bg-zinc-600 p-2 border-l-4 border-amber-500 rounded-lg flex justify-between mb-5"
        >
          <div class="text-left">
            <div class="mb-3 font-bold">Session stats</div>
            <div>
              Game played:
              <strong>{{
                numeral(currentSessionStats[player._id].totalGames).format("0")
              }}</strong>
            </div>

            <div>
              Total kill::
              <strong>{{
                numeral(currentSessionStats[player._id].totalKill).format("0")
              }}</strong>
            </div>
            <div class="mb-3">
              Avg kills/game:
              <strong>{{
                numeral(currentSessionStats[player._id].averageKill).format(
                  "0,0.00"
                )
              }}</strong>
            </div>
          </div>

          <div class="text-right">
            <div class="mb-3 font-bold">Global stats</div>
            <div>
              Game played:
              <strong>{{ numeral(player.gamesPlayed).format("0") }}</strong>
            </div>

            <div>
              Total kill:
              <strong>{{ numeral(player.totalKills).format("0") }}</strong>
            </div>
            <div class="mb-3">
              Avg kills/game:
              <strong>{{ numeral(player.avgKills).format("0,0.00") }}</strong>
            </div>
          </div>
        </div>

        <div
          class="lex flex-col bg-zinc-600 p-2 border-l-4 border-pink-400 rounded-lg flex-col flex mb-5"
        >
          <Bar
            class="mb-3 max-h-[200px]"
            :options="
              Object.assign({}, chartOptions, { scales: { y: { max: 10 } } })
            "
            :data="playerChartData[player._id].avgKills"
          />

          <Bar
            class="mb-3 max-h-[200px]"
            :options="
              Object.assign({}, chartOptions, { scales: { y: { max: 25 } } })
            "
            :data="playerChartData[player._id].latestSessionKills"
          />
        </div>
      </div>
    </div>
    <h1 class="text-white font-bold text-6xl text-center mb-5">
      Current session stats
    </h1>

    <h1 class="text-white font-bold text-2xl text-center mb-5">
      Players kills during current session
    </h1>
    <div class="flex w-1/2 mx-auto overflow-auto mb-10">
      <Line
        class="mb-3 w-full h-[400px]"
        :options="chartOptions"
        :data="globalChartData.playersCurrentSessionKills"
      />
    </div>

    <h1 class="text-white font-bold text-2xl text-center mb-5">
      Current session kills repartition
    </h1>
    <div class="flex w-1/2 mx-auto overflow-auto mb-10">
      <Doughnut
        class="mb-3 w-full h-[400px]"
        :options="chartOptions"
        :data="globalChartData.currentSessionKillsRepartition"
      ></Doughnut>
    </div>
    <h1 class="text-white font-bold text-6xl text-center mb-5">Global stats</h1>

    <h1 class="text-white font-bold text-2xl text-center mb-5">
      Team K/G evolution
    </h1>

    <div class="flex w-1/2 mx-auto overflow-auto mb-10">
      <Bar
        class="mb-3 w-full h-[400px]"
        :options="chartOptions"
        :data="globalChartData.teamAverageKillsPerSession"
      />
    </div>

    <h1 class="text-white font-bold text-2xl text-center mb-5">
      Players total kills during each sessions
    </h1>
    <div class="flex w-1/2 mx-auto overflow-auto mb-10">
      <Bar
        class="mb-3 w-full h-[400px]"
        :options="chartOptions"
        :data="globalChartData.playersSessionKills"
      />
    </div>
    <h1 class="text-white font-bold text-2xl text-center mb-5">
      Players K/G evolution
    </h1>
    <div class="flex w-1/2 mx-auto overflow-auto mb-10">
      <Line
        class="mb-3 w-full h-[400px]"
        :options="chartOptions"
        :data="globalChartData.sessionsPlayerAvgKillsPerSession"
      />
    </div>

    <h1 class="text-white font-bold text-2xl text-center mb-5">
      Total kill repartition
    </h1>
    <div class="flex w-1/2 mx-auto overflow-auto mb-10">
      <Doughnut
        class="mb-3 w-full h-[400px]"
        :options="chartOptions"
        :data="globalChartData.globalKillsRepartition"
      ></Doughnut>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon } from "@heroicons/vue/24/solid";
</script>

<script>
import dataMixin from "./data-mixin.js";

import { Bar, Line, Doughnut } from "vue-chartjs";
import "chart.js/auto";

// Generate an array of beautiful colors

const playerColors = [
  "#f87171",
  "#fbbf24",
  "#a3e635",
  "#10b981",
  "#0ea5e9",
  "#6366f1",
  "#d946ef",
  "#f43f5e",
];

import moment from "moment";
import numeral from "numeral";
import _ from "lodash";

// load a
// switch between locales
numeral.locale("fr");
export default {
  components: { Bar, Line, Doughnut },
  mixins: [dataMixin],
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
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
    globalChartData() {
      const sessions = this.groupedComputedGames;

      const latestSession =
        sessions.length > 0 ? sessions[sessions.length - 1] : [];

      const latestSessionKills = latestSession
        .slice()
        .reverse()
        .map((g) => {
          return g.scores.reduce((acc, s) => acc + s.score, 0);
        });

      const options = {
        latestSessionKills: {
          labels: [
            ...latestSessionKills.map((s, index) => `Game ${index + 1}`),
          ],
          datasets: [
            {
              label: "Latest session team kills",
              data: latestSessionKills,
              backgroundColor: "rgba(25, 255, 25, 0.2)",
              borderColor: "rgba(25, 255, 25, 1)",
              borderWidth: 1,
            },
          ],
        },

        latestSessionKills: {
          labels: [
            ...latestSessionKills.map((s, index) => `Game ${index + 1}`),
          ],
          datasets: [
            {
              label: "Latest session team kills",
              data: latestSessionKills,
              backgroundColor: "rgba(25, 255, 25, 0.2)",
              borderColor: "rgba(25, 255, 25, 1)",
              borderWidth: 1,
            },
          ],
        },
        globalKillsRepartition: {
          labels: this.players.map((p) => p.nickname),
          datasets: [
            {
              data: this.players.map((p) => {
                return this.computedGames.reduce((acc, g) => {
                  const score = g.scores.find((s) => s.playerId === p._id);
                  return acc + (score ? score.score : 0);
                }, 0);
              }),
              backgroundColor: playerColors,
            },
          ],
        },
        currentSessionKillsRepartition: {
          labels: this.players.map((p) => p.nickname),
          datasets: [
            {
              data: this.players.map((p) => {
                return latestSession.reduce((acc, g) => {
                  const score = g.scores.find((s) => s.playerId === p._id);
                  return acc + (score ? score.score : 0);
                }, 0);
              }),
              backgroundColor: playerColors,
            },
          ],
        },

        teamAverageKillsPerSession: {
          labels: [...sessions.map((s, index) => `Session ${index + 1}`)],
          datasets: [
            {
              label: "Team average kills per session",
              data: sessions.map((s) => {
                return (
                  s
                    .map((g) => {
                      return g.scores.reduce((acc, s) => acc + s.score, 0);
                    })
                    .reduce((acc, s) => acc + s, 0) / s.length
                );
              }),
              backgroundColor: "rgba(16, 185, 129, 0.50)",

              borderWidth: 1,
            },
          ],
        },

        sessionsPlayerAvgKillsPerSession: {
          labels: [...sessions.map((s, index) => `Session ${index + 1}`)],
          datasets: [
            ...this.players.map((p, index) => {
              return {
                label: p.nickname,
                data: sessions.map((s) => {
                  return (
                    s
                      .map((g) => {
                        return g.scores.find((s) => s.playerId === p._id)
                          ?.score;
                      })
                      .reduce((acc, s) => acc + s, 0) / s.length
                  );
                }),
                backgroundColor: playerColors[index],
                borderColor: playerColors[index],
                borderWidth: 4,
              };
            }),
          ],
        },

        playersSessionKills: {
          labels: [...sessions.map((s, index) => `Session ${index + 1}`)],
          datasets: this.players.map((p, index) => {
            return {
              label: p.nickname,
              data: sessions.map((s) => {
                return s
                  .map((g) => {
                    const score = g.scores.find((s) => s.playerId == p._id);
                    return score ? score.score : 0;
                  })
                  .reduce((acc, s) => acc + s, 0);
              }),
              backgroundColor: playerColors[index],
              borderColor: playerColors[index],
              borderWidth: 1,
            };
          }),
        },
        playersCurrentSessionKills: {
          labels: [
            ...latestSessionKills.map((s, index) => `Game ${index + 1}`),
          ],

          datasets: this.players.map((p, index) => {
            return {
              label: p.nickname,
              data: latestSession
                .slice()
                .reverse()
                .map((g) => {
                  const score = g.scores.find((s) => s.playerId == p._id);
                  return score ? score.score : 0;
                }),
              backgroundColor: playerColors[index],
              borderColor: playerColors[index],
              borderWidth: 4,
            };
          }),
        },
      };

      return options;
    },

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
            labels: [...latestSessionKills.map((g, index) => index + 1)],
            datasets: [
              {
                label: "Session kills / games",
                backgroundColor: "#86efac",
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
  },
};
</script>
