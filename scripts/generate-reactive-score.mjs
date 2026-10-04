import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sampleRate = 44_100;
const bpm = 92;
const beat = 60 / bpm;
const duration = beat * 64;
const channels = 2;
const frames = Math.round(sampleRate * duration);
const outputDir = new URL('../.tools/audio/', import.meta.url);

const lightChords = [
  [52, 55, 59], // E minor
  [48, 52, 55], // C major
  [43, 47, 50], // G major
  [50, 54, 57], // D major
];
const darkChords = [
  [40, 47, 52],
  [41, 47, 53],
  [36, 43, 48],
  [35, 42, 47],
];
const lightArp = [64, 67, 71, 74, 67, 71, 76, 71, 60, 64, 67, 72, 62, 66, 69, 74];
const darkArp = [52, 59, 64, 59, 53, 59, 65, 59, 48, 55, 60, 55, 47, 54, 59, 54];

const hz = (midi) => 440 * (2 ** ((midi - 69) / 12));
const osc = (frequency, time, phase = 0) => Math.sin(Math.PI * 2 * frequency * time + phase);
const softClip = (value) => Math.tanh(value * 1.28) * 0.78;
const wrap = (time) => ((time % duration) + duration) % duration;

function chordLayer(time, channel, chords, brightness) {
  const chordDuration = beat * 8;
  const position = wrap(time);
  const index = Math.floor(position / chordDuration) % chords.length;
  const phase = position % chordDuration;
  const fade = Math.max(0, (phase - chordDuration + beat * 1.5) / (beat * 1.5));
  const smooth = fade * fade * (3 - 2 * fade);
  const render = (notes, weight) => notes.reduce((sum, note, voice) => {
    const detune = (channel ? 1 : -1) * (voice + 1) * 0.0012;
    const frequency = hz(note) * (1 + detune);
    const fundamental = osc(frequency, position, voice * 0.23 + channel * 0.12);
    const overtone = osc(frequency * 2, position, voice * 0.31) * brightness;
    return sum + (fundamental + overtone) * weight / notes.length;
  }, 0);
  return render(chords[index], 1 - smooth) + render(chords[(index + 1) % chords.length], smooth);
}

function glassPluck(time, channel, notes, gain, decay) {
  const step = beat / 2;
  const phase = wrap(time) % step;
  const index = Math.floor(wrap(time) / step) % notes.length;
  const frequency = hz(notes[index]);
  const envelope = Math.exp(-phase * decay);
  return gain * envelope * (
    osc(frequency, phase, channel * 0.17)
    + 0.46 * osc(frequency * 2.01, phase)
    + 0.19 * osc(frequency * 3.98, phase, 0.3)
  );
}

function pulse(time, frequency, gain, decay) {
  const phase = wrap(time) % beat;
  const envelope = Math.exp(-phase * decay);
  return gain * envelope * osc(frequency + 12 * Math.exp(-phase * 14), phase);
}

function loopFade(time) {
  const position = wrap(time);
  return Math.min(1, position / 0.45, (duration - position) / 0.45);
}

function lightSample(time, channel) {
  const position = wrap(time);
  const chordIndex = Math.floor(position / (beat * 8)) % lightChords.length;
  const root = hz(lightChords[chordIndex][0] - 12);
  const pad = 0.115 * chordLayer(position, channel, lightChords, 0.08);
  const airyDelay = 0.025 * chordLayer(position - 0.19, 1 - channel, lightChords, 0.1);
  const bass = 0.065 * osc(root, position, channel * 0.08) * (0.82 + 0.18 * osc(1 / (beat * 8), position));
  const pluck = glassPluck(position, channel, lightArp, 0.075, 9.5);
  const kick = pulse(position, 54, 0.082, 9.2);
  const offbeatPhase = (position + beat / 2) % beat;
  const softTick = 0.013 * Math.exp(-offbeatPhase * 25) * osc(1_460, offbeatPhase, channel * 0.2);
  const sparklePhase = position % (beat * 4);
  const sparkle = 0.018 * Math.exp(-sparklePhase * 5.7) * osc(hz(83), sparklePhase, channel * 0.3);
  return softClip((pad + airyDelay + bass + pluck + kick + softTick + sparkle) * loopFade(position));
}

function darkSample(time, channel) {
  const position = wrap(time);
  const chordIndex = Math.floor(position / (beat * 8)) % darkChords.length;
  const root = hz(darkChords[chordIndex][0] - 12);
  const pad = 0.095 * chordLayer(position, channel, darkChords, 0.04);
  const sub = 0.11 * osc(root, position, channel * 0.05) * (0.76 + 0.24 * osc(1 / (beat * 4), position));
  const lowPulse = pulse(position, 43, 0.13, 7.6);
  const mutedArp = glassPluck(position, channel, darkArp, 0.034, 13);
  const halfBeat = beat / 2;
  const clockPhase = position % halfBeat;
  const clock = 0.018 * Math.exp(-clockPhase * 36) * (
    osc(1_050, clockPhase, channel * 0.23) + 0.45 * osc(2_100, clockPhase)
  );
  const warningPhase = position % (beat * 8);
  const warning = 0.027 * Math.exp(-warningPhase * 3.8) * osc(hz(70), warningPhase, channel * 0.16);
  return softClip((pad + sub + lowPulse + mutedArp + clock + warning) * loopFade(position));
}

function renderWav(sampleFunction) {
  const wav = Buffer.alloc(44 + frames * channels * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * channels * 2, 28);
  wav.writeUInt16LE(channels * 2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(frames * channels * 2, 40);
  for (let frame = 0; frame < frames; frame += 1) {
    const time = frame / sampleRate;
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, sampleFunction(time, channel)));
      wav.writeInt16LE(Math.round(sample * 32_767), 44 + (frame * channels + channel) * 2);
    }
  }
  return wav;
}

await mkdir(outputDir, { recursive: true });
const lightPath = new URL('trust-bubbles-light.wav', outputDir);
const darkPath = new URL('trust-bubbles-dark.wav', outputDir);
await Promise.all([
  writeFile(lightPath, renderWav(lightSample)),
  writeFile(darkPath, renderWav(darkSample)),
]);
console.log(`Generated light score: ${fileURLToPath(lightPath)}`);
console.log(`Generated dark score: ${fileURLToPath(darkPath)}`);
console.log(`Duration: ${duration.toFixed(3)}s | Tempo: ${bpm} BPM | Key center: E minor`);
