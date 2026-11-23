// Galebound Duel — tuning, elements and palette in one place.
// The table is a landscape layout that fits a 1280x480 window and grows on
// bigger screens; no rule depends on the window size.
export const MAX_HP = 30;
export const HAND_SIZE = 5;
export const ENERGY_PER_TURN = 3;
export const SURGE_BONUS = 2;

// Four original elements. Each is told apart by colour AND shape AND name,
// so a card stays readable with colour alone turned off.
export const ELEMENTS = {
  ember: { name: 'Ember', glyph: '▲', color: '#e5534b', dark: '#8f2b25', light: '#ffb3ad' },
  tide: { name: 'Tide', glyph: '●', color: '#4fc3f7', dark: '#1d6f96', light: '#b8e6ff' },
  gale: { name: 'Gale', glyph: '◆', color: '#58c98a', dark: '#237a48', light: '#b9f2cd' },
  stone: { name: 'Stone', glyph: '■', color: '#f2c94c', dark: '#96791a', light: '#ffedb0' },
};

// The surge wheel: Ember scorches Gale, Gale scatters Tide, Tide drowns Ember.
// Stone stands alone: it never surges and nothing surges against it.
export const BEATS = { ember: 'gale', gale: 'tide', tide: 'ember' };

export const PALETTE = {
  felt: '#12291f',
  feltEdge: '#0b1a13',
  panel: '#1c2b26',
  panelEdge: '#33473d',
  gold: '#e8c15a',
  text: '#f2ede0',
  muted: '#9db3a5',
  player: '#4fc3f7',
  foe: '#e5534b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
