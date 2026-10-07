# Portal de acceso Vigix (código exclusivo + subdominios)

El cliente escribe su **código exclusivo** (ej. `27822022`) y lo derivamos directo a su plataforma, que vive en su propio subdominio:

```
https://vga-security-24.vigix.com.ar/fichadas.html
```

## Privacidad: por qué este modelo

- **No hay lista visible.** El archivo `empresas.json` se consulta internamente pero el cliente **nunca ve otras empresas** ni puede saber **cuántas hay**.
- Solo ve una caja de texto: escribe su código y entra.
- El portal **no maneja credenciales**: el login (legajo + PIN) ocurre dentro de cada plataforma.

## Archivos

```
derivador/
├─ index.html        ← el portal (caja de código + botón Entrar)
├─ portal.css
├─ portal.app.js     ← busca el código en empresas.json y deriva
├─ empresas.json     ← mapa de códigos → URLs (NO visible para el cliente)
├─ README-PORTAL.md
└─ assets/           ← logo
```

## empresas.json: cómo se carga cada empresa

```json
{
  "version": 1,
  "empresas": [
    {
      "codigo": "27822022",
      "nombre": "VGA Security 24",
      "url": "https://vga-security-24.vigix.com.ar/fichadas.html",
      "activa": true
    }
  ]
}
```

- `codigo`: lo que escribe el cliente en el portal (puede ser numérico, alfanumérico, lo que quieras darle).
- `nombre`: nombre de la empresa (solo se usa para el botón de "último acceso").
- `url`: adónde va el cliente. **Siempre a `fichadas.html`** (no al index de la landing).
- `activa`: poné `false` para ocultar una empresa sin borrarla.

## Dar de alta una empresa nueva

1. Corré `generar-empresa.py` con su `empresa.json` → genera el clon con el `CNAME` del subdominio.
2. Subí el clon a su repo → activá GitHub Pages.
3. Creá el CNAME en Cloudflare (`Tipo CNAME | Nombre <subdominio> | Destino <usuario>.github.io | Proxy DNS only`).
4. Agregá la entrada en `empresas.json` del derivador:
   ```json
   {
     "codigo": "EL-CODIGO-QUE-LE-DAS",
     "nombre": "Nombre de la empresa",
     "url": "https://<subdominio>.vigix.com.ar/fichadas.html",
     "activa": true
   }
   ```
5. Comitá y pusheá. El cliente ya puede usar su código.

## Acceso directo por URL

```
vigix.com.ar/derivador/?c=27822022
```
Entra directo sin escribir nada (útil para guardar como marcador).

## Cómo publicarlo

Subí la carpeta `derivador/` a la raíz de tu repo de la landing. Queda:

- `vigix.com.ar/` → tu landing comercial
- `vigix.com.ar/derivador/` → este portal
