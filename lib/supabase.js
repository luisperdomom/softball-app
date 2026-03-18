import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rcnwumyoelxuchiozobl.supabase.co"

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbnd1bXlvZWx4dWNoaW96b2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzY2MTcsImV4cCI6MjA4OTI1MjYxN30.nkSzOTd9qm5q2cZj_bGrBgrkJVboNuZJYtHvnnYylM4"

export const supabase = createClient(supabaseUrl, supabaseKey)