# Portal de acceso Vigix (código exclusivo + subdominios)

Este portal es la **puerta de entrada** de `vigix.com.ar`. El cliente escribe el
**código exclusivo** de su empresa y lo derivamos directo a su plataforma, que
vive en su propio subdominio:

```
https://<codigo>.vigix.com.ar/
```

Ejemplo: con el código `demo-asistencia` entra a `https://demo-asistencia.vigix.com.ar/`.

## Privacidad: por qué este modelo

- **No hay lista de empresas ni archivo `empresas.json`.** El destino se calcula
  SOLO a partir del código que escribe el cliente.
- Por eso el cliente **nunca ve otras empresas** ni puede saber **cuántas hay**.
- El portal **no maneja credenciales**: el login (legajo + PIN) ocurre ya dentro
  de cada plataforma, contra su propio Firebase y su propio Worker.

> El "código exclusivo" es la etiqueta del subdominio de cada empresa. Como los
> subdominios son DNS público, el código no es un secreto fuerte; es un
> derivador cómodo, no un control de acceso. El control real está en el login
> de cada plataforma. Si algún día querés que el código sea distinto del
> subdominio y validado en el servidor, se puede resolver con el Worker.

## Archivos

```
derivador/
├─ index.html        ← el portal (una sola caja: código + botón Entrar)
├─ portal.css
├─ portal.app.js     ← calcula el destino y deriva
└─ assets/           ← logo
```

## Cómo publicarlo

Subí la carpeta `derivador/` a la raíz de tu repo de la landing (el que ya sirve
`vigix.com.ar`). Queda:

- `vigix.com.ar/` → tu landing comercial
- `vigix.com.ar/derivador/` → este portal

## Configuración (dentro de `portal.app.js`)

- `DOMINIO_BASE` — dominio donde cuelgan los subdominios (por defecto `vigix.com.ar`).
- `PATH_DESTINO` — a dónde entra el cliente dentro de su plataforma.
  - `""` (por defecto) → la raíz del subdominio (su `index.html`).
  - `"fichadas.html"` → lo manda directo a la pantalla de fichada.

## Acceso directo opcional

Podés pasar el código por la URL para entrar sin escribir nada:

```
vigix.com.ar/derivador/?c=demo-asistencia
```

## Relación con el alta de empresas

El código que escribe el cliente **es el mismo subdominio** que genera el script
`generar-empresa.py` (campo `subdominio` en `empresa.json`, escrito en el archivo
`CNAME` del clon). Así el alta queda consistente de punta a punta:
`subdominio` → `CNAME` → DNS Cloudflare → código del portal.
