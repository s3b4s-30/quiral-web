---
name: Quiral POS
description: Apple HIG & Dual OLED Native POS Design System
colors:
  primary: "#007aff"
  primary-hover: "#0062cc"
  oled-black: "#000000"
  oled-surface: "#141416"
  oled-border: "#262629"
  light-bg: "#f2f2f7"
  light-surface: "#ffffff"
  light-border: "#e5e5ea"
  apple-gray: "#8e8e93"
  success: "#34c759"
  warning: "#ff9500"
  danger: "#ff3b30"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  subheadline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  callout:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
  micro:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  tabular-metric:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1rem, 2.5vw, 1.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  safe-top-notch: "64px"
  anti-collision: "128px"
  anti-collision-cart: "176px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# DESIGN.md — Especificación del Sistema de Diseño Quiral POS

## 1. Overview
Quiral POS implementa los principios de Apple Human Interface Guidelines (HIG) sobre una arquitectura web progresiva (PWA). El sistema visual opera bajo una arquitectura Dual OLED estricta: negro absoluto `#000000` en modo oscuro y `#f2f2f7` en modo claro, priorizando ergonomía táctil en terminales móviles de mostrador y adaptabilidad fluida a estaciones de escritorio (`>= 768px`).

## 2. Colors
- **Modo Oscuro OLED (Nativo):**
  - Fondo Primario: `#000000` (`var(--bg-primary)`)
  - Superficie Elevada: `#141416` (`var(--bg-elevated)`)
  - Bordes y Separadores: `#262629` (`var(--border-color)`)
  - Texto Primario: `#f5f5f7` (`var(--text-primary)`)
  - Texto Secundario: `#86868b` (`var(--text-secondary)`)
- **Modo Claro (Nativo):**
  - Fondo Primario: `#f2f2f7`
  - Superficie Elevada: `#ffffff`
  - Bordes y Separadores: `#e5e5ea`
  - Texto Primario: `#1d1d1f`
  - Texto Secundario: `#6e6e73`
- **Acentos Semánticos:**
  - Sistema Apple Blue: `#007aff`
  - Apple Gray (Neutro HIG): `#8e8e93`
  - Éxito / Cobro / Garantía Activa: `#34c759`
  - Advertencia / Alerta de Stock: `#ff9500`
  - Destructivo / Devolución / Pérdida: `#ff3b30`

