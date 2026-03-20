"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function HomePage() {

  const [teams, setTeams] = useState<any[]>([])
  const [standings, setStandings] = useState<any[]>([])
  
  useEffect(() => {
    fetchTeams()
    fetchStandings()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase
      .from("teams")
      .select("*")

    setTeams(data || [])
  }

  async function fetchStandings() {

    const { data: teams } = await supabase
      .from("teams")
      .select("*")

    const { data: games } = await supabase
      .from("games")
      .select("*")
      .not("home_score", "is", null)

    if (!teams || !games) return

    const table: any = {}

    teams.forEach((t: any) => {
      table[t.id] = {
        name: t.name,
        W: 0,
        L: 0
      }
    })

    games.forEach((g: any) => {

      if (!table[g.home_team] || !table[g.away_team]) return

      if (g.home_score > g.away_score) {
        table[g.home_team].W++
        table[g.away_team].L++
      } else if (g.away_score > g.home_score) {
        table[g.away_team].W++
        table[g.home_team].L++
      }
    })

    const result = Object.values(table).map((t: any) => {
      const total = t.W + t.L
      return {
        ...t,
        pct: total ? (t.W / total).toFixed(3) : "0.000"
      }
    })

    result.sort((a: any, b: any) => b.pct - a.pct)

    setStandings(result)
  }

  return (
    <div style={container}>

      {/* HEADER */}
      <h1 style={title}>🏆 Liga del Pacífico</h1>
      
      {/* QUICK ACTIONS */}
      
      <div style={actions}>
        <Link href="/create-game"><button style={btn}>⚾ Crear Juego</button></Link>
        <Link href="/teams"><button style={btn}>🏆 Equipos</button></Link>
        <Link href="/stats"><button style={btn}>📊 Stats</button></Link>
        <Link href="/roster"><button style={btn}>👥 Roster</button></Link>
      </div>

      {/* STANDINGS */}
      <h2 style={{ marginTop: "40px" }}>🏆 Standings</h2>

      <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={cell}>Team</th>
            <th style={cell}>W</th>
            <th style={cell}>L</th>
            <th style={cell}>PCT</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((t: any, i: number) => (
            <tr key={i}>
              <td style={cell}>{t.name}</td>
              <td style={cell}>{t.W}</td>
              <td style={cell}>{t.L}</td>
              <td style={cell}>{t.pct}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* TEAMS GRID */}
      <h2 style={{ marginTop: "40px" }}>Equipos</h2>

      <div style={grid}>
        {teams.map((team: any) => (
          <div
            key={team.id}
            style={card}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >

            {/* LOGO */}
            <div style={logoContainer}>
              {team.logo ? (
                <img src={team.logo} style={logo} />
              ) : (
                <div style={placeholderLogo}>⚾</div>
              )}
            </div>

            <h3 style={teamName}>{team.name}</h3>
            <p style={teamCity}>{team.city}</p>

            <Link href={`/teams/${team.id}`}>
              <button style={smallBtn}>Ver Equipo</button>
            </Link>

          </div>
        ))}
      </div>

    </div>
  )
}

/* STYLES */

const container = {
  padding: "20px",
  background: "#f5f6f7",
  minHeight: "100vh"
}

const title = {
  fontSize: "24px",
  fontWeight: "bold"
}

const subtitle = {
  color: "#666",
  marginBottom: "20px"
}

const actions = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginTop: "20px"
}

const btn = {
  padding: "12px",
  fontSize: "14px",
  borderRadius: "10px",
  background: "#111",
  color: "#fff"
}

const smallBtn = {
  marginTop: "10px",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  background: "#0070f3",
  color: "#fff",
  cursor: "pointer"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "20px",
  marginTop: "20px"
}

const card = {
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  textAlign: "center" as const,
  transition: "0.2s",
  cursor: "pointer"
}

const logoContainer = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "10px"
}

const logo = {
  width: "60px",
  height: "60px",
  objectFit: "cover" as const,
  borderRadius: "50%"
}

const placeholderLogo = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px"
}

const teamName = {
  margin: "10px 0 5px 0"
}

const teamCity = {
  color: "#666",
  fontSize: "14px"
}

const table = {
  marginTop: "20px",
  width: "100%",
  borderCollapse: "collapse" as const
}

const cell = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center" as const
}