/**
 * SUPABASE CLIENT INITIALIZATION
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://jfzflbemzeyiibxaudhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmemZsYmVtemV5aWlieGF1ZGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NDE4MDcsImV4cCI6MjA4MjExNzgwN30.RxzDizE8dp0yOp0jKIIoxmm0BlaroUdn2DeGL6C5BYM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
