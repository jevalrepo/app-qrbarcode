export type QRType =
  | 'url'
  | 'email'
  | 'phone'
  | 'wifi'
  | 'vcard'
  | 'geo'
  | 'sms'
  | 'product'
  | 'text';

export function detectType(data: string): QRType {
  if (/^(https?:\/\/|www\.)/i.test(data)) return 'url';
  if (/^mailto:/i.test(data) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) return 'email';
  if (/^tel:/i.test(data) || /^\+?[\d\s\-().]{7,20}$/.test(data)) return 'phone';
  if (/^WIFI:/i.test(data)) return 'wifi';
  if (/^BEGIN:VCARD/i.test(data)) return 'vcard';
  if (/^geo:/i.test(data)) return 'geo';
  if (/^smsto?:/i.test(data) || /^sms:/i.test(data)) return 'sms';
  if (/^\d{8,14}$/.test(data.trim())) return 'product';
  return 'text';
}

export function getTypeLabel(type: QRType): string {
  const labels: Record<QRType, string> = {
    url: 'Enlace web',
    email: 'Correo',
    phone: 'Teléfono',
    wifi: 'Red WiFi',
    vcard: 'Contacto',
    geo: 'Ubicación',
    sms: 'SMS',
    product: 'Producto',
    text: 'Texto',
  };
  return labels[type];
}

export function getTypeIcon(type: QRType): string {
  const icons: Record<QRType, string> = {
    url: 'globe-outline',
    email: 'mail-outline',
    phone: 'call-outline',
    wifi: 'wifi-outline',
    vcard: 'person-outline',
    geo: 'location-outline',
    sms: 'chatbubble-outline',
    product: 'barcode-outline',
    text: 'document-text-outline',
  };
  return icons[type];
}

export function getTypeColor(type: QRType, accent = '#00C896'): string {
  const colors: Record<QRType, string> = {
    url: accent,
    email: '#378ADD',
    phone: '#639922',
    wifi: '#7F77DD',
    vcard: '#D4537E',
    geo: '#EF9F27',
    sms: '#30B8D8',
    product: '#D85A30',
    text: '#888780',
  };
  return colors[type];
}

export function parseWifi(data: string): { ssid: string; password: string; security: string } {
  const ssid = data.match(/S:([^;]+)/)?.[1] ?? '';
  const password = data.match(/P:([^;]+)/)?.[1] ?? '';
  const security = data.match(/T:([^;]+)/)?.[1] ?? 'nopass';
  return { ssid, password, security };
}
