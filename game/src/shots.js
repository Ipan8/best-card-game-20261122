// The screenshot scenes behind ?shot=title|play|win|loss. Each one plays the
// real rules forward from a fresh game for a fixed script, so the frame is
// what a real duel looks like and the same seed always gives the same frame:
//   title — a fresh duel, title screen over the table.
//   play  — three full rounds, best against best: both wardens bloodied,
//           a hand to play, the foe's next card telegraphed.
//   win   — the Warden at its best against a careless foe: a real victory.
//   loss  — a careless Warden against the foe at its best: a real defeat.
import { createGame, playRound } from './engine.js';

const PLAY_ROUNDS = 3;
const MAX_ROUNDS = 40;

export function stageShot(name, seed) {
  const state = createGame(seed);
  if (name === 'play') {
    for (let round = 0; round < PLAY_ROUNDS && state.phase !== 'over'; round += 1) {
      playRound(state, 'best', 'best');
    }
    return { state, screen: 'play' };
  }
  if (name === 'win') {
    let rounds = 0;
    while (state.phase !== 'over' && rounds < MAX_ROUNDS) {
      playRound(state, 'best', 'worst');
      rounds += 1;
    }
    return { state, screen: state.winner === 'player' ? 'win' : 'play' };
  }
  if (name === 'loss') {
    let rounds = 0;
    while (state.phase !== 'over' && rounds < MAX_ROUNDS) {
      playRound(state, 'worst', 'best');
      rounds += 1;
    }
    return { state, screen: state.winner === 'foe' ? 'loss' : 'play' };
  }
  return { state, screen: 'title' };
}
