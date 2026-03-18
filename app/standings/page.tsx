"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function StandingsPage() {

  const [standings, setStandings] = useState<any[]>([])

  useEffect(() => {
    fetchStandings()
  }, [])

  async function fetchStandings() {

    // 🔥 TEAMS
    const { data: teams } = await supabase
      .from("teams")
      .select("*")

    // 🔥 GAMES (solo finalizados)
    const { data: games } = await supabase
      .from("games")
      .select("*")
      .not("home_score", "is", null)

    if (!teams || !games) return

    const table: any = {}

    // INIT
    teams.forEach((t: any) => {
      table[t.id] = {
        name: t.name,
        W: 0,
        L: 0,
        RS: 0,
        RA: 0
      }
    })

    // 🔥 PROCESAR JUEGOS
    games.forEach((g: any) => {

      const home = table[g.home_team]
      const away = table[g.away_team]

      if (!home || !away) return

      // runs
      home.RS += g.home_score
      home.RA += g.away_score

      away.RS += g.away_score
      away.RA += g.home_score

      // wins/losses
      if (g.home_score > g.away_score) {
        home.W++
        away.L++
      } else if (g.away_score > g.home_score) {
        away.W++
        home.L++
      }
    })

    // 🔥 CALCULAR %
    let result = Object.values(table).map((t: any) => {
      const games = t.W + t.L
      return {
        ...t,
        PCT: games ? (t.W / games).toFixed(3) : "0.000"
      }
    })

    // 🔥 ORDENAR
    result.sort((a: any, b: any) => {
      return b.PCT - a.PCT || (b.RS - b.RA) - (a.RS - a.RA)
    })

    setStandings(result)
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>🏆 Standings</h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cell}>Team</th>
            <th style={cell}>W</th>
            <th style={cell}>L</th>
            <th style={cell}>PCT</th>
            <th style={cell}>RS</th>
            <th style={cell}>RA</th>
            <th style={cell}>DIFF</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((t: any, i: number) => (
            <tr key={i}>
              <td style={cell}>{t.name}</td>
              <td style={cell}>{t.W}</td>
              <td style={cell}>{t.L}</td>
              <td style={cell}>{t.PCT}</td>
              <td style={cell}>{t.RS}</td>
              <td style={cell}>{t.RA}</td>
              <td style={cell}>{t.RS - t.RA}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

const tableStyle = {
  marginTop: "20px",
  width: "100%",
  borderCollapse: "collapse" as const
}

const cell = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center" as const
}