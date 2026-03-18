import { supabase } from "../../../lib/supabase"

export default async function Page({ params }: any) {

  const { data: players } = await supabase
    .from("players")
    .select("*")

  return (
    <div style={{ padding: "40px" }}>
      <h1>Roster</h1>

      {players?.map((player) => (
        <div key={player.id}>
          #{player.number} {player.name} - {player.position}
        </div>
      ))}
    </div>
  )
}