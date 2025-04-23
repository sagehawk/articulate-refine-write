
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
