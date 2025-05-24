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
exports.calculateDistance = calculateDistance;
exports.geocodeAddress = geocodeAddress;
const axios_1 = __importDefault(require("axios"));
const YANDEX_API_KEY = process.env.REACT_APP_YANDEX_API_KEY || 'your-api-key';
const GEOCODE_URL = 'https://geocode-maps.yandex.ru/1.x';
const ROUTE_URL = 'https://api-maps.yandex.ru/services/route/2.0';
function calculateDistance(fromAddress, toAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            const fromCoords = yield geocodeAddress(fromAddress);
            const toCoords = yield geocodeAddress(toAddress);
            const response = yield axios_1.default.get(ROUTE_URL, {
                params: {
                    apikey: YANDEX_API_KEY,
                    waypoints: `${fromCoords.lat},${fromCoords.lng}|${toCoords.lat},${toCoords.lng}`,
                    format: 'json',
                },
            });
            const distance = (_f = (_e = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.routes) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.legs) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.distance) === null || _f === void 0 ? void 0 : _f.value;
            if (typeof distance !== 'number') {
                throw new Error('Distance value is missing or invalid');
            }
            return distance / 1000; // Convert meters to kilometers
        }
        catch (error) {
            console.error('Error calculating distance:', error);
            throw new Error('Failed to calculate distance');
        }
    });
}
function geocodeAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const response = yield axios_1.default.get(GEOCODE_URL, {
                params: {
                    apikey: YANDEX_API_KEY,
                    geocode: address,
                    format: 'json',
                },
            });
            const point = (_g = (_f = (_e = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.response) === null || _b === void 0 ? void 0 : _b.GeoObjectCollection) === null || _c === void 0 ? void 0 : _c.featureMember) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.GeoObject) === null || _f === void 0 ? void 0 : _f.Point) === null || _g === void 0 ? void 0 : _g.pos;
            if (!point) {
                throw new Error('GeoObject or Point is missing in the response');
            }
            const [lng, lat] = point.split(' ').map(Number);
            return { lat, lng };
        }
        catch (error) {
            console.error('Error geocoding address:', error);
            throw new Error('Failed to geocode address');
        }
    });
}
