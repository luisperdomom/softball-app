"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function PlayerPage() {

  const params = useParams()
  const playerId = params.id as string

  const [player, setPlayer] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"batting" | "pitching">("batting")

  useEffect(() => {
    fetchPlayer()
    fetchStats()
  }, [])

  async function fetchPlayer() {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single()

    setPlayer(data)
  }

  async function fetchStats() {

    const { data } = await supabase
      .from("at_bats")
      .select("*")
      .or(`player_id.eq.${playerId},pitcher_id.eq.${playerId}`)

    if (!data) return

    let hits = 0
    let singles = 0
    let doubles = 0
    let triples = 0
    let hr = 0
    let walks = 0
    let strikeouts = 0
    let rbi = 0
    let atBats = 0

    let hitsAllowed = 0
    let walksAllowed = 0
    let strikeoutsP = 0
    let runsAllowed = 0
    let outsPitched = 0

    data.forEach((ab: any) => {

      // BATTING
      if (ab.player_id === playerId) {

        atBats++

        if (ab.result === "single") { hits++; singles++ }
        if (ab.result === "double") { hits++; doubles++ }
        if (ab.result === "triple") { hits++; triples++ }
        if (ab.result === "hr") { hits++; hr++ }

        if (ab.result === "walk") walks++
        if (ab.result === "strikeout") strikeouts++

        rbi += ab.rbi || 0
      }

      // PITCHING
      if (ab.pitcher_id === playerId) {

        if (["single","double","triple","hr"].includes(ab.result)) {
          hitsAllowed++
          runsAllowed += ab.rbi || 0
        }

        if (ab.result === "walk") walksAllowed++
        if (ab.result === "strikeout") strikeoutsP++
        if (ab.result === "out") outsPitched++
      }

    })

    const avg = atBats ? (hits / atBats).toFixed(3) : "0.000"
    const obp = (atBats + walks)
      ? ((hits + walks) / (atBats + walks)).toFixed(3)
      : "0.000"

    const totalBases =
      singles + (doubles * 2) + (triples * 3) + (hr * 4)

    const slg = atBats ? (totalBases / atBats).toFixed(3) : "0.000"
    const ops = (parseFloat(obp) + parseFloat(slg)).toFixed(3)

    const innings = outsPitched / 3

    const era = innings
      ? ((runsAllowed / innings) * 9).toFixed(2)
      : "0.00"

    const whip = innings
      ? ((walksAllowed + hitsAllowed) / innings).toFixed(2)
      : "0.00"

    setStats({
      avg, obp, slg, ops,
      hits, singles, doubles, triples, hr,
      walks, strikeouts, rbi, atBats,

      era, whip, strikeoutsP,
      walksAllowed, hitsAllowed,
      innings: innings.toFixed(1)
    })
  }

  if (!stats) return <p style={{ padding: "40px" }}>Loading...</p>

  return (
    <div style={container}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={{ margin: 0 }}>{player?.name}</h1>
        <p style={{ color: "#666" }}>Player Profile</p>
      </div>

      {/* TABS */}
      <div style={tabs}>
        <button
          style={activeTab === "batting" ? activeTabStyle : tab}
          onClick={() => setActiveTab("batting")}
        >
          Batting
        </button>

        <button
          style={activeTab === "pitching" ? activeTabStyle : tab}
          onClick={() => setActiveTab("pitching")}
        >
          Pitching
        </button>
      </div>

      {/* BATTING */}
      {activeTab === "batting" && (
        <div style={section}>
          <h2 style={sectionTitle}>Batting</h2>

          <div style={grid}>
            <Stat label="AVG" value={stats.avg} />
            <Stat label="OBP" value={stats.obp} />
            <Stat label="SLG" value={stats.slg} />
            <Stat label="OPS" value={stats.ops} />

            <Stat label="H" value={stats.hits} />
            <Stat label="1B" value={stats.singles} />
            <Stat label="2B" value={stats.doubles} />
            <Stat label="3B" value={stats.triples} />
            <Stat label="HR" value={stats.hr} />

            <Stat label="RBI" value={stats.rbi} />
            <Stat label="BB" value={stats.walks} />
            <Stat label="SO" value={stats.strikeouts} />
            <Stat label="AB" value={stats.atBats} />
          </div>
        </div>
      )}

      {/* PITCHING */}
      {activeTab === "pitching" && (
        <div style={section}>
          <h2 style={sectionTitle}>Pitching</h2>

          <div style={grid}>
            <Stat label="IP" value={stats.innings} />
            <Stat label="ERA" value={stats.era} />
            <Stat label="WHIP" value={stats.whip} />

            <Stat label="SO" value={stats.strikeoutsP} />
            <Stat label="BB" value={stats.walksAllowed} />
            <Stat label="H" value={stats.hitsAllowed} />
          </div>
        </div>
      )}

    </div>
  )
}

function Stat({ label, value }: any) {
  return (
    <div style={card}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  )
}

/* 🎨 STYLES */

const container = {
  padding: "30px",
  background: "#f5f6f7",
  minHeight: "100vh"
}

const header = {
  marginBottom: "20px"
}

const tabs = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
  borderBottom: "2px solid #ddd",
  paddingBottom: "10px"
}

const tab = {
  padding: "8px 16px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontWeight: "bold",
  color: "#555"
}

const activeTabStyle = {
  ...tab,
  borderBottom: "3px solid #e60023",
  color: "#e60023"
}

const section = {
  marginTop: "30px"
}

const sectionTitle = {
  marginBottom: "15px",
  borderBottom: "2px solid #ddd",
  paddingBottom: "5px"
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gap: "10px"
}

const card = {
  background: "white",
  borderRadius: "10px",
  padding: "15px",
  textAlign: "center" as const,
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
}

const statValue = {
  fontSize: "20px",
  fontWeight: "bold"
}

const statLabel = {
  fontSize: "12px",
  color: "#777",
  marginTop: "5px"
}