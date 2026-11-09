(function(){
  // tira de reels: dar vuelta al tocar (sin confundir con el arrastre)
  var tira=document.getElementById('tira'),cartas=[].slice.call(tira.querySelectorAll('.carta')),x0=0;
  function play(v){var p=v.play();if(p&&p.catch)p.catch(function(){});}
  cartas.forEach(function(c){
    c.addEventListener('pointerdown',function(e){x0=e.clientX});
    c.addEventListener('click',function(e){if(Math.abs(e.clientX-x0)<8){c.classList.toggle('vuelta');var v=c.querySelector('video');if(c.classList.contains('vuelta'))v.pause();else play(v);}});
  });
  // reproducir solo las visibles y no dadas vuelta
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target.querySelector('video');if(e.isIntersecting&&!e.target.classList.contains('vuelta'))play(v);else v.pause()})},{root:null,threshold:.4});
  cartas.forEach(function(c){io.observe(c)});
  // si la contratapa no entra en la carta, se desvanece al final
  function mide(){document.querySelectorAll('.cara.dorso .txt').forEach(function(p){p.classList.toggle('corta',p.scrollHeight>p.clientHeight+2)})}
  mide();window.addEventListener('resize',mide);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(mide);
  // empezar centrado en la tercera carta en celular
  if(window.innerWidth<900){var c3=cartas[2];tira.scrollLeft=c3.offsetLeft-(tira.clientWidth-c3.offsetWidth)/2}
  tira.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();tira.scrollBy({left:(e.key==='ArrowRight'?1:-1)*(cartas[0].offsetWidth+14),behavior:'smooth'})}});

  // grosor del libro
  var datos=[
    {k:'story',n:'Story',t:'Unos minutos',g:6,d:'La historia completa, con final, contada por nosotros en unos minutos. Para saber de qué va, o cuando el día no da para más.'},
    {k:'lite',n:'Lite',t:'Cerca de la mitad',g:20,d:'Escenas enteras del autor, en orden. Donde salteamos un tramo, un conector nuestro te ubica y se distingue a simple vista.'},
    {k:'original',n:'Original',t:'Todo el libro',g:40,d:'El libro completo, tal como lo escribió el autor. Para cuando tenés tiempo y ganas de todo.'}];
  var r=document.getElementById('grosor'),tomo=document.getElementById('tomo'),ficha=document.getElementById('ficha'),etq=document.querySelectorAll('#etq span');
  function aplica(){var d=datos[+r.value];tomo.style.setProperty('--g',d.g);ficha.dataset.v=d.k;
    document.getElementById('fNombre').firstChild.textContent=d.n;document.getElementById('fTiempo').textContent=d.t;document.getElementById('fDesc').textContent=d.d;
    r.style.setProperty('--pct',(r.value*50)+'%');r.setAttribute('aria-valuetext',d.n);etq.forEach(function(s,i){s.classList.toggle('on',i===+r.value)});}
  r.addEventListener('input',aplica);aplica();
})();
