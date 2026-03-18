import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default async function GamesPage() {

  const { data: games } = await supabase
  .from("games")
  .select(`
    id,
    game_date,
    home_team:teams!games_home_team_fkey(name),
    away_team:teams!games_away_team_fkey(name)
  `)

  return (
    <div style={{ padding: "40px" }}>
      <h1>Games</h1>

      {games?.map((game: any) => (
  <Link
    key={game.id}
    href={`/games/${game.id}`}
    style={{
      display: "block",
      padding: "10px",
      marginTop: "10px",
      background: "#f3f3f3",
      borderRadius: "6px"
    }}
  >
    ⚾ {game.home_team?.name} vs {game.away_team?.name}
    <br />
    <small>{game.game_date}</small>
  </Link>
))}
    </div>
  )
}