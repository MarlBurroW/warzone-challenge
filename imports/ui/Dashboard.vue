<template>
  <div class="bg-zinc-700 mb-5">
    <div
      class="relative overflow-hidden px-10"
      style="padding-top: 10rem; padding-bottom: 10rem"
    >
      <img
        alt="background"
        src="/images/bg.jpg"
        class="absolute pointer-events-none select-none z-0 block opacity-30 w-full h-full left-0 right-0 top-0 bottom-0 object-cover"
      />

      <div class="flex w-full justify-center flex-wrap">
        <div
          v-for="(player, index) in activePlayers"
          :key="player._id"
          :style="{ borderColor: player.color }"
          class="bg-zinc-800 shadow-xl border-t-8 w-[29rem] relative p-2 m-2 mb-10 rounded-md flex flex-col text-center justify-between text-white px-12 py-10"
        >
          <img
            v-if="isOnFire(player)"
            src="/images/fire.gif"
            class="absolute -top-[2rem] w-[22rem]"
          />

          <img
            alt="mmr_logo"
            class="absolute pointer-events-none z-0 opacity-10 w-full left-0 right-0 select-none"
            :src="getMmrLogo(player.level)"
          />
          <!-- <div
            v-if="isOnFire(player)"
            class="absolute flex justify-center w-full left-0 right-0 -top-20"
          > -->
          <!-- <fire></fire> -->
          <!-- </div> -->

          <div class="z-10">
            <div class="flex flex-col">
              <div class="flex flex-wrap h-7 justify-center align-center">
                <span
                  v-for="i in currentSessionStats[player._id].topPlayer"
                  v-if="
                    currentSessionStats &&
                    currentSessionStats[player._id].topPlayer
                  "
                >
                  <StarIcon
                    :style="{ color: player.color }"
                    class="h-6 w-6 text-yellow-500"
                  ></StarIcon>
                </span>
              </div>

              <div class="text-3xl mb-5 font-black">
                {{ isOnFire(player) ? '🔥' : '' }}{{ player.nickname
                }}{{ isOnFire(player) ? '🔥' : '' }}
              </div>
              <div class="mb-5 flex justify-center">
                <img
                  :class="`${
                    isOnFire(player) ? 'hot-mmr-logo' : ''
                  } w-[12rem] h-[12rem] brightness-130 pointer-events-none select-none`"
                  alt="mmr_logo"
                  :src="getMmrLogo(player.level)"
                />
              </div>
              <div class="mb-5">
                <div class="flex justify-center">
                  <span
                    v-if="!isNaN(player.mmr) && player.mmr !== 0"
                    class="font-thin text-3xl"
                  >
                    {{ Math.round(player.mmr) }}</span
                  >
                  <span v-else class="font-thin text-3xl">
                    {{ 5 - player.gamesPlayed }} game{{
                      5 - player.gamesPlayed > 1 ? 's' : ''
                    }}
                    left</span
                  >
                  <div
                    v-if="getMmrEvolution(player)"
                    class="evolution-mmr font-thin text-3xl ml-2"
                  >
                    <span
                      v-if="
                        getMmrEvolution(player) && getMmrEvolution(player) >= 0
                      "
                      class="text-green-300 left-50 bottom-3 font-bold"
                    >
                      +{{ getMmrEvolution(player) }}
                    </span>
                    <span
                      v-if="
                        getMmrEvolution(player) && getMmrEvolution(player) < 0
                      "
                      class="text-3xl text-red-300 font-bold"
                    >
                      {{ getMmrEvolution(player) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="h-20">
                <div v-if="player.level != 0" class="flex w-full items-center">
                  <div class="flex mr-4">
                    <img
                      class="w-12"
                      alt="previous_league_logo"
                      :src="getMmrLogo(player.level - 1)"
                    />
                  </div>
                  <div
                    class="flex w-full bg-gradient-to-t from-gray-500 to-gray-600 rounded-full h-2"
                  >
                    <div
                      class="h-2 rounded-full transition-all duration-1000 ease-in-out align-middle"
                      :style="
                        getProgressMmrStyle(player) +
                        'background: ' +
                        player.color
                      "
                    ></div>
                  </div>
                  <div class="flex ml-4">
                    <img
                      class="w-12"
                      alt="next_league_logo"
                      :src="getMmrLogo(player.level + 1)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <div
                :style="{ borderColor: player.color }"
                class="bg-zinc-600 p-2 border-l-4 rounded-lg mb-5 w-full bg-opacity-50"
              >
                <div class="mb-3 font-thin">Global K/G</div>
                <div class="flex justify-center items-end">
                  <span class="text-4xl font-thin"
                    >{{ numeral(player.avgKg).format('0,0.00') }}
                  </span>

                  <ArrowUpRightIcon
                    v-if="player.kgTrending === 1"
                    class="h-8 w-8 text-green-500"
                  >
                  </ArrowUpRightIcon>
                  <ArrowRightIcon
                    v-if="player.kgTrending === 0"
                    class="h-8 w-8"
                  >
                  </ArrowRightIcon>
                  <ArrowDownRightIcon
                    v-if="player.kgTrending === -1"
                    class="h-8 w-8 text-red-500"
                  >
                  </ArrowDownRightIcon>
                </div>
              </div>

              <div
                :style="{ borderColor: player.color }"
                class="bg-zinc-600 p-2 border-l-4 rounded-lg mb-5 w-full bg-opacity-50"
              >
                <div class="mb-3 font-thin">Session K/G</div>
                <div class="flex justify-center items-end">
                  <span class="text-4xl font-thin"
                    >{{ numeral(player.currentSessionAvgKg).format('0,0.00') }}
                  </span>

                  <ArrowUpRightIcon
                    v-if="player.CurrentSessionTrending === 1"
                    class="h-8 w-8 text-green-500"
                  >
                  </ArrowUpRightIcon>
                  <ArrowRightIcon
                    v-if="player.CurrentSessionTrending === 0"
                    class="h-8 w-8"
                  >
                  </ArrowRightIcon>
                  <ArrowDownRightIcon
                    v-if="player.CurrentSessionTrending === -1"
                    class="h-8 w-8 text-red-500"
                  >
                  </ArrowDownRightIcon>
                </div>
              </div>
            </div>

            <div
              :style="{ borderColor: player.color }"
              class="bg-zinc-600 p-2 px-5 border-l-4 rounded-lg mb-5 bg-opacity-50"
            >
              <div class="mb-3 font-thin">Statistics</div>

              <div class="flex flex justify-between">
                <div class="text-right text-sm font-thin leading-6">
                  <div class="mb-3 font-normal">Global stats</div>
                  <div>
                    Games played:
                    <strong>{{
                      numeral(player.gamesPlayed).format('0')
                    }}</strong>
                  </div>

                  <div>
                    Total kills:
                    <strong>{{
                      numeral(player.totalKills).format('0')
                    }}</strong>
                  </div>
                  <div>
                    Avg kills/game:
                    <strong>{{
                      numeral(player.avgKg).format('0,0.00')
                    }}</strong>
                  </div>
                  <div>
                    Best player:
                    <strong
                      >{{ numeral(player.topPlayer).format('0') }} game{{
                        player.topPlayer > 1 ? 's' : ''
                      }}</strong
                    >
                  </div>
                  <div class="mb-3">
                    <!-- <InformationCircleIcon
                      class="h-4 w-4 inline"
                      title="  Will be higher if the data varies greatly. If the data
                          is very uniform, the value will be low."
                    ></InformationCircleIcon> -->

                    Variation:
                    <strong>{{
                      numeral(player.coefficientOfVariation).format('0,0.00')
                    }}</strong>
                  </div>
                </div>
                <div
                  v-if="currentSession"
                  class="text-left text-sm font-thin leading-6"
                >
                  <div class="mb-3 font-normal">Session stats</div>

                  <div>
                    Games played:
                    <strong>{{
                      numeral(
                        currentSessionStats[player._id].totalGames
                      ).format('0')
                    }}</strong>
                  </div>

                  <div>
                    Total kills:
                    <strong>{{
                      numeral(currentSessionStats[player._id].totalKill).format(
                        '0'
                      )
                    }}</strong>
                  </div>
                  <div>
                    Avg kills/game:
                    <strong>{{
                      numeral(
                        currentSessionStats[player._id].averageKill
                      ).format('0,0.00')
                    }}</strong>
                  </div>
                  <div>
                    Best player:
                    <strong
                      >{{
                        numeral(
                          currentSessionStats[player._id].topPlayer
                        ).format('0')
                      }}
                      game{{
                        currentSessionStats[player._id].topPlayer ? 's' : ''
                      }}</strong
                    >
                  </div>
                  <div
                    class="mb-3"
                    title="Will be higher if the data varies greatly. If the data is very uniform, the value will be low."
                  >
                    Variation:
                    <strong>{{
                      numeral(
                        player.currentSessionCoefficientOfVariation
                      ).format('0,0.00')
                    }}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="currentSession"
              :style="{ borderColor: player.color }"
              class="lex flex-col bg-zinc-600 p-2 border-l-4 rounded-lg flex-col flex mb-5 bg-opacity-50"
            >
              <Bar
                class="mb-3 max-h-[20rem]"
                :options="
                  Object.assign({}, chartOptions, {
                    scales: {
                      y: {
                        max: maxKg,
                        ticks: { color: 'white', beginAtZero: true },
                      },
                      x: { ticks: { color: 'white', beginAtZero: true } },
                    },
                  })
                "
                :data="playerChartData[player._id].avgKg"
              />

              <Bar
                class="mb-3 max-h-[20rem]"
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
    </div>
    <div
      style="padding-top: 10rem; padding-bottom: 10rem"
      class="relative bg-gradient-to-b from-zinc-700 to-zinc-800"
    >
      <h1 class="text-white font-thin text-6xl text-center mb-[10rem]">
        Current session stats
      </h1>

      <div
        class="bg-zinc-800 relative flex-1 min-w-[300px] p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Stacked players kills / current session games
        </h1>

        <div class="flex w-full mx-auto overflow-auto">
          <Bar
            class="mb-3 w-full h-[400px]"
            :options="stackedChartOptions"
            :data="globalChartData.stackedPlayersCurrentSessionKills"
          />
        </div>
      </div>
      <div
        class="bg-zinc-800 relative flex-1 min-w-[300px] p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
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
        class="bg-zinc-800 relative flex-1 min-w-[300px] p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Current session kills repartition
        </h1>
        <div class="flex mx-auto overflow-auto">
          <Doughnut
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.currentSessionKillsRepartition"
          ></Doughnut>
        </div>
      </div>

      <div
        class="bg-zinc-800 p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Current session team ranks (Lower is better)
        </h1>

        <div class="flex mx-auto overflow-auto">
          <Bar
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.currentSessionTeamRanks"
          />
        </div>
      </div>

      <h1
        class="text-white font-thin text-6xl text-center mb-[100px] mt-[100px]"
      >
        Global stats
      </h1>
      <div
        class="bg-zinc-800 p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Average team rank evolution (Lower is better)
        </h1>

        <div class="flex mx-auto overflow-auto">
          <Bar
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.globalTeamRanks"
          />
        </div>
      </div>
      <div
        class="bg-zinc-800 p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Team K/G evolution
        </h1>

        <div class="flex mx-auto overflow-auto">
          <Bar
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.teamAverageKillsPerSession"
          />
        </div>
      </div>
      <div
        class="bg-zinc-800 p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Players total kills during each sessions
        </h1>
        <div class="flex mx-auto overflow-auto">
          <Bar
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.playersSessionKills"
          />
        </div>
      </div>

      <div
        class="bg-zinc-800 p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Players K/G evolution
        </h1>
        <div class="flex mx-auto overflow-auto">
          <Line
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.sessionsPlayerAvgKillsPerSession"
          />
        </div>
      </div>
      <div
        class="bg-zinc-800 p-10 max-w-[80rem] mx-auto rounded-xl shadow-xl mb-10 border-t-8 border-[#7ec92e]"
      >
        <h1 class="text-white font-thin text-2xl text-center mb-5">
          Total kills repartition
        </h1>
        <div class="flex mx-auto overflow-auto">
          <Doughnut
            class="mb-3 w-full h-[400px]"
            :options="chartOptions"
            :data="globalChartData.globalKillsRepartition"
          ></Doughnut>
        </div>
      </div>
    </div>

    <div class="p-10 bg-zinc-900 text-center text-white text-xl">
      Released 100% by MarlburroW -> C'est faux
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  StarIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/solid';
import tinycolor from 'tinycolor2';
</script>

<script lang="ts">
import dataMixin from './data-mixin';
import { IComputedScore } from '../api/collections/Games';
import { Player } from '../api/collections/Players';
import { defineComponent } from 'vue';
import { Bar, Line, Doughnut } from 'vue-chartjs';
import 'chart.js/auto';
import numeral from 'numeral';
import Fire from './Fire.vue';

numeral.locale('fr');

export default defineComponent({
  components: { Bar, Line, Doughnut, Fire },
  mixins: [dataMixin],
  data() {
    return {
      activeOnly: true,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: true,
        scales: {
          y: {
            ticks: { color: 'white', beginAtZero: true },
          },
          x: {
            ticks: { color: 'white', beginAtZero: true },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: 'white',

              font: {
                size: 15,
              },
            },
          },
        },
      },
      stackedChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: true,
        scales: {
          y: {
            ticks: { color: 'white', beginAtZero: true },
            stacked: true,
          },
          x: {
            ticks: { color: 'white', beginAtZero: true },
            stacked: true,
          },
        },
        plugins: {
          legend: {
            labels: {
              color: 'white',

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
      const currentSession : any[] = this.groupedComputedGames[this.groupedComputedGames.length - 1];

      // Iterate over all score and find the max

      return currentSession.reduce((accGame, game) => {
        const maxGameScore = game.scores.reduce((accScore, score) => {
          return Math.max(accScore, score.score);
        }, 0);

        return Math.max(accGame, maxGameScore);
      }, 0);
    },

    globalChartData() {
      const sessions : [] = this.groupedComputedGames;
      const latestSession = this.currentSession ? this.currentSession : [];
      const latestSessionKills = latestSession
        .slice()
        .reverse()
        .map((g) => {
          return g.scores.reduce(
            (acc, s) => Number(acc) + Number(s.score, 0),
            0
          );
        });

      return {
        latestSessionKills: {
          labels: [
            ...latestSessionKills.map((_s, index) => `Game ${index + 1}`),
          ],
          datasets: [
            {
              label: 'Latest session team kills',
              data: latestSessionKills,
              backgroundColor: 'rgba(25, 255, 25, 0.2)',
              borderColor: 'rgba(25, 255, 25, 1)',
              borderWidth: 1,
            },
          ],
        },
        globalKillsRepartition: {
          labels: this.activePlayers.map(
            (p: { nickname: string }) => p.nickname
          ),
          datasets: [
            {
              data: this.activePlayers.map((p: { _id: string }) => {
                return this.computedGames.reduce((acc, g) => {
                  const score = g.scores.find(
                    (s: { playerId: string }) => s.playerId === p._id
                  );
                  return Number(acc) + Number(score ? score.score : 0);
                }, 0);
              }),
              backgroundColor: this.activePlayers.map(
                (p: { color: string }) => p.color
              ),
            },
          ],
        },
        currentSessionKillsRepartition: {
          labels: this.activePlayers.map(
            (p: { nickname: string }) => p.nickname
          ),
          datasets: [
            {
              data: this.activePlayers.map((p: { _id: string }) => {
                return latestSession.reduce(
                  (acc: number, g: { scores: IComputedScore[] }) => {
                    const score = g.scores.find((s) => s.playerId === p._id);
                    return Number(acc) + Number(score ? score.score : 0);
                  },
                  0
                );
              }),
              backgroundColor: this.activePlayers.map(
                (p: { color: string }) => p.color
              ),
            },
          ],
        },

        teamAverageKillsPerSession: {
          labels: sessions ? [...sessions.map((session, index) => `Session ${index + 1}`)] : [],
          datasets: [
            {
              label: "Team avg kills",
              data: sessions ? sessions.map((session) => {
                return (
                  session
                    .map((g) => {
                      return g.scores.reduce(
                        (acc, s) => Number(acc) + Number(s.score),
                        0
                      );
                    })
                    .reduce((acc, s) => Number(acc) + Number(s), 0) /
                  session.length
                );
              }) : [],
              backgroundColor: 'rgba(16, 185, 129, 0.50)',

              borderWidth: 1,
            },
          ],

        },

        sessionsPlayerAvgKillsPerSession: {
          labels: [...sessions.map((_s, index) => `Session ${index + 1}`)],
          datasets: [
            ...this.activePlayers.map((p, index) => {
              return {
                label: p.nickname,
                cubicInterpolationMode: 'monotone',
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 15,
                pointHitRadius: 30,
                pointStyle: 'circle',
                data: sessions.map((session) => {
                  const playerSessionGames = session.filter((g) => {
                    return g.scores.find(
                      (s) => s.playerId === p._id && s.score !== null
                    );
                  });

                  const playerSessionGameCount = playerSessionGames.length;

                  if (playerSessionGameCount === 0) {
                    return null;
                  }

                  return (
                    playerSessionGames
                      .map((g) => {
                        const score = g.scores.find(
                          (s) => s.playerId === p._id
                        );
                        return score && score.score !== null
                          ? score.score
                          : null;
                      })
                      .reduce((acc, s) => Number(acc) + Number(s), 0) /
                    playerSessionGameCount
                  );
                }),
                backgroundColor: p.color,
                borderColor: p.color,
                borderWidth: 4,
                pointBorderWidth: 0,
              };
            }),
          ],
        },

        playersSessionKills: {
          labels: [...sessions.map((_s, index) => `Session ${index + 1}`)],
          datasets: this.activePlayers.map((p, index) => {
            return {
              label: p.nickname,

              data: sessions.map((session) => {
                return session
                  .map((g) => {
                    const score = g.scores.find((s) => s.playerId === p._id);
                    return score ? score.score : 0;
                  })
                  .reduce((acc, s) => Number(acc) + Number(s), 0);
              }),
              backgroundColor: p.color,
              borderColor: p.color,
              borderWidth: 1,
            };
          }),
        },

        stackedPlayersCurrentSessionKills: {
          labels: [
            ...latestSessionKills.map((_s, index) => `Game ${index + 1}`),
          ],

          datasets: this.activePlayers.map((p, index) => {
            return {
              label: p.nickname,

              data: latestSession
                .slice()
                .reverse()
                .map((g) => {
                  const score = g.scores.find(
                    (s: { playerId: string }) => s.playerId === p._id
                  );
                  return score ? score.score : 0;
                }),
              backgroundColor: p.color,
              borderColor: p.color,
              borderWidth: 4,
            };
          }),
        },

        globalTeamRanks: {
          labels: [...sessions.map((_s, index) => `Session ${index + 1}`)],
          datasets: [
            {
              label: "Team average rank",
              data: sessions.map((session) => {
                return (
                  session
                    .map((g: { rank: number }) => {
                      return g.rank;
                    })
                    .reduce((acc: number, s: number) => acc + s, 0) /
                  session.length
                );
              }),
              backgroundColor: sessions.map((session) => {
                const avgRank =
                  session
                    .map((g) => {
                      return g.rank;
                    })
                    .reduce((acc: number, s: number) => acc + s, 0) /
                  session.length;

                if (avgRank === 1) {
                  return '#fde047';
                } else if (avgRank === 2) {
                  return '#a3e635';
                } else if (avgRank === 3) {
                  return '#a3e635';
                } else if (avgRank > 10) {
                  return '#dc2626';
                } else {
                  return 'rgba(108, 117, 125, 0.50)';
                }
              }),
              borderWidth: 1,
            },
          ],
        },
        currentSessionTeamRanks: {
          labels: [
            ...latestSession
              .slice()
              .reverse()
              .map(
                (g, index) =>
                  `Game ${index + 1} ${this.getRankIndicator(g.rank)}`
              ),
          ],
          datasets: [
            {
              label: "Team rank",
              data: latestSession
                .slice()
                .reverse()
                .map((g) => {
                  return g.rank;
                }),
              backgroundColor: latestSession
                .slice()
                .reverse()
                .map((g) => {
                  if (g.rank === 1) {
                    return "#fde047";
                  } else if (g.rank === 2) {
                    return "#a3e635";
                  } else if (g.rank === 3) {
                    return "#a3e635";
                  } else if (g.rank > 10) {
                    return "#dc2626";
                  } else {
                    return "rgba(108, 117, 125, 0.50)";
                  }
                }),

              borderWidth: 1,
            },
          ],
        },

        playersCurrentSessionKills: {
          labels: [
            ...latestSessionKills.map((_s, index) => `Game ${index + 1}`),
          ],

          datasets: this.activePlayers.map((p, index) => {
            return {
              label: p.nickname,
              cubicInterpolationMode: 'monotone',
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 15,
              pointHitRadius: 30,
              pointStyle: 'circle',
              data: latestSession
                .slice()
                .reverse()

                .map((g) => {
                  const score = g.scores.find(
                    (s: { playerId: string }) => s.playerId === p._id
                  );

                  if (score && score.score !== null) {
                    return score.score;
                  } else {
                    return null;
                  }
                }),
              backgroundColor: p.color,

              borderColor: p.color,
              pointBackgroundColor: p.color,
              borderWidth: 4,
              pointBorderWidth: 0,
            };
          }),
        },
      };
    },

    maxKg() {
      const data = Object.values(this.playerChartData)

        .map((pcd) => {
          return pcd.avgKg.datasets.map((d) => {
            return d.data;
          });
        })
        .flat(2)

        .filter((d) => !isNaN(d));

      return Math.ceil(Math.max(...data));
    },

    playerChartData() {
      const options = {};

      const sessions = this.groupedComputedGames;

      const sessionsStats = sessions.map((s) => this.getSessionStats(s));

      for (let i = 0; i < this.activePlayers.length; i++) {
        const player = this.activePlayers[i];

        const playerSessionsKills = sessions.map((session) => {
          return session
            .map((g) => {
              const score = g.scores.find(
                (s: { playerId: string }) => s.playerId === player._id
              );
              return score ? score.score : 0;
            })
            .reverse();
        });

        const latestSessionKills =
          playerSessionsKills[playerSessionsKills.length - 1];

        const playerStats = sessionsStats.map((s) => s[player._id]);

        options[player._id] = {
          avgKg: {
            labels: [...playerStats.map((_s, index) => `Session ${index + 1}`)],
            datasets: [
              {
                label: 'Avg kills / game',
                backgroundColor: player.color,

                borderRadius: 4,
                data: playerStats.map(
                  (s: { averageKill: number }) => s.averageKill
                ),
              },
            ],
          },
          latestSessionKills: {
            labels: [...latestSessionKills.map((_g, index) => index + 1)],
            datasets: [
              {
                label: 'Session kills / games',
                backgroundColor: player.color,
                borderRadius: 4,
                data: latestSessionKills,
              },
            ],
          },
        };
      }
      return options;
    },

    currentSessionStats() {
      if (this.currentSession) {
        return this.getSessionStats(this.currentSession);
      }

      return null;
    },

    currentSession() {
      // return last session of this.groupedComputedGames

      return this.groupedComputedGames[this.groupedComputedGames.length - 1];
    },
  },

  methods: {
    numeral,
    isOnFire(player: Player): boolean {
      if (player.currentSessionAvgKg && player.avgKg) {
        return (
          player.currentSessionAvgKg > player.avgKg &&
          this.currentSession.filter((g) => {
            return (
              g.scores.find((s) => s.playerId === player._id).score != null
            );
          }).length >= 3
        );
      }
      return false;
    },

    getMmrEvolution(player: Player) {
      if (
        player.mmr &&
        player.mmr != 0 &&
        player.lastMmr &&
        player.lastMmr != 0
      ) {
        return Math.round(player.mmr - player.lastMmr);
      }
      return null;
    },
    getProgressMmrStyle(player: Player) {
      return `width:${player.pourcentNextLevel}%;`;
    },
    getSessionStats(session) {
      const stats = {};
      if (!session) {
        return stats;
      }
      for (const element of this.activePlayers) {
        const player = element;

        stats[player._id] = {
          totalKill: 0,
          totalGames: 0,
          averageKill: 0,
          topPlayer: 0,
        };

        console.log('session', session);
        const playedGames = session
          .filter((game) =>
            game.scores.map((s) => s.playerId).includes(player._id)
          )
          .filter(
            (game) =>
              game.scores.find((s) => s.playerId === player._id).score !== null
          );

        // get top player number by session
        for (const game of playedGames) {
          const maxScore = Math.max(...game.scores.map((s) => s.score));
          const playerScore = game.scores.find(
            (s: { playerId: string }) => s.playerId === player._id
          ).score;
          if (playerScore >= maxScore) {
            stats[player._id].topPlayer += 1;
          }
        }
        stats[player._id].totalGames = playedGames.length;
        stats[player._id].totalKill = playedGames
          .map(
            (game) =>
              game.scores.find(
                (s: { playerId: string }) => s.playerId === player._id
              ).score
          )
          .reduce((a: number, b: number) => a + b, 0);
        stats[player._id].averageKill =
          stats[player._id].totalKill / stats[player._id].totalGames;
      }

      return stats;
    },
    getMmrLogo(level: number): string {
      const map = {
        0: '/images/new/nc.png',
        1: '/images/new/vomit.png',
        2: '/images/new/b3.png',
        3: '/images/new/b2.png',
        4: '/images/new/b1.png',
        5: '/images/new/a3.png',
        6: '/images/new/a2.png',
        7: '/images/new/a1.png',
        8: '/images/new/g3.png',
        9: '/images/new/g2.png',
        10: '/images/new/g1.png',
        11: '/images/new/p3.png',
        12: '/images/new/p2.png',
        13: '/images/new/p1.png',
        14: '/images/new/d3.png',
        15: '/images/new/d2.png',
        16: '/images/new/d1.png',
        17: '/images/new/m3.png',
        18: '/images/new/m2.png',
        19: '/images/new/m1.png',
        20: '/images/new/gm.png',
      };
      return map[level];
    },
  },
});
</script>
