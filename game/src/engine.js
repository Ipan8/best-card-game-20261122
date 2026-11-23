// Galebound Duel — the pure rules. No DOM, no sound, no clock: the same
// seed and the same choices always give the same game, so the engine runs
// in Node for self-tests as well as in the browser.
//
// A duel: you (the Warden) against the Hollow Gale. Both start at 30 life.
// Each turn you get 3 energy and draw up to 5 cards. A card costs energy,
// deals its attack and grants its block. Block soaks damage until your next
// turn starts. Playing a card whose element beats the last played card's
// element (Ember > Gale > Tide > Ember) surges: +2 attack. Reduce the foe
// to 0 life to win; fall to 0 and you lose.
import { BEATS, ENERGY_PER_TURN, HAND_SIZE, MAX_HP, SURGE_BONUS } from './config.js';
import { cardById, freshDeck } from './cards.js';
import { createRandom, shuffle } from './random.js';

export const PLAYER = 'player';
export const FOE = 'foe';

function makeSide(random) {
  return {
    hp: MAX_HP,
    maxHp: MAX_HP,
    block: 0,
    energy: 0,
    hand: [],
    deck: shuffle(freshDeck(), random),
    discard: [],
  };
}

export function createGame(seed) {
  const random = createRandom(seed);
  const state = {
    seed,
    random,
    turn: 1,
    phase: 'player', // 'player' | 'foe' | 'over'
    player: makeSide(random),
    foe: makeSide(random),
    lastElement: null,
    lastPlay: null, // { side, card, attack, surge, soaked, through }
    lastBySide: { player: null, foe: null }, // each side's most recent play
    log: [`The duel begins. Both wardens hold ${MAX_HP} life.`],
    stats: { dealt: 0, taken: 0, played: 0, turns: 0 },
    winner: null,
    telegraph: null, // the card the foe will open with, shown face-up
  };
  beginTurn(state, FOE); // the foe opens with a full hand, face-down
  beginTurn(state, PLAYER);
  state.telegraph = firstFoePlay(state);
  return state;
}

function drawUpTo(state, side) {
  const who = state[side];
  while (who.hand.length < HAND_SIZE) {
    if (who.deck.length === 0) {
      if (who.discard.length === 0) break;
      who.deck = shuffle(who.discard, state.random);
      who.discard = [];
    }
    who.hand.push(who.deck.pop());
  }
}

export function beginTurn(state, side) {
  const who = state[side];
  who.block = 0; // last turn's block fades as your new turn starts
  who.energy = ENERGY_PER_TURN;
  drawUpTo(state, side);
  if (side === PLAYER) state.stats.turns += 1;
}

export function surgeFor(state, card) {
  if (!state.lastElement) return 0;
  return BEATS[card.element] === state.lastElement ? SURGE_BONUS : 0;
}

// Score a card for an autopilot: attack first, block second, surge included.
export function scoreCard(state, card) {
  return card.attack + surgeFor(state, card) + card.block * 0.6;
}

function dealDamage(state, targetSide, amount) {
  const target = state[targetSide];
  const soaked = Math.min(target.block, amount);
  target.block -= soaked;
  const through = amount - soaked;
  target.hp = Math.max(0, target.hp - through);
  return { soaked, through };
}

