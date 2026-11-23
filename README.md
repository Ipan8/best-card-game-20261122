# Galebound Duel

[![make.fun](https://img.shields.io/badge/make.fun-best--card--game--20261122--1826-blue)](https://make.fun/bounty/best-card-game-20261122-1826)
[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Ipan8/best-card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Ipan8/best-card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![Node](https://img.shields.io/badge/node-%3E%3D22.18-green)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A complete original card duel for the [make.fun "Make the best card game" bounty](https://make.fun/bounty/best-card-game-20261122-1826): you, the Warden of the Gale, against the Hollow Gale across a table, in a desktop browser, from static files, with no network request.

## The game

Both wardens hold **30 life**. Each turn you get **3 energy** and draw up to **5 cards** from your own 28-card deck — 7 cards in each of four original elements:

- **▲ Ember** (red) beats **◆ Gale** — **◆ Gale** (green) beats **● Tide** — **● Tide** (blue) beats **▲ Ember** — **■ Stone** (amber) stands alone.

Playing a card whose element beats the last played card's element **Surges: +2 attack**. Block soaks damage until your next turn starts. The foe's next card is telegraphed face-up, so every turn is a readable puzzle: answer its element, or brace with block. Reduce the foe to 0 life to win; fall to 0 and you lose.

- **Title screen** with the rules and the element legend
- **The table**: your hand and the foe's (face-down, plus the telegraphed card), both life totals, both last plays, the surge wheel, and a play log
- **Cards with readable values**: energy cost, attack, block, element name, colour and shape
- **Win and loss screens** with score, turns, damage dealt, cards played and life left
- **Keyboard and mouse**: click a card or press 1–5 to play, Enter ends your turn, M mutes, R restarts
- **Sound**: tiny synthesized WebAudio blips per element (no audio files)

## Play it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no dependencies, no network: `game/index.html` and its ES modules under `game/src/` are the whole game.

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`screenshots/` holds four real renders of the game's own code at 1280×480: the title screen, a mid-play table, the win screen and the loss screen. The `?shot=` scenes are staged by playing the real rules forward from a fixed seed (`game/src/shots.js`), so the same seed always gives the same frame — verified: two runs of `main.ts` write byte-identical output, and the engine self-test (`node test-engine.mjs`) plays full games in Node and confirms both the win path (best play beats a careless foe, 40/40 seeds) and the loss path (a careless Warden falls, 39/40 seeds).

## License

MIT — see [LICENSE](LICENSE).
