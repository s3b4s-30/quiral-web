# 02_ARQUITECTURA_Y_STACK_DECISIONES.md

## 1. Visión General de la Arquitectura
La arquitectura de Quiral se estructura bajo el principio de separación de responsabilidades (SRP y DRY) en una Single Page Application (SPA) web moderna, organizada en las siguientes capas:
1. **Capa de Presentación (UI / Views):** Componentes funcionales en React estructurados con Tailwind CSS, diseñados bajo el estándar Apple HIG (Modo Oscuro OLED absoluto y Modo Claro sistema iOS) y adaptables mediante una barra de navegación inferior fija (`Navbar`) y modales deslizantes tipo *Bottom Sheets*.
2. **Capa de Estado Global y Lógica de Negocio (`POSStoreContext` / Hooks):** Contextos de React centralizados que encapsulan el dominio de la aplicación (gestión de carrito, validación estricta de stock, control multi-lote, selección de proveedores y cálculos financieros).
3. **Capa de Repositorio y Abstracción de Datos (`posRepository`):** Un contrato de servicios tipado en TypeScript que desacopla la interfaz visual del mecanismo de almacenamiento, permitiendo alternar entre el motor en la nube y la caché local de respaldo.
4. **Capa de Backend y Seguridad (Supabase & RLS):** Base de datos relacional PostgreSQL con autenticación de usuarios y aislamiento hermético de los datos mediante Row Level Security (RLS) basado en `store_id`.

> **Estado de la implementación actual:** este checkout contiene la capa de presentación y el contexto local de inventario descritos en `src/context/InventoryContext.tsx`. El repositorio remoto, Supabase, autenticación, ventas e historial descritos arriba son contratos de arquitectura futura y no deben considerarse funcionalidades disponibles en esta versión.

---

## 2. Stack Tecnológico Oficial
* **Core Frontend:** React 18+ con TypeScript, asegurando tipado estricto en entidades de dominio (`Product`, `Batch`, `CartItem`, `Sale`, `Supplier`, `Closure`).
* **Empaquetador y Entorno:** Vite, seleccionado por su extrema velocidad en desarrollo y recarga instantánea HMR.
* **Estilizado Visual:** Tailwind CSS v3/v4, configurado con variables CSS personalizadas para implementar tokens dinámicos de color OLED y soporte nativo para temas Claro/Oscuro en tiempo real.
* **Iconografía:** `lucide-react`, proveyendo iconos limpios y escalables acordes al diseño de interfaces móviles/web.
* **Backend y Base de Datos:** Supabase (PostgreSQL 15+) utilizando el cliente oficial `@supabase/supabase-js`.
* **Persistencia Local y PWA:** `localStorage` para almacenamiento síncrono de sesión, carrito y preferencias de tema, complementado con un Service Worker configurado mediante Vite PWA.

---

## 3. Decisiones Clave de Arquitectura (ADRs para Web)

### ADR-A: Tipado Estricto de Dominio (`src/types/domain.ts`)
* **Definición:** Todas las estructuras de datos que viajan por el sistema deben estar tipadas en interfaces de TypeScript, prohibiendo el uso de tipos `any`.

### ADR-B: Patrón Repositorio con TypeScript (`posRepository.ts`)
* **Definición:** La interfaz gráfica nunca interactúa directamente con los métodos de red de Supabase. Toda operación pasa por un contrato de repositorio estandarizado que soporta adaptadores locales (`localStorage`) y remotos (`Supabase`).

### ADR-C: Enrutamiento y Navegación SPA por Pestañas (`Navbar`)
* **Definición:** La aplicación opera mediante un contenedor principal (`AppShell`) que gestiona una barra de navegación inferior fija con 4 vistas principales (`Resumen`, `Vender`, `Inventario`, `Historial`), manteniendo el estado del carrito persistente entre pestañas.

### ADR-D: Gestión de Proveedores con Sincronización Dinámica de Colores
* **Definición:** Cada proveedor cuenta con un identificador de color de una grilla de 13 tonos. Al actualizar el color de un proveedor en el módulo de gestión, este se propaga instantáneamente mediante el estado global a todas las tarjetas de productos, inventario y selectores de lotes.

### ADR-E: Persistencia local validada y tolerante a fallos
* **Definición:** Las preferencias y el inventario local se leen mediante validadores de dominio y se escriben con errores explícitos. Los datos inválidos o un almacenamiento no disponible restauran el estado inicial sin convertir una carga corrupta en estado operativo.