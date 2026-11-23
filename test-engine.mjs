// Engine self-test (Node): plays full games with autopilots and reports
// whether win and loss paths are reachable, and how long games run.
import { createGame, playCard, playRound, autopilotMove, endPlayerTurn } from './game/src/engine.js';

function playGame(seed, playerPolicy, foePolicy) {
  const s = createGame(seed);
  let guard = 0;
  while (s.phase !== 'over' && guard < 60) {
    playRound(s, playerPolicy, foePolicy);
    guard += 1;
  }
  return s;
}

const winSeeds = [];
const lossSeeds = [];
const lens = [];
for (let seed = 1; seed <= 40; seed += 1) {
  const g = playGame(seed, 'best', 'worst');
  lens.push(g.stats.turns);
  if (g.winner === 'player') winSeeds.push(seed);
  const h = playGame(seed, 'worst', 'best');
  if (h.winner === 'foe') lossSeeds.push(seed);
}
console.log('best-vs-worst player-win seeds:', winSeeds);
console.log('worst-vs-best foe-win seeds:', lossSeeds);
console.log('turns range (best-vs-worst):', Math.min(...lens), '-', Math.max(...lens));

// Mid-play snapshot for the play screenshot: best vs best, 3 rounds in.
const mid = createGame(7);
for (let r = 0; r < 3; r += 1) playRound(mid, 'best', 'best');
console.log('mid seed 7 after 3 rounds: turn', mid.turn, 'hp', mid.player.hp, 'vs', mid.foe.hp, 'phase', mid.phase, 'hand', mid.player.hand.length, 'energy', mid.player.energy);

// Even game: best vs best across seeds — who wins?
let pw = 0;
let fw = 0;
for (let seed = 1; seed <= 40; seed += 1) {
  const g = playGame(seed, 'best', 'best');
  if (g.winner === 'player') pw += 1;
  else if (g.winner === 'foe') fw += 1;
}
console.log('best-vs-best over 40 seeds: player wins', pw, ', foe wins', fw);

// Sanity: illegal plays rejected.
const t = createGame(3);
console.log('illegal (foe hand on player turn):', playCard(t, 'foe', 0) === false);
console.log('illegal (energy):', (() => {
  const s2 = createGame(3);
  s2.player.energy = 0;
  return playCard(s2, 'player', 0) === false;
})());
console.log('deck sizes:', createGame(1).player.deck.length, createGame(1).player.hand.length);
console.log('endPlayerTurn works:', (() => {
  const s3 = createGame(5);
  return endPlayerTurn(s3) && s3.phase === 'player' && s3.turn === 2;
})());
