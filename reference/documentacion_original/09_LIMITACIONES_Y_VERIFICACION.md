# Limitaciones y verificación

## Verificado

- Se inspeccionó el árbol fuente de `universal/`, configuración Expo, tokens, kit UI, pantallas, sheets, estado y repositorio.
- Se inspeccionó el árbol fuente del destino `web prueba/`, package/Vite/PWA, shell, vistas, CSS, tipos, mocks y documentación.
- Se arrancó el original con `npm --prefix universal run web -- --port 8085` sin editar archivos.
- Se observó AuthScreen en navegador a 390×844 en esquema oscuro y claro.
- Se guardaron las capturas auténticas `capturas/auth/dark/390x844.png` y `capturas/auth/light/390x844.png`.
- No se introdujeron credenciales, no se inició sesión, no se hicieron mutaciones Supabase.

## No verificado

- Resumen, POS, Inventario, Historial y overlays comerciales en ejecución; están protegidos por sesión.
- Safari físico, PWA instalada, teclado iOS, orientación, safe-area real y scroll con datos largos.
- Tema claro comercial en ejecución.
- Rendimiento de blur/Animated en Safari.
- Integridad de RLS contra dos cuentas reales.

## Incertidumbres

El original contiene `.env` y valores configurados localmente; no se copiaron ni imprimieron. `SupabasePOSRepository` documenta fallback offline y sincronización, pero no se probó red caída. `ProductList.js` y el kit mezclan valores locales con tokens; el implementador debe respetar el valor del componente concreto si difiere.

La documentación del destino prohíbe blur en barras por problemas iOS, pero el original define `Glass`; esto es una decisión de adaptación, no una contradicción que pueda resolverse sin comparación visual en el destino.

## Capturas ausentes

No se generaron imágenes sintéticas para representar pantallas comerciales. No hay capturas originales disponibles en el árbol inspeccionado y no se sorteó Auth. Por tanto, las fichas de esas pantallas se basan en código, no en comparación visual renderizada.
