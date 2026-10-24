# Arquitectura visual del origen

## Flujo activo comprobado

`index.js` monta `App.js`. `Root` consulta la sesión de Supabase, escucha cambios de
autenticación, resuelve la tienda y decide entre splash, `AuthScreen`, recuperación de
contraseña o `POSApp`. La shell comercial no se monta hasta confirmar sesión.

`POSApp` hidrata `usePOSStore` mediante `SupabasePOSRepository`, aplica `ThemeProvider` y
monta `Shell`. La shell usa `width >= 768` para elegir navegación móvil (`TabBar`) o de
escritorio (`DesktopSidebar`).

## Jerarquía visual

- Móvil: columna centrada de máximo 600 px, contenido con scroll interno, barra inferior y
  FAB/carrito cuando corresponde.
- Escritorio: sidebar fijo de 250 px, contenido flexible y checkout persistente en POS.
- Secciones: `Resumen`, `Vender`, `Inventario` e `Historial`.
- Capas secundarias: sheets de checkout, producto, creación, proveedores, rendimiento y cierre.

## Código relevante

La relación completa está en [MAPA_CODIGO_ORIGINAL.md](./MAPA_CODIGO_ORIGINAL.md). Las copias
consultables están en [mapa_codigo_original/fuentes/](./mapa_codigo_original/fuentes/).
`universal/` es la referencia activa; las implementaciones raíz antiguas no se mezclaron.

## Decisiones que deben conservarse

La apariencia se basa en superficies y tokens tipo iOS, no en fotografías de productos.
La autenticación y el aislamiento por tienda forman parte de la arquitectura original, aunque
el MVP PWA previsto pueda simplificar la persistencia. Esa diferencia se documenta en
[ALCANCE_MVP_PWA.md](./ALCANCE_MVP_PWA.md).
