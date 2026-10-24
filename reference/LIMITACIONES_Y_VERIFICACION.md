# Limitaciones y verificación

## Verificado

- Se inspeccionó `universal/` y se copiaron las fuentes activas relevantes.
- Se confirmaron tokens, navegación, pantallas, componentes, sheets y breakpoints en código.
- Existen dos capturas auténticas de Auth: oscuro y claro, 390×844.
- Se conservaron documentación de `QUIRAL_TRANSFERENCIA_VISUAL` y `QUIRAL_AUDITORIA`.
- No se copiaron credenciales ni `.env`.

## No verificado

- POS, Inventario, Historial, Resumen y overlays comerciales en ejecución con datos.
- Tema claro comercial, Safari físico, PWA instalada, teclado iOS y safe-area real.
- Rendimiento del blur/Animated y aislamiento RLS con dos cuentas reales.
- Integridad del fallback offline con red caída.

No se generaron capturas sintéticas ni se sortearon guardas de autenticación. Las descripciones
comerciales se basan en código y están marcadas como tales.

## Diferencias y revisión manual

El MVP previsto usa persistencia local y no requiere login/Supabase. Eso simplifica seguridad y
datos, pero no debe presentarse como equivalente al origen: revisar explícitamente la limpieza de
sesión, aislamiento de datos y validaciones antes de incorporar autenticación futura.
