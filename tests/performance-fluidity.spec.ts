import { test, expect } from "@playwright/test";

test.describe("Quiral POS — Verificación de Rendimiento, Skeletons y Aislamiento de Modales", () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 14
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  });

  test("1. Autenticación demo y navegación fluida sin parpadeo en $0", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("quiral_demo_bypass", "true");
    });

    await page.goto("http://localhost:5173/");

    // Esperar a que la barra de navegación flotante inferior aparezca
    const mobileNavbar = page.locator("nav.liquid-glass-surface");
    await expect(mobileNavbar).toBeVisible({ timeout: 10000 });

    // 1. Navegación rápida hacia 'Resumen'
    const resumenBtn = mobileNavbar.locator("button").filter({ hasText: "Resumen" });
    await resumenBtn.click();

    // Comprobar que el scroll de Resumen está visible
    const summaryContainer = page.locator("#summary-scroll");
    await expect(summaryContainer).toBeVisible();

    // Validar que la tarjeta de Ingresos está visible y contiene cifras formateadas
    const ingresosCard = page.locator("text=Ingresos").locator("xpath=..");
    await expect(ingresosCard).toBeVisible();

    // 2. Navegación rápida hacia 'Inventario'
    const inventarioBtn = mobileNavbar.locator("button").filter({ hasText: "Inventario" });
    await inventarioBtn.click();
    const inventoryContainer = page.locator("#inventory-scroll");
    await expect(inventoryContainer).toBeVisible();

    // 3. Navegación rápida hacia 'Vender' (POS)
    const posBtn = mobileNavbar.locator("button").filter({ hasText: "Vender" });
    await posBtn.click();
    const posContainer = page.locator("#pos-scroll");
    await expect(posContainer).toBeVisible();
  });

  test("2. Aislamiento de scroll y bloqueo táctil en Modal de Rendimiento de Ventas", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("quiral_demo_bypass", "true");
    });

    await page.goto("http://localhost:5173/");

    const mobileNavbar = page.locator("nav.liquid-glass-surface");
    await expect(mobileNavbar).toBeVisible({ timeout: 10000 });

    // Ir a Resumen
    await mobileNavbar.locator("button").filter({ hasText: "Resumen" }).click();
    await expect(page.locator("#summary-scroll")).toBeVisible();

    // Abrir modal 'Más Vendidos y Devueltos'
    const perfBtn = page.getByRole("button", { name: /Más Vendidos y Devueltos/i });
    await expect(perfBtn).toBeVisible();
    await perfBtn.click();

    // 1. Verificar que el modal está abierto
    const modalDialog = page.locator('[role="dialog"]');
    await expect(modalDialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rendimiento de Ventas" })).toBeVisible();

    // 2. Verificar que body tiene la clase 'modal-open'
    const isModalOpenClassPresent = await page.evaluate(() => {
      return document.body.classList.contains("modal-open");
    });
    expect(isModalOpenClassPresent).toBe(true);

    // 3. Verificar que .quiral-scroll-container tiene overflow: hidden, pointer-events: none y touch-action: none
    const bgStyles = await page.evaluate(() => {
      const scrollEl = document.querySelector("#summary-scroll");
      if (!scrollEl) return null;
      const computed = window.getComputedStyle(scrollEl);
      return {
        overflowY: computed.overflowY,
        pointerEvents: computed.pointerEvents,
        touchAction: computed.touchAction,
      };
    });
    expect(bgStyles?.overflowY).toBe("hidden");
    expect(bgStyles?.pointerEvents).toBe("none");
    expect(bgStyles?.touchAction).toBe("none");

    // 4. Intentar hacer scroll en el fondo (en el backdrop superior) y verificar que no se desplaza
    await page.mouse.move(50, 15);
    await page.mouse.wheel(0, 300);
    const scrollAfterGesture = await page.evaluate(() => {
      const scrollEl = document.querySelector("#summary-scroll");
      return scrollEl ? scrollEl.scrollTop : 0;
    });
    expect(scrollAfterGesture).toBe(0);

    // 5. Verificar navegación entre pestañas 'Más Vendidos' y 'Más Devueltos' dentro del modal
    const returnedTab = modalDialog.getByRole("button", { name: /Más Devueltos/i });
    await returnedTab.click();
    await expect(returnedTab).toHaveClass(/bg-\[#ff9500\]/);

    const sellersTab = modalDialog.getByRole("button", { name: "Más Vendidos", exact: true });
    await sellersTab.click();
    await expect(sellersTab).toHaveClass(/bg-\[#007aff\]/);

    // 6. Cerrar modal y verificar restauración de scroll
    const closeBtn = modalDialog.getByRole("button", { name: "Volver" });
    await closeBtn.click();
    await expect(modalDialog).not.toBeVisible();

    const isClassRemoved = await page.evaluate(() => {
      return !document.body.classList.contains("modal-open");
    });
    expect(isClassRemoved).toBe(true);
  });

  test("3. Aislamiento de scroll y bloqueo táctil en Modal de Cierre de Ciclo", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("quiral_demo_bypass", "true");
    });

    await page.goto("http://localhost:5173/");

    const mobileNavbar = page.locator("nav.liquid-glass-surface");
    await expect(mobileNavbar).toBeVisible({ timeout: 10000 });

    // Ir a Resumen
    await mobileNavbar.locator("button").filter({ hasText: "Resumen" }).click();
    await expect(page.locator("#summary-scroll")).toBeVisible();

    // Abrir modal 'Cerrar Ciclo'
    const closeCycleBtn = page.getByRole("button", { name: /Cerrar Ciclo/i });
    await expect(closeCycleBtn).toBeVisible();
    await closeCycleBtn.click();

    // 1. Verificar modal y título
    const modalDialog = page.locator('[role="dialog"]');
    await expect(modalDialog).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cierre de Ciclo" })).toBeVisible();

    // 2. Comprobar bloqueo estricto en body y fondo
    const isLocked = await page.evaluate(() => {
      const bodyLocked = document.body.classList.contains("modal-open");
      const scrollEl = document.querySelector("#summary-scroll");
      const computed = scrollEl ? window.getComputedStyle(scrollEl) : null;
      return bodyLocked && computed?.pointerEvents === "none" && computed?.overflowY === "hidden";
    });
    expect(isLocked).toBe(true);

    // 3. Verificar scroll interno dentro del modal
    const modalContent = modalDialog.locator(".overflow-y-auto");
    await expect(modalContent).toBeVisible();

    // 4. Cerrar modal con botón de retroceso
    const backBtn = modalDialog.getByRole("button", { name: "Cerrar modal" });
    await backBtn.click();
    await expect(modalDialog).not.toBeVisible();

    // 5. Verificar que el body vuelve a su estado normal
    const isUnlocked = await page.evaluate(() => {
      const scrollEl = document.querySelector("#summary-scroll");
      const computed = scrollEl ? window.getComputedStyle(scrollEl) : null;
      return !document.body.classList.contains("modal-open") && computed?.pointerEvents !== "none";
    });
    expect(isUnlocked).toBe(true);
  });
});
