"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function TeamsPage() {

  const [teams, setTeams] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newCity, setNewCity] = useState("")

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    const { data } = await supabase
      .from("teams")
      .select("*")

    setTeams(data || [])
  }

  async function deleteTeam(id: string) {
  if (!confirm("Delete EVERYTHING?")) return

  // players
  await supabase.from("players").delete().eq("team_id", id)

  // games
  await supabase
    .from("games")
    .delete()
    .or(`home_team.eq.${id},away_team.eq.${id}`)

  // team
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", id)

  if (error) alert(error.message)
  else fetchTeams()
}
  async function updateTeam(id: string) {
    await supabase
      .from("teams")
      .update({
        name: newName,
        city: newCity
      })
      .eq("id", id)

    setEditingId(null)
    setNewName("")
    setNewCity("")
    fetchTeams()
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        🥎 Equipos de la Liga
      </h1>

      <div className="space-y-4">

        {teams.map((team) => (

          <div
            key={team.id}
            className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
          >

            {/* 🔥 EDIT MODE */}
            {editingId === team.id ? (
              <div className="flex gap-2">

                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-1 rounded"
                />

                <input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="border p-1 rounded"
                />

                <button
                  onClick={() => updateTeam(team.id)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  Save
                </button>

              </div>
            ) : (

              <>
                <Link href={`/teams/${team.id}`}>
                  <span className="font-semibold cursor-pointer">
                    ⚾ {team.name} - {team.city}
                  </span>
                </Link>

                <div className="flex gap-2">

                  <button
                    onClick={() => {
                      setEditingId(team.id)
                      setNewName(team.name)
                      setNewCity(team.city || "")
                    }}
                    className="bg-yellow-400 px-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    Delete
                  </button>

                </div>
              </>
            )}

          </div>

        ))}

      </div>

    </div>
  )
}