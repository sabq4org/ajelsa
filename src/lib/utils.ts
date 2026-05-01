/**
 * Generic utility helpers
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function arabicSlug(text: string): string {
  // Slugify supports Arabic with locale 'ar'
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    locale: "ar",
  });
}

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const arabicDays = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export function formatArabicDate(date: Date | string | number): string {
  const d = new Date(date);
  return `${arabicDays[d.getDay()]} ${d.getDate()} ${arabicMonths[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);

  if (diff < 60) return "الآن";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;
  return formatArabicDate(d);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function arabicOrdinal(n: number): string {
  const arabic = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
  return arabic[n - 1] ?? n.toString();
}

export function readingTimeMinutes(text: string): number {
  // Average Arabic reading speed: ~180 words/min
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerpt(text: string, maxLength = 200): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}
