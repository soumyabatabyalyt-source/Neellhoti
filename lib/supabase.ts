import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://jbymiopbxtxkfvublfeh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieW1pb3BieHR4a2Z2dWJsZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTg2MTYsImV4cCI6MjA5MzI5NDYxNn0.H7h6kwQfFB-8nRHvxy753NohgzQY9OzHJgCo-mKI3Ts'
)