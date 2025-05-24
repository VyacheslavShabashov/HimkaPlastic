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
Object.defineProperty(exports, "__esModule", { value: true });
exports._runApiTests = _runApiTests;
const expect_1 = require("expect");
const api_1 = require("../api/api"); // Исправлен путь импорта
function testCalculateOrderPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, api_1.calculateOrderPrice)({
            materialType: "PET",
            volume: 100,
            pickupAddress: "123 Test St, Moscow",
        });
        (0, expect_1.expect)(result).toHaveProperty("basePrice");
        (0, expect_1.expect)(result).toHaveProperty("logisticsCost");
        (0, expect_1.expect)(result).toHaveProperty("totalPrice");
        (0, expect_1.expect)(result).toHaveProperty("environmentalImpact");
        (0, expect_1.expect)(result.basePrice).toBeGreaterThan(0);
        (0, expect_1.expect)(result.logisticsCost).toBeGreaterThanOrEqual(0); // Проверка на неотрицательное значение
        (0, expect_1.expect)(result.totalPrice).toBe(result.basePrice - result.logisticsCost - result.customsDuty - result.environmentalTax); // Исправлено вычисление totalPrice
    });
}
function _runApiTests() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {
            passedTests: [],
            failedTests: [],
        };
        try {
            yield testCalculateOrderPrice();
            result.passedTests.push("testCalculateOrderPrice");
        }
        catch (error) {
            result.failedTests.push({
                name: "testCalculateOrderPrice",
                error: error instanceof Error ? error.message : String(error), // Обработка ошибок
            });
        }
        return result;
    });
}
