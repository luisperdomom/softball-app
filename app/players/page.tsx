"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function PlayersPage() {

  const [teams, setTeams] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState("")
  const [players, setPlayers] = useState<any[]>([])

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase
      .from("teams")
      .select("*")

    setTeams(data || [])
  }

  async function fetchPlayers(teamId: string) {

    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)

    setPlayers(data || [])
  }

  function handleTeamChange(teamId: string) {
    setSelectedTeam(teamId)
    fetchPlayers(teamId)
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Roster 👥</h1>

      {/* SELECT TEAM */}
      <h3>Select Team</h3>

      <select
        value={selectedTeam}
        onChange={(e) => handleTeamChange(e.target.value)}
      >
        <option value="">Select a team</option>

        {teams.map((team: any) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      {/* PLAYERS */}
      <div style={{ marginTop: "30px" }}>

        {players.length > 0 ? (
          players.map((player: any) => (
            <div
              key={player.id}
              style={{
                padding: "10px",
                marginTop: "10px",
                background: "#f3f3f3",
                borderRadius: "6px"
              }}
            >
              {player.name}
            </div>
          ))
        ) : (
          <p style={{ marginTop: "20px" }}>
            No players found
          </p>
        )}

      </div>

    </div>
  )
}