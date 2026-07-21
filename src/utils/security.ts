export function sanitizeHomeKitName(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/gu, '').trim().slice(0, 64) || 'Persistent Alarm';
}
