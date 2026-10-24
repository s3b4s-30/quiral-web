export const TAB_BAR_HEIGHT = 70;
export const FAB_SIZE = 52;
export const FAB_BOTTOM = 96; // Flota de forma armónica sobre la barra de navegación (entre 95 y 100)
export const FAB_RIGHT = 20;

export function getFloatingBottom(insets) {
  const bottomInset = insets?.bottom || 0;
  return Math.max(FAB_BOTTOM, bottomInset + FAB_BOTTOM);
}

export function getContentBottomPadding(insets, isDesktop) {
  if (isDesktop) return 40;
  // Margen inferior ampliado para garantizar que ninguna tarjeta de lista (ej. elemento #7)
  // quede tapada ni superpuesta por el FAB al desplazarse hasta el fondo.
  return getFloatingBottom(insets) + FAB_SIZE + 24;
}
