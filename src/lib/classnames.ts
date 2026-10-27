type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean | number | string | undefined | null };

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const item of classes) {
    if (!item) continue;

    if (typeof item === 'string' || typeof item === 'number') {
      result.push(String(item));
    } else if (typeof item === 'object') {
      for (const key in item) {
        if (item[key]) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
}
