# Responsive: móvil y escritorio

## Reglas comprobadas

- `width >= 768`: escritorio con sidebar.
- POS: una columna móvil; dos columnas entre 768 y 1199; tres desde 1200.
- Panel de checkout POS: 380 px entre 768 y 1199; 420 px desde 1200.
- Historial: dos columnas desde 1100; una por debajo.
- Shell móvil: ancho máximo 600 px.
- Barra móvil: 70 px más inset inferior; FAB de 52 px.

## Safe-area y scroll

El origen usa `react-native-safe-area-context`, `100dvh`, `viewport-fit=cover` y padding
inferior adicional para no ocultar el último elemento detrás de barra/FAB. Los inputs son de
16 px para evitar zoom de Safari. Sheets tienen altura máxima y scroll interno.

## Matriz pendiente para la PWA

Validar 390×844, 320×700, 375×812, 768×1024 y 1440×900. No se verificaron Safari físico,
PWA instalada, teclado iOS, orientación ni safe-area real.
