"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function LineupPage() {

  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [homePlayers, setHomePlayers] = useState<any[]>([])
  const [awayPlayers, setAwayPlayers] = useState<any[]>([])

  const [homeLineup, setHomeLineup] = useState<string[]>(Array(13).fill(""))
  const [awayLineup, setAwayLineup] = useState<string[]>(Array(13).fill(""))

  const [homePositions, setHomePositions] = useState<string[]>(Array(13).fill(""))
  const [awayPositions, setAwayPositions] = useState<string[]>(Array(13).fill(""))

  useEffect(() => {
    if (gameId) fetchPlayers()
  }, [gameId])

  async function fetchPlayers() {

    const { data: game } = await supabase
      .from("games")
      .select("home_team, away_team")
      .eq("id", gameId)
      .single()

    if (!game) return

    const { data: home } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", game.home_team)

    const { data: away } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", game.away_team)

    setHomePlayers(home || [])
    setAwayPlayers(away || [])
  }

  function updateHomePlayer(index: number, playerId: string) {
    const updated = [...homeLineup]
    updated[index] = playerId
    setHomeLineup(updated)
  }

  function updateAwayPlayer(index: number, playerId: string) {
    const updated = [...awayLineup]
    updated[index] = playerId
    setAwayLineup(updated)
  }

  function updateHomePosition(index: number, pos: string) {
    const updated = [...homePositions]
    updated[index] = pos
    setHomePositions(updated)
  }

  function updateAwayPosition(index: number, pos: string) {
    const updated = [...awayPositions]
    updated[index] = pos
    setAwayPositions(updated)
  }

  async function saveLineup() {

    if (!gameId) {
      alert("Game ID missing")
      return
    }

    const homeInserts = homeLineup
      .map((playerId, index) => ({
        game_id: gameId,
        player_id: playerId,
        batting_order: index + 1,
        position: homePositions[index]
      }))
      .filter(p => p.player_id !== "")

    const awayInserts = awayLineup
      .map((playerId, index) => ({
        game_id: gameId,
        player_id: playerId,
        batting_order: index + 1,
        position: awayPositions[index]
      }))
      .filter(p => p.player_id !== "")

    if (homeInserts.length === 0 || awayInserts.length === 0) {
      alert("Both teams must have players")
      return
    }

    // 🔥 BORRAR LINEUP ANTERIOR
    await supabase
      .from("lineups")
      .delete()
      .eq("game_id", gameId)

    const { error } = await supabase
      .from("lineups")
      .insert([...homeInserts, ...awayInserts])

    if (error) {
      console.error("SUPABASE ERROR:", error)
      alert("Error saving lineup")
      return
    }

    alert("Lineup saved!")

    console.log("Redirecting to:", `/games/${gameId}`)

    // 🔥 REDIRECT AL JUEGO
    router.push(`/games/${gameId}`)
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Lineups ⚾</h1>

      {/* HOME */}
      <h2 style={{ marginTop: "20px" }}>Home Team</h2>

      {homeLineup.map((player, index) => (
        <div key={index} style={{ marginTop: "10px" }}>

          {index + 1}

          <select
            value={player}
            onChange={(e) => updateHomePlayer(index, e.target.value)}
          >
            <option value="">Select player</option>

            {homePlayers.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={homePositions[index]}
            onChange={(e) => updateHomePosition(index, e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="">Pos</option>
            <option>P</option>
            <option>C</option>
            <option>1B</option>
            <option>2B</option>
            <option>3B</option>
            <option>SS</option>
            <option>LF</option>
            <option>CF</option>
            <option>RF</option>
            <option>DH</option>
          </select>

        </div>
      ))}

      {/* AWAY */}
      <h2 style={{ marginTop: "40px" }}>Away Team</h2>

      {awayLineup.map((player, index) => (
        <div key={index} style={{ marginTop: "10px" }}>

          {index + 1}

          <select
            value={player}
            onChange={(e) => updateAwayPlayer(index, e.target.value)}
          >
            <option value="">Select player</option>

            {awayPlayers.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={awayPositions[index]}
            onChange={(e) => updateAwayPosition(index, e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="">Pos</option>
            <option>P</option>
            <option>C</option>
            <option>1B</option>
            <option>2B</option>
            <option>3B</option>
            <option>SS</option>
            <option>LF</option>
            <option>CF</option>
            <option>RF</option>
            <option>DH</option>
          </select>

        </div>
      ))}

      <button
        onClick={saveLineup}
        style={{ marginTop: "30px", padding: "10px" }}
      >
        Save Lineups
      </button>

    </div>
  )
}