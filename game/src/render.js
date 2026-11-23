// Galebound Duel — the renderer. A pure function of (state, screen): the
// same state always paints the same table, which is what makes the
// screenshots repeatable. No network, no images: cards are DOM and CSS.
import { ELEMENTS } from './config.js';
import { cardById } from './cards.js';

function hpBar(side, label) {
  const pct = Math.max(0, Math.round((side.hp / side.maxHp) * 100));
  const block = side.block > 0 ? `<span class="block-badge">BLK ${side.block}</span>` : '';
  return `<div class="hp">
    <span class="hp-label">${label}</span>
    <div class="hp-track"><div class="hp-fill" style="width:${pct}%"></div></div>
    <span class="hp-num">${side.hp} / ${side.maxHp}</span>${block}
  </div>`;
}

function energyPips(energy, max) {
  let pips = '';
  for (let i = 0; i < max; i += 1) {
    pips += `<span class="pip${i < energy ? ' on' : ''}">●</span>`;
  }
  return `<span class="energy" title="Energy">${pips}<span class="energy-num">${energy}/${max}</span></span>`;
}

export function cardHtml(card, index, affordable) {
  const el = ELEMENTS[card.element];
  return `<button type="button" class="card el-${card.element}${affordable ? '' : ' poor'}" data-play="${index}" aria-label="${card.name}, ${el.name}, cost ${card.cost}, attack ${card.attack}, block ${card.block}">
    <span class="card-cost">${'●'.repeat(card.cost)}${'○'.repeat(3 - card.cost)}<em>ENERGY</em></span>
    <span class="card-glyph" style="color:${el.color}">${el.glyph}</span>
    <span class="card-name">${card.name}</span>
    <span class="card-el" style="color:${el.light}">${el.name}</span>
    <span class="card-vals"><span>ATK <b>${card.attack}</b></span><span>BLK <b>${card.block}</b></span></span>
    <span class="card-key">${index + 1}</span>
  </button>`;
}

function miniCard(card) {
  const el = ELEMENTS[card.element];
  return `<div class="mini" title="${card.name}">
    <span class="mini-glyph" style="color:${el.color}">${el.glyph}</span>
    <span class="mini-name">${card.name}</span>
    <span class="mini-vals">ATK ${card.attack} · BLK ${card.block}</span>
  </div>`;
}

function cardBack() {
  return `<div class="mini back" title="Face-down card"><span class="mini-glyph">◆</span><span class="mini-name">GALEBOUND</span></div>`;
}

function lastPlaySlot(state, side, caption) {
  const last = state.lastBySide[side];
  if (!last) {
    return `<div class="slot empty"><span>${caption}</span><em>no card yet</em></div>`;
  }
  const surge = last.surge > 0 ? `<span class="surge-tag">SURGE +${last.surge}</span>` : '';
  return `<div class="slot"><div class="slot-card">${miniCard(last.card)}${surge}</div><span class="slot-cap">${caption}</span></div>`;
}

export function scoreOf(state) {
  return state.stats.dealt + (state.winner === 'player' ? 50 : 0);
}

