/* =====================================================
   PARTÍCULAS DORADAS EN EL HERO
===================================================== */
(function initParticulas(){
  const canvas = document.getElementById("particulas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let ancho, alto, particulas = [];

  function redimensionar(){
    ancho = canvas.width = canvas.parentElement.offsetWidth;
    alto = canvas.height = canvas.parentElement.offsetHeight;
  }
  redimensionar();
  window.addEventListener("resize", redimensionar);

  const COLORES = ["rgba(182,138,78,0.55)", "rgba(217,185,124,0.5)", "rgba(110,124,100,0.4)"];
  const CANTIDAD = window.innerWidth < 700 ? 22 : 42;

  function crearParticula(){
    return {
      x: Math.random() * ancho,
      y: Math.random() * alto,
      r: 1.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.2 - Math.random() * 0.4,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      fase: Math.random() * Math.PI * 2
    };
  }
  for (let i = 0; i < CANTIDAD; i++) particulas.push(crearParticula());

  function animar(t){
    ctx.clearRect(0, 0, ancho, alto);
    particulas.forEach(p => {
      p.fase += 0.01;
      p.x += p.vx + Math.sin(p.fase) * 0.15;
      p.y += p.vy;
      if (p.y < -10){ p.y = alto + 10; p.x = Math.random() * ancho; }
      if (p.x < -10) p.x = ancho + 10;
      if (p.x > ancho + 10) p.x = -10;

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animar);
  }
  requestAnimationFrame(animar);
})();

/* =====================================================
   MESA DE REGALOS — TABS Y COPIAR CLABE
===================================================== */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    document.querySelectorAll(".regalos-panel").forEach(p => p.classList.add("oculto"));
    document.getElementById(`panel-${btn.dataset.tab}`).classList.remove("oculto");
  });
});

document.querySelectorAll(".btn-copiar").forEach(btn => {
  btn.addEventListener("click", async () => {
    const valorEl = document.getElementById(btn.dataset.copiar);
    const texto = valorEl.textContent.replace(/\s/g, "");
    try{
      await navigator.clipboard.writeText(texto);
    }catch(e){
      const temp = document.createElement("textarea");
      temp.value = texto;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
    const textoOriginal = btn.textContent;
    btn.textContent = "Copiado ✓";
    btn.classList.add("copiado");
    setTimeout(() => { btn.textContent = textoOriginal; btn.classList.remove("copiado"); }, 1800);
  });
});

/* =====================================================
   CONFIGURACIÓN
===================================================== */
// Cambia esto a la URL real cuando exista backend PHP, ej:
// const API_BASE = "/backend-php/api";
const API_BASE = null; // null = usar datos de ejemplo (familias.js)

const FECHA_BODA = new Date("2026-11-14T17:00:00");
const MAX_INVITADOS_FAMILIA = 5;
const STORAGE_KEY = "boda_rsvp_confirmacion_v1";

/* =====================================================
   SOBRE DE BIENVENIDA
===================================================== */
const sobreOverlay = document.getElementById("sobre");
document.getElementById("abrir-sobre").addEventListener("click", () => {
  sobreOverlay.classList.add("cerrado");
  document.body.style.overflow = "auto";
});
document.body.style.overflow = "hidden";
setTimeout(() => { document.body.style.overflow = sobreOverlay.classList.contains("cerrado") ? "auto" : "hidden"; }, 50);

/* =====================================================
   NAV AL HACER SCROLL
===================================================== */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("activo", window.scrollY > 60);
});

/* =====================================================
   REVEAL ON SCROLL
===================================================== */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.2 });

document.querySelectorAll(".divisor").forEach(el => observador.observe(el));
document.querySelectorAll(".seccion-titulo, .detalle-card, .lt-item, .galeria-item, .historia-texto, .regalo-card, .deposito-card").forEach(el => {
  el.classList.add("reveal");
  observador.observe(el);
});

/* =====================================================
   CONTADOR REGRESIVO
===================================================== */
function actualizarContador(){
  const ahora = new Date();
  let diff = FECHA_BODA - ahora;
  if (diff < 0) diff = 0;
  const dias = Math.floor(diff / (1000*60*60*24));
  const horas = Math.floor((diff / (1000*60*60)) % 24);
  const min = Math.floor((diff / (1000*60)) % 60);
  const seg = Math.floor((diff / 1000) % 60);
  document.getElementById("cd-dias").textContent = String(dias).padStart(2,"0");
  document.getElementById("cd-horas").textContent = String(horas).padStart(2,"0");
  document.getElementById("cd-min").textContent = String(min).padStart(2,"0");
  document.getElementById("cd-seg").textContent = String(seg).padStart(2,"0");
}
actualizarContador();
setInterval(actualizarContador, 1000);

/* =====================================================
   RSVP — ESTADO Y ELEMENTOS
===================================================== */
const pasoCodigo = document.getElementById("paso-codigo");
const pasoFormulario = document.getElementById("paso-formulario");
const pasoListo = document.getElementById("paso-listo");

const inputCodigo = document.getElementById("input-codigo");
const btnValidar = document.getElementById("btn-validar");
const codigoError = document.getElementById("codigo-error");

const familiaNombreEl = document.getElementById("familia-nombre");
const familiaCupoNum = document.getElementById("familia-cupo-num");
const listaInvitados = document.getElementById("lista-invitados");
const btnEnviar = document.getElementById("btn-enviar");
const formError = document.getElementById("form-error");
const resumenConfirmacion = document.getElementById("resumen-confirmacion");

