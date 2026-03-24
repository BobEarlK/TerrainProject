// Shared mutable state — imported by any module that needs to read or write it.
// arrivalType is read from the URL hash immediately (before Supabase clears it).
export const state = {
  currentUser:     null,
  currentUsername: null,
  showOthers:      true,
  passwordWasSet:  false,
  arrivalType:     new URLSearchParams(window.location.hash.slice(1)).get('type'),
};
