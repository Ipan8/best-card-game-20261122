// Galebound Duel — boot and the one loop. The game is event-driven: every
// click or key re-renders the table from the state. The foe's turn is paced
// with short delays so its plays are visible; the engine underneath stays
// synchronous and deterministic.
//
// ?seed=N fixes the shuffle. ?shot=title|play|win|loss (with &seed=N) stages
// that scene instead of running the game, paints it twice and sets
// window.__shotReady for a screenshot.
import { createGame, playCard, beginTurn, foeChoice, firstFoePlay, PLAYER, FOE } from './engine.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { playCardSound, hitSound, winSound, loseSound, turnSound, setMuted, isMuted } from './sound.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const app = document.getElementById('app');
const status = document.getElementById('status');

let state = createGame(seed);
let screen = 'title';
let foeTimer = null;

function announce(message) {
  status.textContent = message;
}

function paint() {
  app.innerHTML = render(state, screen);
}

function startDuel() {
  if (foeTimer !== null) {
    clearTimeout(foeTimer);
    foeTimer = null;
  }
  state = createGame(Math.floor(Math.random() * 4294967296));
  state.muted = isMuted();
  screen = 'play';
  paint();
  announce('The duel begins. Your turn: play a card.');
}

function endDuel(won) {
  screen = won ? 'win' : 'loss';
  paint();
  if (won) winSound();
  else loseSound();
  announce(won ? 'Victory! The Hollow Gale falls.' : 'Defeat. The Hollow Gale prevails.');
}

function afterPlay(side, played) {
  if (!played) return;
  const last = state.lastPlay;
  if (last) {
    playCardSound(last.card.element, last.surge);
    if (last.through > 0) hitSound();
  }
  paint();
  if (state.phase === 'over') endDuel(state.winner === 'player');
}

function runFoeTurn() {
  state.phase = 'foe';
  beginTurn(state, FOE);
  paint();
  announce('The Hollow Gale plays.');
  function step() {
    if (state.phase !== 'foe') return;
    const index = foeChoice(state);
    if (index === -1) {
      state.phase = 'player';
      state.turn += 1;
      beginTurn(state, PLAYER);
      state.telegraph = firstFoePlay(state);
      paint();
      turnSound();
      announce(`Turn ${state.turn}. Your move.`);
      return;
    }
    afterPlay(FOE, playCard(state, FOE, index));
    if (state.phase === 'over') return;
    foeTimer = setTimeout(step, 550);
  }
  foeTimer = setTimeout(step, 550);
}

function endTurn() {
  if (state.phase !== 'player' || screen !== 'play') return;
  turnSound();
  runFoeTurn();
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-play], [data-end], [data-start], [data-again], [data-mute], [data-restart]');
  if (!target) return;
  if (target.hasAttribute('data-start') || target.hasAttribute('data-again')) {
    startDuel();
    return;
  }
  if (target.hasAttribute('data-restart')) {
    startDuel();
    return;
  }
  if (target.hasAttribute('data-mute')) {
    setMuted(!isMuted());
    state.muted = isMuted();
    paint();
    return;
  }
  if (target.hasAttribute('data-end')) {
    endTurn();
    return;
  }
  if (target.hasAttribute('data-play')) {
    if (state.phase !== 'player' || screen !== 'play') return;
    const index = Number.parseInt(target.getAttribute('data-play'), 10);
    const before = state.player.energy;
    afterPlay(PLAYER, playCard(state, PLAYER, index));
    if (state.player.energy === before && screen === 'play') {
      announce('Not enough energy for that card.');
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key;
  if (key >= '1' && key <= '5' && screen === 'play' && state.phase === 'player') {
    const index = Number.parseInt(key, 10) - 1;
    afterPlay(PLAYER, playCard(state, PLAYER, index));
    return;
  }
  if (key === 'Enter' || key === ' ') {
    event.preventDefault();
    if (screen === 'title' || screen === 'win' || screen === 'loss') startDuel();
    else if (screen === 'play') endTurn();
    return;
  }
  if (key === 'm' || key === 'M') {
    setMuted(!isMuted());
    state.muted = isMuted();
    paint();
  }
});

// Leaving the tab mid-foe-turn pauses the pacing, never the rules.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && foeTimer !== null) {
    clearTimeout(foeTimer);
    foeTimer = null;
  }
});

function runShot(name) {
  const scene = stageShot(name, seed);
  state = scene.state;
  state.muted = true;
  screen = scene.screen;
  let painted = 0;
  function paintShot() {
    paint();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paintShot);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paintShot);
}

if (shot) {
  runShot(shot);
} else {
  state.muted = false;
  paint();
  announce('Galebound Duel. Press Enter or click Start the Duel.');
}
