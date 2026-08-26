import { detectPitch, frequencyToNote } from './pitch.js';

const $ = id => document.getElementById(id);
const ui = { device:$('deviceSelect'), start:$('startButton'), status:$('deviceStatus'), note:$('note'), frequency:$('frequency'), cents:$('cents'), level:$('level'), confidence:$('confidence'), latency:$('latency'), hint:$('hint'), fill:$('meterFill') };
let context, stream, analyser, samples, frame, running = false;
let history = [];

async function listDevices(selectedId) {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput');
  ui.device.innerHTML = '';
  for (const [index, device] of devices.entries()) {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `音频输入 ${index + 1}`;
    option.selected = device.deviceId === selectedId;
    ui.device.append(option);
  }
  ui.device.disabled = !devices.length;
}

async function start(preferredId = ui.device.value) {
  stop(false);
  ui.start.disabled = true;
  ui.status.textContent = ' 正在请求麦克风权限…';
  ui.status.prepend(Object.assign(document.createElement('span'), {className:'dot'}));
  try {
    const audioOptions = {echoCancellation:false, noiseSuppression:false, autoGainControl:false, channelCount:1};
    if (preferredId) audioOptions.deviceId = {exact:preferredId};
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio:audioOptions, video:false});
    } catch (deviceError) {
      // A disconnected or stale device ID should not prevent the first permission prompt.
      if (!preferredId || !['OverconstrainedError', 'NotFoundError'].includes(deviceError.name)) throw deviceError;
      delete audioOptions.deviceId;
      stream = await navigator.mediaDevices.getUserMedia({audio:audioOptions, video:false});
    }
    context = new AudioContext({latencyHint:'interactive'});
    await context.resume();
    analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0;
    samples = new Float32Array(analyser.fftSize);
    context.createMediaStreamSource(stream).connect(analyser);
    const settings = stream.getAudioTracks()[0].getSettings();
    await listDevices(settings.deviceId);
    running = true;
    ui.start.textContent = '停止检测'; ui.start.classList.add('stop'); ui.start.disabled = false;
    ui.status.classList.add('active'); ui.status.innerHTML = '<span class="dot"></span>已连接：' + (stream.getAudioTracks()[0].label || '当前输入设备');
    ui.latency.textContent = `${Math.round(analyser.fftSize / context.sampleRate * 1000)} ms`;
    tick();
  } catch (error) {
    ui.start.disabled = false;
    ui.status.classList.remove('active');
    const messages = {
      NotAllowedError:'未获得麦克风权限，请在浏览器设置中允许',
      NotFoundError:'没有找到音频输入设备，请检查声卡连接',
      NotReadableError:'音频设备正被其他程序占用，请关闭相关程序后重试',
      SecurityError:'浏览器阻止了麦克风访问，请使用 localhost 打开本页'
    };
    ui.status.innerHTML = '<span class="dot"></span>' + (messages[error.name] || `连接失败：${error.message || error.name}`);
  }
}

function stop(reset = true) {
  running = false; cancelAnimationFrame(frame); history = [];
  stream?.getTracks().forEach(track => track.stop()); context?.close();
  stream = context = analyser = null;
  if (reset) {
    ui.start.textContent='开始检测'; ui.start.classList.remove('stop'); ui.status.classList.remove('active');
    ui.status.innerHTML='<span class="dot"></span>已停止'; ui.note.textContent='—'; ui.frequency.textContent='—'; ui.cents.textContent='等待信号';
  }
}

function tick() {
  if (!running) return;
  analyser.getFloatTimeDomainData(samples);
  const found = detectPitch(samples, context.sampleRate);
  const db = found.rms ? 20 * Math.log10(found.rms) : -Infinity;
  ui.level.textContent = Number.isFinite(db) ? `${db.toFixed(1)} dB` : '— dB';
  ui.confidence.textContent = found.frequency ? `${Math.round(found.confidence * 100)}%` : '—';
  if (found.frequency && found.confidence >= .72) {
    history.push(found.frequency); if (history.length > 5) history.shift();
    const sorted = [...history].sort((a,b)=>a-b);
    const frequency = sorted[Math.floor(sorted.length / 2)];
    const note = frequencyToNote(frequency);
    ui.note.textContent = note.name; ui.frequency.textContent = frequency.toFixed(2); ui.hint.textContent = '当前检测';
    const cents = Math.max(-50, Math.min(50, note.cents));
    ui.cents.textContent = Math.abs(cents) < 3 ? '音高稳定' : `${Math.abs(cents).toFixed(0)} cents ${cents < 0 ? '偏低' : '偏高'}`;
    ui.fill.style.left = cents < 0 ? `${50 + cents}%` : '50%'; ui.fill.style.width = `${Math.abs(cents)}%`;
  } else if (db < -44 || !found.frequency) {
    history = []; ui.note.textContent='—'; ui.frequency.textContent='—'; ui.cents.textContent='等待清晰的单音'; ui.hint.textContent='弹响一根弦'; ui.fill.style.width='0';
  }
  frame = requestAnimationFrame(tick);
}

ui.start.addEventListener('click', () => running ? stop() : start());
ui.device.addEventListener('change', () => { if (running) start(ui.device.value); });
navigator.mediaDevices?.addEventListener('devicechange', () => listDevices(ui.device.value));
