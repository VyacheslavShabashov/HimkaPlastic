"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIMKA_PLASTIC_COORDINATES = exports.HIMKA_PLASTIC_ADDRESS = void 0;
exports.geocodeAddress = geocodeAddress;
exports.calculateDistance = calculateDistance;
exports.getRegionFromAddress = getRegionFromAddress;
exports.getYandexMapsApiScript = getYandexMapsApiScript;
exports.fallbackGetRegionFromAddress = fallbackGetRegionFromAddress;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Yandex Maps API key (must be provided via environment variable)
const YANDEX_MAPS_API_KEY = process.env.YANDEX_MAPS_API_KEY;
if (!YANDEX_MAPS_API_KEY) {
    throw new Error('YANDEX_MAPS_API_KEY environment variable is required');
}
// Константа с адресом ООО Химка пластик
exports.HIMKA_PLASTIC_ADDRESS = "Заводская ул. 2А корп.28 Химки";
// Яндекс-координаты завода (можно использовать как запасной вариант)
exports.HIMKA_PLASTIC_COORDINATES = [55.906336, 37.429674]; // [широта, долгота]
// Yandex Maps API base URL для геокодирования (HTTP Геокодер)
const YANDEX_GEOCODE_API_URL = 'https://geocode-maps.yandex.ru/1.x';
// Yandex Maps JavaScript API v3 base URL
const YANDEX_MAPS_JS_API_URL = 'https://api-maps.yandex.ru/v3';
// Локальный кэш для геокодирования и расстояний
const geocodeCache = new Map();
const distanceCache = new Map();
/**
 * Get geocode information for an address
 * @param address Address to geocode
 * @returns Promise with geocoding results
 */
function geocodeAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        if (geocodeCache.has(address)) {
            return geocodeCache.get(address);
        }
        try {
            const response = yield axios_1.default.get(YANDEX_GEOCODE_API_URL, {
                params: {
                    apikey: YANDEX_MAPS_API_KEY,
                    geocode: address,
                    format: 'json'
                }
            });
            const data = response.data;
            if (!data || !data.response) {
                throw new Error('Invalid geocode response format');
            }
            geocodeCache.set(address, data);
            return data;
        }
        catch (error) {
            console.error('Error geocoding address:', error);
            // fallback: возвращаем координаты завода как запасной вариант
            geocodeCache.set(address, {
                response: {
                    GeoObjectCollection: {
                        featureMember: [
                            {
                                GeoObject: {
                                    Point: { pos: `${exports.HIMKA_PLASTIC_COORDINATES[1]} ${exports.HIMKA_PLASTIC_COORDINATES[0]}` },
                                    metaDataProperty: { GeocoderMetaData: { Address: { Components: [{ kind: 'locality', name: 'Химки' }] } } }
                                }
                            }
                        ]
                    }
                }
            });
            return geocodeCache.get(address);
        }
    });
}
/**
 * Calculate distance between two addresses
 * @param fromAddress Starting address
 * @param toAddress Destination address
 * @returns Promise with the calculated distance in km
 */
function calculateDistance(fromAddress, toAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const cacheKey = `${fromAddress}__${toAddress}`;
        if (distanceCache.has(cacheKey)) {
            return distanceCache.get(cacheKey);
        }
        try {
            // First geocode both addresses to get coordinates
            const fromGeocode = yield geocodeAddress(fromAddress);
            const toGeocode = yield geocodeAddress(toAddress);
            if (!((_c = (_b = (_a = fromGeocode.response) === null || _a === void 0 ? void 0 : _a.GeoObjectCollection) === null || _b === void 0 ? void 0 : _b.featureMember) === null || _c === void 0 ? void 0 : _c.length) ||
                !((_f = (_e = (_d = toGeocode.response) === null || _d === void 0 ? void 0 : _d.GeoObjectCollection) === null || _e === void 0 ? void 0 : _e.featureMember) === null || _f === void 0 ? void 0 : _f.length)) {
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
            distanceCache.set(cacheKey, distance);
            return distance;
        }
        catch (error) {
            console.error('Error calculating distance:', error);
            // fallback: возвращаем фиксированное значение (например, 10 км)
            distanceCache.set(cacheKey, 10);
            return 10;
        }
    });
}
/**
 * Calculate the "as the crow flies" distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    // Add 20% to account for actual road distance being longer than direct distance
    return distance * 1.2;
}
/**
 * Get region information from an address
 * @param address Address to analyze
 * @returns Promise with the region name
 */
function getRegionFromAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            const geocodeResult = yield geocodeAddress(address);
            if (!((_c = (_b = (_a = geocodeResult.response) === null || _a === void 0 ? void 0 : _a.GeoObjectCollection) === null || _b === void 0 ? void 0 : _b.featureMember) === null || _c === void 0 ? void 0 : _c.length)) {
                console.error('No geocode results found for address:', address);
                throw new Error('Could not geocode address');
            }
            // Extract region information from response
            const geoObject = geocodeResult.response.GeoObjectCollection.featureMember[0].GeoObject;
            const addressDetails = geoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            // Find the region component (kind: province is usually the region in Russia)
            const region = (_d = addressDetails.find((comp) => comp.kind === 'province')) === null || _d === void 0 ? void 0 : _d.name;
            // Если не нашли регион, попробуем найти другую административную единицу
            if (!region) {
                // Проверяем, есть ли в адресе упоминание города или района
                const locality = (_e = addressDetails.find((comp) => comp.kind === 'locality' ||
                    comp.kind === 'area' ||
                    comp.kind === 'district')) === null || _e === void 0 ? void 0 : _e.name;
                if (locality) {
                    console.log(`Определен населенный пункт для адреса "${address}": ${locality}`);
                    return locality;
                }
                // Если вообще ничего не нашли, вернем хотя бы первый компонент адреса
                const firstComponent = (_f = addressDetails[0]) === null || _f === void 0 ? void 0 : _f.name;
                if (firstComponent) {
                    return firstComponent;
                }
                // Если и это не сработало, проверим текст адреса на известные названия регионов
                return fallbackGetRegionFromAddress(address);
            }
            console.log(`Определен регион для адреса "${address}": ${region}`);
            return region;
        }
        catch (error) {
            console.error('Error getting region from address:', error);
            // Fallback to simple text search from the original function
            return fallbackGetRegionFromAddress(address);
        }
    });
}
/**
 * Generate HTML script tag for Yandex Maps API
 * @returns HTML script tag with API key
 */
function getYandexMapsApiScript() {
    return `<script src="https://api-maps.yandex.ru/v3/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU"></script>`;
}
/**
 * Fallback function to determine region from address string
 * Used when API calls fail
 */
function fallbackGetRegionFromAddress(address) {
    console.log(`Используется резервный метод определения региона для адреса: ${address}`);
    const addressLower = address.toLowerCase();
    // Сначала проверяем на конкретные города
    if (addressLower.includes("москва") || addressLower.includes("moscow")) {
        return "Москва";
    }
    else if (addressLower.includes("химки")) {
        return "Московская область";
    }
    else if (addressLower.includes("санкт-петербург") || addressLower.includes("saint petersburg") || addressLower.includes("st. petersburg")) {
        return "Санкт-Петербург";
    }
    else if (addressLower.includes("екатеринбург") || addressLower.includes("ekaterinburg")) {
        return "Екатеринбург";
    }
    else if (addressLower.includes("новосибирск") || addressLower.includes("novosibirsk")) {
        return "Новосибирск";
    }
    // Если город не определен, проверяем на регионы или области
    if (addressLower.includes("московская") && addressLower.includes("област")) {
        return "Московская область";
    }
    else if (addressLower.includes("ленинградская") && addressLower.includes("област")) {
        return "Ленинградская область";
    }
    else if (addressLower.includes("свердловская") && addressLower.includes("област")) {
        return "Свердловская область";
    }
    // Если не нашли соответствий, возвращаем более информативное название
    return "Центральный регион";
}
