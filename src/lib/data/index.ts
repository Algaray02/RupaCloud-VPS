/**
 * Titik masuk data layer.
 *
 * - Server Components / API Routes  → liveDataSource (Prisma, aman di Node.js)
 * - Client Components ("use client") → clientDataSource (fetch, aman di browser)
 *
 * Untuk kemudahan, ekspor `dataSource` masih ada agar kode lama tetap
 * compatible; tapi ia sekarang SELALU mengarah ke clientDataSource agar
 * tidak pernah membundel Prisma ke browser.
 *
 * Server-side code sebaiknya mengimport langsung dari "@/lib/data/live"
 * atau menggunakan Prisma via "@/lib/prisma".
 */
import { clientDataSource } from "./client";
import { DataSourceContract } from "./types";

export const dataSource: DataSourceContract = clientDataSource;

export * from "./types";
