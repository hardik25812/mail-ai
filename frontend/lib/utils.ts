import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from a name (up to 2 characters)
 * @param name The full name to extract initials from
 * @returns The first letter of the first and last word
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // If there's only one word, return the first two characters
    return (words[0].substring(0, 2) || '?').toUpperCase();
  }
  
  // Otherwise, return the first character of the first and last word
  const firstInitial = words[0][0] || '?';
  const lastInitial = words[words.length - 1][0] || '?';
  
  return (firstInitial + lastInitial).toUpperCase();
}
