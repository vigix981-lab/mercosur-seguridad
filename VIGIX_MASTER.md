# Vigix master

`vigix981-lab/vigix-master` es la plantilla maestra y fuente oficial del producto Vigix.

## Alcance

Este repositorio centraliza:

- frontend público y operativo;
- código fuente del Cloudflare Worker;
- reglas de Firebase;
- configuración de referencia;
- assets de marca;
- SEO;
- documentación técnica necesaria para generar instancias independientes de clientes.

## Arquitectura V1

Cada empresa cliente utiliza una instancia independiente. Vigix master funciona como base desde la cual se generan y mantienen esas instancias.

## Identificadores técnicos heredados

Los identificadores desplegados de Firebase, Auth, Realtime Database, Storage, Worker y convenciones internas no se renombran únicamente por motivos de marca. Se conservan cuando forman parte de dependencias reales.

Cualquier migración de esos identificadores requiere verificar dependencias, variables de entorno, CSP, autenticación, reglas y funcionamiento antes de aplicarse.

## Flujo de trabajo

- `main`: versión destinada a producción.
- `christian-frontend-seo`: trabajo de frontend, contenido y SEO antes de integrar.
- Backend, Firebase, Worker, seguridad y reglas deben coordinarse antes de cualquier cambio que pueda afectar producción.

## Control 3

Antes de integrar cambios a `main`, verificar:

1. código y diferencias de rama;
2. publicación;
3. producción;
4. funcionamiento real;
5. ausencia de regresiones en frontend, Worker y Firebase.
