(async () => {
  const stage = document.querySelector('.bass-motion-stage');
  if (!stage) return;

  try {
    const response = await fetch(stage.dataset.svgSrc);
    if (!response.ok) return;
    const parsed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    const svg = parsed.documentElement;
    svg.querySelector('script')?.remove();
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    stage.replaceChildren(document.importNode(svg, true));
  } catch {
    return;
  }

  const svg = stage.querySelector('svg');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!svg || reducedMotion.matches) return;

  const mainBody = svg.querySelector('#main-body-path');
  const neck = svg.querySelector('#neck-path');
  const dotPaths = [...svg.querySelectorAll('.dots path')];
  if (!mainBody || !neck || !dotPaths.length) return;
  const originalBodyPath = mainBody.getAttribute('d');
  const bodyTokens = originalBodyPath.match(/[A-Za-z]|-?\d*\.?\d+/g);
  const originalNeckPath = neck.getAttribute('d');
  const neckTokens = originalNeckPath.match(/[A-Za-z]|-?\d*\.?\d+/g);
  const dotModels = dotPaths.map(path => ({
    path,
    tokens: path.getAttribute('d').match(/[A-Za-z]|-?\d*\.?\d+/g)
  }));
  const startedAt = performance.now();

  const deformPath = (element, tokens, deformation) => {
    const output = [];
    let pair = [];
    for (const token of tokens) {
      if (/[A-Za-z]/.test(token)) {
        output.push(token);
        continue;
      }
      pair.push(Number(token));
      if (pair.length !== 2) continue;
      const point = deformation(pair[0], pair[1]);
      output.push(point[0].toFixed(1), point[1].toFixed(1));
      pair = [];
    }
    element.setAttribute('d', output.join(' '));
  };

  const deformBody = force => {
    const output = [];
    let pair = [];
    for (const token of bodyTokens) {
      if (/[A-Za-z]/.test(token)) {
        output.push(token);
        continue;
      }
      pair.push(Number(token));
      if (pair.length !== 2) continue;
      const [x, y] = pair;
      const tail = Math.exp(-(((x - 550) / 255) ** 2 + ((y - 850) / 92) ** 2));
      const shoulder = Math.exp(-(((x - 690) / 175) ** 2 + ((y - 650) / 185) ** 2));
      const weight = Math.max(tail, shoulder * 0.48);
      output.push((x - force * weight * 0.26).toFixed(1));
      output.push((y + force * weight * (tail * 0.97 - shoulder * 0.34)).toFixed(1));
      pair = [];
    }
    mainBody.setAttribute('d', output.join(' '));
  };

  const render = now => {
    const elapsed = now - startedAt;
    const seconds = elapsed / 1000;
    const entrance = Math.min(1, elapsed / 1400);
    const softenedEntrance = entrance * entrance * (3 - 2 * entrance);

    // Base periods differ, with small secondary waves preventing lockstep motion.
    const bodyForce = softenedEntrance * (
      38 * Math.sin(seconds * Math.PI * 2 / 8.8) +
      6 * Math.sin(seconds * Math.PI * 2 / 7.4 + 0.72)
    );
    const neckForce = softenedEntrance * (
      14 * Math.sin(seconds * Math.PI * 2 / 8.1 + 0.3) +
      3 * Math.sin(seconds * Math.PI * 2 / 7.2 + 1.15)
    );
    deformBody(bodyForce);
    const deformNeckPoint = (x, y) => {
      const axis = Math.max(0, Math.min(1, ((x - 960) * 0.60 + (585 - y) * 0.80) / 630));
      const anchored = axis * axis * (3 - 2 * axis);
      return [x + neckForce * 0.78 * anchored, y + neckForce * 0.62 * anchored];
    };
    deformPath(neck, neckTokens, deformNeckPoint);
    dotModels.forEach(model => deformPath(model.path, model.tokens, deformNeckPoint));
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
  reducedMotion.addEventListener('change', () => location.reload());
})();
