// Galebound Duel — tiny WebAudio blips, all synthesized, no audio files.
// The context is created lazily on the first user gesture, so the screenshot
// scenes (which never gesture) stay silent and deterministic.
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensure() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq, at, dur, type, gain) {
  const ac = ensure();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ac.currentTime + at);
  amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + at + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.02);
}

const ELEMENT_TONE = { ember: 220, tide: 330, gale: 392, stone: 165 };

export function playCardSound(element, surge) {
  const base = ELEMENT_TONE[element] ?? 262;
  blip(base, 0, 0.12, 'triangle', 0.12);
  if (surge > 0) blip(base * 1.5, 0.07, 0.16, 'triangle', 0.12);
}

export function hitSound() {
  blip(110, 0, 0.18, 'sawtooth', 0.08);
}

export function winSound() {
  [523, 659, 784, 1047].forEach((f, i) => blip(f, i * 0.12, 0.22, 'triangle', 0.12));
}

export function loseSound() {
  [392, 330, 262, 196].forEach((f, i) => blip(f, i * 0.14, 0.24, 'sine', 0.1));
}

export function turnSound() {
  blip(440, 0, 0.07, 'sine', 0.06);
}
