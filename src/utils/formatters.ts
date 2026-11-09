/**
 * Kenyan Business Utility Formatters and Validators
 */

/**
 * Format numbers as Kenyan Shillings (KES)
 * @example formatKES(1500) => "KES 1,500.00"
 */
export function formatKES(amount: number | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'KES 0.00';
  }
  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);

  return `KES ${formatted}`;
}

/**
 * Normalise and format Kenyan phone numbers into standard international format (+254 7xx xxx xxx)
 */
export function formatKenyanPhone(phone: string): string {
  if (!phone) return '';
  // strip all non-digits except +
  let cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }

  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return `+254 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

/**
 * Validate standard Kenyan mobile numbers (Safaricom, Airtel, Telkom)
 */
export function isValidKenyanPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  // Matches 07xxxxxxxx, 01xxxxxxxx, 2547xxxxxxxx, 2541xxxxxxxx
  return /^(?:254|0)[17]\d{8}$/.test(digits);
}

/**
 * Validate KRA PIN format: 1 letter + 9 digits + 1 letter (e.g. P051234567Z or A001234567B)
 */
export function isValidKRAPIN(pin: string): boolean {
  if (!pin) return false;
  return /^[A-Za-z]\d{9}[A-Za-z]$/.test(pin.trim());
}

/**
 * Format date for Kenyan business documents
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return dateString.toString();

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format datetime with timestamp
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return dateString.toString();

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Generate simulated M-Pesa transaction reference (10 alphanumeric chars, e.g. QLK78294HJ)
 */
export function generateMPesaRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'Q';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate WhatsApp share link for receipt or invoice
 */
export function generateWhatsAppShareLink(phone: string, text: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

/**
 * Kenyan 47 Counties list with major trading hubs
 */
export const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kiambu',
  'Nakuru',
  'Machakos',
  'Kisumu',
  'Uasin Gishu (Eldoret)',
  'Kajiado',
  'Kilifi',
  'Meru',
  'Nyeri',
  'Kakamega',
  'Bungoma',
  'Kisii',
  'Murang\'a',
  'Kericho',
  'Bomet',
  'Embu',
  'Kitui',
  'Laikipia',
  'Makueni',
  'Trans Nzoia (Kitale)',
  'Garissa',
  'Narok',
  'Kwale',
  'Nandi',
  'Siaya',
  'Homa Bay',
  'Migori',
  'Vihiga',
  'Busia',
  'Baringo',
  'Nyandarua',
  'Kirinyaga',
  'Isiolo',
  'Marsabit',
  'Mandera',
  'Wajir',
  'Turkana',
  'West Pokot',
  'Samburu',
  'Elgeyo Marakwet',
  'Tharaka-Nithi',
  'Taita Taveta',
  'Tana River',
  'Lamu',
  'Wajir'
];
