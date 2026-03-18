"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function CreatePlayerPage() {

  const [name, setName] = useState("")
  const [teamId, setTeamId] = useState("")
  const [teams, setTeams] = useState<any[]>([])

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase.from("teams").select("*")
    setTeams(data || [])
  }

  async function createPlayer() {

    if (!name || !teamId) {
      alert("Fill all fields")
      return
    }

    const { error } = await supabase
      .from("players")
      .insert({
        name,
        team_id: teamId
      })

    if (error) {
      alert("Error creating player")
    } else {
      alert("Player added!")
      setName("")
    }
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Add Player ⚾</h1>

      <input
        placeholder="Player name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", marginTop: "20px" }}
      />

      <br />

      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        <option value="">Select team</option>

        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <br />

      <button
        onClick={createPlayer}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        Add Player
      </button>

    </div>
  )
}