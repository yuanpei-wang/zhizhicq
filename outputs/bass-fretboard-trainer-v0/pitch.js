// YIN fundamental-frequency estimator, tuned for a standard 4-string bass.
export function detectPitch(buffer, sampleRate, minHz = 35, maxHz = 500) {
  let rms = 0;
  for (const value of buffer) rms += value * value;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.006) return { frequency: null, confidence: 0, rms };

  const minTau = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxTau = Math.min(Math.floor(sampleRate / minHz), Math.floor(buffer.length / 2));
  const yin = new Float32Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0;
    for (let i = 0; i < buffer.length - maxTau; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yin[tau] = sum;
  }

  let runningSum = 0;
  yin[0] = 1;
  for (let tau = 1; tau <= maxTau; tau++) {
    runningSum += yin[tau];
    yin[tau] = runningSum ? yin[tau] * tau / runningSum : 1;
  }

  let tau = -1;
  const threshold = 0.14;
  for (let t = minTau; t < maxTau; t++) {
    if (yin[t] < threshold) {
      while (t + 1 <= maxTau && yin[t + 1] < yin[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) {
    let best = minTau;
    for (let t = minTau + 1; t <= maxTau; t++) if (yin[t] < yin[best]) best = t;
    if (yin[best] > 0.28) return { frequency: null, confidence: 0, rms };
    tau = best;
  }

  const prev = yin[tau - 1] ?? yin[tau];
  const next = yin[tau + 1] ?? yin[tau];
  const denominator = 2 * (2 * yin[tau] - next - prev);
  const refinedTau = denominator ? tau + (next - prev) / denominator : tau;
  return { frequency: sampleRate / refinedTau, confidence: Math.max(0, 1 - yin[tau]), rms };
}

export function frequencyToNote(frequency) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const names = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  const target = 440 * 2 ** ((midi - 69) / 12);
  return { midi, name: `${names[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`, cents: 1200 * Math.log2(frequency / target) };
}
