"use client"

import "./globals.css"
import { useState } from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

const [open, setOpen] = useState(false)  
  return (
    <html lang="en">
      <body>

        <nav style={nav}>

  {/* 🔥 HAMBURGER */}
  <div style={topBar}>
    <button onClick={() => setOpen(!open)} style={hamburger}>
      ☰
    </button>

    <span style={{ fontWeight: "bold" }}>Liga del Pacífico</span>
  </div>

  {/* 🔥 MENU */}
  <div style={{
    ...menu,
    left: open ? "0" : "-100%"
  }}>
    <a href="/" style={link}>🏠 Home</a>
    <a href="/create-game" style={link}>⚾ Crear Juego</a>
    <a href="/teams" style={link}>🏆 Equipos</a>
    <a href="/players" style={link}>👥 Roster</a>
    <a href="/stats" style={link}>📊 Stats</a>
    <a href="/create-team" style={link}>🏆 Crear Equipo</a>
    <a href="/create-player" style={link}>👤 Crear Jugador</a>
    <a href="/standings" style={link}>🏆 Standings</a>
  </div>

</nav>

        {/* CONTENIDO */}
        <main style={{ padding: "20px" }}>
          {children}
        </main>

      </body>
    </html>
  )
}

const nav: React.CSSProperties = {
  background: "#111",
  color: "white",
  padding: "10px"
}

const topBar = {
  display: "flex",
  alignItems: "center",
  gap: "15px"
}

const hamburger = {
  fontSize: "20px",
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer"
}

const menu = {
  position: "fixed" as const,
  top: 0,
  left: "-100%",
  width: "70%",
  height: "100%",
  background: "#111",
  display: "flex",
  flexDirection: "column" as const,
  padding: "20px",
  gap: "15px",
  transition: "0.3s",
  zIndex: 1000
}

const link = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "16px"
}