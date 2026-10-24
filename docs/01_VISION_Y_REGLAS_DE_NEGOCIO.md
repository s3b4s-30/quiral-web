# 01_VISION_Y_REGLAS_DE_NEGOCIO.md

## 1. Identidad y Propósito del Sistema
* **Nombre del Producto:** Quiral (Sistema POS, Control de Caja e Inventario en Tiempo Real).
* **Propósito Operativo:** Diseñado específicamente para tiendas de tecnología móvil y accesorios (como dispositivos iPhone, fundas, audífonos y componentes de carga), optimizado para la velocidad en mostrador físico y la gestión financiera precisa.
* **Modelo de Distribución:** Aplicación Web moderna construida como una **Progressive Web App (PWA)** de alto rendimiento (React + TypeScript + Vite + Tailwind CSS), accesible mediante enlace directo e instalable en dispositivos móviles y de escritorio sin pasar por tiendas de aplicaciones nativas.

---

## 2. Reglas Inquebrantables de Dominio (Core Business Rules)

### Regla 1: Cero Precios Quemados (Precios 100% Momentáneos)
* **Qué significa:** El sistema nunca impone precios de venta fijos ni costos predeterminados en sus plantillas, categorías o catálogos base.
* **Cómo opera:** Todos los precios de venta y costos unitarios son totalmente dinámicos y momentáneos. El usuario los decide y digita manualmente (con formato monetario automático con separador de miles por punto) en el instante exacto de registrar un nuevo lote, dar de alta un accesorio o realizar la liquidación de una venta en el POS.

### Regla 2: Aislamiento Estricto Multi-Tenant (Multi-Tienda)
* **Qué significa:** Cada comercio o usuario opera en un entorno hermético e independiente.
* **Cómo opera:** Toda lectura, escritura o consulta de datos de negocio (`products`, `sales`, `suppliers`, `closures`) debe exigir y filtrar obligatoriamente por el identificador único de la tienda (`store_id`), respaldado por seguridad a nivel de motor de base de datos (Row Level Security - RLS). Ningún usuario puede ver información ajena.

### Regla 3: Control Multi-Lote por Proveedor y Sincronización de Colores
* **Qué significa:** Un mismo producto puede ser adquirido de diferentes proveedores mayoristas en momentos distintos, manteniendo costos unitarios y existencias independientes por cada lote y color distintivo de proveedor.
* **Cómo opera:** Al añadir un producto al carrito de ventas, el sistema selecciona automáticamente por defecto el lote del proveedor que posea la mayor cantidad de stock disponible, permitiendo al cajero alternarlo de forma manual mediante botones de selección rápida (pills coloreadas) antes de facturar.

### Regla 4: Trazabilidad de Garantías por Ítem e Historial
* **Qué significa:** La cobertura de garantía no se aplica de manera global a toda la factura, sino de forma individual e independiente a cada producto y línea vendida.
* **Cómo opera:** Cada ítem comercializado registra su periodo de cobertura (por defecto 15 o 30 días estándar), estado actual de reclamación (con badges de días restantes o garantía aplicada) y notas de incidencia, permitiendo aplicar reemplazos físicos o reversiones sin alterar el balance general del stock en caja.

### Regla 5: Arqueos y Cierres de Ciclo Contable con Persistencia Histórica
* **Qué significa:** El negocio consolida cortes periódicos contrastando matemáticamente las ventas teóricas registradas en el sistema contra el efectivo físico real depositado en la caja.
* **Cómo opera:** El cierre calcula automáticamente los ingresos brutos, el costo de mercancía vendida (CMV), la utilidad real, la inversión recuperada y las diferencias de efectivo, resguardando los reportes de rendimiento y los listados de más vendidos y devueltos.

### Regla 6: Privacidad en Mostrador (Modo Mostrador vs. Modo Costos)
* **Qué significa:** El sistema debe blindar y proteger la información financiera confidencial (costos unitarios, márgenes de utilidad y nombres de proveedores mayoristas) cuando el dependiente interactúa de cara al público.
* **Cómo opera:** El inventario opera por defecto en **Modo Mostrador** (ocultando costos de compra y márgenes mediante un botón de control con icono de ojo tachado), permitiendo alternar al **Modo Costos y Lotes** únicamente mediante un control protegido para la auditoría y control exclusivo del administrador.

### Regla 7: Adaptabilidad Multiplataforma (PWA Offline-First y Bottom Navbar)
* **Qué significa:** La aplicación garantiza una experiencia fluida tanto en terminales fijas como en movilidad, emulando la ergonomía de una app nativa en PWA.
* **Cómo opera:** Cuenta con una barra de navegación inferior fija (`Navbar`) con 4 pestañas principales (`Resumen`, `Vender`, `Inventario`, `Historial`), indicador de badge en tiempo real para el carrito, y una barra flotante de cobro persistente.

### Regla 8: Integridad y Aislamiento del Historial de Ventas (Eliminación Segura)
* **Qué significa:** Las tareas de mantenimiento, depuración o limpieza del catálogo no deben corromper, alterar ni borrar la contabilidad histórica de la tienda.
* **Cómo opera:** Al eliminar un producto o purgar stock agotado, el sistema desvincula el artículo de la base operativa actual de forma segura mediante confirmaciones de dos pasos, pero conserva totalmente intactas las transacciones previas almacenadas en el historial de ventas y cierres.

### Regla 9: Persistencia Offline-First con Caché Local
* **Qué significa:** Un fallo en la conectividad a internet de la tienda no debe paralizar la consulta del catálogo ni la operación básica del mostrador.
* **Cómo opera:** El sistema utiliza estrategias de almacenamiento local persistente (`localStorage`) para mantener la sesión, el carrito de compras y los catálogos sincronizados de manera fluida ante interrupciones de red.

### Regla 10: Autocompletado Inteligente de Catálogo por Chips Dinámicos
* **Qué significa:** El alta de nuevos productos no debe ser manual ni propensa a errores de nomenclatura.
* **Cómo opera:** El formulario de creación incluye selectores en cascada por categorías (`Cargadores y Cables`, `Forros / Fundas`, `Audio / AirPods`) con chips interactivos que autogeneran el nombre comercial y las especificaciones técnicas en tiempo real.