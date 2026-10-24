# Inventario de transferencia

## Resumen comprobado

Inventario realizado el 23 de octubre de 2026. La carpeta contiene 82 archivos:

- 39 documentos (`.md`, `.txt`, `.pdf` o `.docx`), incluidos 11 documentos originales de
  `QUIRAL_TRANSFERENCIA_VISUAL`, 8 informes de `QUIRAL_AUDITORIA`, 12 documentos nuevos de
  índice/síntesis y 7 README de las carpetas temáticas, además de `AGENTS.md` como referencia
  técnica de la fuente.
- 10 imágenes: 2 capturas auténticas de Auth y 8 recursos gráficos de `universal/assets` y
  `universal/public`.
- 34 copias de consulta del código/configuración activo, sin dependencias completas ni secretos.

## Orígenes copiados

| Origen | Destino |
|---|---|
| `C:\Users\Sebas\Desktop\QUIRAL_TRANSFERENCIA_VISUAL\*.md` | `documentacion_original/` |
| `C:\Users\Sebas\Desktop\QUIRAL_TRANSFERENCIA_VISUAL\capturas/` | `capturas/` |
| `C:\Users\Sebas\Desktop\QUIRAL_AUDITORIA\*` | `documentacion_original/` |
| `C:\Users\Sebas\Desktop\elytras-quiral\universal\` fuentes seleccionadas | `mapa_codigo_original/fuentes/` |
| `universal/assets/` y `universal/public/` iconos seleccionados | `recursos_visuales/` |

Los dos PNG de Auth ya existentes se compararon por SHA-256 y se conservaron sin sobrescribir.
Las fuentes seleccionadas también se verificaron por hash contra el origen.

## Archivos nuevos

Los documentos de síntesis exigidos están en la raíz: `README_REFERENCIAS.md`,
`ARQUITECTURA_VISUAL_ORIGEN.md`, `DESIGN_SYSTEM.md`, `ESPECIFICACION_PANTALLAS.md`,
`COMPONENTES_Y_OVERLAYS.md`, `RESPONSIVE_MOVIL_ESCRITORIO.md`, `INTERACCIONES_VISIBLES.md`,
`MAPA_CODIGO_ORIGINAL.md`, `PLAN_RECONSTRUCCION_VISUAL.md`, `LIMITACIONES_Y_VERIFICACION.md` y
`ALCANCE_MVP_PWA.md` e `INVENTARIO_TRANSFERENCIA.md`. Los README temáticos solo enlazan esos
documentos y no duplican la fuente.

No se copiaron `.env`, credenciales, `node_modules`, `dist` ni archivos generados de dependencias.
