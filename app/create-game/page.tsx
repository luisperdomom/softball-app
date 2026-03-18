"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function CreateGame() {

  const [teams, setTeams] = useState<any[]>([])
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase
      .from("teams")
      .select("*")

    setTeams(data || [])
  }

  async function createGame() {

    if (!homeTeam || !awayTeam) {
      alert("Select both teams")
      return
    }

    if (homeTeam === awayTeam) {
      alert("Teams must be different")
      return
    }

    const { data, error } = await supabase
      .from("games")
      .insert({
        home_team: homeTeam,
        away_team: awayTeam
      })
      .select()
      .single()

    if (error) {
      alert("Error creating game")
      console.log(error)
      return
    }

    // 🔥 REDIRECT AL LINEUP
    router.push(`/games/${data.id}/lineup`)
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Create Game</h1>

      <div>

        <h3>Home Team</h3>
        <select onChange={(e) => setHomeTeam(e.target.value)}>
          <option value="">Select team</option>

          {teams.map((team: any) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}

        </select>

      </div>

      <div style={{ marginTop: "20px" }}>

        <h3>Away Team</h3>
        <select onChange={(e) => setAwayTeam(e.target.value)}>
          <option value="">Select team</option>

          {teams.map((team: any) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}

        </select>

      </div>

      <button
        onClick={createGame}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        Create Game
      </button>

    </div>
  )
}