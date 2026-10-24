# Referencias de QUIRAL para `quiral-pwa`

Paquete de documentación y recursos para reconstruir visualmente la aplicación activa
ubicada en `C:\Users\Sebas\Desktop\elytras-quiral\universal\`. Esta carpeta no contiene
una implementación de la PWA.

## Orden recomendado

1. [ARQUITECTURA_VISUAL_ORIGEN.md](./ARQUITECTURA_VISUAL_ORIGEN.md)
2. [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
3. [ESPECIFICACION_PANTALLAS.md](./ESPECIFICACION_PANTALLAS.md)
4. [COMPONENTES_Y_OVERLAYS.md](./COMPONENTES_Y_OVERLAYS.md)
5. [RESPONSIVE_MOVIL_ESCRITORIO.md](./RESPONSIVE_MOVIL_ESCRITORIO.md)
6. [INTERACCIONES_VISIBLES.md](./INTERACCIONES_VISIBLES.md)
7. [MAPA_CODIGO_ORIGINAL.md](./MAPA_CODIGO_ORIGINAL.md)
8. [PLAN_RECONSTRUCCION_VISUAL.md](./PLAN_RECONSTRUCCION_VISUAL.md)
9. [LIMITACIONES_Y_VERIFICACION.md](./LIMITACIONES_Y_VERIFICACION.md)
10. [ALCANCE_MVP_PWA.md](./ALCANCE_MVP_PWA.md)
11. [INVENTARIO_TRANSFERENCIA.md](./INVENTARIO_TRANSFERENCIA.md)

## Material transferido

- Documentos originales en [documentacion_original/](./documentacion_original/).
- Capturas auténticas de Auth en [capturas/](./capturas/).
- Iconos y recursos de marca en [recursos_visuales/](./recursos_visuales/).
- Copias de consulta del código activo en [mapa_codigo_original/fuentes/](./mapa_codigo_original/fuentes/).
- Índices temáticos en [auditoria_visual/](./auditoria_visual/), [design_system/](./design_system/),
  [pantallas/](./pantallas/), [componentes/](./componentes/), [interacciones/](./interacciones/),
  [responsive/](./responsive/) y [decisiones_y_limitaciones/](./decisiones_y_limitaciones/).

## Convenciones de evidencia

- **Verificado en código:** aparece en el árbol activo o en una copia de fuente de esta carpeta.
- **Observado visualmente:** solo las capturas de Auth disponibles; no se presentaron datos de sesión.
- **Pendiente:** no fue posible comprobarlo ejecutando la pantalla o no existe una captura.
- Las rutas mencionadas como origen son absolutas para facilitar auditoría; las copias de este paquete
  no contienen `.env`, credenciales ni dependencias completas.

La documentación de `QUIRAL_TRANSFERENCIA_VISUAL` y `QUIRAL_AUDITORIA` se conserva sin sobrescribir
en [documentacion_original/](./documentacion_original/). Cuando dos documentos difieren, prevalece
el código activo de `universal/src/` y la diferencia queda señalada en [LIMITACIONES_Y_VERIFICACION.md](./LIMITACIONES_Y_VERIFICACION.md).
