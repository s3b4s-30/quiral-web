export function formatCOP(value: number): string {
  return "$" + Math.round(value).toLocaleString("es-CO");
}

export function parseCOPInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

