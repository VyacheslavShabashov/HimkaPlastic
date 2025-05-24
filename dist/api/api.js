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
exports.signOut = exports.signUp = exports.signIn = void 0;
exports.getCurrentUser = getCurrentUser;
exports.updateUserProfile = updateUserProfile;
exports.getMarketRates = getMarketRates;
exports.updateMarketRate = updateMarketRate;
exports.calculateOrderPrice = calculateOrderPrice;
exports.createOrder = createOrder;
exports.getUserOrders = getUserOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.getUserAnalytics = getUserAnalytics;
exports.getAllOrders = getAllOrders;
exports.getMonthlyFinancialReport = getMonthlyFinancialReport;
exports.getYearlyFinancialReports = getYearlyFinancialReports;
exports.updatePaymentStatus = updatePaymentStatus;
const db_1 = require("../server/db");
const actions_1 = require("../server/actions");
const yandexMaps_1 = require("../utils/yandexMaps");
// Authentication handlers
const signIn = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, actions_1.signIn)(email, password);
});
exports.signIn = signIn;
const signUp = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, actions_1.signUp)(userData);
});
exports.signUp = signUp;
const signOut = (token) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, actions_1.signOut)(token);
});
exports.signOut = signOut;
// User Management
function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    });
}
function updateUserProfile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        return db_1.db.user.update({
            where: { id: auth.userId },
            data,
        });
    });
}
// Market Rates
function getMarketRates() {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db.marketRate.findMany();
    });
}
function updateMarketRate(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
            throw new Error("Not authorized");
        return yield db_1.db.marketRate.updateMany({
            where: { materialType: input.materialType },
            data: { pricePerKg: input.pricePerKg },
        });
    });
}
// Order Management
// Helper function to determine region from address - заменяем на новую функцию из yandexMaps
// function getRegionFromAddress(address: string): string {
//   // In a production app, this would use a geocoding API
//   // For now, we'll do a simple text search
//   const addressLower = address.toLowerCase();
//   if (addressLower.includes("москва") || addressLower.includes("moscow")) {
//     return "Москва";
//   } else if (addressLower.includes("санкт-петербург") || addressLower.includes("saint petersburg") || addressLower.includes("st. petersburg")) {
//     return "Санкт-Петербург";
//   } else if (addressLower.includes("екатеринбург") || addressLower.includes("ekaterinburg")) {
//     return "Екатеринбург";
//   } else if (addressLower.includes("новосибирск") || addressLower.includes("novosibirsk")) {
//     return "Новосибирск";
//   }
//   return "По умолчанию";
// }
// Helper function to calculate distance from address - заменяем на новую функцию
function getDistanceFromAddress(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Используем адрес завода ООО Химка пластик как точку отсчета
            return yield (0, yandexMaps_1.calculateDistance)(yandexMaps_1.HIMKA_PLASTIC_ADDRESS, address);
        }
        catch (error) {
            console.error("Failed to calculate distance using Yandex Maps:", error);
            // Fallback to our previous implementation
            return fallbackCalculateDistance(address);
        }
    });
}
// Fallback function for distance calculation
function fallbackCalculateDistance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        // In a production app, this would use a maps API (Google Maps, Yandex Maps)
        // For now, we'll simulate distances based on regions
        let region;
        try {
            region = yield (0, yandexMaps_1.getRegionFromAddress)(address);
        }
        catch (error) {
            // If getRegionFromAddress fails, use simple text matching
            region = getFallbackRegion(address);
        }
        const addressLower = address.toLowerCase();
        // Проверяем, не является ли это адресом в Химках
        if (addressLower.includes("химки")) {
            // Если адрес в Химках, возвращаем небольшое расстояние (1-10 км)
            return 1 + Math.random() * 9;
        }
        switch (region) {
            case "Москва":
                return 10 + Math.random() * 20; // 10-30 km
            case "Санкт-Петербург":
                return 15 + Math.random() * 25; // 15-40 km
            case "Екатеринбург":
                return 20 + Math.random() * 30; // 20-50 km
            case "Новосибирск":
                return 25 + Math.random() * 35; // 25-60 km
            default:
                return 30 + Math.random() * 50; // 30-80 km
        }
    });
}
// Simple text-based region determination
function getFallbackRegion(address) {
    const addressLower = address.toLowerCase();
    if (addressLower.includes("москва") || addressLower.includes("moscow")) {
        return "Москва";
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
    return "По умолчанию";
}
function calculateOrderPrice(orderData) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get market rate for the material type
        const materialRate = yield db_1.db.marketRate.findFirst({
            where: { materialType: orderData.materialType },
        });
        if (!materialRate) {
            throw new Error(`No market rate found for ${orderData.materialType}`);
        }
        // Calculate base price
        const basePrice = orderData.volume * materialRate.pricePerKg;
        // Get distance based on pickup address using Yandex Maps API
        const distance = orderData.distance || (yield getDistanceFromAddress(orderData.pickupAddress));
        // Используем фиксированную ставку 63 рубля за км для расчета логистики
        const LOGISTICS_COST_PER_KM = 63;
        const logisticsCost = distance * LOGISTICS_COST_PER_KM;
        // Get region from address using Yandex Maps API
        const region = yield (0, yandexMaps_1.getRegionFromAddress)(orderData.pickupAddress);
        // Get regional taxes and duties
        const regionalTaxes = yield db_1.db.regionalTax.findFirst({
            where: { region },
        });
        const customsDuty = (regionalTaxes === null || regionalTaxes === void 0 ? void 0 : regionalTaxes.customsDuty) || 200;
        const environmentalTaxRate = (regionalTaxes === null || regionalTaxes === void 0 ? void 0 : regionalTaxes.environmentalTax) || 0.5;
        const environmentalTax = orderData.volume * environmentalTaxRate;
        // Calculate environmental impact (carbon footprint reduction)
        const environmentalImpact = orderData.volume * 1.5; // 1.5kg CO2 saved per kg recycled
        // Calculate total price
        const totalPrice = basePrice - logisticsCost - customsDuty - environmentalTax;
        return {
            basePrice,
            logisticsCost,
            customsDuty,
            environmentalTax,
            distance,
            region,
            totalPrice,
            environmentalImpact,
            price: totalPrice,
        };
    });
}
function createOrder(orderData) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Calculate price and environmental impact
        const priceCalculation = yield calculateOrderPrice(orderData);
        // Create the order in database
        const order = yield db_1.db.order.create({
            userId: auth.userId,
            materialType: orderData.materialType,
            volume: orderData.volume,
            pickupAddress: orderData.pickupAddress,
            price: priceCalculation.totalPrice,
            status: "pending",
            environmentalImpact: priceCalculation.environmentalImpact,
        });
        // Send confirmation email
        yield (0, actions_1.sendEmail)({
            to: "customer@example.com", // In real app, would be user's email
            subject: `Order Confirmation: #${order.id}`,
            html: `
      <h1>Your order has been received</h1>
      <p>Thank you for your order. We have received your request for ${orderData.volume}kg of ${orderData.materialType}.</p>
      <p>Total price: ₽${priceCalculation.totalPrice.toFixed(2)}</p>
      <p>Environmental impact: ${priceCalculation.environmentalImpact.toFixed(2)}kg CO2 saved</p>
    `,
        });
        return order;
    });
}
function getUserOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        return orders;
    });
}
function getOrderById(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        const order = yield db_1.db.order.findUnique({
            where: { id: input.id },
        });
        if (!order)
            throw new Error("Order not found");
        if (order.userId !== auth.userId) {
            // Check if user is admin
            const user = yield db_1.db.user.findUnique({
                where: { id: auth.userId },
            });
            if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
                throw new Error("Not authorized");
        }
        return order;
    });
}
function updateOrderStatus(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        // Verify admin status
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
            throw new Error("Not authorized");
        const order = yield db_1.db.order.update({
            where: { id: input.id },
            data: { status: input.status },
        });
        // Send status update email to customer
        try {
            const customer = yield db_1.db.user.findUnique({ where: { id: order.userId } });
            if (customer === null || customer === void 0 ? void 0 : customer.email) {
                yield (0, actions_1.sendEmail)({
                    to: customer.email,
                    subject: `Order Status Update - ${input.status.toUpperCase()}`,
                    text: `
# Order Status Update

Your order status has been updated.

## Order Details
- Order ID: ${order.id}
- New Status: ${order.status.toUpperCase()}
- Material: ${order.materialType}
- Volume: ${order.volume} kg

You can view more details in your dashboard.

Thank you for choosing EcoTrack!
        `,
                });
            }
        }
        catch (error) {
            console.error("Failed to send status update email:", error);
        }
        return order;
    });
}
// Analytics
function getUserAnalytics() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        if (orders.length === 0) {
            return {
                totalOrders: 0,
                totalEarnings: 0,
                totalEnvironmentalImpact: 0,
                recycledByMaterial: {},
                ordersByStatus: {},
                monthlyEarnings: Array(12).fill(0),
                yearlyVolume: {},
            };
        }
        // Calculate analytics from orders
        const analytics = orders.reduce((acc, order) => {
            // Increment total orders
            acc.totalOrders += 1;
            // Add to total earnings
            acc.totalEarnings += order.price;
            // Add to total environmental impact
            acc.totalEnvironmentalImpact += order.environmentalImpact;
            // Group by material type
            if (!acc.recycledByMaterial[order.materialType]) {
                acc.recycledByMaterial[order.materialType] = 0;
            }
            acc.recycledByMaterial[order.materialType] += order.volume;
            // Group by status
            if (!acc.ordersByStatus[order.status]) {
                acc.ordersByStatus[order.status] = 0;
            }
            acc.ordersByStatus[order.status] += 1;
            // Add to monthly earnings (by creation date)
            const orderDate = new Date(order.createdAt);
            const month = orderDate.getMonth();
            acc.monthlyEarnings[month] += order.price;
            // Add to yearly volume
            const year = orderDate.getFullYear();
            if (!acc.yearlyVolume[year]) {
                acc.yearlyVolume[year] = 0;
            }
            acc.yearlyVolume[year] += order.volume;
            return acc;
        }, {
            totalOrders: 0,
            totalEarnings: 0,
            totalEnvironmentalImpact: 0,
            recycledByMaterial: {},
            ordersByStatus: {},
            monthlyEarnings: Array(12).fill(0),
            yearlyVolume: {},
        });
        return analytics;
    });
}
// Admin functions
function getAllOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (auth.status !== "authenticated")
            throw new Error("Not authenticated");
        // Verify admin status
        const user = yield db_1.db.user.findUnique({
            where: { id: auth.userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin))
            throw new Error("Not authorized");
        return yield db_1.db.order.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: true },
        });
    });
}
// Financial Reports
function getMonthlyFinancialReport(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Get all orders for the specified month
        const startDate = new Date(params.year, params.month - 1, 1);
        const endDate = new Date(params.year, params.month, 0, 23, 59, 59);
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        // Фильтруем заказы по дате на стороне JavaScript
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });
        // Calculate totals
        const totalPaid = filteredOrders.reduce((sum, order) => sum + order.price, 0);
        const volume = filteredOrders.reduce((sum, order) => sum + order.volume, 0);
        const monthNames = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        return {
            id: `report-${params.year}-${params.month}`,
            month: params.month,
            year: params.year,
            totalPaid,
            volume,
            monthName: monthNames[params.month - 1],
        };
    });
}
function getYearlyFinancialReports(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Get all orders for the specified year
        const startDate = new Date(params.year, 0, 1);
        const endDate = new Date(params.year, 11, 31, 23, 59, 59);
        const orders = yield db_1.db.order.findMany({
            where: { userId: auth.userId }
        });
        // Фильтруем заказы по дате на стороне JavaScript
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });
        // Group orders by month and calculate totals
        const monthlyReports = {};
        // Initialize all months
        for (let month = 1; month <= 12; month++) {
            monthlyReports[month] = { totalPaid: 0, volume: 0 };
        }
        // Add data from orders
        filteredOrders.forEach((order) => {
            const orderDate = new Date(order.createdAt);
            const month = orderDate.getMonth() + 1; // months are 0-indexed in JS
            monthlyReports[month].totalPaid += order.price;
            monthlyReports[month].volume += order.volume;
        });
        // Convert to array of reports
        const reports = [];
        const monthNames = [
            "Январь",
            "Февраль",
            "Март",
            "Апрель",
            "Май",
            "Июнь",
            "Июль",
            "Август",
            "Сентябрь",
            "Октябрь",
            "Ноябрь",
            "Декабрь",
        ];
        for (let month = 1; month <= 12; month++) {
            const totalPaid = monthlyReports[month].totalPaid;
            const volume = monthlyReports[month].volume;
            reports.push({
                id: `report-${params.year}-${month}`,
                month,
                year: params.year,
                totalPaid,
                volume,
                monthName: monthNames[month - 1],
            });
        }
        return reports;
    });
}
function updatePaymentStatus(paymentData) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = yield (0, actions_1.getAuth)();
        if (!auth.userId) {
            throw new Error("Not authenticated");
        }
        // Verify order belongs to user
        const order = yield db_1.db.order.findUnique({
            where: { id: paymentData.orderId },
        });
        if (!order || order.userId !== auth.userId) {
            throw new Error("Order not found or access denied");
        }
        // Update payment status
        const updatedOrder = yield db_1.db.order.update({
            where: { id: paymentData.orderId },
            data: { paymentStatus: paymentData.status },
        });
        // If payment is marked as paid, send receipt
        if (paymentData.status === "paid") {
            yield (0, actions_1.sendEmail)({
                to: "customer@example.com", // In real app, would be user's email
                subject: `Receipt for Order #${order.id}`,
                html: `
        <h1>Payment Received</h1>
        <p>Thank you for your payment of ₽${order.price.toFixed(2)} for order #${order.id}.</p>
      `,
            });
        }
        return updatedOrder;
    });
}
