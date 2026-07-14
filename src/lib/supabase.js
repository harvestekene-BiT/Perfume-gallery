import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jxtzhwvrgfwfcfreprks.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHpod3ZyZ2Z3ZmNmcmVwcmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDk4ODIsImV4cCI6MjA5OTYyNTg4Mn0.foIc-OGllAH7XAIcyBey7ojeWMpwfktW47dJK5q615M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
