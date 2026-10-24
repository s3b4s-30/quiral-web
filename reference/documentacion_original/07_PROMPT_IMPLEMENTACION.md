# Prompt de implementación — reconstrucción Quiral web

Trabaja exclusivamente en `C:\Users\Sebas\Desktop\elytras\web prueba`. No modifiques `C:\Users\Sebas\Desktop\elytras-quiral`. Usa como fuente de verdad los siete documentos de `C:\Users\Sebas\Desktop\QUIRAL_AUDITORIA`, especialmente `01`–`06`, y el código universal original solo en lectura.

Implementa una PWA React + TypeScript + Vite + Tailwind que reproduzca las cuatro áreas del original: Resumen, Vender, Inventario e Historial. Conserva la arquitectura existente cuando sea compatible, pero sustituye mocks y localStorage global por Auth Supabase, repositorio multi-tenant y estado compartido real. Toda consulta o mutación de `products`, `sales`, `sale_items`, `batches`, `suppliers` e `inventory_adjustments` debe exigir `store_id` y quedar protegida por RLS; nunca uses `store-demo` en runtime.

Reproduce el comportamiento de `usePOSStore.js`, `CheckoutSheet.js`, `InventarioScreen.js`, `HistorialScreen.js` y `ResumenScreen.js`: selección/consumo de lotes, límites de stock, precios y descuentos, métodos de pago originales, garantías por ítem, ciclos/cierres y errores explícitos. Mantén el estado de carga, error, vacío y offline solo lectura. Al cerrar sesión limpia caché y estado en memoria del tenant anterior.

Mantén el diseño OLED claro/oscuro con los tokens confirmados; no inventes sombras, radios o cifras. Decide y documenta explícitamente si el tema inicial es oscuro como el original o `auto` como el prototipo, y no mezcles ambos silenciosamente. Implementa sheets accesibles, safe areas, `100dvh`, teclado iOS y barra/FAB sin cubrir contenido según `04_ADAPTACION_SAFARI_IOS.md`.

No declares terminado por compilar solamente. Ejecuta build/lint, valida dos tenants con RLS, prueba venta → stock → historial → garantía → cierre, y comprueba 390×844 en Safari iPhone/standalone además de escritorio ≥768 px. Reporta archivos modificados, pruebas ejecutadas, limitaciones y cualquier discrepancia pendiente.