let familiaActual = null; // { id, nombre_familia, invitados: [...] }
let respuestas = {};       // { "Nombre": true|false }

function mostrarPaso(paso){
  [pasoCodigo, pasoFormulario, pasoListo].forEach(p => p.classList.add("oculto"));
  paso.classList.remove("oculto");
}

/* ---------- Revisar si este dispositivo ya confirmó ---------- */
function revisarConfirmacionPrevia(){
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (!guardado) return false;
  try{
    const datos = JSON.parse(guardado);
    pintarResumen(datos.nombre_familia, datos.respuestas);
    mostrarPaso(pasoListo);
    return true;
  }catch(e){ return false; }
}

function pintarResumen(nombreFamilia, respuestasGuardadas){
  const confirmados = Object.entries(respuestasGuardadas).filter(([,v]) => v).map(([k]) => k);
  const noAsisten = Object.entries(respuestasGuardadas).filter(([,v]) => !v).map(([k]) => k);
  let texto = `<strong>${nombreFamilia}</strong><br>`;
  if (confirmados.length) texto += `Asisten: ${confirmados.join(", ")}.<br>`;
  if (noAsisten.length) texto += `No asisten: ${noAsisten.join(", ")}.`;
  resumenConfirmacion.innerHTML = texto;
}

/* ---------- Buscar familia (backend o demo) ---------- */
async function buscarFamilia(codigo){
  if (API_BASE){
    try{
      const res = await fetch(`${API_BASE}/validar_familia.php?codigo=${encodeURIComponent(codigo)}`);
      const data = await res.json();
      if (!data.ok) return null;
      return data.familia;
    }catch(e){
      console.error("Error consultando backend, usando demo:", e);
    }
  }
  const familia = FAMILIAS_DEMO[codigo.trim().toUpperCase()];
  return familia || null;
}

btnValidar.addEventListener("click", async () => {
  codigoError.textContent = "";
  const codigo = inputCodigo.value.trim();
  if (!codigo){
    codigoError.textContent = "Ingresa tu código de invitación.";
    return;
  }
  btnValidar.disabled = true;
  btnValidar.textContent = "Buscando...";

  const familia = await buscarFamilia(codigo);

  btnValidar.disabled = false;
  btnValidar.textContent = "Buscar mi invitación";

  if (!familia){
    codigoError.textContent = "No encontramos ese código. Revisa tu invitación física o digital.";
    return;
  }
  if (familia.invitados.length > MAX_INVITADOS_FAMILIA){
    familia.invitados = familia.invitados.slice(0, MAX_INVITADOS_FAMILIA);
  }
  familiaActual = familia;
  renderFormulario(familia);
  mostrarPaso(pasoFormulario);
});

/* ---------- Render del formulario por invitado ---------- */
function renderFormulario(familia){
  familiaNombreEl.textContent = familia.nombre_familia;
  familiaCupoNum.textContent = familia.invitados.length;
  listaInvitados.innerHTML = "";
  respuestas = {};

  familia.invitados.forEach(nombre => {
    respuestas[nombre] = true; // por defecto: asiste

    const row = document.createElement("div");
    row.className = "invitado-row";
    row.innerHTML = `
      <span class="invitado-nombre">${nombre}</span>
      <div class="invitado-toggle">
        <button type="button" data-nombre="${nombre}" data-valor="si" class="activo-si">Asiste</button>
        <button type="button" data-nombre="${nombre}" data-valor="no">No asiste</button>
      </div>
    `;
    listaInvitados.appendChild(row);
  });

  listaInvitados.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const nombre = btn.dataset.nombre;
      const valor = btn.dataset.valor === "si";
      respuestas[nombre] = valor;

      const hermanos = btn.parentElement.querySelectorAll("button");
      hermanos.forEach(b => { b.classList.remove("activo-si","activo-no"); });
      btn.classList.add(valor ? "activo-si" : "activo-no");
    });
  });
}

/* ---------- Enviar confirmación ---------- */
btnEnviar.addEventListener("click", async () => {
  formError.textContent = "";
  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";

  const payload = {
    codigo: familiaActual.id,
    nombre_familia: familiaActual.nombre_familia,
    respuestas
  };

  let resultadoOk = true;

  if (API_BASE){
    try{
      const res = await fetch(`${API_BASE}/confirmar.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.ok){
        formError.textContent = data.mensaje || "Esta invitación ya fue confirmada anteriormente.";
        resultadoOk = false;
      }
    }catch(e){
      console.error("Error enviando al backend:", e);
      // En demo seguimos guardando localmente aunque falle el backend
    }
  }

  btnEnviar.disabled = false;
  btnEnviar.textContent = "Confirmar asistencia";

  if (!resultadoOk) return;

  // Bloqueo por dispositivo/navegador
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    codigo: familiaActual.id,
    nombre_familia: familiaActual.nombre_familia,
    respuestas,
    fecha: new Date().toISOString()
  }));

  pintarResumen(familiaActual.nombre_familia, respuestas);
  mostrarPaso(pasoListo);
});

/* ---------- Inicio ---------- */
if (!revisarConfirmacionPrevia()){
  mostrarPaso(pasoCodigo);
}
