export function formatCOP(value: number): string {
  return "$" + Math.round(value).toLocaleString("es-CO");
}

export function parseCOPInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export interface WarrantyStatus {
  status: "active" | "expired" | "claimed";
  label: string;
  remainingDays: number;
  elapsedDays: number;
  progressPct: number;
}

export function getWarrantyStatus(
  saleDateISO: string,
  warrantyDays: number = 15,
  warrantyClaimed: boolean = false,
): WarrantyStatus {
  const saleDate = new Date(saleDateISO);
  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - saleDate.getTime());
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, warrantyDays - elapsedDays);
  const progressPct =
    warrantyDays > 0 ? Math.min(100, Math.round((remainingDays / warrantyDays) * 100)) : 0;

  if (warrantyClaimed) {
    return {
      status: "claimed",
      label: "Garantía Aplicada",
      remainingDays,
      elapsedDays,
      progressPct,
    };
  }

  if (remainingDays <= 0) {
    return {
      status: "expired",
      label: "Garantía Vencida",
      remainingDays: 0,
      elapsedDays,
      progressPct: 0,
    };
  }

  return {
    status: "active",
    label: `${remainingDays} de ${warrantyDays} días restantes`,
    remainingDays,
    elapsedDays,
    progressPct,
  };
}

