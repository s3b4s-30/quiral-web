import { Closure, Product, Sale, Supplier } from "../types/domain";

export const DEMO_STORE_ID = "00000000-0000-0000-0000-000000000030";

export function generateDemoSeed() {
  const supplierNames = [
    "Distribuidora Apple Miami",
    "Importadora Shenzhen Direct",
    "Mayorista Audio & Cases Cartagena",
    "Perfumería Árabe & Diseñador",
    "Anker Oficial Colombia",
    "Proveedora Digital Streaming",
  ];

  const colors = ["#007AFF", "#AF52DE", "#28CD41", "#FF9500", "#5AC8FA", "#FF3B30"];

  const suppliers: Supplier[] = supplierNames.map((name, i) => ({
    id: `demo-sup-${i + 1}`,
    name,
    phone: `+57 3${10 + i} 555 ${String((i + 1) * 123).padStart(4, "0")}`,
    color: colors[i],
  }));

  const productNames = [
    "iPhone 15 Pro Max 256GB", "iPhone 15 Pro 128GB", "iPhone 14 Pro Max 256GB", "iPhone 14 128GB",
    "iPhone 13 128GB", "iPhone 12 64GB", "iPhone 11 64GB", "Samsung Galaxy S24 Ultra",
    "Cubo Cargador iPhone 20W Original", "Cubo Anker 30W GaN", "Cargador Doble USB-C 35W",
    "Cable USB-C a Lightning MFi 1m", "Cable USB-C Trenzado 60W 2m", "Batería MagSafe Apple", "Cargador Inalámbrico MagSafe 15W",
    "AirPods Pro 2da Gen USB-C", "AirPods 3ra Gen", "EarPods Lightning", "EarPods USB-C",
    "AirTag Individual", "Pack x4 AirTags", "Apple Pencil USB-C",
    "Vidrio Cerámico Privacidad iPhone 13/14/15/16 Pro Max", "Case Silicona MagSafe Con Logo iPhone 15",
    "Case Silicona MagSafe Con Logo iPhone 14", "Case Transparente MagSafe Anti-Amarilleo", "Protector de Lentes Cámara Zafiro",
    "Sauvage Dior 100ml EDP", "Bleu de Chanel 100ml", "Lattafa Khamrah 100ml", "Al Haramain Amber Oud", "YSL Y EDP 100ml",
    "Cuenta Netflix 4K (Perfil 1 Mes)", "Spotify Premium 3 Meses", "Disney+ Estándar"
  ];

  const products: Product[] = productNames.map((name, index) => {
    const i = index + 1;
    let category: Product["category"];
    let price: number;
    let cost: number;
    let subtitle: string;

    if (i <= 8) {
      category = "Celulares";
      price = 1800000 + i * 220000;
      cost = Math.round(price * 0.72);
      subtitle = "Equipo homologado libre";
    } else if (i <= 15) {
      category = "Cargadores y Cables";
      price = 45000 + (i - 8) * 12000;
      cost = Math.round(price * 0.48);
      subtitle = "Carga rápida certificada";
    } else if (i <= 22) {
      category = "Audio / AirPods";
      price = 65000 + (i - 15) * 55000;
      cost = Math.round(price * 0.55);
      subtitle = "Sonido de alta definición";
    } else if (i <= 27) {
      category = "Forros / Fundas";
      price = 25000 + (i - 22) * 8000;
      cost = Math.round(price * 0.4);
      subtitle = "Protección grado militar";
    } else if (i <= 32) {
      category = "Perfumes";
      price = 180000 + (i - 27) * 45000;
      cost = Math.round(price * 0.6);
      subtitle = "Fragancia original sellada";
    } else {
      category = "Streaming";
      price = 28000 + (i - 32) * 11000;
      cost = Math.round(price * 0.35);
      subtitle = "Activación inmediata";
    }

    const stockA = [6, 19, 27].includes(i) ? 0 : [4, 8, 22].includes(i) ? 2 : 16 + (i % 9);
    const stockB = [6, 19, 27].includes(i) ? 0 : 7 + (i % 6);

    return {
      id: `demo-prod-${i}`,
      name,
      category,
      subtitle,
      price,
      warrantyDays: i <= 8 ? 90 : i > 32 ? 30 : 60,
      createdAt: "2026-07-01T08:00:00Z",
      batches: [
        {
          id: `demo-batch-${i}-a`,
          supplierId: suppliers[((i - 1) % 6)].id,
          cost,
          stock: stockA,
        },
        {
          id: `demo-batch-${i}-b`,
          supplierId: suppliers[i % 6].id,
          cost: Math.round(cost * 1.05),
          stock: stockB,
        },
      ],
    };
  });

  const customerNames = [
    "Santiago Restrepo", "Cliente General", "Ana Morales", "Carlos Gómez", "Laura Pérez",
    "Andrés Rodríguez", "Valentina Ríos", "Mateo Henao", "Camila Ortiz", "Felipe Castro",
    "Sofía Jaramillo", "Daniela Ospina", "Alejandro Quintero", "Mariana Londoño", "Sebastián Mejía"
  ];

  const sales: Sale[] = [];
  const baseStart = new Date("2026-07-01T10:00:00-05:00").getTime();
  const recentStart = new Date("2026-10-21T09:15:00-05:00").getTime();

  for (let i = 1; i <= 118; i++) {
    const isRecent = i >= 96; // 23 ventas en el Ciclo Actual reciente
    const saleTimestamp = isRecent
      ? recentStart + (i - 96) * 3.5 * 3600000 + (i % 5) * 17 * 60000
      : baseStart + (i - 1) * 28 * 3600000 + (i % 7) * 23 * 60000;

    const saleDate = new Date(saleTimestamp).toISOString();
    const pIdx = ((i - 1) % productNames.length);
    const sIdx = ((i - 1) % customerNames.length);
    const product = products[pIdx];

    const isWarranty = [9, 21, 35, 48, 62, 77, 89, 102, 110, 115].includes(i);
    const warrantyNote = isWarranty
      ? i % 3 === 0
        ? "Falla en conector de carga verificado en taller."
        : i % 3 === 1
        ? "Defecto de audio en auricular izquierdo."
        : "Botón lateral con respuesta intermitente."
      : undefined;

    const qty = 1 + (i % 2);
    const unitPrice = pIdx < 8 ? 2100000 : 55000 + (pIdx % 8) * 15000;
    const unitCostSnapshot = pIdx < 8 ? 1550000 : 32000 + (pIdx % 8) * 9000;

    sales.push({
      id: `demo-sale-${i}`,
      saleNumber: 1000 + i,
      customerName: customerNames[sIdx],
      note: i % 7 === 0 ? "Descuento cliente frecuente aplicado." : undefined,
      paymentMethod: i % 3 === 0 ? "Nequi" : i % 3 === 1 ? "Efectivo" : "Bancolombia",
      totalAmount: qty * unitPrice,
      createdAt: saleDate,
      items: [
        {
          id: `demo-item-${i}-1`,
          productId: product.id,
          productName: product.name,
          qty,
          unitPrice,
          unitCostSnapshot,
          batchId: `demo-batch-${pIdx + 1}-a`,
          warrantyDays: product.warrantyDays,
          warrantyClaimed: isWarranty,
          warrantyClaimNote: warrantyNote,
        },
      ],
    });
  }

  // Ordenar ventas descendente por fecha
  sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const closureLabels = [
    "1 de jul. – 15 de jul. 2026", "16 de jul. – 31 de jul. 2026",
    "1 de ago. – 15 de ago. 2026", "16 de ago. – 31 de ago. 2026",
    "1 de sep. – 15 de sep. 2026", "16 de sep. – 30 de sep. 2026",
    "1 de oct. – 10 de oct. 2026", "11 de oct. – 20 de oct. 2026"
  ];

  const closureDates = [
    "2026-07-15T20:00:00-05:00", "2026-07-31T20:00:00-05:00",
    "2026-08-15T20:00:00-05:00", "2026-08-31T20:00:00-05:00",
    "2026-09-15T20:00:00-05:00", "2026-09-30T20:00:00-05:00",
    "2026-10-10T20:00:00-05:00", "2026-10-20T20:00:00-05:00"
  ];

  const closures: Closure[] = closureLabels.map((periodLabel, idx) => {
    const i = idx + 1;
    const closedAt = closureDates[idx];
    const totalSold = 2400000 + i * 210000;
    const netProfit = 980000 + i * 95000;

    return {
      id: `demo-cycle-${i}`,
      periodLabel,
      closedAt,
      totalSold,
      netProfit,
      recoveredInvestment: 1420000 + i * 115000,
      remainingStockInvestment: 4850000 + i * 40000,
      expectedCash: totalSold,
      realCashReported: totalSold - (i % 3) * 10000,
      differenceNote: i % 2 === 0 ? "Arqueo exacto sin descuadre reportado." : "Diferencia menor de $10.000 por cambio en efectivo.",
      topSellers: [
        {
          id: products[((i - 1) % 15)].id,
          name: products[((i - 1) % 15)].name,
          qty: 10 + i,
          revenue: 650000 + i * 25000,
          profit: 280000 + i * 14000,
        },
        {
          id: products[((i + 3) % 15)].id,
          name: products[((i + 3) % 15)].name,
          qty: 7 + i,
          revenue: 480000 + i * 18000,
          profit: 190000 + i * 11000,
        },
      ],
      topReturned: i % 2 === 0 ? [
        {
          id: products[8].id,
          name: products[8].name,
          qty: 1,
          notes: ["Cambio inmediato de cable por garantía."],
        }
      ] : [],
    };
  });

  // Ordenar cierres descendente por fecha
  closures.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime());

  return { suppliers, products, sales, closures };
}

