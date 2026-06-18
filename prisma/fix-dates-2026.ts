/**
 * Actualiza la base de datos de producción: desplaza +2 años las fechas
 * de gestión 2023→2025 y 2024→2026 en todas las entidades visibles en
 * los paneles (admin, contador, cliente). Idempotente: solo toca años
 * 2023/2024, así que volver a ejecutarlo no vuelve a desplazar.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Cargar DATABASE_URL desde .env (ts-node no lo hace automáticamente)
function loadEnv() {
  if (process.env.DATABASE_URL) return;
  const envPath = join(__dirname, "..", ".env");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/);
    if (m) {
      let v = m[1].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env.DATABASE_URL = v.replace(/^﻿/, "");
    }
  }
}
loadEnv();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

/** Desplaza +2 años una fecha solo si su año (UTC) es 2023 o 2024. */
function shift(d: Date | null | undefined): Date | null | undefined {
  if (!d) return d;
  const y = d.getUTCFullYear();
  if (y === 2023 || y === 2024) {
    return new Date(
      Date.UTC(y + 2, d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())
    );
  }
  return d;
}

function bumpYearInText(s: string | null | undefined): string | null | undefined {
  if (!s) return s;
  return s.replace(/\b2024\b/g, "2026").replace(/\b2023\b/g, "2025");
}

async function main() {
  let changes = 0;

  // 1. Tasas tributarias: year 2024 -> 2026, 2023 -> 2025
  for (const year of [2024, 2023]) {
    const res = await prisma.tributaryRate.updateMany({
      where: { year },
      data: { year: year + 2 },
    });
    if (res.count) { console.log(`✓ tributaryRate year ${year}->${year + 2}: ${res.count}`); changes += res.count; }
  }

  // 2. Cálculos RAU: gestion + dueDate + approvedAt
  const calcs = await prisma.rauCalculation.findMany();
  for (const c of calcs) {
    const data: Record<string, unknown> = {};
    if (c.gestion === 2024) data.gestion = 2026;
    else if (c.gestion === 2023) data.gestion = 2025;
    const nd = shift(c.dueDate); if (nd && nd !== c.dueDate) data.dueDate = nd;
    const na = shift(c.approvedAt); if (na && na !== c.approvedAt) data.approvedAt = na;
    if (Object.keys(data).length) {
      await prisma.rauCalculation.update({ where: { id: c.id }, data });
      console.log(`✓ rauCalculation ${c.id}: ${JSON.stringify(data)}`); changes++;
    }
  }

  // 3. Pagos: dueDate + paymentDate + receiptNumber
  const pays = await prisma.payment.findMany();
  for (const p of pays) {
    const data: Record<string, unknown> = {};
    const nd = shift(p.dueDate); if (nd && nd !== p.dueDate) data.dueDate = nd;
    const np = shift(p.paymentDate); if (np && np !== p.paymentDate) data.paymentDate = np;
    const nr = bumpYearInText(p.receiptNumber); if (nr && nr !== p.receiptNumber) data.receiptNumber = nr;
    if (Object.keys(data).length) {
      await prisma.payment.update({ where: { id: p.id }, data });
      console.log(`✓ payment ${p.id}: ${JSON.stringify(data)}`); changes++;
    }
  }

  // 4. Documentos: nombres con "Gestión 2024" etc.
  const docs = await prisma.document.findMany();
  for (const d of docs) {
    const nn = bumpYearInText(d.name);
    if (nn && nn !== d.name) {
      await prisma.document.update({ where: { id: d.id }, data: { name: nn } });
      console.log(`✓ document ${d.id}: ${d.name} -> ${nn}`); changes++;
    }
  }

  // 4b. Propiedades: registrationNum + tituloPropiedad
  const props = await prisma.property.findMany();
  for (const pr of props) {
    const data: Record<string, unknown> = {};
    const nr = bumpYearInText(pr.registrationNum); if (nr && nr !== pr.registrationNum) data.registrationNum = nr;
    const nt = bumpYearInText(pr.tituloPropiedad); if (nt && nt !== pr.tituloPropiedad) data.tituloPropiedad = nt;
    if (Object.keys(data).length) {
      await prisma.property.update({ where: { id: pr.id }, data });
      console.log(`✓ property ${pr.id}: ${JSON.stringify(data)}`); changes++;
    }
  }

  // 5. Notificaciones: title + message
  const notifs = await prisma.notification.findMany();
  for (const n of notifs) {
    const data: Record<string, unknown> = {};
    const nt = bumpYearInText(n.title); if (nt && nt !== n.title) data.title = nt;
    const nm = bumpYearInText(n.message); if (nm && nm !== n.message) data.message = nm;
    if (Object.keys(data).length) {
      await prisma.notification.update({ where: { id: n.id }, data });
      console.log(`✓ notification ${n.id}: ${JSON.stringify(data)}`); changes++;
    }
  }

  console.log(`\n✅ Listo. ${changes} registros actualizados (2023→2025, 2024→2026).`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