// Play hand[index] for `side`. Returns false when the play is illegal.
export function playCard(state, side, handIndex) {
  if (state.phase === 'over') return false;
  if ((side === PLAYER) !== (state.phase === 'player')) return false;
  const who = state[side];
  const foeSide = side === PLAYER ? FOE : PLAYER;
  const cardId = who.hand[handIndex];
  if (cardId === undefined) return false;
  const card = cardById(cardId);
  if (who.energy < card.cost) return false;

  who.energy -= card.cost;
  who.hand.splice(handIndex, 1);
  who.discard.push(cardId);
  who.block += card.block;
  const surge = surgeFor(state, card);
  const attack = card.attack + surge;
  const { soaked, through } = dealDamage(state, foeSide, attack);
  state.lastElement = card.element;
  state.lastPlay = { side, card, attack, surge, soaked, through };
  state.lastBySide[side] = { card, attack, surge, soaked, through };
  state.stats.played += 1;
  if (side === PLAYER) state.stats.dealt += through;
  else state.stats.taken += through;

  const actor = side === PLAYER ? 'You play' : 'The Hollow Gale plays';
  const surgeText = surge > 0 ? ` — SURGE +${surge}!` : '';
  const soakText = soaked > 0 ? ` (${soaked} soaked by block)` : '';
  state.log.push(`${actor} ${card.name} for ${attack}${surgeText}${soakText}.`);
  if (card.block > 0) state.log.push(`${actor === 'You play' ? 'You gain' : 'The foe gains'} ${card.block} block.`);
  if (who.hand.length === 0) state.log.push(`${side === PLAYER ? 'Your hand' : 'The foe\u2019s hand'} is empty.`);

  if (state[foeSide].hp <= 0) {
    state.phase = 'over';
    state.winner = side;
    state.log.push(
      side === PLAYER
        ? 'The Hollow Gale falls. Victory is yours!'
        : 'Your light gutters out. The Hollow Gale prevails.',
    );
  }
  return true;
}

// The foe's best affordable card, by autopilot score; -1 when it cannot play.
export function foeChoice(state) {
  return bestChoice(state, FOE);
}

export function bestChoice(state, side) {
  const who = state[side];
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < who.hand.length; i += 1) {
    const card = cardById(who.hand[i]);
    if (card.cost > who.energy) continue;
    const score = scoreCard(state, card);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

export function worstChoice(state, side) {
  const who = state[side];
  let worst = -1;
  let worstScore = Infinity;
  for (let i = 0; i < who.hand.length; i += 1) {
    const card = cardById(who.hand[i]);
    if (card.cost > who.energy) continue;
    const score = scoreCard(state, card);
    if (score < worstScore) {
      worstScore = score;
      worst = i;
    }
  }
  return worst;
}

// The card the foe will open with on its next turn, for the face-up telegraph.
export function firstFoePlay(state) {
  const saved = state.foe.energy;
  state.foe.energy = ENERGY_PER_TURN;
  const index = bestChoice(state, FOE);
  state.foe.energy = saved;
  return index === -1 ? null : cardById(state.foe.hand[index]);
}

// End the player's turn: the foe draws, plays until it cannot, then the
// player's next turn begins. Synchronous: the browser paces it with delays,
// the shots and the self-tests run it straight through.
export function endPlayerTurn(state) {
  if (state.phase !== 'player') return false;
  state.phase = 'foe';
  beginTurn(state, FOE);
  let guard = 0;
  while (state.phase === 'foe' && guard < 12) {
    const index = foeChoice(state);
    if (index === -1) break;
    playCard(state, FOE, index);
    guard += 1;
  }
  if (state.phase === 'over') return true;
  state.phase = 'player';
  state.turn += 1;
  beginTurn(state, PLAYER);
  state.telegraph = firstFoePlay(state);
  return true;
}

// One full autopilot round: the player moves by policy, then the foe moves
// by policy, then the next player turn begins. Used by the screenshot
// staging and the self-tests, never by the live foe.
export function playRound(state, playerPolicy, foePolicy) {
  let n = 0;
  while (state.phase === 'player' && n < 8) {
    if (!autopilotMove(state, PLAYER, playerPolicy)) break;
    n += 1;
  }
  if (state.phase === 'over') return;
  state.phase = 'foe';
  beginTurn(state, FOE);
  let m = 0;
  while (state.phase === 'foe' && m < 12) {
    if (!autopilotMove(state, FOE, foePolicy)) break;
    m += 1;
  }
  if (state.phase === 'over') return;
  state.phase = 'player';
  state.turn += 1;
  beginTurn(state, PLAYER);
  state.telegraph = firstFoePlay(state);
}

// One autopilot move for a side, by policy: 'best' | 'worst'. Used by the
// screenshot staging and the self-tests, never by the live foe.
export function autopilotMove(state, side, policy) {
  const choose = policy === 'worst' ? worstChoice : bestChoice;
  const index = choose(state, side);
  if (index === -1) return false;
  return playCard(state, side, index);
}
