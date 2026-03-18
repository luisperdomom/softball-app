"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function CreateTeamPage() {

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)

  async function createTeam() {

    if (!name) {
      alert("Enter team name")
      return
    }

    let logoUrl = null

    // 🔥 SUBIR IMAGEN
    if (logoFile) {
      const fileName = `${Date.now()}-${logoFile.name}`

      const { error } = await supabase.storage
        .from("team-logos")
        .upload(fileName, logoFile)

      if (!error) {
        const { data } = supabase.storage
          .from("team-logos")
          .getPublicUrl(fileName)

        logoUrl = data.publicUrl
      }
    }

    // 🔥 GUARDAR TEAM
    const { error } = await supabase.from("teams").insert({
      name,
      city,
      logo: logoUrl
    })

    if (error) {
      alert("Error creating team")
    } else {
      alert("Team created!")
      setName("")
      setCity("")
      setLogoFile(null)
    }
  }

  return (
    <div style={{ padding: "40px" }}>

      <h1>Create Team ⚾</h1>

      {/* LOGO */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
      />

      {/* NAME */}
      <input
        placeholder="Team name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", marginTop: "20px", display: "block" }}
      />

      {/* CITY */}
      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: "10px", marginTop: "10px", display: "block" }}
      />

      <button
        onClick={createTeam}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        Create Team
      </button>

    </div>
  )
}