/* Classics Hook · web · sin dependencias, sin cookies, sin rastreo */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactil = matchMedia('(hover: none)').matches;

  /* palabras del título que suben una a una */
  $$('[data-palabras]').forEach(el => {
    const html = el.innerHTML.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(Boolean);
    let i = 0;
    el.innerHTML = html.map(p => /^\s+$/.test(p) ? ' ' : `<span class="palabra"><span style="--i:${i++}">${p}</span></span>`).join('');
  });

  /* barra de progreso + luz del puntero */
  const prog = $('#progreso');
  const onScroll = () => {
    const h = document.documentElement;
    prog.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const luz = $('#luz');
  if (luz && !tactil && !quieto) {
    addEventListener('pointermove', e => { luz.style.opacity = 1; luz.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });
    document.addEventListener('pointerleave', () => luz.style.opacity = 0);
  }

  /* aparecer al hacer scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.rev').forEach(el => io.observe(el));

  /* luz que sigue al puntero dentro de cada tarjeta */
  $$('.tarjeta').forEach(t => t.addEventListener('pointermove', e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* teléfono de la portada: se inclina con el puntero */
  const esc = $('.portada .escena'), tel = esc && $('.telefono', esc);
  if (esc && !tactil && !quieto) {
    esc.addEventListener('pointermove', e => {
      const r = esc.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tel.style.setProperty('--ry', (x * 18 - 4) + 'deg'); tel.style.setProperty('--rx', (-y * 12 + 2) + 'deg');
    });
    esc.addEventListener('pointerleave', () => { tel.style.removeProperty('--ry'); tel.style.removeProperty('--rx'); });
  }

  /* mazo de reels: la tapa de adelante sube y sale, como al deslizar */
  const tapas = $$('.mazo .tapa-reel'), segs = $$('.historias i');
  if (tapas.length) {
    const n = tapas.length; let idx = 0; const DUR = 3400;
    const poner = (primera) => {
      tapas.forEach((t, k) => {
        const pos = (k - idx + n) % n, antes = +t.dataset.pos;
        if (!primera && antes === n - 1 && pos === n - 2) { t.style.transition = 'none'; t.dataset.pos = pos; void t.offsetWidth; t.style.transition = ''; }
        else t.dataset.pos = pos;
      });
      segs.forEach((s, k) => { s.className = k < idx ? 'hecho' : k === idx ? 'activo' : ''; });
    };
    segs.forEach(s => s.parentElement.style.setProperty('--dur', DUR + 'ms'));
    poner(true);
    if (!quieto) setInterval(() => { idx = (idx + 1) % n; poner(false); }, DUR);
  }

  /* deslizá para empezar */
  const d = $('.desliza');
  if (d) {
    const per = $('.perilla', d), txt = $('.texto', d);
    let max = 0, x0 = 0, activo = false, p = 0;
    const medir = () => { max = d.clientWidth - per.offsetWidth - 10; d.style.setProperty('--max', max + 'px'); };
    const poner = v => { p = Math.max(0, Math.min(1, v)); d.style.setProperty('--p', p); };
    const fin = () => {
      d.classList.add('listo'); txt.textContent = '¡Vamos!';
      setTimeout(() => $('#inicio').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' }), 250);
      setTimeout(() => { d.classList.remove('listo'); txt.textContent = 'Deslizá para elegir tu tiempo'; poner(0); }, 1600);
    };
    medir(); addEventListener('resize', medir);
    per.addEventListener('pointerdown', e => { activo = true; x0 = e.clientX - p * max; d.classList.add('arrastra'); per.setPointerCapture(e.pointerId); });
    per.addEventListener('pointermove', e => { if (activo) poner((e.clientX - x0) / max); });
    const suelta = () => { if (!activo) return; activo = false; d.classList.remove('arrastra'); p > .88 ? (poner(1), fin()) : poner(0); };
    per.addEventListener('pointerup', suelta); per.addEventListener('pointercancel', suelta);
    per.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poner(1); fin(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); poner(p + .34); if (p >= 1) fin(); }
    });
  }

  /* cómo funciona: el teléfono cambia con cada paso */
  const pasos = $('.pasos');
  if (pasos) {
    const ps = $$('.paso', pasos);
    const o = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { ps.forEach(x => x.classList.toggle('on', x === e.target)); pasos.dataset.paso = e.target.dataset.n; if (e.target.dataset.n === '3') leer(); }
    }), { rootMargin: '-42% 0px -42% 0px' });
    ps.forEach(x => o.observe(x));
    const pal = $$('.lector span', pasos); let tl;
    function leer() {
      clearInterval(tl); pal.forEach(w => w.classList.remove('dicho')); if (quieto) { pal.forEach(w => w.classList.add('dicho')); return; }
      let k = 0; tl = setInterval(() => { if (k < pal.length) pal[k++].classList.add('dicho'); else { clearInterval(tl); setTimeout(() => { if (pasos.dataset.paso === '3') leer(); }, 1800); } }, 330);
    }
  }

  let heroSync = () => {};
  /* elegí tu tiempo */
  const rango = $('#rango');
  if (rango) {
    const out = $('#minutos'), ver = $('#veredicto'), ops = $$('.op');
    const fmt = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}` : `${m} min`;
    const act = () => {
      const m = +rango.value; rango.style.setProperty('--pct', ((m - rango.min) / (rango.max - rango.min) * 100) + '%');
      out.innerHTML = m >= 60 ? `${Math.floor(m / 60)}<small>h</small> ${String(m % 60).padStart(2, '0')}<small>min</small>` : `${m}<small>min</small>`;
      let mejor = -1;
      ops.forEach((o, i) => { if (+o.dataset.min <= m) mejor = i; });
      ops.forEach((o, i) => { o.classList.toggle('mejor', i === mejor); o.classList.toggle('ok', i !== mejor && +o.dataset.min <= m); });
      if (mejor < 0) ver.textContent = 'Con menos de 33 minutos, empezá por el reel y la contratapa: te cuentan de qué va sin spoilers.';
      else { const o = ops[mejor]; ver.textContent = `Te alcanza para «${o.dataset.nombre}» (${fmt(+o.dataset.min)}). ${mejor === 3 ? 'Es el libro entero, con las palabras del autor.' : 'Con las palabras del autor, sin reescribir.'}`; }
    };
    rango.addEventListener('input', () => { act(); heroSync(+rango.value); }); act();
  }


  /* portada: el tiempo que tenés manda sobre el abanico */
  const rH = $('#rangoH');
  if (rH) {
    const V = [{ m: 33, n: 'Relámpago', s: 'Lo imprescindible, con las palabras del autor', t: '33 min', pc: 10.5 },
               { m: 78, n: 'Rápida', s: 'Un cuarto del libro, sin perder la trama', t: '1 h 18', pc: 25 },
               { m: 156, n: 'Tranquila', s: 'La mitad, con las palabras del autor', t: '2 h 36', pc: 50 },
               { m: 311, n: 'Original', s: 'El libro completo, tal como lo escribió', t: '5 h 11', pc: 100 }];
    const vivo = $('#vivo'), hn = $('#hn'), btns = $$('.selector-v button');
    const largo = m => m < 60 ? `${m} minutos.` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') + ' min' : ''}.`;
    let ultimo = -2;
    heroSync = m => {
      rH.value = m; rH.style.setProperty('--pct', ((m - rH.min) / (rH.max - rH.min) * 100) + '%');
      hn.textContent = largo(m);
      let i = -1; V.forEach((v, k) => { if (v.m <= m) i = k; });
      vivo.style.setProperty('--abre', 6 + Math.min(m, 360) / 360 * 18);
      btns.forEach((b, k) => b.classList.toggle('on', k === i));
      if (i !== ultimo) {
        ultimo = i; const v = V[Math.max(i, 0)];
        $('#vNombre').textContent = i < 0 ? 'Mirá el reel' : v.n;
        $('#vSub').textContent = i < 0 ? 'Con menos de 33 minutos, empezá por el reel y la contratapa' : v.s;
        $('#vTiempo').textContent = i < 0 ? '< 33 min' : v.t;
        const pc = i < 0 ? 3 : v.pc; vivo.style.setProperty('--pc', pc); $('#vPc').textContent = Math.round(pc) + '%';
        vivo.classList.remove('pop'); void vivo.offsetWidth; vivo.classList.add('pop');
      }
    };
    rH.addEventListener('input', () => { heroSync(+rH.value); if (rango) { rango.value = rH.value; rango.dispatchEvent(new Event('input')); } });
    btns.forEach(b => b.addEventListener('click', () => { heroSync(+b.dataset.min); if (rango) { rango.value = b.dataset.min; rango.dispatchEvent(new Event('input')); } }));
    heroSync(+rH.value);
  }

  /* estante: cada libro se inclina con el puntero */
  if (!tactil && !quieto) $$('.libro3d').forEach(l => {
    l.addEventListener('pointermove', e => { const r = l.getBoundingClientRect(); l.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 22 + 'deg'); l.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 16 + 'deg'); });
    l.addEventListener('pointerleave', () => { l.style.removeProperty('--ry'); l.style.removeProperty('--rx'); });
  });

  /* cifras que cuentan */
  const oc = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; oc.unobserve(e.target);
    const el = e.target, fin = +el.dataset.n; if (quieto || fin === 0) { el.textContent = fin; return; }
    const t0 = performance.now(), D = 1300;
    (function paso(t) { const k = Math.min(1, (t - t0) / D); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); })(t0);
  }), { threshold: .6 });
  $$('[data-n].cuenta').forEach(el => oc.observe(el));
})();
