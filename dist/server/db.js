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
exports.db = void 0;
// In-memory data store
let users = [
    {
        id: "user-1",
        name: "Тестовый Пользователь",
        email: "test@example.com",
        companyName: "Тест Ком",
        inn: "1234567890",
        kpp: "098765432",
        billingAddress: "г. Тест, ул. Тестовая, д.1",
        dashboardSettings: JSON.stringify([
            { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
            { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
            { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
        ]),
        isAdmin: false,
    },
    {
        id: "admin-1",
        name: "Администратор",
        email: "admin@example.com",
        companyName: "Эко Трэк",
        isAdmin: true,
        dashboardSettings: JSON.stringify([
            { id: 'w1', type: 'totalOrders', position: 0, size: 'large' },
            { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
        ]),
    }
];
let orders = [
    {
        id: "order-1",
        userId: "user-1",
        materialType: "PET",
        volume: 500,
        pickupAddress: "г. Москва, ул. Тверская, д.1",
        price: 12500,
        status: "completed",
        paymentStatus: "paid",
        environmentalImpact: 750,
        createdAt: new Date("2023-01-10"),
        updatedAt: new Date("2023-01-15"),
    },
    {
        id: "order-2",
        userId: "user-1",
        materialType: "HDPE",
        volume: 300,
        pickupAddress: "г. Москва, ул. Ленина, д.15",
        price: 9000,
        status: "in_progress",
        paymentStatus: "pending",
        environmentalImpact: 450,
        createdAt: new Date("2023-02-05"),
        updatedAt: new Date("2023-02-10"),
    },
];
let marketRates = [
    {
        id: "rate-1",
        materialType: "PET",
        pricePerKg: 25,
        logisticsCostPerKm: 15
    },
    {
        id: "rate-2",
        materialType: "HDPE",
        pricePerKg: 30,
        logisticsCostPerKm: 17.5
    },
];
let regionalTaxes = [
    { region: "Москва", environmentalTax: 0.5, customsDuty: 200 },
    { region: "Санкт-Петербург", environmentalTax: 0.4, customsDuty: 180 },
    { region: "Екатеринбург", environmentalTax: 0.3, customsDuty: 150 },
    { region: "Новосибирск", environmentalTax: 0.35, customsDuty: 160 },
    { region: "По умолчанию", environmentalTax: 0.25, customsDuty: 100 }
];
// Инициализация массива финансовых отчетов с примерами данных
let financialReports = [
    {
        id: "report-2023-1",
        month: 1,
        year: 2023,
        totalPaid: 45000,
        volume: 1800,
        monthName: 'Январь'
    },
    {
        id: "report-2023-2",
        month: 2,
        year: 2023,
        totalPaid: 38000,
        volume: 1500,
        monthName: 'Февраль'
    }
];
// Database interface
exports.db = {
    // User operations
    user: {
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.where.id) {
                return users.find(u => u.id === query.where.id) || null;
            }
            if (query.where.email) {
                return users.find(u => u.email === query.where.email) || null;
            }
            return null;
        }),
        findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            return [...users];
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = Object.assign(Object.assign({}, data), { id: `user-${Date.now()}` });
            users.push(newUser);
            return newUser;
        }),
        update: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const userIndex = users.findIndex(u => u.id === query.where.id);
            if (userIndex === -1) {
                throw new Error(`User not found: ${query.where.id}`);
            }
            users[userIndex] = Object.assign(Object.assign({}, users[userIndex]), query.data);
            return users[userIndex];
        }),
        delete: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const userIndex = users.findIndex(u => u.id === query.where.id);
            if (userIndex === -1) {
                throw new Error(`User not found: ${query.where.id}`);
            }
            const deletedUser = users[userIndex];
            users.splice(userIndex, 1);
            return deletedUser;
        })
    },
    // Order operations
    order: {
        findMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            let result = [...orders];
            if (query && query.where && query.where.userId) {
                result = result.filter(o => o.userId === query.where.userId);
            }
            if (query && query.orderBy && typeof query.orderBy.createdAt === 'string') {
                result.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return query.orderBy.createdAt === 'desc' ? dateB - dateA : dateA - dateB;
                });
            }
            if (query && query.include && query.include.user) {
                result = result.map(order => {
                    const user = users.find(u => u.id === order.userId);
                    return Object.assign(Object.assign({}, order), { user });
                });
            }
            return result;
        }),
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const order = orders.find(o => o.id === query.where.id) || null;
            return order;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            const newOrder = Object.assign(Object.assign({}, data), { id: `order-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() });
            orders.push(newOrder);
            return newOrder;
        }),
        update: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const orderIndex = orders.findIndex(o => o.id === query.where.id);
            if (orderIndex === -1) {
                throw new Error(`Order not found: ${query.where.id}`);
            }
            orders[orderIndex] = Object.assign(Object.assign(Object.assign({}, orders[orderIndex]), query.data), { updatedAt: new Date() });
            return orders[orderIndex];
        }),
        delete: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const orderIndex = orders.findIndex(o => o.id === query.where.id);
            if (orderIndex === -1) {
                throw new Error(`Order not found: ${query.where.id}`);
            }
            const deletedOrder = orders[orderIndex];
            orders.splice(orderIndex, 1);
            return deletedOrder;
        }),
        updateMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            return exports.db.order.update(query);
        })
    },
    // Market rate operations
    marketRate: {
        findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            return [...marketRates];
        }),
        findFirst: (query) => __awaiter(void 0, void 0, void 0, function* () {
            return marketRates.find(r => r.materialType === query.where.materialType) || null;
        }),
        updateMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const rateIndex = marketRates.findIndex(r => r.materialType === query.where.materialType);
            if (rateIndex === -1) {
                throw new Error(`Market rate not found: ${query.where.materialType}`);
            }
            marketRates[rateIndex] = Object.assign(Object.assign({}, marketRates[rateIndex]), query.data);
            return marketRates[rateIndex];
        }),
        createMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const newRates = query.data.map(rate => (Object.assign(Object.assign({}, rate), { id: `rate-${Date.now()}-${Math.floor(Math.random() * 1000)}` })));
            marketRates.push(...newRates);
            return newRates;
        })
    },
    // Regional tax operations
    regionalTax: {
        findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            return [...regionalTaxes];
        }),
        findFirst: (query) => __awaiter(void 0, void 0, void 0, function* () {
            return regionalTaxes.find(t => t.region === query.where.region) ||
                regionalTaxes.find(t => t.region === "По умолчанию") || null;
        }),
        createMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            regionalTaxes.push(...query.data);
            return query.data;
        })
    },
    // Financial report operations
    financialReport: {
        findMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            let result = [...financialReports];
            if (query && query.where) {
                if (query.where.year) {
                    result = result.filter(r => r.year === query.where.year);
                }
                if (query.where.month) {
                    result = result.filter(r => r.month === query.where.month);
                }
            }
            return result;
        }),
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            return financialReports.find(r => r.id === query.where.id) || null;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            const newReport = Object.assign(Object.assign({}, data), { id: `report-${data.year}-${data.month}` });
            // Check if report already exists
            const existingIndex = financialReports.findIndex(r => r.year === data.year && r.month === data.month);
            if (existingIndex !== -1) {
                financialReports[existingIndex] = newReport;
            }
            else {
                financialReports.push(newReport);
            }
            return newReport;
        })
    }
};
