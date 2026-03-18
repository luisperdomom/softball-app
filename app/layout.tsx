import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        {/* 🔥 NAVBAR */}
        <nav style={{
          display: "flex",
          gap: "20px",
          padding: "15px",
          background: "#111",
          color: "white"
        }}>
          <a href="/" style={link}>🏠 Home</a>
          <a href="/create-game">⚾ Crear Juego</a>
          <a href="/teams" style={link}>🏆 Equipos</a>
          <a href="/players" style={link}>👥 Roster</a>
          <a href="/stats" style={link}>📊 Stats</a>
          <a href="/create-team">🏆 Crear Equipo</a>
          <a href="/create-player">👤 Crear Jugador</a>
          <a href="/standings">🏆 Standings</a>
        </nav>

        {/* CONTENIDO */}
        <main style={{ padding: "20px" }}>
          {children}
        </main>

      </body>
    </html>
  )
}

const link = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold"
}