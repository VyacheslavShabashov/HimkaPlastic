import axios from 'axios';

const YANDEX_API_KEY = process.env.REACT_APP_YANDEX_API_KEY || 'your-api-key';
const GEOCODE_URL = 'https://geocode-maps.yandex.ru/1.x';
const ROUTE_URL = 'https://api-maps.yandex.ru/services/route/2.0';

// Define types for Yandex API responses
interface YandexRouteResponse {
  routes?: Array<{
    legs?: Array<{
      distance?: {
        value?: number;
      };
    }>;
  }>;
}

interface YandexGeocodeResponse {
  response?: {
    GeoObjectCollection?: {
      featureMember?: Array<{
        GeoObject?: {
          Point?: {
            pos?: string;
          };
        };
      }>;
    };
  };
}

// API типы для backend и frontend
export interface User {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  inn?: string;
  kpp?: string;
  billingAddress?: string;
  /**
   * Hashed password for authentication. Optional because the client
   * never receives it from the server.
   */
  passwordHash?: string;
  /**
   * Secret used for TOTP multi‑factor authentication.
   */
  totpSecret?: string;
  isAdmin: boolean;
  dashboardSettings: string; // JSON строка с настройками
}

export interface Order {
  id: string;
  userId: string;
  materialType: string;
  volume: number;
  pickupAddress: string;
  price: number;
  status: string;
  paymentStatus?: string;
  environmentalImpact: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface MarketRate {
  id: string;
  materialType: string;
  pricePerKg: number;
  logisticsCostPerKm: number;
}

export interface PriceCalculation {
  basePrice: number;
  logisticsCost: number;
  customsDuty: number;
  environmentalTax: number;
  distance: number;
  region: string;
  totalPrice: number;
  environmentalImpact: number;
  price: number;
}

export interface FinancialReport {
  id: string;
  month: number;
  year: number;
  totalPaid: number;
  volume: number;
  monthName: string;
}

export interface Analytics {
  totalOrders: number;
  totalEarnings: number;
  totalEnvironmentalImpact: number;
  recycledByMaterial: Record<string, number>;
  ordersByStatus: Record<string, number>;
  monthlyEarnings: number[];
  yearlyVolume: Record<number, number>;
}

export async function calculateDistance(fromAddress: string, toAddress: string): Promise<number> {
  try {
    const fromCoords = await geocodeAddress(fromAddress);
    const toCoords = await geocodeAddress(toAddress);

    const response = await axios.get<YandexRouteResponse>(ROUTE_URL, {
      params: {
        apikey: YANDEX_API_KEY,
        waypoints: `${fromCoords.lat},${fromCoords.lng}|${toCoords.lat},${toCoords.lng}`,
        format: 'json',
      },
    });

    const distance = response.data?.routes?.[0]?.legs?.[0]?.distance?.value;

    if (typeof distance !== 'number') {
      throw new Error('Distance value is missing or invalid');
    }

    return distance / 1000; // Convert meters to kilometers
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw new Error('Failed to calculate distance');
  }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  try {
    const response = await axios.get<YandexGeocodeResponse>(GEOCODE_URL, {
      params: {
        apikey: YANDEX_API_KEY,
        geocode: address,
        format: 'json',
      },
    });

    const point = response.data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos;

    if (!point) {
      throw new Error('GeoObject or Point is missing in the response');
    }

    const [lng, lat] = point.split(' ').map(Number);
    return { lat, lng };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error('Failed to geocode address');
  }
}