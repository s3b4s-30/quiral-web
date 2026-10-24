# AGENTS.md — Directrices Permanentes para Asistentes y Desarrolladores

Bienvenido al repositorio de **Quiral POS**. Antes de inspeccionar o realizar cualquier modificación en este proyecto, es **obligatorio** cumplir con las siguientes instrucciones:

## 1. Documento de Referencia Obligatoria
Antes de iniciar cualquier tarea de frontend, UI/UX o lógica de negocio, **debes leer y consultar**:
- [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md)

Este documento define la arquitectura visual (Apple HIG, temas duales OLED), los estándares de componentes móviles (Bottom Sheets, botones de acción en footer persistente con safe-areas, encabezados sólidos sin blur) y las directrices de datos.

## 2. Historial de Descarte
Consulta la sección `[Historial de Descarte]` en [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) antes de proponer o aplicar cambios.
**Queda estrictamente prohibido reintroducir patrones, textos o estilos previamente descartados**, tales como:
- Cabeceras translúcidas con blur en vistas de scroll.
- Navbar visible al mismo tiempo que modales abiertos.
- Botones principales de acción colocados al final de contenedores desplazables.
- Términos informales descartados (ej. "Cubito Cargador" -> debe ser "Cubo").
- Descuadres o saltos de línea en el texto «Modo administrador».

## 3. Protocolo de Resolución de Conflictos
Si una nueva instrucción o requerimiento contradice una regla confirmada de [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md):
1. **Detén la parte afectada inmediatamente.**
2. Explica la regla existente y la contradicción detectada.
3. Presenta las alternativas de forma clara.
4. Solicita la decisión del usuario antes de proceder.
5. Una vez resuelta la consulta, actualiza [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md), elimina la alternativa descartada del código y continúa con la tarea.

## 4. Control de Calidad Obligatorio
Toda modificación debe verificarse ejecutando:
```bash
npm run build
```
Asegura que el comando finalice con código de salida `0` y cero errores de TypeScript o Vite antes de concluir cualquier encargo.

