# Diferencias verificadas: original vs `web prueba`

## Tecnología y arranque

Destino: `C:\Users\Sebas\Desktop\elytras\web prueba`. Usa React 19 + TypeScript + Vite 8 + Tailwind 4 + vite-plugin-pwa (`package.json`, `vite.config.ts`). El original activo usa Expo/React Native universal y Supabase (`universal/package.json`). El destino no contiene cliente Supabase implementado: `src/lib/supabase/` solo tiene `.gitkeep`.

## Diferencias funcionales críticas

1. `src/App.tsx` monta directamente `AppShell`/vistas; no hay `AuthScreen`, `getSession`, listener de auth ni guardia de sesión.
2. `src/contexts/POSStoreContext.tsx` hidrata mocks desde `src/utils/mocks.ts` y persiste todo en `localStorage` con clave única. No hay `store_id` efectivo por usuario ni repositorio remoto.
3. Las ventas se completan localmente y usan `store_id: 'store-demo'`; el original crea payloads con lotes, garantías y tenant real.
4. El destino calcula/reduce stock en estado local, pero no descuenta lotes con la estrategia original ni persiste cierres/garantías en Supabase.
5. El destino usa `localStorage` directo para turno cerrado, reclamos y tema (`SummaryView`, `HistoryView`, `ThemeContext`). Esto no es aislamiento por tienda.
6. Hay funciones visuales sin conexión real: exportar cierre, ver detalle de turno, acciones rápidas, proveedor y edición/alta de producto no completan el flujo de dominio.
7. `SummaryView` contiene cifras estáticas (`23 OCT 2026`, `24.850.000`, `+12,8%`) que no proceden del store; deben eliminarse o conectarse al cálculo original.
8. El destino ofrece `Transferencia` además de los cuatro métodos presentes en `CheckoutSheet.js`.

## Diferencias visuales y estructurales

- El destino tiene layout de escritorio/sidebar y POS dividido, que sí coincide conceptualmente, pero sus componentes son HTML/CSS propios (`src/components/layout/*`) y no reutilizan `TabBar`, `PageHeader`, `ProductCard`, `Sheet` ni tokens del universal.
- El destino usa `auto` por defecto para tema; el universal carga `dark` por defecto desde repositorio.
- Los nombres de modelos difieren (`quantity`, `unit_price`, `created_at` en destino frente a `qty`, `unitPriceCharged`, `createdAt` en universal). Requiere un adaptador explícito, no renombrado parcial.
- Existe documentación previa en `web prueba/docs/` y `MASTER_SPEC.md`, pero no sustituye la implementación: se contrastó contra el código y se marcaron las divergencias anteriores.

## Riesgos a corregir antes de producción

La combinación de mocks, `store-demo` y localStorage puede exponer o mezclar datos al cambiar de usuario/dispositivo. No conectar la UI a producción hasta implementar Auth, resolución de tenant, RLS, filtros explícitos y limpieza de caché al cerrar sesión.
