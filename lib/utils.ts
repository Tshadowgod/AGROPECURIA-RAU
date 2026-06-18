import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "BOB"): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function formatHectares(value: number): string {
  return `${value.toLocaleString("es-BO", { minimumFractionDigits: 2 })} ha`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function isOverdue(dueDate: Date | string): boolean {
  return new Date(dueDate) < new Date();
}

/**
 * Estado efectivo de un pago. Una obligación no pagada cuyo vencimiento
 * ya pasó se considera VENCIDA aunque en la BD figure como PENDING.
 */
export function effectivePaymentStatus(
  status: string,
  dueDate: Date | string
): string {
  if (status === "PAID" || status === "OVERDUE") return status;
  if ((status === "PENDING" || status === "PARTIAL") && isOverdue(dueDate)) {
    return "OVERDUE";
  }
  return status;
}

export function daysUntilDue(dueDate: Date | string): number {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
