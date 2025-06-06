
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSmartDecimal(num: number): string {
  // Check if the number has more than 2 decimal places
  const hasMoreThanTwoDecimals = (num * 100) % 1 !== 0;
  
  if (hasMoreThanTwoDecimals) {
    // Truncate to 2 decimal places without rounding
    const truncated = Math.floor(num * 100) / 100;
    return truncated.toFixed(2);
  }
  
  // Return as-is for numbers with 2 or fewer decimal places
  return num.toString();
}

export function formatIndianNumberSmart(num: number): string {
  const smartFormatted = formatSmartDecimal(num);
  const numValue = parseFloat(smartFormatted);
  return numValue.toLocaleString('en-IN');
}
