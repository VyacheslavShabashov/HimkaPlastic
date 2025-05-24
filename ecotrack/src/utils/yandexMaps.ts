import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Yandex Maps API key
const YANDEX_MAPS_API_KEY = process.env.YANDEX_MAPS_API_KEY || '8cd50efd-1a88-46d3-821a-643cbfcc250a';

// Константа с адресом ООО Химка пластик
export const HIMKA_PLASTIC_ADDRESS = "Заводская ул. 2А корп.28 Химки";

// Яндекс-координаты завода (можно использовать как запасной вариант)
export const HIMKA_PLASTIC_COORDINATES = [55.906336, 37.429674]; // [широта, долгота]

// Yandex Maps API base URL для геокодирования (HTTP Геокодер)
const YANDEX_GEOCODE_API_URL = 'https://geocode-maps.yandex.ru/1.x';
// Yandex Maps JavaScript API v3 base URL
const YANDEX_MAPS_JS_API_URL = 'https://api-maps.yandex.ru/v3';

/**
 * Get geocode information for an address
 * @param address Address to geocode
 * @returns Promise with geocoding results
 */
export async function geocodeAddress(address: string) {
  try {
    const response = await axios.get(YANDEX_GEOCODE_API_URL, {
      params: {
        apikey: YANDEX_MAPS_API_KEY,
        geocode: address,
        format: 'json'
      }
    });
    
    if (!response.data || !response.data.response) {
      console.error('Invalid geocode response format:', response.data);
      throw new Error('Invalid geocode response format');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error geocoding address:', error);
    // Проверка на ошибки сети
    if (axios.isAxiosError(error) && !error.response) {
      console.error('Network error - could not connect to Yandex API');
      throw new Error('Could not connect to geocoding service');
    }
    
    // Проверка на ошибки API
    if (axios.isAxiosError(error) && error.response) {
      console.error(`API error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
      throw new Error(`Geocoding API error: ${error.response.status}`);
    }
    
    throw new Error('Failed to geocode address');
  }
}

/**
 * Calculate distance between two addresses
 * @param fromAddress Starting address
 * @param toAddress Destination address
 * @returns Promise with the calculated distance in km
 */
export async function calculateDistance(fromAddress: string, toAddress: string) {
  try {
    // First geocode both addresses to get coordinates
    const fromGeocode = await geocodeAddress(fromAddress);
    const toGeocode = await geocodeAddress(toAddress);
    
    if (!fromGeocode.response?.GeoObjectCollection?.featureMember?.length || 
        !toGeocode.response?.GeoObjectCollection?.featureMember?.length) {
      console.error('Could not geocode addresses properly', { fromGeocode, toGeocode });
      throw new Error('Could not geocode one or both addresses');
    }
    
    // Get the coordinates from the geocoder response
    const fromPoint = fromGeocode.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
    const toPoint = toGeocode.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
    
    // Convert coordinates format from "longitude latitude" to [latitude, longitude]
    const fromCoords = [parseFloat(fromPoint[1]), parseFloat(fromPoint[0])];
    const toCoords = [parseFloat(toPoint[1]), parseFloat(toPoint[0])];
    
    console.log('Calculating distance between coordinates:', {
      fromCoords,
      toCoords,
      fromAddress,
      toAddress
    });
    
    // Поскольку у нас нет прямого доступа к маршрутному API из бэкенда,
    // используем формулу гаверсинуса для расчета расстояния
    const distance = calculateHaversineDistance(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
    
    return distance;
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw new Error('Failed to calculate distance between addresses');
  }
}

/**
 * Calculate the "as the crow flies" distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  // Add 20% to account for actual road distance being longer than direct distance
  return distance * 1.2;
}

/**
 * Get region information from an address
 * @param address Address to analyze
 * @returns Promise with the region name
 */
export async function getRegionFromAddress(address: string) {
  try {
    const geocodeResult = await geocodeAddress(address);
    
    if (!geocodeResult.response?.GeoObjectCollection?.featureMember?.length) {
      console.error('No geocode results found for address:', address);
      throw new Error('Could not geocode address');
    }
    
    // Extract region information from response
    const geoObject = geocodeResult.response.GeoObjectCollection.featureMember[0].GeoObject;
    const addressDetails = geoObject.metaDataProperty.GeocoderMetaData.Address.Components;
    
    // Find the region component (kind: province is usually the region in Russia)
    const region = addressDetails.find((comp: any) => comp.kind === 'province')?.name;
    
    // Если не нашли регион, попробуем найти другую административную единицу
    if (!region) {
      // Проверяем, есть ли в адресе упоминание города или района
      const locality = addressDetails.find((comp: any) => 
        comp.kind === 'locality' || 
        comp.kind === 'area' || 
        comp.kind === 'district'
      )?.name;
      
      if (locality) {
        console.log(`Определен населенный пункт для адреса "${address}": ${locality}`);
        return locality;
      }
      
      // Если вообще ничего не нашли, вернем хотя бы первый компонент адреса
      const firstComponent = addressDetails[0]?.name;
      if (firstComponent) {
        return firstComponent;
      }
      
      // Если и это не сработало, проверим текст адреса на известные названия регионов
      return fallbackGetRegionFromAddress(address);
    }
    
    console.log(`Определен регион для адреса "${address}": ${region}`);
    return region;
  } catch (error) {
    console.error('Error getting region from address:', error);
    // Fallback to simple text search from the original function
    return fallbackGetRegionFromAddress(address);
  }
}

/**
 * Generate HTML script tag for Yandex Maps API
 * @returns HTML script tag with API key
 */
export function getYandexMapsApiScript() {
  return `<script src="https://api-maps.yandex.ru/v3/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU"></script>`;
}

/**
 * Fallback function to determine region from address string
 * Used when API calls fail
 */
function fallbackGetRegionFromAddress(address: string): string {
  console.log(`Используется резервный метод определения региона для адреса: ${address}`);
  const addressLower = address.toLowerCase();
  
  // Сначала проверяем на конкретные города
  if (addressLower.includes("москва") || addressLower.includes("moscow")) {
    return "Москва";
  } else if (addressLower.includes("химки")) {
    return "Московская область";
  } else if (addressLower.includes("санкт-петербург") || addressLower.includes("saint petersburg") || addressLower.includes("st. petersburg")) {
    return "Санкт-Петербург";
  } else if (addressLower.includes("екатеринбург") || addressLower.includes("ekaterinburg")) {
    return "Екатеринбург";
  } else if (addressLower.includes("новосибирск") || addressLower.includes("novosibirsk")) {
    return "Новосибирск";
  }
  
  // Если город не определен, проверяем на регионы или области
  if (addressLower.includes("московская") && addressLower.includes("област")) {
    return "Московская область";
  } else if (addressLower.includes("ленинградская") && addressLower.includes("област")) {
    return "Ленинградская область";
  } else if (addressLower.includes("свердловская") && addressLower.includes("област")) {
    return "Свердловская область";
  }
  
  // Если не нашли соответствий, возвращаем более информативное название
  return "Центральный регион";
}