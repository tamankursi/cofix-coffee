import { siteConfig } from '../config/site';
import { getJakartaDate } from './date';
import { StoreOperationalSettings, StoreStatusMode } from '../types';

export interface OperationalStatus {
  isOpen: boolean;
  currentJakartaTime: string;
  openDisplay: string;
  openTime: string;
  closeTime: string;
  storeStatus: StoreStatusMode;
  reason?: string;
}

// Dev test simulation key (for testing scenarios)
const SIMULATED_TIME_KEY = 'cofix_simulated_hour';

export function setSimulatedHour(hour: number | null) {
  if (hour === null) {
    localStorage.removeItem(SIMULATED_TIME_KEY);
  } else {
    localStorage.setItem(SIMULATED_TIME_KEY, String(hour));
  }
  window.dispatchEvent(new Event('cofix_time_change'));
}

export function getSimulatedHour(): number | null {
  const val = localStorage.getItem(SIMULATED_TIME_KEY);
  return val !== null ? parseInt(val, 10) : null;
}

/**
 * Parses time string like "07:00" or "7:00" into { hours, minutes }
 */
export function parseTimeString(timeStr: string, defaultHour: number = 7, defaultMinute: number = 0): { hours: number; minutes: number } {
  if (!timeStr) return { hours: defaultHour, minutes: defaultMinute };
  const parts = timeStr.split(':').map((p) => parseInt(p.trim(), 10));
  const hours = !isNaN(parts[0]) ? Math.max(0, Math.min(23, parts[0])) : defaultHour;
  const minutes = parts.length > 1 && !isNaN(parts[1]) ? Math.max(0, Math.min(59, parts[1])) : defaultMinute;
  return { hours, minutes };
}

/**
 * Checks if COFIX is currently within operational hours in Asia/Jakarta (WIB)
 */
export function checkOperationalHours(settings?: StoreOperationalSettings | null): OperationalStatus {
  const jkt = getJakartaDate();
  const simulatedHour = getSimulatedHour();

  const currentHour = simulatedHour !== null ? simulatedHour : jkt.getHours();
  const currentMinute = simulatedHour !== null ? 0 : jkt.getMinutes();

  // Use dynamic settings if provided, else fallback to siteConfig default
  const openTime = settings?.openTime || `${String(siteConfig.jamOperasional.openHour).padStart(2, '0')}:00`;
  const closeTime = settings?.closeTime || `${String(siteConfig.jamOperasional.closeHour).padStart(2, '0')}:00`;
  const storeStatus: StoreStatusMode = settings?.storeStatus || 'auto';

  const { hours: openHour, minutes: openMinute } = parseTimeString(openTime, siteConfig.jamOperasional.openHour, 0);
  const { hours: closeHour, minutes: closeMinute } = parseTimeString(closeTime, siteConfig.jamOperasional.closeHour, 0);

  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const openTotalMinutes = openHour * 60 + openMinute;
  const closeTotalMinutes = closeHour * 60 + closeMinute;

  let isOpen = false;
  let reason = '';

  // Rule 6: If admin chose "Tutup sementara", store is IMMEDIATELY closed
  if (storeStatus === 'temporary_closed') {
    isOpen = false;
    reason = 'Kedai sedang tutup sementara';
  } else {
    // Rule 5: Automatic based on schedule (07:00-21:00 or custom)
    if (openTotalMinutes < closeTotalMinutes) {
      // Normal daytime schedule (e.g., 07:00 to 21:00)
      isOpen = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
    } else if (openTotalMinutes > closeTotalMinutes) {
      // Overnight schedule (e.g., 18:00 to 02:00)
      isOpen = currentTotalMinutes >= openTotalMinutes || currentTotalMinutes < closeTotalMinutes;
    } else {
      // Same open and close minute (effectively closed or 24h depending on definition)
      isOpen = false;
    }

    const openFormatted = `${String(openHour).padStart(2, '0')}.${String(openMinute).padStart(2, '0')}`;
    const closeFormatted = `${String(closeHour).padStart(2, '0')}.${String(closeMinute).padStart(2, '0')}`;

    reason = isOpen
      ? 'Kedai sedang buka'
      : `Kedai tutup. Buka kembali pukul ${openFormatted} WIB`;
  }

  const hoursStr = String(currentHour).padStart(2, '0');
  const minsStr = String(currentMinute).padStart(2, '0');
  const openDisplay = `${openTime.replace(':', '.')} – ${closeTime.replace(':', '.')} WIB`;

  return {
    isOpen,
    currentJakartaTime: `${hoursStr}.${minsStr} WIB`,
    openDisplay,
    openTime,
    closeTime,
    storeStatus,
    reason,
  };
}

export type ProductButtonState = {
  text: 'Tambah ke keranjang' | 'Yah lagi abis' | 'Yah lagi tutup';
  disabled: boolean;
  statusType: 'available' | 'out_of_stock' | 'closed';
};

/**
 * Evaluates the EXACT 3 conditions required:
 * 1. Within hours + stock > 0 => "Tambah ke keranjang" (Active)
 * 2. Within hours + stock <= 0 => "Yah lagi abis" (Disabled)
 * 3. Outside hours or temporary closed => "Yah lagi tutup" (Disabled, priority over stock)
 */
export function getProductButtonState(stock: number, settings?: StoreOperationalSettings | null): ProductButtonState {
  const { isOpen } = checkOperationalHours(settings);

  // Condition 3: Outside operational hours or temporarily closed (highest priority)
  if (!isOpen) {
    return {
      text: 'Yah lagi tutup',
      disabled: true,
      statusType: 'closed',
    };
  }

  // Condition 2: Inside hours, but stock is 0
  if (stock <= 0) {
    return {
      text: 'Yah lagi abis',
      disabled: true,
      statusType: 'out_of_stock',
    };
  }

  // Condition 1: Inside hours and stock available
  return {
    text: 'Tambah ke keranjang',
    disabled: false,
    statusType: 'available',
  };
}
