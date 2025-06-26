export function roundToDecimals(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function calculatePercentage(value: number, percentage: number): number {
  return value * (percentage / 100);
}

export function isInteger(value: number): boolean {
    return value % 1 === 0;
}
