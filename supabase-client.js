// supabase is loaded as a global from the CDN script tag in index.html
const SUPABASE_URL = 'https://cbmviwlufimknywjejnr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibXZpd2x1Zmlta255d2plam5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDg2NTAsImV4cCI6MjA4OTAyNDY1MH0.gR_ypDVU_KTjVgPMV-kCKaAYcwvrWAAEYt-8-UxvBJM';

export const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.localStorage
    // Note: lock bypass removed 2026-03-19. It fixed AbortError on updateUser but broke
    // token refresh, causing all DB queries to hang on returning visits with expired tokens.
    // updateUser is now fired without await — USER_UPDATED event drives dismissal instead.
    // See AsyncEventMap.md for full explanation.
  }
});
