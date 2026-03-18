"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function PitchersPage() {

  const [pitchers, setPitchers] = useState<any[]>([])
  const [sortBy, setSortBy] = useState("ERA")

  useEffect(() => {
    fetchPitchers()
  }, [])

  useEffect(() => {
    sortPitchers()
  }, [sortBy])

  async function fetchPitchers() {

    const { data } = await supabase
      .from("at_bats")
      .select(`
        result,
        pitcher_id,
        players (
          id,
          name
        )
      `)

    const stats: any = {}

    data?.forEach((ab: any) => {

      const pitcherId = ab.pitcher_id
      if (!pitcherId) return

      const name = "Pitcher " + pitcherId // temporal

      if (!stats[pitcherId]) {
        stats[pitcherId] = {
          name,
          outs: 0,
          runs: 0,
          hits: 0,
          walks: 0,
          strikeouts: 0
        }
      }

      // OUTS
      if (ab.result === "out" || ab.result === "strikeout") {
        stats[pitcherId].outs++
      }

      // STRIKEOUT
      if (ab.result === "strikeout") {
        stats[pitcherId].strikeouts++
      }

      // WALKS
      if (ab.result === "walk") {
        stats[pitcherId].walks++
      }

      // HITS
      if (
        ab.result === "single" ||
        ab.result === "double" ||
        ab.result === "triple" ||
        ab.result === "hr"
      ) {
        stats[pitcherId].hits++
      }

      // ⚠️ runs (simplificado)
      if (ab.result === "hr") {
        stats[pitcherId].runs++
      }

    })

    const final = Object.values(stats).map((p: any) => {

      const innings = p.outs / 3

      const ERA = innings ? ((p.runs * 6) / innings) : 0
      const WHIP = innings ? ((p.walks + p.hits) / innings) : 0

      return {
        ...p,
        ERA: ERA.toFixed(2),
        WHIP: WHIP.toFixed(2)
      }
    })

    setPitchers(final)
  }

  function sortPitchers() {

    const sorted = [...pitchers].sort((a: any, b: any) => {

      if (sortBy === "ERA" || sortBy === "WHIP") {
        return parseFloat(a[sortBy]) - parseFloat(b[sortBy]) // menor mejor
      }

      return (b[sortBy] || 0) - (a[sortBy] || 0)
    })

    setPitchers(sorted)
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Pitcher Leaderboard ⚾</h1>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{ marginTop: "20px", padding: "5px" }}
      >
        <option value="ERA">ERA</option>
        <option value="WHIP">WHIP</option>
        <option value="strikeouts">SO</option>
        <option value="walks">BB</option>
        <option value="hits">H Allowed</option>
      </select>

      <table style={{ borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={cell}>Pitcher</th>
            <th style={cell}>ERA</th>
            <th style={cell}>WHIP</th>
            <th style={cell}>SO</th>
            <th style={cell}>BB</th>
            <th style={cell}>H</th>
          </tr>
        </thead>

        <tbody>
          {pitchers.map((p: any, i) => (
            <tr key={i}>
              <td style={cell}>{p.name}</td>
              <td style={cell}>{p.ERA}</td>
              <td style={cell}>{p.WHIP}</td>
              <td style={cell}>{p.strikeouts}</td>
              <td style={cell}>{p.walks}</td>
              <td style={cell}>{p.hits}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

const cell = {
  border: "1px solid #ccc",
  padding: "8px"
}