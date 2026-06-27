import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const storageBucket = 'audio-files'
const tableName = 'emotional_fatigue'

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  return supabase
}

function createAudioPath(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const uniqueId = crypto.randomUUID()

  return `uploads/${Date.now()}-${uniqueId}-${safeName}`
}

// Uploads a WAV file to Supabase Storage and returns its stored path.
export async function uploadAudio(file) {
  const client = getSupabaseClient()
  const filePath = createAudioPath(file)

  const { data, error } = await client.storage.from(storageBucket).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type || 'audio/wav',
    upsert: false,
  })

  if (error) throw new Error(error.message)

  return data.path
}

// Saves the audio file reference and fatigue level into the emotional_fatigue table.
export async function savePrediction(audioFile, fatigueLevel) {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from(tableName)
    .insert({
      audio_file: audioFile,
      emotional_fatigue_level: fatigueLevel,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data
}

// Fetches all prediction records ordered by newest first.
export async function fetchPredictions() {
  const client = getSupabaseClient()

  const { data, error } = await client
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data
}

// Deletes a prediction record by its id.
export async function deletePrediction(id) {
  const client = getSupabaseClient()

  const { error } = await client.from(tableName).delete().eq('id', id)

  if (error) throw new Error(error.message)
}


