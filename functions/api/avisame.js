// Lista de espera: guarda solo correo, fecha e idioma en D1 (binding DB).
const JSON_H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const resp = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_H });

export async function onRequestPost({ request, env }) {
  let datos;
  try {
    const t = await request.text();
    if (t.length > 2000) return resp({ ok: false }, 400);
    datos = JSON.parse(t);
  } catch (e) {
    return resp({ ok: false }, 400);
  }
  if (!datos || typeof datos !== 'object') return resp({ ok: false }, 400);
  // campo trampa: si viene con algo, parece ok pero no se guarda
  if (datos.sitio) return resp({ ok: true });
  const correo = typeof datos.correo === 'string' ? datos.correo.trim().toLowerCase() : '';
  if (!correo || correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
    return resp({ ok: false }, 400);
  }
  const idioma = (request.headers.get('accept-language') || '').slice(0, 2).toLowerCase() || null;
  try {
    await env.DB.prepare('INSERT OR IGNORE INTO avisos (correo, fecha, idioma) VALUES (?, ?, ?)')
      .bind(correo, new Date().toISOString(), idioma).run();
  } catch (e) {
    return resp({ ok: false }, 500);
  }
  return resp({ ok: true });
}

export async function onRequest() {
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
}
