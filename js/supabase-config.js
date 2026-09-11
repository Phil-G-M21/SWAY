/**
 * SWAY — Supabase connection
 * These two values are safe to be public (the anon key is designed for
 * frontend use). Real security comes from Row Level Security rules set on
 * each table in the Supabase dashboard.
 */
const SUPABASE_URL = 'https://mvadvbjjwqgkrynpfomu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YWR2Ympqd3Fna3J5bnBmb211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTQzOTksImV4cCI6MjEwNDY3MDM5OX0.7yRDkIYYU_TyMMMkEq2thzbru3nkxss6vglBqcxIsv8';

// Create the client (supabase-js is loaded from CDN in index.html <head>)
const sway_db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
