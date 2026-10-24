# Plan incremental de reconstrucción

## Orden recomendado

### 1. Contrato y seguridad

Modificar en destino `src/types/domain.ts`, crear `src/lib/supabase/client.ts` y repositorios/servicios bajo `src/lib/supabase/`. Migrar las entidades al contrato universal y exigir `store_id` en cada consulta/mutación. Añadir Auth y guardia en `src/App.tsx`; solo después montar `POSStoreContext`.

### 2. Estado compartido

Rehacer `src/contexts/POSStoreContext.tsx`/`src/hooks/usePOSStore.ts` para hidratación, loading/error, caché cuidadosamente separada por tenant, sincronización y limpieza al sign out. Reutilizar `src/utils/format.ts` solo como formateador; no reutilizar `src/utils/mocks.ts` en runtime autenticado.

### 3. POS

Corregir `src/views/PosView.tsx` y `src/components/layout/SplitPosLayout.tsx`: selección de lote, proveedor, precio unitario, descuento acotado, métodos originales, creación de venta y consumo de lotes. Mantener el panel desktop y sheet móvil, pero conectar ambos al mismo estado.

### 4. Inventario y proveedores

Completar `src/views/InventoryView.tsx` con crear/editar/eliminar, lotes, recepción, ajuste/merma, limpieza y proveedor. Crear componentes reutilizables en `src/components/` para modal/sheet, campos y confirmación accesible.

### 5. Historial y resumen

Completar `HistoryView.tsx` con garantías por ítem y persistencia; reescribir `SummaryView.tsx` para métricas dinámicas, ciclos, cierres, arqueo y detalle. Eliminar números hardcodeados y localStorage global.

### 6. Tema y PWA

Alinear `ThemeContext.tsx`, `src/index.css`, `index.html` y `vite.config.ts` con tokens verificables, safe areas, sheets de teclado y `100dvh`. Mantener Tailwind/Vite/PWA actuales salvo incompatibilidad demostrada.

### 7. Verificación

Ejecutar `npm run build` y `npm run lint` en destino; probar flujos con datos Supabase de dos tiendas; validar RLS; después usar Safari iPhone 12 390×844 y las dimensiones de la matriz de `04_ADAPTACION_SAFARI_IOS.md`.

## Reutilizar / corregir / reconstruir / integrar

- **Reutilizar:** Vite, React, TypeScript, Tailwind, PWA plugin, layout responsive, tipos base y formato monetario.
- **Corregir:** mocks, localStorage, fechas/cifras estáticas, nombres de campos, acciones incompletas y tema.
- **Reconstruir:** Auth, repositorio, persistencia, ventas atómicas, lotes, cierres, garantías y sheets de dominio.
- **Integrar:** Supabase Auth, tablas/RLS del `universal/supabase/schema.sql`, RPC públicas documentadas y cliente con variables públicas.
- **Verificar:** aislamiento tenant, errores de red, offline solo lectura, teclado, safe areas, orientación y standalone.
