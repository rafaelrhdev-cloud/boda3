# Invitación de Boda — Camila & Mateo (Plantilla de venta)

Invitación digital con RSVP, pensada como producto para vender a clientes
que organizan su boda. La parte visual (lo que ve el invitado) es 100%
estática y funciona sola; el backend PHP + MySQL es opcional y se conecta
cuando el cliente quiera guardar las confirmaciones en una base de datos real.

## Estructura del proyecto

```
boda-invitacion/
├── index.html              → página principal (la que ve el invitado)
├── css/
│   └── style.css
├── js/
│   ├── familias.js         → datos de EJEMPLO (modo demo, sin servidor)
│   └── main.js             → toda la lógica (sobre, contador, RSVP, partículas, regalos)
├── assets/                 → aquí van las fotos reales (pareja, galería)
│
├── backend-php/            → backend real para producción (opcional)
│   ├── config.php          → credenciales de conexión a MySQL
│   ├── api/
│   │   ├── validar_familia.php   → GET: busca un código de invitación
│   │   └── confirmar.php         → POST: guarda la confirmación
│   └── admin/               → PANEL OCULTO para el cliente
│       ├── login.php
│       ├── panel.php
│       ├── logout.php
│       └── generar_hash.php
│
├── database/
│   └── schema.sql           → estructura de tablas + datos de ejemplo
│
└── README.md
```

La idea de poner `index.html`, `css/`, `js/` y `assets/` en la raíz es que
puedas subir el repositorio directo a GitHub (o a GitHub Pages, Netlify,
Vercel, o la raíz de un hosting normal) y que la página funcione sin tener
que entrar a ninguna subcarpeta.

## 1. Subir a GitHub / GitHub Pages

1. Crea el repositorio y sube **todo el contenido tal cual está**, sin
   mover nada de carpeta.
2. Si usas GitHub Pages: Settings → Pages → Branch: `main` → Folder: `/ (root)`.
3. Tu invitación quedará viva en `https://tu-usuario.github.io/tu-repo/`.

GitHub Pages **no ejecuta PHP**, así que en ese caso la página funcionará
en modo demo (con `js/familias.js`). Si necesitas guardar confirmaciones
reales en MySQL, sube el proyecto a un hosting que sí soporte PHP (ver
punto 3).

## 2. Modo demo (para enseñar/vender la plantilla)

Abre `index.html` directamente en el navegador, o súbelo a cualquier
hosting estático. No necesita servidor ni base de datos: usa los códigos
definidos en `js/familias.js`.

**Códigos de prueba:**

| Código     | Familia              | Lugares |
|------------|-----------------------|---------|
| RIOS2026   | Familia Ríos          | 4       |
| TORRES5    | Familia Torres        | 5       |
| LUNA1      | Invitado especial     | 1       |
| GOMEZ3     | Familia Gómez         | 3       |

El bloqueo "una confirmación por dispositivo" funciona en este modo
mediante `localStorage`: una vez que alguien confirma en su navegador,
ese mismo navegador ya no puede volver a abrir el formulario de código,
solo verá su resumen. Para "resetear" en pruebas, borra el almacenamiento
local del sitio o ejecuta en la consola del navegador:

```js
localStorage.removeItem("boda_rsvp_confirmacion_v1")
```

## 3. Modo real con MySQL (lo que entregas al cliente final)

Este modo necesita un hosting con PHP + MySQL (cPanel, Hostinger, etc.),
no funciona en GitHub Pages.

### Paso 1 — Crear la base de datos
Importa el archivo SQL:

```bash
mysql -u tu_usuario -p < database/schema.sql
```

Esto crea la base `boda_rsvp`, las tablas `familias`, `invitados`,
`administradores`, y ya incluye los mismos 4 códigos de ejemplo de la
tabla anterior para que puedas probar de inmediato.