export function render(state, screen) {
  const p = state.player;
  const f = state.foe;
  const hand = p.hand
    .map((id, i) => cardHtml(cardById(id), i, cardById(id).cost <= p.energy))
    .join('');
  const backs = f.hand.map(() => cardBack()).join('');
  const tele = state.telegraph
    ? `<div class="tele-card">${miniCard(state.telegraph)}</div><span class="tele-cap">WILL PLAY</span>`
    : `<div class="slot empty"><span>WILL PLAY</span><em>—</em></div>`;
  const log = state.log.slice(-2).map((line) => `<div>${line}</div>`).join('');

  const table = `
  <header class="topbar">
    <span class="brand">GALEBOUND DUEL</span>
    <span class="turn">TURN ${state.turn}</span>
    <span class="score">SCORE <b>${scoreOf(state)}</b> · DMG <b>${state.stats.dealt}</b></span>
    <span class="spacer"></span>
    <button type="button" class="tbtn" data-mute aria-label="Toggle sound">SOUND ${state.muted ? 'OFF' : 'ON'}</button>
    <button type="button" class="tbtn" data-restart aria-label="Restart duel">RESTART</button>
  </header>
  <section class="foe-row">
    <div class="foe-info">
      <span class="foe-name">THE HOLLOW GALE</span>
      ${hpBar(f, 'FOE')}
      <span class="deck">DECK ${f.deck.length} · HAND ${f.hand.length}</span>
    </div>
    <div class="foe-hand">${backs}</div>
    <div class="telegraph">${tele}</div>
  </section>
  <section class="table">
    <div class="plays">
      ${lastPlaySlot(state, 'player', 'YOUR LAST PLAY')}
      <div class="wheel">
        <b>THE SURGE WHEEL</b>
        <span><i style="color:#e5534b">▲ Ember</i> beats <i style="color:#58c98a">◆ Gale</i></span>
        <span><i style="color:#58c98a">◆ Gale</i> beats <i style="color:#4fc3f7">● Tide</i></span>
        <span><i style="color:#4fc3f7">● Tide</i> beats <i style="color:#e5534b">▲ Ember</i></span>
        <span><i style="color:#f2c94c">■ Stone</i> stands alone · Surge +2 ATK</span>
      </div>
      ${lastPlaySlot(state, 'foe', 'FOE\u2019S LAST PLAY')}
    </div>
    <div class="log">${log}</div>
  </section>
  <section class="player-row">
    <div class="player-info">
      <span class="player-name">YOU · WARDEN OF THE GALE</span>
      ${hpBar(p, 'YOU')}
      <span class="deck">DECK ${p.deck.length} · DISCARD ${p.discard.length}</span>
      ${energyPips(p.energy, 3)}
    </div>
    <div class="hand">${hand}</div>
    <button type="button" class="endturn" data-end ${state.phase === 'player' ? '' : 'disabled'}>END TURN ⏎</button>
  </section>`;

  let overlay = '';
  if (screen === 'title') {
    overlay = `<div class="overlay">
      <div class="panel title-panel">
        <div class="fan">
          <span class="fan-card el-ember">▲</span><span class="fan-card el-tide">●</span><span class="fan-card el-gale">◆</span><span class="fan-card el-stone">■</span>
        </div>
        <h1>GALEBOUND<br>DUEL</h1>
        <p class="tag">A duel of the four elements. You are the Warden.<br>The Hollow Gale waits across the table.</p>
        <div class="how">
          <span><b>1</b> Play cards with energy — 3 each turn.</span>
          <span><b>2</b> Beat the last element to Surge +2 attack.</span>
          <span><b>3</b> Block soaks damage. Reduce the foe to 0 life.</span>
        </div>
        <div class="legend">
          <span><i style="color:#e5534b">▲ Ember</i></span><span><i style="color:#4fc3f7">● Tide</i></span><span><i style="color:#58c98a">◆ Gale</i></span><span><i style="color:#f2c94c">■ Stone</i></span>
        </div>
        <button type="button" class="bigbtn" data-start>START THE DUEL</button>
        <p class="hint">Click a card or press 1–5 to play · Enter ends your turn · M mutes</p>
      </div>
    </div>`;
  } else if (screen === 'win' || screen === 'loss') {
    const won = screen === 'win';
    overlay = `<div class="overlay">
      <div class="panel end-panel">
        <h1 class="${won ? 'win' : 'loss'}">${won ? 'VICTORY' : 'DEFEAT'}</h1>
        <p class="tag">${won ? 'The Hollow Gale falls. The table is yours.' : 'Your light gutters out. The Hollow Gale prevails.'}</p>
        <div class="stats">
          <span>SCORE <b>${scoreOf(state)}</b></span>
          <span>TURNS <b>${state.stats.turns}</b></span>
          <span>DAMAGE DEALT <b>${state.stats.dealt}</b></span>
          <span>CARDS PLAYED <b>${state.stats.played}</b></span>
          <span>LIFE LEFT <b>${state.player.hp} / ${state.player.maxHp}</b></span>
        </div>
        <button type="button" class="bigbtn" data-again>PLAY AGAIN</button>
        <p class="hint">Press Enter to play again</p>
      </div>
    </div>`;
  }

  return table + overlay;
}
