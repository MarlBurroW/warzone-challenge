<template>
  <div class="bg-zinc-700 p-10 mb-5">
    <h1 class="font-bold text-8xl mb-[50px] text-center text-white">Players</h1>

    <div class="flex w-full justify-center flex-wrap">
      <div
        key="player._id"
        v-for="player in players"
        class="bg-zinc-800 shadow-xl border-t-8 border-[#7ec92e] w-[400px] relative p-2 m-2 mb-10 rounded-md flex flex-col text-center justify-between text-white px-12 py-10"
      >
        <img
          class="absolute z-0 opacity-10 w-full left-0 right-0"
          :src="getMmrLogo(player.mmr)"
        />

        <div class="z-1 relative">
          <span class="text-3xl mb-3 font-black">{{ player.nickname }}</span>

          <div class="flex flex-col mb-5 relative">
            <div class="flex justify-center">
              <img class="w-[100px]" :src="getMmrLogo(player.mmr)" />
            </div>
            <div
              class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-5"
            >
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-in-out"
                :style="getProgressMmrStyle(player.mmr)"
              ></div>
              <span class="font-bold">{{ Math.round(player.mmr) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <div
              class="bg-zinc-600 p-2 border-l-4 border-amber-500 rounded-lg mb-5 w-full"
            >
              <div class="mb-3 font-bold">Global K/G</div>
              <div class="flex justify-center items-end">
                <span class="text-4xl font-bold"
                  >{{ numeral(player.avgKg).format("0,0.00") }}
                </span>

                <ArrowUpRightIcon
                  class="h-8 w-8 text-green-500"
                  v-if="player.kgTrending == 1"
                >
                </ArrowUpRightIcon>
                <ArrowRightIcon class="h-8 w-8" v-if="player.kgTrending == 0">
                </ArrowRightIcon>
                <ArrowDownRightIcon
                  class="h-8 w-8 text-red-500"
                  v-if="player.kgTrending == -1"
                >
                </ArrowDownRightIcon>
              </div>
            </div>

            <div
              class="bg-zinc-600 p-2 border-l-4 border-amber-500 rounded-lg mb-5 w-full"
            >
              <div class="mb-3 font-bold">15 last games K/G</div>
              <div class="flex justify-center items-end">
                <span class="text-4xl font-bold"
                  >{{ numeral(player.avgKg15LastGames).format("0,0.00") }}
                </span>

                <ArrowUpRightIcon
                  class="h-8 w-8 text-green-500"
                  v-if="player.kg15LastGamesTrending == 1"
                >
                </ArrowUpRightIcon>
                <ArrowRightIcon
                  class="h-8 w-8"
                  v-if="player.kg15LastGamesTrending == 0"
                >
                </ArrowRightIcon>
                <ArrowDownRightIcon
                  class="h-8 w-8 text-red-500"
                  v-if="player.kg15LastGamesTrending == -1"
                >
                </ArrowDownRightIcon>
              </div>
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
                  numeral(currentSessionStats[player._id].totalGames).format(
                    "0"
                  )
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
                <strong>{{ numeral(player.avgKg).format("0,0.00") }}</strong>
              </div>
            </div>
          </div>
          <div
            class="lex flex-col bg-zinc-600 p-2 border-l-4 border-pink-400 rounded-lg flex-col flex mb-5"
          >
            <Bar
              class="mb-3 max-h-[200px]"
              :options="
                Object.assign({}, chartOptions, {
                  scales: {
                    y: {
                      max: 8,
                      ticks: { color: 'white', beginAtZero: true },
                    },
                    x: { ticks: { color: 'white', beginAtZero: true } },
                  },
                })
              "
              :data="playerChartData[player._id].avgKg"
            />

            <Bar
              class="mb-3 max-h-[200px]"
              :options="
                Object.assign({}, chartOptions, {
                  scales: {
                    y: {
                      max: currentSessionMaxPlayerKill,
                      ticks: { color: 'white', beginAtZero: true },
                    },
                    x: { ticks: { color: 'white', beginAtZero: true } },
                  },
                })
              "
              :data="playerChartData[player._id].latestSessionKills"
            />
          </div>
        </div>
      </div>
    </div>
    <h1 class="text-white font-bold text-6xl text-center mb-[100px] mt-[100px]">
      Current session stats
    </h1>

    <div
      class="bg-zinc-800 p-10 max-w-[1200px] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
    >
      <h1 class="text-white font-bold text-2xl text-center mb-5">
        Players kills during current session
      </h1>
      <div class="flex mx-auto overflow-auto">
        <Line
          class="mb-3 w-full h-[400px]"
          :options="chartOptions"
          :data="globalChartData.playersCurrentSessionKills"
        />
      </div>
    </div>
    <div
      class="bg-zinc-800 p-10 max-w-[1200px] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
    >
      <h1 class="text-white font-bold text-2xl text-center mb-5">
        Current session kills repartition
      </h1>
      <div class="flex w-1/2 mx-auto overflow-auto">
        <Doughnut
          class="mb-3 w-full h-[400px]"
          :options="chartOptions"
          :data="globalChartData.currentSessionKillsRepartition"
        ></Doughnut>
      </div>
    </div>

    <h1 class="text-white font-bold text-6xl text-center mb-[100px] mt-[100px]">
      Global stats
    </h1>
    <div
      class="bg-zinc-800 p-10 max-w-[1200px] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
    >
      <h1 class="text-white font-bold text-2xl text-center mb-5">
        Team K/G evolution
      </h1>

      <div class="flex w-1/2 mx-auto overflow-auto">
        <Bar
          class="mb-3 w-full h-[400px]"
          :options="chartOptions"
          :data="globalChartData.teamAverageKillsPerSession"
        />
      </div>
    </div>
    <div
      class="bg-zinc-800 p-10 max-w-[1200px] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
    >
      <h1 class="text-white font-bold text-2xl text-center mb-5">
        Players total kills during each sessions
      </h1>
      <div class="flex w-1/2 mx-auto overflow-auto">
        <Bar
          class="mb-3 w-full h-[400px]"
          :options="chartOptions"
          :data="globalChartData.playersSessionKills"
        />
      </div>
    </div>

    <div
      class="bg-zinc-800 p-10 max-w-[1200px] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
    >
      <h1 class="text-white font-bold text-2xl text-center mb-5">
        Players K/G evolution
      </h1>
      <div class="flex w-1/2 mx-auto overflow-auto">
        <Line
          class="mb-3 w-full h-[400px]"
          :options="chartOptions"
          :data="globalChartData.sessionsPlayerAvgKillsPerSession"
        />
      </div>
    </div>
    <div
      class="bg-zinc-800 p-10 max-w-[1200px] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
    >
      <h1 class="text-white font-bold text-2xl text-center mb-5">
        Total kill repartition
      </h1>
      <div class="flex w-1/2 mx-auto overflow-auto">
        <Doughnut
          class="mb-3 w-full h-[400px]"
          :options="chartOptions"
          :data="globalChartData.globalKillsRepartition"
        ></Doughnut>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  XMarkIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/solid";
</script>

<script>
import dataMixin from "./data-mixin.js";

import { Bar, Line, Doughnut } from "vue-chartjs";
import "chart.js/auto";

// Generate an array of beautiful colors

const playerColors = [
  "#0ea5e9",
  "#f87171",
  "#fbbf24",
  "#a3e635",

  "#10b981",

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
    currentSessionMaxPlayerKill() {
      const currentSession =
        this.groupedComputedGames[this.groupedComputedGames.length - 1];

      // Iterate over all score and find the max

      const max = currentSession.reduce((acc, game) => {
        const maxGameScore = game.scores.reduce((acc, score) => {
          return Math.max(acc, score.score);
        }, 0);

        return Math.max(acc, maxGameScore);
      }, 0);

      return max;
    },

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
          avgKg: {
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

    getProgressMmrStyle(mmr) {
      console.log("mmr MDR", mmr);
      let rest = mmr % 15;
      console.log("REST MMR MDR", rest);
      let pourcentage = Math.trunc(rest * 100) / 15;
      return "width:" + pourcentage + "%;";
    },
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
    getMmrLogo(mmr) {
      if (mmr < 950) return "/images/vomit.png";
      if (mmr < 965) return "/images/new/b3.png";
      if (mmr < 980) return "/images/new/b2.png";
      if (mmr < 995) return "/images/new/b1.png";
      if (mmr < 1010) return "/images/new/a3.png";
      if (mmr < 1025) return "/images/new/a2.png";
      if (mmr < 1040) return "/images/new/a1.png";
      if (mmr < 1055) return "/images/new/g3.png";
      if (mmr < 1070) return "/images/new/g2.png";
      if (mmr < 1085) return "/images/new/g1.png";
      if (mmr < 1100) return "/images/new/p3.png";
      if (mmr < 1115) return "/images/new/p2.png";
      if (mmr < 1130) return "/images/new/p1.png";
      if (mmr < 1145) return "/images/new/d3.png";
      if (mmr < 1160) return "/images/new/d2.png";
      if (mmr < 1175) return "/images/new/d1.png";
      if (mmr < 1190) return "/images/new/m3.png";
      if (mmr < 1205) return "/images/new/m2.png";
      if (mmr < 1220) return "/images/new/m1.png";
      if (mmr >= 1235) return "/images/gm.png";
      return "/images/vomit.png";
    },
  },
};
</script>
