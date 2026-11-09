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

  // calculadora de lectura: el mismo criterio que la app (app/lib/plan.dart)
  // palabras por minuto según dificultad; Lite = mitad de palabras; Story = un décimo
  var WPM={1:220,2:200,3:170},PROP={story:.1,lite:.5,original:1};
  // palabras_totales, categoria y dificultad de app/assets/catalogo/datos/catalogo.json
  var libros=[
    {t:'Don Quijote de la Mancha',a:'Miguel de Cervantes',p:373351,c:'novela',d:3},
    {t:'La isla del tesoro',a:'Robert Louis Stevenson',p:87973,c:'novela',d:2},
    {t:'La vuelta al mundo en ochenta días',a:'Julio Verne',p:65209,c:'novela',d:1},
    {t:'Orgullo y prejuicio',a:'Jane Austen',p:117315,c:'novela',d:2},
    {t:'Los miserables',a:'Victor Hugo',p:260125,c:'novela',d:3},
    {t:'El sabueso de los Baskerville',a:'Arthur Conan Doyle',p:62276,c:'novela',d:2},
    {t:'Cándido, o El optimismo',a:'Voltaire',p:31806,c:'novela',d:2},
    {t:'Lazarillo de Tormes',a:'Anónimo',p:19607,c:'novela_corta',d:2},
    {t:'Hamlet',a:'William Shakespeare',p:34349,c:'teatro',d:3},
    {t:'Macbeth',a:'William Shakespeare',p:14019,c:'teatro',d:2},
    {t:'Romeo y Julieta',a:'William Shakespeare',p:20829,c:'teatro',d:2},
    {t:'Odisea',a:'Homero',p:119707,c:'poesia',d:3},
    {t:'La Divina Comedia',a:'Dante Alighieri',p:112059,c:'poesia',d:3}];
  var sinLite={teatro:1,poesia:1,cuento:1};
  var niveles=[
    {k:'story',n:'Story',g:6,d:'La historia completa, con final, contada por nosotros en pocas páginas. Para saber de qué va, o cuando el día no da para más.'},
    {k:'lite',n:'Lite',g:20,d:'Escenas enteras del autor, en orden. Donde salteamos un tramo, un conector nuestro te ubica.'},
    {k:'original',n:'Original',g:40,d:'El libro completo, tal como lo escribió el autor. Para cuando tenés tiempo y ganas de todo.'}];
  var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS=[{d:1,c:'L',n:'lunes'},{d:2,c:'M',n:'martes'},{d:3,c:'M',n:'miércoles'},{d:4,c:'J',n:'jueves'},{d:5,c:'V',n:'viernes'},{d:6,c:'S',n:'sábado'},{d:0,c:'D',n:'domingo'}];
  var MINUTOS=[10,15,20,30,45,60];
  var r=document.getElementById('grosor'),tomo=document.getElementById('tomo'),ficha=document.getElementById('ficha'),etq=document.getElementById('etq'),
      sel=document.getElementById('cLibro'),cMin=document.getElementById('cMin'),cDias=document.getElementById('cDias'),
      $=function(id){return document.getElementById(id)};
  var libro=libros[0],minDia=30,dias={1:1,2:1,3:1,4:1,5:1},nivel='original';
  libros.forEach(function(l,i){var o=document.createElement('option');o.value=i;o.textContent=l.t+' · '+l.a;sel.appendChild(o)});
  MINUTOS.forEach(function(m){var b=document.createElement('button');b.type='button';b.textContent=m;b.setAttribute('aria-label',m+' minutos por día');b.setAttribute('aria-pressed',m===minDia);
    b.addEventListener('click',function(){minDia=m;[].forEach.call(cMin.children,function(x){x.setAttribute('aria-pressed',+x.textContent===m)});aplica()});cMin.appendChild(b)});
  DIAS.forEach(function(d){var b=document.createElement('button');b.type='button';b.textContent=d.c;b.setAttribute('aria-label',d.n);b.setAttribute('aria-pressed',!!dias[d.d]);
    b.addEventListener('click',function(){if(dias[d.d]){if(Object.keys(dias).length===1)return;delete dias[d.d]}else dias[d.d]=1;b.setAttribute('aria-pressed',!!dias[d.d]);aplica()});cDias.appendChild(b)});
  sel.addEventListener('change',function(){libro=libros[+sel.value];ajustaRango();aplica()});
  // teatro, poesía y cuentos no tienen Lite: el deslizador va de Story a Original
  function ajustaRango(){var dos=!!sinLite[libro.c];var era=r.max;r.max=dos?1:2;
    if(dos){if(era!=='1')r.value=(+r.value>=1)?1:0;etq.innerHTML='<span>Story</span><span>Original</span>'}
    else{if(era==='1')r.value=(+r.value===1)?2:0;etq.innerHTML='<span>Story</span><span>Lite</span><span>Original</span>'}
    etq.classList.toggle('dos',dos)}
  function nivelActual(){var dos=r.max==='1';return dos?(+r.value?'original':'story'):niveles[+r.value].k}
  function duracion(min){if(min<60)return Math.min(59,Math.max(1,Math.round(min)))+' min';var h=Math.floor(min/60),m=Math.round(min%60);if(m===60)return (h+1)+' h';if(m===0)return h+' h';return h+' h '+(m<10?'0':'')+m}
  function plazo(min,dLect,semanas){
    if(dLect<=1)return 'de una sentada';
    if(dLect<=13)return dLect===7?'una semana':'unos '+dLect+' días de lectura';
    if(semanas<=12){var s=Math.round(semanas);return s===1?'una semana':'unas '+s+' semanas'}
    var meses=semanas/4.345,ent=Math.floor(meses),resto=meses-ent,medio=resto>=.35&&resto<=.75,n=medio?ent:Math.round(meses),suf=medio?' y medio':'';
    return n===1?'un mes'+suf:'unos '+n+' meses'+suf}
  function textoDias(){var ds=DIAS.filter(function(d){return dias[d.d]});
    if(ds.length===7)return 'todos los días';
    var idx=ds.map(function(d){return DIAS.indexOf(d)}),seguidos=idx.every(function(v,i){return i===0||v===idx[i-1]+1});
    if(ds.length===2&&ds[0].d===6&&ds[1].d===0)return 'los fines de semana';
    if(ds.length===1)return 'los '+ds[0].n+(ds[0].n.slice(-1)==='s'?'':'s');
    if(seguidos&&ds.length>=3)return 'de '+ds[0].n+' a '+ds[ds.length-1].n;
    var ns=ds.map(function(d){return d.n+(d.n.slice(-1)==='s'?'':'s')});return 'los '+ns.slice(0,-1).join(', ')+' y '+ns[ns.length-1]}
  function fechaFin(dLect){var f=new Date();f.setHours(0,0,0,0);var n=0;for(var i=0;i<4000;i++){if(dias[f.getDay()]){n++;if(n>=dLect)break}f.setDate(f.getDate()+1)}return f}
  function textoFecha(f){var hoy=new Date(),t=f.getDate()+' de '+MESES[f.getMonth()];if(f.getFullYear()!==hoy.getFullYear())t+=' de '+f.getFullYear();return t}
  function aplica(){
    nivel=nivelActual();var nv=niveles.filter(function(x){return x.k===nivel})[0];
    tomo.style.setProperty('--g',nv.g);ficha.dataset.v=nv.k;$('tTitulo').textContent=libro.t;$('tAutor').textContent=libro.a;
    $('fNombre').firstChild.textContent=nv.n;$('fDesc').textContent=nv.d;
    r.style.setProperty('--pct',(r.value/r.max*100)+'%');r.setAttribute('aria-valuetext',nv.n);
    [].forEach.call(etq.children,function(s,i){s.classList.toggle('on',i===+r.value)});
    // la cuenta
    var palabras=Math.round(libro.p*PROP[nivel]),min=palabras/WPM[libro.d],nDias=Object.keys(dias).length,
        dLect=Math.max(1,Math.ceil(min/minDia)),semanas=min/(minDia*nDias),sem=Math.max(1,Math.round(semanas)),fin=fechaFin(dLect);
    $('fTiempo').textContent=duracion(min);$('fTotal').textContent=duracion(min);
    $('fDias').textContent=dLect;$('fDiasEt').textContent=dLect===1?'día de lectura':'días de lectura';
    $('fSemanas').textContent=sem;$('fSemanasEt').textContent=sem===1?'semana':'semanas';
    var p=$('fPlazo');p.textContent='';
    p.appendChild(document.createTextNode('Con '+minDia+' minutos '+textoDias()+(dLect<=1?', lo leés de una sentada: ':', terminás en '+plazo(min,dLect,semanas)+': ')));
    var b=document.createElement('b');b.textContent='el '+textoFecha(fin);p.appendChild(b);p.appendChild(document.createTextNode('.'));
  }
  r.addEventListener('input',aplica);ajustaRango();aplica();
})();

// lista de espera
(function(){
  var f=document.getElementById('formAviso');if(!f||!window.fetch)return;
  var est=document.getElementById('estadoAviso'),b=document.getElementById('enviar'),inp=document.getElementById('correo');
  function msg(t,err){est.className='estado'+(err?' error':'');est.textContent=t}
  function falla(){est.className='estado error';est.innerHTML='No pudimos guardarlo: escribinos a <a href="mailto:contacto@classicshook.com">contacto@classicshook.com</a>.'}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var c=inp.value.trim();
    if(!c||!inp.checkValidity()){msg('Revisá el correo, parece incompleto.',true);return}
    b.disabled=true;msg('Enviando…');
    fetch('/api/avisame',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({correo:c,sitio:document.getElementById('sitio').value})})
      .then(function(r){return r.json().then(function(j){return {s:r.status,j:j}})})
      .then(function(x){
        if(x.j&&x.j.ok){msg('Listo, te avisamos cuando salga.');f.reset();inp.disabled=true}
        else if(x.s===400){b.disabled=false;msg('Revisá el correo, parece incompleto.',true)}
        else{b.disabled=false;falla()}
      }).catch(function(){b.disabled=false;falla()});
  });
})();