### Paso 2 — Configurar conexión
Edita `backend-php/config.php` con los datos reales del hosting:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'boda_rsvp');
define('DB_USER', 'usuario_real');
define('DB_PASS', 'password_real');
```

### Paso 3 — Subir todo al hosting
Sube **todo el contenido de la carpeta** (`index.html`, `css/`, `js/`,
`assets/`, `backend-php/`, `database/`) a la raíz pública del hosting
(por ejemplo `public_html/`).

### Paso 4 — Conectar el frontend al backend real
En `js/main.js`, cambia esta línea:

```js
const API_BASE = null;
```

por la ruta real de tu carpeta `api`, por ejemplo:

```js
const API_BASE = "/backend-php/api";
```

A partir de ese momento, cada confirmación se valida y se guarda
directamente en MySQL, y el bloqueo de "una sola confirmación por
familia" queda garantizado también a nivel base de datos (columna
`confirmado`), no solo en el navegador del invitado.

### Paso 5 — Crear cada boda/cliente nuevo
Para cada cliente nuevo que te compre la página, agrega sus familias e
invitados directamente en la base de datos:

```sql
INSERT INTO familias (codigo, nombre_familia, cupo_maximo)
VALUES ('PEREZ4', 'Familia Pérez', 4);

INSERT INTO invitados (familia_id, nombre) VALUES
(LAST_INSERT_ID(), 'Juan Pérez'),
(LAST_INSERT_ID(), 'Ana Pérez');
```

(En la práctica, para no repetir `LAST_INSERT_ID()` manualmente, inserta
primero la familia, anota su `id`, y luego inserta los invitados con ese
`id` real.)

## 4. Panel oculto del cliente (ver invitados confirmados)

**Ubicación:** `backend-php/admin/login.php`

Ejemplo de URL final: `https://tudominio.com/backend-php/admin/login.php`

No está enlazado desde ninguna parte de la página pública — solo
accesible si conoces la ruta, que es justo lo que le compartes a tu
cliente de forma privada (o renómbrala a algo único como
`admin-boda-perez-2026` para mayor discreción).

**Para crear el primer usuario administrador:**

1. Abre una vez `backend-php/admin/generar_hash.php` en el navegador
   (edita antes la contraseña deseada dentro del archivo).
2. Copia el hash que te imprime.
3. Insértalo en la base de datos:

```sql
INSERT INTO administradores (usuario, password_hash)
VALUES ('admin', 'PEGA_AQUI_EL_HASH');
```

4. Borra o protege `generar_hash.php` después de usarlo.
5. Entra con ese usuario y contraseña en `admin/login.php`.

El panel muestra: total de invitados, cuántos confirmaron, cuántos no
asistirán, y el detalle por familia con fecha de confirmación.

## 5. Personalización para cada venta

Lo que normalmente cambia por cliente:
- Nombres de los novios, fecha, lugares (`index.html`)
- Foto de los novios: reemplaza el `<div id="foto-novios">` en el hero por
  `<img src="assets/pareja.jpg" alt="...">` (la guía está comentada en el
  propio HTML) y coloca la imagen en `assets/`.
- Mesa de regalos: edita la sección `#regalos` — tiene una pestaña con
  tarjetas de tiendas/listas de regalo y otra con los datos bancarios
  para depósito/transferencia (con botón "Copiar" para la CLABE).
- Paleta de colores (variables CSS al inicio de `style.css`, sección `:root`)
- Tipografías (Google Fonts en el `<head>` de `index.html`)
- Fotos reales en la sección de galería (reemplazar los `background` de
  `.galeria-item` en CSS por `background-image: url(...)`)
- Códigos y nombres de familias (base de datos o `js/familias.js` en demo)
- Usuario/contraseña del panel privado
- Las partículas doradas del hero son 100% CSS/canvas (`hero-particulas`
  en `js/main.js`); puedes ajustar cantidad y color ahí mismo.

## 6. Notas de seguridad para producción

- Cambia la contraseña de `generar_hash.php` y bórralo después de usarlo.
- Sirve el sitio por HTTPS.
- Considera renombrar la carpeta `admin/` a una ruta menos predecible.
- El bloqueo por dispositivo combina `localStorage` (frontend) + columna
  `confirmado` en MySQL (backend), que es la protección real contra
  doble confirmación, ya que `localStorage` solo ayuda a la experiencia
  del mismo usuario, no a evitar que otra persona use el mismo código
  desde otro dispositivo.
