/* Classics Hook · web · sin dependencias, sin cookies, sin rastreo */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* barra de progreso de la página */
  const prog = $('#progreso');
  if (prog) {
    const onScroll = () => {
      const h = document.documentElement;
      prog.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* aparecer al hacer scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.rev').forEach(el => io.observe(el));

  /* portada: el tiempo que tenés decide qué oraciones quedan en la página */
  const rH = $('#rangoH'), vivo = $('#vivo');
  if (rH && vivo) {
    const V = [{ m: 33, n: 'Relámpago', s: 'Lo imprescindible', t: '33 min', pc: 10.5 },
               { m: 78, n: 'Rápida', s: 'Un cuarto, sin perder la trama', t: '1 h 18', pc: 25 },
               { m: 156, n: 'Tranquila', s: 'La mitad del libro', t: '2 h 36', pc: 50 },
               { m: 311, n: 'Original', s: 'El libro completo', t: '5 h 11', pc: 100 }];
    const spans = $$('.texto-libro span', vivo), btns = $$('.selector-v button', vivo);
    const hn = $('#hn'), out = $('#hTiempo');
    const corto = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') : ''}`;
    const largo = m => m < 60 ? `${m} minutos` : m % 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m / 60} horas`;
    let ultimo = -2;
    const poner = m => {
      rH.value = m; rH.style.setProperty('--pct', ((m - rH.min) / (rH.max - rH.min) * 100) + '%');
      hn.textContent = largo(m); out.textContent = corto(m);
      let i = 0; V.forEach((v, k) => { if (v.m <= m) i = k; });
      if (i === ultimo) return; ultimo = i;
      const nivel = i + 1, v = V[i];
      vivo.dataset.nivel = nivel;
      vivo.style.setProperty('--g', nivel / 2);
      spans.forEach(s => { const dentro = +s.dataset.n <= nivel; s.classList.toggle('dentro', dentro); s.classList.toggle('fuera', !dentro); });
      btns.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i); });
      $('#vNombre').textContent = v.n; $('#vSub').textContent = v.s; $('#vTiempo').textContent = v.t;
      $('#vBarra').style.setProperty('--pc', v.pc + '%');
    };
    rH.addEventListener('input', () => poner(+rH.value));
    btns.forEach(b => b.addEventListener('click', () => poner(+b.dataset.min)));
    poner(+rH.value);
  }

  /* cómo funciona: el teléfono cambia con cada paso (solo en pantallas anchas) */
  const pasos = $('.pasos');
  if (pasos) {
    const ps = $$('.paso', pasos), pal = $$('.lector span', pasos); let tl;
    const leer = () => {
      clearInterval(tl); pal.forEach(w => w.classList.remove('dicho'));
      if (quieto) { pal.forEach(w => w.classList.add('dicho')); return; }
      let k = 0; tl = setInterval(() => { if (k < pal.length) pal[k++].classList.add('dicho'); else clearInterval(tl); }, 320);
    };
    const o = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      ps.forEach(x => x.classList.toggle('on', x === e.target)); pasos.dataset.paso = e.target.dataset.n;
      if (e.target.dataset.n === '3') leer();
    }), { rootMargin: '-45% 0px -45% 0px' });
    ps.forEach(x => o.observe(x));
  }

  /* deslizá para volver a elegir tu tiempo */
  const d = $('.desliza');
  if (d) {
    const per = $('.perilla', d), txt = $('.texto', d);
    let max = 0, x0 = 0, activo = false, p = 0;
    const medir = () => { max = d.clientWidth - per.offsetWidth - 8; d.style.setProperty('--max', max + 'px'); };
    const pon = v => { p = Math.max(0, Math.min(1, v)); d.style.setProperty('--p', p); };
    const fin = () => {
      d.classList.add('listo'); txt.textContent = '¡Vamos!';
      setTimeout(() => $('#inicio').scrollIntoView({ behavior: quieto ? 'auto' : 'smooth' }), 250);
      setTimeout(() => { d.classList.remove('listo'); txt.textContent = 'Deslizá para elegir tu tiempo'; pon(0); }, 1600);
    };
    medir(); addEventListener('resize', medir);
    per.addEventListener('pointerdown', e => { activo = true; x0 = e.clientX - p * max; d.classList.add('arrastra'); per.setPointerCapture(e.pointerId); });
    per.addEventListener('pointermove', e => { if (activo) pon((e.clientX - x0) / max); });
    const suelta = () => { if (!activo) return; activo = false; d.classList.remove('arrastra'); p > .85 ? (pon(1), fin()) : pon(0); };
    per.addEventListener('pointerup', suelta); per.addEventListener('pointercancel', suelta);
    per.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pon(1); fin(); } });
  }
})();
