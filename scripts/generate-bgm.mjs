import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sampleRate = 44_100;
const duration = 48;
const channels = 2;
const frameCount = sampleRate * duration;
const beat = 60 / 80;
const chordDuration = beat * 8;
const output = new URL('../.tools/audio/after-8-8-bgm.wav', import.meta.url);

const chords = [
  [50, 53, 57], // D minor
  [46, 50, 53], // B-flat major
  [43, 46, 50], // G minor
  [45, 50, 52], // A suspended tension
];
const pluckNotes = [62, 65, 69, 65, 58, 62, 65, 62, 55, 58, 62, 58, 57, 62, 64, 62];

const midiToHz = (midi) => 440 * (2 ** ((midi - 69) / 12));
const wave = (frequency, time, phase = 0) => (
  Math.sin(Math.PI * 2 * frequency * time + phase)
  + 0.18 * Math.sin(Math.PI * 4 * frequency * time + phase * 0.7)
  + 0.06 * Math.sin(Math.PI * 6 * frequency * time + phase * 1.3)
);

function padAt(time, channel) {
  const safeTime = (time + duration) % duration;
  const chordIndex = Math.floor(safeTime / chordDuration) % chords.length;
  const chordPhase = safeTime % chordDuration;
  const crossfade = Math.max(0, (chordPhase - (chordDuration - 1.2)) / 1.2);
  const current = chords[chordIndex];
  const next = chords[(chordIndex + 1) % chords.length];
  const render = (notes, gain) => notes.reduce((sum, midi, index) => {
    const detune = channel === 0 ? -0.0015 * (index + 1) : 0.0015 * (index + 1);
    return sum + wave(midiToHz(midi) * (1 + detune), safeTime, channel * 0.18 + index * 0.31) * gain / notes.length;
  }, 0);
  const eased = crossfade * crossfade * (3 - 2 * crossfade);
  return render(current, 1 - eased) + render(next, eased);
}

function sampleAt(time, channel) {
  const safeTime = (time + duration) % duration;
  const beatPhase = safeTime % beat;
  const beatIndex = Math.floor(safeTime / beat);

  const pad = 0.17 * padAt(safeTime, channel)
    + 0.035 * padAt(safeTime - 0.23, 1 - channel)
    + 0.018 * padAt(safeTime - 0.47, channel);

  const droneMotion = 0.78 + 0.22 * Math.sin(Math.PI * 2 * safeTime / 12);
  const drone = droneMotion * (
    0.075 * Math.sin(Math.PI * 2 * 73.416 * safeTime + channel * 0.12)
    + 0.035 * Math.sin(Math.PI * 2 * 110 * safeTime + channel * 0.27)
  );

  const pulseEnvelope = Math.exp(-beatPhase * 7.2);
  const pulseFrequency = 48 + 18 * Math.exp(-beatPhase * 13);
  const pulse = 0.105 * pulseEnvelope * Math.sin(Math.PI * 2 * pulseFrequency * beatPhase);

  const pluckPhase = safeTime % (beat * 2);
  const pluckIndex = Math.floor(safeTime / (beat * 2)) % pluckNotes.length;
  const pluckEnvelope = Math.exp(-pluckPhase * 4.8);
  const pluckFrequency = midiToHz(pluckNotes[pluckIndex]);
  const pluck = 0.04 * pluckEnvelope * (
    Math.sin(Math.PI * 2 * pluckFrequency * pluckPhase + channel * 0.14)
    + 0.32 * Math.sin(Math.PI * 4 * pluckFrequency * pluckPhase)
  );

  const tickPhase = safeTime % (beat / 2);
  const tick = beatIndex % 4 === 3
    ? 0.016 * Math.exp(-tickPhase * 34) * Math.sin(Math.PI * 2 * 1_780 * tickPhase)
    : 0;

  const edgeFade = Math.min(1, safeTime / 0.8, (duration - safeTime) / 0.8);
  const mixed = (pad + drone + pulse + pluck + tick) * Math.max(0, edgeFade);
  return Math.tanh(mixed * 1.35) * 0.72;
}

const wav = Buffer.alloc(44 + frameCount * channels * 2);
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
wav.writeUInt32LE(frameCount * channels * 2, 40);

for (let frame = 0; frame < frameCount; frame += 1) {
  const time = frame / sampleRate;
  for (let channel = 0; channel < channels; channel += 1) {
    const sample = Math.max(-1, Math.min(1, sampleAt(time, channel)));
    wav.writeInt16LE(Math.round(sample * 32_767), 44 + (frame * channels + channel) * 2);
  }
}

await mkdir(new URL('../.tools/audio/', import.meta.url), { recursive: true });
await writeFile(output, wav);
console.log(`Generated original BGM: ${fileURLToPath(output)}`);
console.log(`Duration: ${duration}s | Tempo: 80 BPM | Key center: D minor`);
