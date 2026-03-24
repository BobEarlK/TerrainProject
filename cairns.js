import { client } from './supabase-client.js';
import { state } from './state.js';

const terrain = document.getElementById('terrain');
const instruction = document.getElementById('instruction');

// ── Popup ──────────────────────────────────────────────────────────────────
const popup      = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupText  = document.getElementById('popup-text');

export function showPopup(e, title, content) {
  popupTitle.textContent = title;
  popupText.textContent  = content;
  const pw = 320, ph = 140;
  popup.style.left    = Math.min(e.clientX + 16, window.innerWidth - pw - 16) + 'px';
  popup.style.top     = Math.max(e.clientY - ph - 16, 16) + 'px';
  popup.style.display = 'block';
  e.stopPropagation();
}

export function closePopup() { popup.style.display = 'none'; }

// ── Visibility filter ──────────────────────────────────────────────────────
export function applyVisibilityFilter() {
  document.querySelectorAll('.cairn:not(.cairn-mine):not(.dragging)').forEach(el => {
    el.style.display = state.showOthers ? '' : 'none';
  });
}

// ── Render a single cairn ──────────────────────────────────────────────────
export function addCairnToTerrain(x, y, title, content, draggable, isOwner) {
  const img = document.createElement('img');
  img.src       = 'cairn.svg';
  img.alt       = 'cairn marker';
  img.className = 'cairn';
  if (isOwner) img.classList.add('cairn-mine');
  img.style.left = (x * 100) + '%';
  img.style.top  = (y * 100) + '%';

  if (draggable) {
    makeDraggable(img, title, content);
  } else {
    img.addEventListener('click', (e) => showPopup(e, title, content));
  }

  terrain.appendChild(img);
  return img;
}

// ── Drag to place ──────────────────────────────────────────────────────────
function makeDraggable(img, title, content) {
  img.classList.add('dragging');
  instruction.style.display = 'block';

  function onMove(e) {
    const rect    = terrain.getBoundingClientRect();
    img.style.left = ((e.clientX - rect.left) / rect.width  * 100) + '%';
    img.style.top  = ((e.clientY - rect.top)  / rect.height * 100) + '%';
  }

  async function onUp(e) {
    document.removeEventListener('mousemove', onMove);
    img.classList.remove('dragging');
    img.classList.add('cairn-mine');
    instruction.style.display = 'none';

    const rect = terrain.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    const y    = (e.clientY - rect.top)  / rect.height;
    img.style.left = (x * 100) + '%';
    img.style.top  = (y * 100) + '%';

    img.addEventListener('click', (ev) => showPopup(ev, title, content));

    const { error } = await client.from('markers').insert({
      x, y, title, content, user_id: state.currentUser.id
    });
    if (error) console.error('Error saving marker:', error);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp, { once: true });
}

// ── Load all markers from DB ───────────────────────────────────────────────
export async function loadMarkers() {
  const { data, error } = await client.from('markers').select('*');
  if (error) { console.error('Error loading markers:', error); return; }

  // Clear after the await — concurrent calls both clear, so whichever finishes
  // last wins. JS single-thread guarantees the clear+render runs atomically.
  document.querySelectorAll('.cairn').forEach(el => el.remove());
  data.forEach(marker => {
    const isOwner = !!(state.currentUser && marker.user_id === state.currentUser.id);
    addCairnToTerrain(marker.x, marker.y, marker.title, marker.content, false, isOwner);
  });
  applyVisibilityFilter();
}
