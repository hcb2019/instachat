export function ensureDatabaseWrite(error: unknown, operation: string): void {
  if (error) throw new Error(`Não foi possível ${operation}.`);
}
