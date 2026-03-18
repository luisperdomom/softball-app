"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

type Score = {
  home: number
  away: number
}

type Bases = {
  first: string | null
  second: string | null
  third: string | null
}

export default function GamePage() {

  const params = useParams()
  const gameId = params.id as string

  const [homeTeam, setHomeTeam] = useState<any>(null)
  const [awayTeam, setAwayTeam] = useState<any>(null)
  const [lineup, setLineup] = useState<any[]>([])
  const [mvp, setMvp] = useState<any>(null)
  const [currentPitcher, setCurrentPitcher] = useState("")
  const [homePitcher, setHomePitcher] = useState("")
  const [awayPitcher, setAwayPitcher] = useState("")
  const [homeLineup, setHomeLineup] = useState<any[]>([])
  const [awayLineup, setAwayLineup] = useState<any[]>([])

  const [bases, setBases] = useState<Bases>({
    first: null,
    second: null,
    third: null
  })

  const [outs, setOuts] = useState(0)
  const [inning, setInning] = useState(1)
  const [half, setHalf] = useState<"top" | "bottom">("top")

  const [score, setScore] = useState<Score>({
    home: 0,
    away: 0
  })

  const [scoreboard, setScoreboard] = useState<any>({
    home: {},
    away: {}
  })

  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState<"mercy" | "normal" | null>(null)
  const activeLineup = half === "top" ? awayLineup : homeLineup

  const winnerName =
    score.home > score.away
      ? homeTeam?.name
      : score.away > score.home
      ? awayTeam?.name
      : "Tie"

  useEffect(() => {
    fetchGame()
    fetchLineup()
    fetchLineups()
  }, [])

  async function fetchGame() {
    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single()

    if (game) {
      const { data: home } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", game.home_team)
        .single()

      const { data: away } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", game.away_team)
        .single()

      setHomeTeam(home)
      setAwayTeam(away)
    }
  }

  async function fetchLineup() {
    const { data } = await supabase
      .from("lineups")
      .select(`
        batting_order,
        players (
          id,
          name
        )
      `)
      .eq("game_id", gameId)
      .order("batting_order")

    setLineup(data || [])
  }

  async function fetchLineups() {

  const { data: game } = await supabase
    .from("games")
    .select("home_team, away_team")
    .eq("id", gameId)
    .single()

  if (!game) return

  const { data } = await supabase
    .from("lineups")
    .select(`
      batting_order,
      position,
      players (
        id,
        name,
        team_id
      )
    `)
    .eq("game_id", gameId)
    .order("batting_order")

  if (!data) return

  const home = data.filter(
    (p: any) => p.players.team_id === game.home_team
  )

  const away = data.filter(
    (p: any) => p.players.team_id === game.away_team
  )

  setHomeLineup(home)
  setAwayLineup(away)
}

  function getPlayerName(id: string | null) {
    if (!id) return "-"
    const player = lineup.find((p: any) => p.players.id === id)
    return player ? player.players.name : "-"
  }

  function addRun(team: "home" | "away", inningValue: number) {
    setScore((prev: Score) => ({
      ...prev,
      [team]: prev[team] + 1
    }))

    setScoreboard((prev: any) => {
      const runs = prev[team][inningValue] || 0

      return {
        ...prev,
        [team]: {
          ...prev[team],
          [inningValue]: runs + 1
        }
      }
    })
  }

  async function saveGameResult(finalHome: number, finalAway: number) {
    let winnerId = null
    let loserId = null

    if (finalHome > finalAway) {
      winnerId = homeTeam?.id
      loserId = awayTeam?.id
    } else if (finalAway > finalHome) {
      winnerId = awayTeam?.id
      loserId = homeTeam?.id
    }

    await supabase
      .from("games")
      .update({
        home_score: finalHome,
        away_score: finalAway,
        winner: winnerId,
        loser: loserId
      })
      .eq("id", gameId)
  }

  async function calculateMVP() {
    const { data } = await supabase
      .from("at_bats")
      .select(`
        result,
        rbi,
        players (
          id,
          name
        )
      `)
      .eq("game_id", gameId)

    const scores: any = {}

    data?.forEach((ab: any) => {
      const playerId = ab.players.id
      const name = ab.players.name

      if (!scores[playerId]) {
        scores[playerId] = { name, points: 0 }
      }

      if (ab.result === "single") scores[playerId].points += 1
      if (ab.result === "double") scores[playerId].points += 2
      if (ab.result === "triple") scores[playerId].points += 3
      if (ab.result === "hr") scores[playerId].points += 4

      scores[playerId].points += ab.rbi || 0
    })

    return Object.values(scores).sort(
      (a: any, b: any) => b.points - a.points
    )[0]
  }

  async function recordAtBat(playerId: string, result: string) {

    if (gameOver) {
      alert("Game is already finished")
      return
    }

    if (!homePitcher || !awayPitcher) {
  alert("Select both pitchers")
  return
}

    const team = half === "top" ? "away" : "home"
    const inningValue = inning

    const pitcher = half === "top" ? homePitcher : awayPitcher

    await supabase.from("at_bats").insert({
  game_id: gameId,
  player_id: playerId,
  pitcher_id: pitcher,
  inning: inningValue,
  result
})

    let newBases = { ...bases }

    if (result === "single") {
      if (newBases.third) addRun(team, inningValue)
      newBases.third = newBases.second
      newBases.second = newBases.first
      newBases.first = playerId
    }

    if (result === "double") {
      if (newBases.third) addRun(team, inningValue)
      if (newBases.second) addRun(team, inningValue)
      newBases.third = newBases.first
      newBases.second = playerId
      newBases.first = null
    }

    if (result === "triple") {
      if (newBases.third) addRun(team, inningValue)
      if (newBases.second) addRun(team, inningValue)
      if (newBases.first) addRun(team, inningValue)
      newBases.third = playerId
      newBases.second = null
      newBases.first = null
    }

    if (result === "hr") {
      if (newBases.third) addRun(team, inningValue)
      if (newBases.second) addRun(team, inningValue)
      if (newBases.first) addRun(team, inningValue)
      addRun(team, inningValue)
      newBases = { first: null, second: null, third: null }
    }

    if (result === "walk") {
      if (newBases.first && newBases.second && newBases.third) {
        addRun(team, inningValue)
      }
      if (newBases.first && newBases.second) {
        newBases.third = newBases.second
      }
      if (newBases.first) {
        newBases.second = newBases.first
      }
      newBases.first = playerId
    }

    if (result === "out" || result === "strikeout") {

      const newOuts = outs + 1

      if (newOuts >= 3) {

        const diff = score.home - score.away

        // MERCY
        if ((inning >= 5 && Math.abs(diff) >= 10) || (inning >= 4 && Math.abs(diff) >= 15)) {

          if (diff < 0 && half === "top") {
            // dejar que home batee
          } else {
            setGameOver(true)
            setGameResult("mercy")

            await saveGameResult(score.home, score.away)

            const mvpPlayer = await calculateMVP()
            setMvp(mvpPlayer)

            alert("Game ended by mercy rule ⚾")
            return
          }
        }

        // FINAL NORMAL
        if (inning >= 6 && diff !== 0 && half === "bottom") {

          setGameOver(true)
          setGameResult("normal")

          await saveGameResult(score.home, score.away)

          const mvpPlayer = await calculateMVP()
          setMvp(mvpPlayer)

          alert("Game finished ⚾")
          return
        }

        setOuts(0)
        setBases({ first: null, second: null, third: null })

        if (half === "top") {
          setHalf("bottom")
        } else {
          setHalf("top")
          setInning(prev => prev + 1)
        }

        return
      } else {
        setOuts(newOuts)
      }
    }

    setBases(newBases)
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>⚾ {homeTeam?.name} vs {awayTeam?.name}</h1>

      <h2>
        {homeTeam?.name}: {score.home} | {awayTeam?.name}: {score.away}
      </h2>

      <h3>Home Pitcher</h3>
<select value={homePitcher} onChange={(e) => setHomePitcher(e.target.value)}>
  <option value="">Select Home Pitcher</option>
  {lineup.map((p: any) => (
    <option key={p.players.id} value={p.players.id}>
      {p.players.name}
    </option>
  ))}
</select>


<h3>Away Pitcher</h3>
<select value={awayPitcher} onChange={(e) => setAwayPitcher(e.target.value)}>
  <option value="">Select Away Pitcher</option>
  {lineup.map((p: any) => (
    <option key={p.players.id} value={p.players.id}>
      {p.players.name}
    </option>
  ))}
</select>

      {gameOver && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "10px",
          background: "#ffecec",
          border: "1px solid #ff4d4d"
        }}>
          <h2>🏁 FINAL</h2>
          <p>{homeTeam?.name} {score.home} - {awayTeam?.name} {score.away}</p>
          <strong>🏆 Winner: {winnerName}</strong>
          <p>{gameResult === "mercy" ? "Game ended by Mercy Rule ⚾" : "Game completed ⚾"}</p>
        </div>
      )}

      {gameOver && mvp && (
        <h2 style={{ marginTop: "10px", color: "green" }}>
          🏆 MVP: {mvp.name}
        </h2>
      )}

      <h3>{half === "top" ? "Top" : "Bottom"} {inning}</h3>
      <p>Outs: {outs}</p>

      <p style={{ marginTop: "10px" }}>
     Pitching: {
     half === "top"
      ? getPlayerName(homePitcher)
      : getPlayerName(awayPitcher)
      }
     </p>

      <p>
        Bases:
        1B: {getPlayerName(bases.first)} |
        2B: {getPlayerName(bases.second)} |
        3B: {getPlayerName(bases.third)}
      </p>

      <h3>Scoreboard</h3>

      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cell}>Team</th>
            {[1,2,3,4,5,6].map(i => <th key={i} style={cell}>{i}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cell}>{homeTeam?.name}</td>
            {[1,2,3,4,5,6].map(i => <td key={i} style={cell}>{scoreboard.home[i] || 0}</td>)}
          </tr>
          <tr>
            <td style={cell}>{awayTeam?.name}</td>
            {[1,2,3,4,5,6].map(i => <td key={i} style={cell}>{scoreboard.away[i] || 0}</td>)}
          </tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: "30px" }}>Lineups</h2>

