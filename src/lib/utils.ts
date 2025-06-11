
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianNumber(num: number): string {
  if (num === 0) return '0';
  
  const numStr = Math.abs(num).toString();
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  
  if (otherNumbers !== '') {
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    return num < 0 ? '-' + formatted : formatted;
  } else {
    return num < 0 ? '-' + lastThree : lastThree;
  }
}
