"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function StatsPage() {

  const [players, setPlayers] = useState<any[]>([])
  const [statFilter, setStatFilter] = useState("ops")
  const [tab, setTab] = useState<"batting" | "pitching">("batting")

  useEffect(() => {
    fetchStats()
  }, [statFilter])

  async function fetchStats() {

    const { data: players } = await supabase
      .from("players")
      .select("*")

    const { data: atBats } = await supabase
      .from("at_bats")
      .select("*")

    if (!players || !atBats) return

    const statsMap: any = {}

    players.forEach((p: any) => {
      statsMap[p.id] = {
        id: p.id,
        name: p.name,
        hits: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        hr: 0,
        walks: 0,
        strikeouts: 0,
        rbi: 0,
        ab: 0,
        hitsAllowed: 0,
        walksAllowed: 0,
        strikeoutsP: 0,
        runsAllowed: 0,
        outsPitched: 0
      }
    })

    atBats.forEach((ab: any) => {

      if (!statsMap[ab.player_id]) return

      const p = statsMap[ab.player_id]

      p.ab++

      if (ab.result === "single") { p.hits++; p.singles++ }
      if (ab.result === "double") { p.hits++; p.doubles++ }
      if (ab.result === "triple") { p.hits++; p.triples++ }
      if (ab.result === "hr") { p.hits++; p.hr++ }

      if (ab.result === "walk") p.walks++
      if (ab.result === "strikeout") p.strikeouts++

      // 👉 PITCHEO
if (ab.pitcher_id && statsMap[ab.pitcher_id]) {

  const p = statsMap[ab.pitcher_id]

  if (["single","double","triple","hr"].includes(ab.result)) {
    p.hitsAllowed++
  }

  if (ab.result === "walk") p.walksAllowed++
  if (ab.result === "strikeout") p.strikeoutsP++
  if (ab.result === "out") p.outsPitched++

  if (["single","double","triple","hr"].includes(ab.result)) {
    p.runsAllowed += ab.rbi || 0
  }
}

      p.rbi += ab.rbi || 0
    })

    let statsArray = Object.values(statsMap)

    // 🔥 CALCULOS
    statsArray = statsArray.map((p: any) => {

      const avg = p.ab ? (p.hits / p.ab) : 0

      const obp = (p.ab + p.walks)
        ? (p.hits + p.walks) / (p.ab + p.walks)
        : 0

      const innings = p.outsPitched / 3

      const era = innings
      ? ((p.runsAllowed / innings) * 9)
      : 0

      const whip = innings
       ? ((p.walksAllowed + p.hitsAllowed) / innings)
      : 0

      const totalBases =
        p.singles +
        (p.doubles * 2) +
        (p.triples * 3) +
        (p.hr * 4)

      const slg = p.ab ? totalBases / p.ab : 0
      const ops = obp + slg

      return {
        ...p,
        avg: avg.toFixed(3),
        obp: obp.toFixed(3),
        slg: slg.toFixed(3),
        ops: ops.toFixed(3),
        era: era.toFixed(2),
        whip: whip.toFixed(2),
        strikeoutsP: p.strikeoutsP,
        walksAllowed: p.walksAllowed,
        hitsAllowed: p.hitsAllowed,
        innings: innings.toFixed(1)

      }
      
    })

    // 🔥 SORT DINÁMICO
    statsArray.sort((a: any, b: any) => b[statFilter] - a[statFilter])

    setPlayers(statsArray)
  }

  const top3 = players.slice(0, 3)

  return (
  <div style={container}>

    <h1>🏆 Leaderboard</h1>

    {/* 🔥 TABS */}
    <div style={tabsContainer}>

      <div
        onClick={() => setTab("batting")}
        style={{
          ...tabStyle,
          borderBottom: tab === "batting" ? "3px solid red" : "none"
        }}
      >
        Batting
      </div>

      <div
        onClick={() => setTab("pitching")}
        style={{
          ...tabStyle,
          borderBottom: tab === "pitching" ? "3px solid red" : "none"
        }}
      >
        Pitching
      </div>

    </div>

    {/* 🔥 FILTER DINÁMICO */}
    <select
      value={statFilter}
      onChange={(e) => setStatFilter(e.target.value)}
      style={select}
    >

      {tab === "batting" && (
        <>
          <option value="ops">OPS</option>
          <option value="avg">AVG</option>
          <option value="obp">OBP</option>
          <option value="slg">SLG</option>

          <option value="hits">Hits</option>
          <option value="doubles">2B</option>
          <option value="triples">3B</option>
          <option value="hr">HR</option>

          <option value="rbi">RBI</option>
          <option value="walks">BB</option>
          <option value="strikeouts">SO</option>
          <option value="ab">AB</option>
        </>
      )}

      {tab === "pitching" && (
        <>
          <option value="era">ERA</option>
          <option value="whip">WHIP</option>
          <option value="strikeoutsP">SO</option>
          <option value="walksAllowed">BB</option>
          <option value="hitsAllowed">H</option>
          <option value="innings">IP</option>
        </>
      )}

    </select>

    {/* 🔥 TOP 3 */}
    <div style={topContainer}>
      {top3.map((p: any, i: number) => (
        <div key={i} style={{
          ...card,
          background:
            i === 0 ? "#FFD700" :
            i === 1 ? "#C0C0C0" :
            "#CD7F32"
        }}>
          <h2>#{i + 1}</h2>
          <h3>{p.name}</h3>
          <p>{statFilter.toUpperCase()}: {p[statFilter]}</p>
        </div>
      ))}
    </div>

      {/* 🔥 TABLE */}
      <table style={table}>

        <thead>
  <tr>
    <th style={cell}>#</th>
    <th style={cell}>Player</th>

    {tab === "batting" && (
      <>
        <th style={cell}>AVG</th>
        <th style={cell}>OBP</th>
        <th style={cell}>SLG</th>
        <th style={cell}>OPS</th>
        <th style={cell}>H</th>
        <th style={cell}>2B</th>
        <th style={cell}>3B</th>
        <th style={cell}>HR</th>
        <th style={cell}>RBI</th>
        <th style={cell}>BB</th>
        <th style={cell}>SO</th>
        <th style={cell}>AB</th>
      </>
    )}

    {tab === "pitching" && (
      <>
        <th style={cell}>IP</th>
        <th style={cell}>ERA</th>
        <th style={cell}>WHIP</th>
        <th style={cell}>SO</th>
        <th style={cell}>BB</th>
        <th style={cell}>H</th>
      </>
    )}

  </tr>
</thead>

        <tbody>
  {players.map((p: any, i: number) => (
    <tr key={i}>
      <td style={cell}>{i + 1}</td>

      <td style={cell}>
        <Link href={`/players/${p.id}`}>
          <span style={linkStyle}>{p.name}</span>
        </Link>
      </td>

      {tab === "batting" && (
        <>
          <td style={cell}>{p.avg}</td>
          <td style={cell}>{p.obp}</td>
          <td style={cell}>{p.slg}</td>
          <td style={cell}>{p.ops}</td>
          <td style={cell}>{p.hits}</td>
          <td style={cell}>{p.doubles}</td>
          <td style={cell}>{p.triples}</td>
          <td style={cell}>{p.hr}</td>
          <td style={cell}>{p.rbi}</td>
          <td style={cell}>{p.walks}</td>
          <td style={cell}>{p.strikeouts}</td>
          <td style={cell}>{p.ab}</td>
        </>
      )}

      {tab === "pitching" && (
        <>
          <td style={cell}>{p.innings}</td>
          <td style={cell}>{p.era}</td>
          <td style={cell}>{p.whip}</td>
          <td style={cell}>{p.strikeoutsP}</td>
          <td style={cell}>{p.walksAllowed}</td>
          <td style={cell}>{p.hitsAllowed}</td>
        </>
      )}

    </tr>
  ))}
</tbody>

      </table>

    </div>
  )
}

/* 🎨 STYLES */

const container = {
  padding: "40px",
  background: "#f5f6f7",
  minHeight: "100vh"
}

const select = {
  marginTop: "10px",
  padding: "8px"
}

const topContainer = {
  display: "flex",
  gap: "20px",
  marginTop: "30px"
}

const card = {
  flex: 1,
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center" as const
}

const table = {
  marginTop: "40px",
  width: "100%",
  borderCollapse: "collapse" as const
}

const cell = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center" as const
}

const linkStyle = {
  color: "#0070f3",
  fontWeight: "bold",
  cursor: "pointer",
  textDecoration: "none"
}

  const tabsContainer = {
  display: "flex",
  gap: "20px",
  marginTop: "20px",
  cursor: "pointer"
}

const tabStyle = {
  padding: "10px",
  fontWeight: "bold"
}
