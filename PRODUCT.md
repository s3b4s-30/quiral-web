# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Cajeros, dependientes de mostrador y administradores de comercios minoristas y tiendas de tecnología en Colombia.
- Operan en terminales móviles de mano (iPhone y Android en modo standalone PWA) y en estaciones fijas de escritorio (macOS/Windows) para control de inventario, auditoría y cierres de ciclo.

## Product Purpose
- Punto de venta (POS) y administración de inventario multi-lote en tiempo real para comercios minoristas.
- Permite facturación ágil de mostrador, descuento atómico de stock por lotes específicos con snapshots de costo inmutables, seguimiento de garantías y arqueos de caja periódicos sincronizados con Supabase PostgreSQL.

## Positioning
- Quiral POS ofrece una experiencia táctil fluida bajo Apple Human Interface Guidelines (HIG) con sistema dual OLED nativo (negro absoluto `#000000` y superficies sólidas `#141416`), garantizando rendimiento constante a 60fps en WebKit iOS sin recargas ni latencia.

## Operating Context
- Entorno de mostrador de venta rápida donde la ergonomía con una sola mano es esencial.
- Operación en red local o conexiones 4G móviles. Manejo de cifras de millones de pesos colombianos ($100.000 COP a más de $1.500.000.000 COP) que requieren contención numérica tabular estricta.
- Cero tolerancia a parpadeos o retardos de interfaz.

## Capabilities and Constraints
- **Gestión Determinista Multi-Lote:** Las existencias totales de cada producto reflejan determinísticamente la suma de sus lotes activos (`adjustMasterStock` incrementa o decrementa deterministamente sobre el lote con mayor inventario disponible, sin saldos negativos).
- **Transacciones Atómicas Seguras:** Transacciones comerciales ejecutadas a través del RPC atómico `complete_sale` en Supabase bajo nivel de aislamiento `SERIALIZABLE`.
- **Cero `backdrop-blur` en Cabeceras y Modales:** Queda estrictamente prohibido el uso de filtros `backdrop-blur` en cabeceras móviles de scroll, modales (`ModalSheet`, `AuthScreen`, `PurgeConfirmModal`), menús desplegables (`TopMenu`) o barras flotantes (`CartSummaryBar`), debido a congelamientos del GPU compositor y caídas de 60fps a 15fps en WebKit iOS. Se utilizan superficies sólidas OLED opacas (`var(--bg-elevated)`).
- **Blindaje Monetario Obligatorio:** Toda cifra en moneda colombiana (COP) de hasta 10 dígitos debe implementar obligatoriamente la clase CSS `.tabular-nums`, formateo universal con `formatCOP()`, escala responsive elástica y truncamiento (`truncate`) para prevenir desbordamientos horizontales.
- **Protocolo de Espaciado Anti-Colisión:** Contenedores de scroll con espaciado inferior obligatorio de `pb-32` (8rem) en vistas estándar (`InventoryView`, `HistoryView`, `SummaryView`) y dinámico de hasta `pb-44` en `PosView` cuando el carrito de ventas se encuentra activo.
- **Footer Persistente en Modales:** Los botones de acción principal en modales residen en un slot fijo inferior adaptado con `env(safe-area-inset-bottom)`, desacoplados del área desplazable.

## Brand Commitments
- Nombre de la marca: **Quiral POS** (`quiral.xyz`).
- Filosofía visual: Apple Human Interface Guidelines (HIG) con sistema dual OLED nativo.
- Terminología estandarizada: Denominaciones formales de catálogo (ej. siempre "Cubo", descartado el término informal "Cubito Cargador").

## Evidence on Hand
- Base de código: React 18, Vite 6, Tailwind CSS 3, TypeScript estricto.
- Trinidad Documental de Gobernanza: [`AGENTS.md`](./AGENTS.md), [`DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md), [`QUIRAL_V1.0.1_DOCS.md`](./QUIRAL_V1.0.1_DOCS.md) y [`.agents/SKILLS_INDEX.md`](./.agents/SKILLS_INDEX.md).
- Vistas operativas: `PosView.tsx`, `InventoryView.tsx`, `SummaryView.tsx`, `HistoryView.tsx`.
- Componentes adaptativos: `DesktopSidebar.tsx`, `Navbar.tsx`, `TopHeader.tsx`, `ModalSheet.tsx`, `CartSummaryBar.tsx`, `FloatingCartFAB.tsx`.

## Product Principles
1. **Velocidad de Mostrador Inmediata:** Toda interacción (búsqueda, adición al carrito, checkout) debe responder sin latencia visual perceptible.
2. **Determinismo Financiero y de Stock:** El inventario y los balances comerciales no admiten desfases ni aproximaciones flotantes.
3. **Ergonomía Apple HIG:** Adaptabilidad fluida a safe-areas, footer persistente en modales y prevención de colisiones con gestos del sistema iOS.
4. **Respeto Absoluto al Historial de Descarte:** Ningún anti-patrón rechazado (desenfoques WebKit, colisiones de navbar, fuentes sobredimensionadas) puede reintroducirse.

## Accessibility & Inclusion
- Soporte para `prefers-reduced-motion` global mediante anulación de transiciones parpadeantes en cambios de tema OLED.
- Contraste WCAG AA sobre fondos OLED puros.
- Áreas táctiles mínimas de 44x44px en controles principales.
