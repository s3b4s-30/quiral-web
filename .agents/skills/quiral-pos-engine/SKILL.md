---
name: quiral-pos-engine
description: >-
  Estándares de arquitectura de datos, estado global (InventoryContext), transacciones atómicas Supabase y gestión
  de inventario multi-lote para Quiral POS. Úsalo al modificar lógica de catálogo, balanceo de stock, RPCs de venta
  (complete_sale), cálculo de márgenes, sincronización Realtime y formateo monetario COP.
---

# Quiral POS Engine & State Architecture Skill

Esta Skill establece las pautas de ingeniería para la gestión del estado global, las mutaciones de base de datos y la integridad transaccional en **Quiral POS**.

---

## 1. Principios de Integridad de Datos

1. **Fuente de Verdad Única:**
   PostgreSQL en Supabase es la fuente de verdad persistente. El estado de React en `InventoryContext` actúa como espejo optimista.
2. **Aislamiento Multi-Tenant:**
   Toda consulta o mutación debe incluir `.eq("store_id", storeId)` y respetar las funciones RLS (`is_store_member`).
3. **Cero Saldo Negativo:**
   Bajo ninguna circunstancia se debe permitir que el stock de un lote o el inventario total descienda de cero.
4. **Snapshotting de Costos:**
   Cada ítem de venta completada debe registrar su costo unitario histórico (`unitCostSnapshot`) y días de garantía para asegurar que los cálculos de utilidad histórica sean inmutables aunque el costo del lote cambie en el futuro.

---

## 2. Algoritmo Determinista de Balanceo de Lotes (`adjustMasterStock`)

Al modificar el stock total de un producto desde el control maestro en `ProductDetailModal` o `InventoryContext`:

```typescript
// Regla determinista de asignación y descuento de lotes:
if (delta > 0) {
  // Incrementar (+1): Asignar al lote con mayor cantidad de existencias actual
  const targetBatch = [...product.batches].sort((a, b) => b.stock - a.stock)[0];
  targetBatch.stock += delta;
} else if (delta < 0) {
  // Decrementar (-1): Sustraer del lote con mayor stock disponible (desempate determinista)
  const availableBatches = product.batches.filter((b) => b.stock > 0);
  if (availableBatches.length === 0) return; // Impedir negativos
  const targetBatch = [...availableBatches].sort((a, b) => b.stock - a.stock)[0];
  targetBatch.stock += delta; // delta es negativo
}
```

---

## 3. Transacción Comercial Atómica en Supabase (`complete_sale`)

Al finalizar un cobro en el POS (`completeSale` en `InventoryContext.tsx`):
1. **Validación previa en cliente:**
   - Carrito con al menos un ítem.
   - Total coherente: $0 \le \text{total} \le \text{subtotal}$.
   - Cantidad de cada producto $\le$ stock del lote seleccionado.
2. **Actualización Optimista:** Actualiza inmediatamente el estado local de React para respuesta táctil instantánea.
3. **Llamada RPC Transaccional:**
   ```typescript
   const { data, error } = await supabase.rpc("complete_sale", {
     target_store: storeId,
     sale_id: saleId,
     sale_number: nextSaleNumber,
     sale_created_at: new Date().toISOString(),
     sale_data: salePayload,
     lines: saleLinesPayload,
   });
   ```
   Si la base de datos rechaza la transacción por falta de stock concurrente, se revierte la actualización optimista y se notifica al usuario.

---

## 4. Convenciones de Formateo de Cifras (`src/utils/formatters.ts`)

Queda estrictamente prohibido formatear moneda o fechas con lógica inline `Intl.NumberFormat` dispersa. Utiliza siempre los formateadores centralizados:

```typescript
import {
  formatCOP,          // $1.500.000 (sin decimales, punto como separador)
  parseCOPInput,      // Extrae entero numérico desde texto con formato COP
  formatUnits,        // 15 uds
  formatProductCount, // 1 producto / 5 productos
  formatShortDate,    // 24 oct
  formatFullDate,     // 24 oct 2026
} from "../utils/formatters";
```

Todo elemento visual que renderice moneda o existencias debe llevar la clase CSS:
```tsx
<span className="tabular-nums font-bold">
  {formatCOP(monto)}
</span>
```

---

## 5. Verificación de Seguridad y Build

Al finalizar cualquier cambio en la lógica de negocio o tipos de datos:
1. Valida tipos sin emitir código:
   ```bash
   npx tsc --noEmit
   ```
2. Valida la compilación completa con Rollup:
   ```bash
   npm run build
   ```
Ambos deben concluir con código de salida `0`.
