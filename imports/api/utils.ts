import { Player, Players } from './collections/Players'
import { Game, Games } from './collections/Games'
import moment from 'moment'

export { updatePlayerScores, assignPlayersColors, computeGames }

const updatePlayerScores = function () {
  // Fetch players
  const players = Players.find({ active: true }).fetch()
  // Fetch updated game backlog
  const games = Games.find({ active: true }).fetch()

  // Compute player scores from backlog

  for (const player of players) {
    computePlayerScoreFromBacklog(player, games)
  }
}

const computeGames = function () {
  let games = Games.find().fetch()

  let sessionCounter = 1

  // Sort games by createdDate asc to compute in the right order

  games = games.sort((a: Game, b: Game) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  games.forEach((game, i) => {
    if (Object.prototype.hasOwnProperty.call(game, 'createdAt')) {
      const currentGameDate = moment(game.createdAt)
      const previousGame = games[i - 1]

      if (previousGame) {
        const previousGameDate = moment(previousGame.createdAt)

        const diff = currentGameDate.diff(previousGameDate, 'minutes')

        if (diff >= 60) {
          sessionCounter = sessionCounter + 1
        }
      }
    }

    Games.update(game._id, {
      $set: {
        scores: game.scores,
        sessionId: sessionCounter,
        rank: game.rank,
      },
    })
  })
}

export const computePlayerScoreFromBacklog = function (
  player: Player,
  games: Game[]
) {
  // Order games by createdDate asc

  // Reset player attributes
  player.balance = 0
  player.lastGameKills = 0
  player.level = 0
  player.totalKills = 0
  player.gamesPlayed = 0
  player.pourcentNextLevel = 0
  player.topPlayer = 0
  const playerId: string = player._id

  // Sort games by createdDate asc to compute in the right order

  games = games.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // Iterate over games

  const gameRankList: number[] = []
  const playerKillList: number[] = []
  const bonusList: number[] = []

  // Reset player attributes if no games

  if (games.length === 0) {
    initializePlayerValues(playerId)
    return
  }

  games.forEach((game, i) => {
    // Check if player has played in this game, and only compute score if so
    if (
      Object.prototype.hasOwnProperty.call(game.scores, playerId) &&
      typeof game.scores[playerId as keyof typeof game.scores] === 'number'
    ) {
      if (game.rank) {
        const bonus = getBonus(game.rank)
        if (bonus != null) {
          bonusList.push(bonus)
        }
      }

      const arrScores: number[] = Object.values(
        game.scores
      ) as unknown as number[]
      const filteredArrScores = arrScores.filter((kill): kill is number => {
        return true
      })
      const maxScore = Math.max(...filteredArrScores)
      const playerScore = game.scores[
        playerId as keyof typeof game.scores
      ] as number
      if (playerScore) {
        player.totalKills = player.totalKills + playerScore
        player.gamesPlayed = player.gamesPlayed + 1
        playerKillList.push(playerScore)
        if (playerScore >= maxScore) {
          player.topPlayer++
        }
      }
    }

    if (player.gamesPlayed >= 5) {
      if (i === games.length - 2) {
        player.lastMmr = calculateMmr(bonusList, gameRankList, playerKillList)
      }
      if (i === games.length - 1) {
        player.mmr = calculateMmr(bonusList, gameRankList, playerKillList)
      }
    }
  })

  // calculate mmr

  if (player.mmr) {
    player.level = getLeagueNumber(player.mmr)
    player.pourcentNextLevel = getPourcentNextLevel(player.mmr, player.level)
  }

  const latestSessionGames = games.filter((game) => {
    return game.sessionId === games[games.length - 1]?.sessionId
  })

  const playerCurrentSessionKillList = latestSessionGames.map((game) => {
    return game.scores[playerId as keyof typeof game.scores]
  })

  const filteredPlayerCurrentSessionKillList =
    playerCurrentSessionKillList.filter((kill): kill is number => {
      return typeof kill === 'number'
    })

  // Calculate player statistics

  player.coefficientOfVariation = getCoefficientOfVariation(playerKillList)
  player.kgTrending = getPlayerKGTrending(playerKillList)
  player.avgKg = getAvg(playerKillList)

  if (playerCurrentSessionKillList.length > 0) {
    player.currentSessionCoefficientOfVariation = getCoefficientOfVariation(
      filteredPlayerCurrentSessionKillList
    )
    player.CurrentSessionTrending = getPlayerKGTrending(
      filteredPlayerCurrentSessionKillList
    )

    player.currentSessionAvgKg = getAvg(filteredPlayerCurrentSessionKillList)
  }
  player.currentSessionCoefficientOfVariation = getCoefficientOfVariation(
    filteredPlayerCurrentSessionKillList
  )
  player.CurrentSessionTrending = getPlayerKGTrending(
    filteredPlayerCurrentSessionKillList
  )

  player.currentSessionAvgKg = getAvg(filteredPlayerCurrentSessionKillList)

  // Update player

  Players.update(player._id, {
    $set: {
      balance: player.balance,
      lastGameKills: player.lastGameKills,
      level: player.level,
      gamesPlayed: player.gamesPlayed,
      totalKills: player.totalKills,
      mmr: player.mmr,
      lastMmr: player.lastMmr,
      pourcentNextLevel: player.pourcentNextLevel,
      currentSessionAvgKg: player.currentSessionAvgKg,
      CurrentSessionTrending: player.CurrentSessionTrending,
      avgKg: player.avgKg,
      kgTrending: player.kgTrending,
      topPlayer: player.topPlayer,
      coefficientOfVariation: player.coefficientOfVariation,
      currentSessionCoefficientOfVariation:
        player.currentSessionCoefficientOfVariation,
    },
  })
}

const initializePlayerValues = function (playerId: string) {
  Players.update(playerId, {
    $set: {
      lastGameKills: 0,
      level: 0,
      totalKills: 0,
      gamesPlayed: 0,
      mmr: 0,
      lastMmr: 0,
      currentSessionAvgKg: 0,
      CurrentSessionTrending: 0,
      avgKg: 0,
      kgTrending: 0,
      pourcentNextLevel: 0,
      topPlayer: 0,
      coefficientOfVariation: 0,
      currentSessionCoefficientOfVariation: 0,
    },
  })
}
const getBonus = function (gameRank: number): number | null {
  if (gameRank === 1) {
    return 5
  } else if (gameRank === 2) {
    return 3
  } else if (gameRank === 3) {
    return 2
  } else if (gameRank > 3 && gameRank <= 5) {
    return 1
  } else if (gameRank >= 12) {
    return -1
  }
  return null
}
const calculateMmr = function (
  bonus: number[],
  gameRankList: number[],
  playerKillList: number[]
): number {
  const smoothingBonus = getAvg(bonus)
  const smoothingRecentBonus = smoothing(bonus.slice(-20))
  const WeightedBonus = (smoothingBonus + smoothingRecentBonus) / 2

  const smoothingGameRankAverage = getAvg(gameRankList)
  const smoothingRecentGameAverage = smoothing(gameRankList.slice(-20))
  const WeightedGameRank =
    (smoothingGameRankAverage + smoothingRecentGameAverage) / 2

  const smoothingPlayerKill = getAvg(playerKillList)
  const smoothingRecentPlayerKill = smoothing(playerKillList.slice(-20))
  const WeightedPlayerKill =
    (smoothingPlayerKill + smoothingRecentPlayerKill) / 2

  const WeightedPlayerKillAndBonus = WeightedPlayerKill + WeightedBonus

  return Math.round(
    (WeightedPlayerKillAndBonus * 3 - WeightedGameRank + 100) * 10
  )
}

const smoothing = function (param: number[]): number {
  const result: number[] = []
  param.forEach((element, i) => {
    let index = 0
    while (index < i + 1) {
      result.push(element)
      index++
    }
  })
  return getAvg(result)
}

const getLeagueNumber = function (mmr: number): number {
  const repartitionLeagues: { [key: number]: number } = {
    20: 1235,
    19: 1220,
    18: 1205,
    17: 1190,
    16: 1175,
    15: 1160,
    14: 1145,
    13: 1130,
    12: 1115,
    11: 1100,
    10: 1085,
    9: 1070,
    8: 1055,
    7: 1040,
    6: 1025,
    5: 1010,
    4: 995,
    3: 980,
    2: 965,
    1: 950,
  }

  let result = 0

  if (mmr === 0) {
    return 0
  } else {
    for (const key in repartitionLeagues) {
      if (repartitionLeagues[key] && mmr >= repartitionLeagues[key]!) {
        result = parseInt(key, 10)
      }
    }
  }
  return result
}

const getPourcentNextLevel = function (mmr: number | undefined, level: number) {
  if (level >= 19) {
    return 100
  }
  let test = false
  let increment = 0
  if (mmr && level) {
    while (!test) {
      if (getLeagueNumber(mmr + increment) !== level) {
        test = true
      } else {
        increment++
      }
    }
    if (level === 19) {
      return Math.trunc((30 - increment) * 100) / 30
    } else {
      return Math.trunc((15 - increment) * 100) / 15
    }
  }
  return 0
}

const getPlayerKGTrending = function (playerKillList: number[]): number {
  let kgTrending = 0
  let kgTrend = 0

  for (let i = 0; i < playerKillList.length; i++) {
    const playerKillsI1 = playerKillList?.[i + 1]
    const playerKills = playerKillList?.[i]
    if (playerKillsI1 && playerKills) {
      kgTrend = kgTrend + playerKillsI1 - playerKills
      if (kgTrend > 0) {
        kgTrending = 1
      } else if (kgTrend < 0) {
        kgTrending = -1
      } else {
        kgTrending = 0
      }
    }
  }
  return kgTrending
}

const getAvg = function (param: number[]): number {
  if (Array.isArray(param) && param.length > 0) {
    return (
      param.reduce((x, y) => {
        return x + y
      }, 0) / param.length
    )
  } else {
    return 0
  }
}

const assignPlayersColors = function () {
  const playerColors = [
    '#0ea5e9',
    '#f87171',
    '#fbbf24',
    '#a3e635',
    '#10b981',
    '#6366f1',
    '#d946ef',
    '#f43f5e',
  ]

  const players = Players.find().fetch()

  players.forEach((player, index) => {
    Players.update(player._id, {
      $set: {
        color: playerColors[index],
      },
    })
  })
}

function getCoefficientOfVariation(array: number[]): number {
  const n = array.length
  const mean = array.reduce((acc, val) => acc + val, 0) / n
  const variance =
    array.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (n - 1)
  const sd = Math.sqrt(variance)
  return (sd / mean) * 100
}
