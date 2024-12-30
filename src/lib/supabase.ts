import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://adfvgbyeqzosbjxfwvis.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZnZnYnllcXpvc2JqeGZ3dmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMjg2MzQsImV4cCI6MjA0ODkwNDYzNH0.BFoJHrmlbJdP0h7BaR3xBErJYA6wM3YQcmF18c9Z1wc'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})