<div style={{ display: "flex", gap: "50px" }}>

  {/* HOME */}
  <div>
    <h3>{homeTeam?.name}</h3>

    {homeLineup.map((p: any) => (
      <div key={p.batting_order}>
        {p.batting_order} - {p.players?.name} ({p.position || "-"})
      </div>
    ))}
  </div>

  {/* AWAY */}
  <div>
    <h3>{awayTeam?.name}</h3>

    {awayLineup.map((p: any) => (
      <div key={p.batting_order}>
        {p.batting_order} - {p.players?.name} ({p.position || "-"})
      </div>
    ))}
  </div>

</div>
      
      <h2 style={{ marginTop: "30px" }}>Lineup</h2>

      {activeLineup.map((player: any) => (
        <div key={player.batting_order} style={{ marginTop: "20px" }}>
          <strong>{player.batting_order} — {player.players?.name}</strong>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "single")}>1B</button>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "double")}>2B</button>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "triple")}>3B</button>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "hr")}>HR</button>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "walk")}>BB</button>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "strikeout")}>SO</button>
            <button style={btn} onClick={() => recordAtBat(player.players.id, "out")}>OUT</button>
          </div>
        </div>
      ))}

    </div>
  )
}

const btn = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#f5f5f5",
  cursor: "pointer"
}

const cell = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center" as const
}