## 3. Typography
- **Fuente Principal:** Tipografía de sistema Apple (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif`).
- **Escala de Texto y Micro-Rampa (Apple HIG):**
  - Display: `clamp(1.5rem, 4vw, 2.25rem)` (24px–36px)
  - Headline: `clamp(1.125rem, 2.5vw, 1.5rem)` (18px–24px)
  - Subheadline: `0.9375rem` (`15px`)
  - Body: `0.875rem` (`14px`)
  - Callout: `0.8125rem` (`13px`)
  - Caption: `0.6875rem` (`11px`)
  - Micro / Badges: `0.625rem` (`10px`)
- **Blindaje Numérico Tabular Obligatorio:** Todo precio, subtotal, saldo, existencias de inventario y fechas comerciales deben incluir la clase CSS `.tabular-nums`.
- **Escala Fluida para Cifras Monetarias COP (hasta 10 dígitos):**
  - Tarjetas de métricas: `text-base min-[380px]:text-lg sm:text-xl md:text-2xl font-bold tabular-nums tracking-tight truncate`.
  - Queda prohibido el uso de tipografía rígida sobredimensionada (`text-3xl`, `text-2xl` fijo).
  - Precios en tarjetas de catálogo: `text-sm sm:text-base md:text-lg font-extrabold whitespace-nowrap` con contenedor `max-w-[55%]` y título adyacente `min-w-0 flex-1 truncate`.

## 4. Layout
- **Estrategia Adaptativa Dual:**
  - **Móvil (< 768px):** Navegación mediante barra flotante inferior `Navbar` (con desmontaje condicional `!hasActiveModal`) y botón flotante de carrito `FloatingCartFAB`.
  - **Escritorio (>= 768px):** Barra lateral fija `DesktopSidebar` (`w-64`), catálogo a dos columnas expandidas y modales centrados.
- **Protocolo de Espaciado Anti-Colisión:**
  - **Margen Superior Seguro (`pt-16` / 4rem / 64px):** El 100% de las vistas principales (`SummaryView`, `PosView`, `InventoryView`, `HistoryView`) y modales (`ModalSheet`, `PurgeConfirmModal`, `AuthScreen`) implementan un resguardo superior mínimo de `pt-16` (`padding-top: max(4rem, var(--quiral-header-offset))`). Esto previene colisiones con la Dynamic Island, notch y barra de estado de iOS WebKit / Safari PWA.
  - Vistas Estándar (`InventoryView`, `HistoryView`, `SummaryView`): Contenedor principal con padding inferior obligatorio `pb-32` (8rem) en móvil y `md:pb-12` en escritorio.
  - Punto de Venta (`PosView`): Padding inferior dinámico `${cartUnits > 0 ? "pb-44 sm:pb-36" : "pb-32"}` para garantizar que `CartSummaryBar` no cubra las últimas tarjetas de venta.
- **Safe Areas Nativas:** Todos los contenedores de borde respetan estrictamente `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`.

## 5. Elevation & Depth
- **Cero `backdrop-blur` en Cabeceras y Modales:**
  - Cabecera fija (`TopHeader.tsx` / `.quiral-top-header`): 100% sólida opaca (`var(--bg-elevated)`).
  - Barra de resumen de carrito (`CartSummaryBar.tsx`), menús desplegables (`TopMenu.tsx`) y modales (`ModalSheet.tsx`): Fondo sólido OLED `var(--bg-elevated)` y fondos atenuados limpios `bg-black/60`.
  - **Justificación:** Los filtros `backdrop-blur` en WebKit iOS causan congelamiento del GPU compositor, texto borroso o cortado a la mitad, y caídas de 60fps a 15fps.
- **Superficies Elevadas:** Capas con bordes definidos `border border-[var(--border-color)]` y sombras tonales sutiles.

## 6. Shapes
- **Tarjetas y Paneles:** `rounded-2xl` o `rounded-3xl` con bordes sutiles.
- **Píldora Táctil (*Handle*):** En `ModalSheet`, píldora horizontal centrada `w-9 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600` a `10px` del borde superior (`pt-2.5 pb-1`).
- **Controles Compactos:** Botón `AdminCompactButton` con transición responsive (círculo `w-8 h-8 rounded-full` en `<420px`, píldora con texto en `>=420px`).

## 7. Components
- **ModalSheet:** Hojas flotantes de arrastre (*swipe-to-dismiss*) estilo nativo iOS con inercia elástica, bloqueo estricto de scroll en la capa inferior (`body.modal-open` con `touch-action: none; pointer-events: none`) y botón de acción principal alojado obligatoriamente en el `footer` persistente fuera del scroll.
  - **Margen Superior Ergonómico en Móvil (`max-h-[calc(100dvh-2.25rem)]`):** La hoja despeja 36px desde la parte superior de la pantalla móvil sin generar espacios muertos excesivos, garantizando visibilidad inmediata de la píldora de arrastre (`pt-3 pb-1.5`) y la cabecera. En escritorio conmuta a centrado nativo (`sm:max-h-[85vh]`).
  - **Aislamiento de Scroll:** El scroll vertical ocurre exclusivamente dentro del elemento con clase `.overscroll-contain`, previniendo fugas táctiles (*touch leakage*) hacia las vistas de fondo.
- **Skeletons de Carga Asíncrona:** Implementación obligatoria de placeholders animados (`animate-pulse`) en `SummaryView`, `PosView`, `InventoryView`, `HistoryView`, `CycleClosingModal` y `SalesPerformanceModal`. Nunca calcular o renderizar ceros (`$0`) ni estados vacíos prematuros mientras el contexto se encuentre en estado `loading === true`.
- **PosProductCard / ProductCard:** Tarjeta de catálogo con contención de desbordamiento, fila de costos en `flex-wrap gap-1.5` y badge de existencias.
- **CartSummaryBar:** Barra de checkout fija en la parte inferior sobre fondos sólidos OLED con acceso inmediato al cobro.

## 8. Do's and Don'ts
- **DO:** Usar siempre `.tabular-nums` en montos COP, existencias y fechas.
- **DO:** Procesar todos los montos con `formatCOP()` y las existencias con `formatUnits()`.
- **DO:** Implementar Skeletons con `animate-pulse` mientras `loading === true` en vistas y modales.
- **DO:** Bloquear el scroll de la vista de fondo mediante `body.modal-open` al montar cualquier `ModalSheet`.
- **DO:** Aplicar `max-h-[calc(100dvh-2.25rem)]` en `ModalSheet` para garantizar visibilidad de la píldora y el título sin crear vacíos excesivos.
- **DO:** Aplicar `pb-32` en contenedores de scroll móvil y `pb-44` en POS con carrito activo.
- **DO:** Alojar el botón de confirmación en el slot `footer` persistente de `ModalSheet` con `env(safe-area-inset-bottom)`.
- **DON'T:** Renderizar jamás cifras en `$0` ni estados vacíos de catálogo mientras la promesa asíncrona de Supabase esté resolviendo (`loading === true`).
- **DON'T:** Usar jamás `backdrop-blur` en cabeceras móviles, menús desplegables o modales.
- **DON'T:** Asignar `max-h-[92vh]` o forzar modales móviles contra el borde superior de la pantalla.
- **DON'T:** Reintroducir tipografías fijas sobredimensionadas (`text-3xl`, `text-2xl` rígido) en tarjetas de métricas monetarias.
- **DON'T:** Mostrar simultáneamente la `Navbar` inferior cuando un modal se encuentra abierto.
- **DON'T:** Utilizar denominaciones informales (usar siempre "Cubo", nunca "Cubito Cargador").
- **DON'T:** Alterar el balance determinista de lotes en `adjustMasterStock`.
