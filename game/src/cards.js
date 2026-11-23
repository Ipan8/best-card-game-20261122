// The 28 cards of Galebound Duel: 7 per element, each with its own name,
// energy cost, attack and block. No card is copied from another game.
import { ELEMENTS } from './config.js';

const DEFS = [
  // Ember — the scorching element.
  ['Cinder Fang', 'ember', 1, 3, 0],
  ['Spark Snare', 'ember', 1, 2, 2],
  ['Flame Lash', 'ember', 2, 5, 1],
  ['Ashen Guard', 'ember', 2, 3, 4],
  ['Wildfire', 'ember', 2, 6, 0],
  ['Inferno Crown', 'ember', 3, 8, 2],
  ['Ember Bastion', 'ember', 3, 5, 6],
  // Tide — the drowning element.
  ['Tide Surge', 'tide', 1, 3, 0],
  ['Coral Ward', 'tide', 1, 2, 2],
  ['Riptide', 'tide', 2, 5, 1],
  ['Deep Guard', 'tide', 2, 3, 4],
  ['Maelstrom', 'tide', 2, 6, 0],
  ['Abyssal Crown', 'tide', 3, 8, 2],
  ['Tidewall', 'tide', 3, 5, 6],
  // Gale — the scattering element.
  ['Gale Cut', 'gale', 1, 3, 0],
  ['Zephyr Veil', 'gale', 1, 2, 2],
  ['Storm Lash', 'gale', 2, 5, 1],
  ['Skyward Guard', 'gale', 2, 3, 4],
  ['Cyclone', 'gale', 2, 6, 0],
  ['Tempest Crown', 'gale', 3, 8, 2],
  ['Windwall', 'gale', 3, 5, 6],
  // Stone — the element that stands alone.
  ['Stone Fist', 'stone', 1, 3, 0],
  ['Pebble Ward', 'stone', 1, 2, 2],
  ['Quake Slam', 'stone', 2, 5, 1],
  ['Granite Guard', 'stone', 2, 3, 4],
  ['Boulderfall', 'stone', 2, 6, 0],
  ['Mountain Crown', 'stone', 3, 8, 2],
  ['Bedrock Wall', 'stone', 3, 5, 6],
];

export const CARDS = DEFS.map(([name, element, cost, attack, block], index) => ({
  id: index,
  name,
  element,
  cost,
  attack,
  block,
  color: ELEMENTS[element].color,
  glyph: ELEMENTS[element].glyph,
}));

export function cardById(id) {
  return CARDS[id];
}

// A fresh deck is one copy of every card, in id order; the engine shuffles it.
export function freshDeck() {
  return CARDS.map((card) => card.id);
}
