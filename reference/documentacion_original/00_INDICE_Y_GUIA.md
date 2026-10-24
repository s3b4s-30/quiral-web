# Transferencia visual Quiral

## Cómo usar este paquete

La fuente de verdad visual y funcional es `C:\Users\Sebas\Desktop\elytras-quiral\universal\`. El destino es `C:\Users\Sebas\Desktop\elytras\web prueba\`. Los documentos se redactaron a partir del código real, no solo de README. Lee en este orden:

1. `01_ARQUITECTURA_VISUAL_ORIGEN.md`: mapa activo y jerarquía.
2. `02_DESIGN_SYSTEM_EXACTO.md`: tokens y medidas confirmadas.
3. `03_ESPECIFICACION_PANTALLAS.md`: fichas de pantallas.
4. `04_COMPONENTES_Y_OVERLAYS.md`: piezas reutilizables y sheets.
5. `05_RESPONSIVE_IOS_Y_ESCRITORIO.md`: reglas de viewport.
6. `06_INTERACCIONES_VISIBLES.md`: estados que cambian la UI.
7. `07_MAPA_ORIGEN_DESTINO.md`: correspondencia con el destino.
8. `08_PLAN_PRIORIZADO_DE_RECONSTRUCCION.md`: orden de ejecución.
9. `09_LIMITACIONES_Y_VERIFICACION.md`: evidencia y pendientes.
10. `10_PROMPT_MAESTRO_PARA_NUEVA_IA.md`: prompt autónomo para implementar.

Las capturas auténticas disponibles están en `capturas/auth/dark/390x844.png` y `capturas/auth/light/390x844.png`. Solo muestran autenticación sin sesión. No hay capturas de las áreas comerciales porque el control de sesión no se sorteó.

## Convenciones

- **Confirmado:** visible en código o ejecutado sin ambigüedad.
- **Recomendación:** traducción propuesta para React/HTML, no hecho del original.
- **Pendiente:** no pudo verificarse o requiere una prueba adicional.
- Las rutas de origen son relativas a `universal/` salvo indicación contraria.
- Los valores de Supabase y credenciales nunca se copian a esta transferencia.

## Decisión ante contradicciones

Para la reconstrucción, prevalece el código activo de `universal/src/` sobre la aplicación web histórica raíz y sobre las especificaciones aspiracionales del destino. `web prueba/MASTER_SPEC.md` describe objetivos del destino, no evidencia del original, y se trata como restricción de implementación solo cuando no contradice lo observado.
