"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const api = __importStar(require("../api/api"));
const actions_1 = require("./actions");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Create Express application
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Authentication middleware
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        const auth = yield (0, actions_1.getAuth)(token);
        if (auth.status !== 'authenticated') {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Attach user info to request
        req.auth = auth;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication required' });
    }
});
// Admin middleware
const adminMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        const auth = yield (0, actions_1.getAuth)(token);
        if (auth.status !== 'authenticated' || auth.role !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        // Attach user info to request
        req.auth = auth;
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        res.status(403).json({ error: 'Admin privileges required' });
    }
});
// API Routes
// Authentication
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield api.signIn(email, password);
        res.json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message || 'Login failed' });
    }
}));
app.post('/api/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, companyName } = req.body;
        const result = yield api.signUp({ email, password, name, companyName });
        res.json(result);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
}));
app.post('/api/auth/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (token) {
            yield api.signOut(token);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(400).json({ error: error.message || 'Logout failed' });
    }
}));
// User profile
app.get('/api/profile', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield api.getCurrentUser();
        res.json(user);
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(400).json({ error: error.message || 'Failed to get profile' });
    }
}));
app.put('/api/profile', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const updatedUser = yield api.updateUserProfile(userData);
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
}));
// Market Rates
app.get('/api/market-rates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rates = yield api.getMarketRates();
        res.json(rates);
    }
    catch (error) {
        console.error('Market rates error:', error);
        res.status(400).json({ error: error.message || 'Failed to get market rates' });
    }
}));
app.put('/api/market-rates', adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { materialType, pricePerKg } = req.body;
        const updatedRate = yield api.updateMarketRate({ materialType, pricePerKg });
        res.json(updatedRate);
    }
    catch (error) {
        console.error('Market rate update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update market rate' });
    }
}));
// Order Management
app.post('/api/calculate-price', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = req.body;
        const priceCalculation = yield api.calculateOrderPrice(orderData);
        res.json(priceCalculation);
    }
    catch (error) {
        console.error('Price calculation error:', error);
        res.status(400).json({ error: error.message || 'Failed to calculate price' });
    }
}));
app.post('/api/orders', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = req.body;
        const order = yield api.createOrder(orderData);
        res.json(order);
    }
    catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ error: error.message || 'Failed to create order' });
    }
}));
app.get('/api/orders', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield api.getUserOrders();
        res.json(orders);
    }
    catch (error) {
        console.error('Orders fetch error:', error);
        res.status(400).json({ error: error.message || 'Failed to fetch orders' });
    }
}));
app.get('/api/orders/:id', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield api.getOrderById({ id: req.params.id });
        res.json(order);
    }
    catch (error) {
        console.error('Order fetch error:', error);
        res.status(400).json({ error: error.message || 'Failed to fetch order' });
    }
}));
app.put('/api/orders/:id/status', adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const order = yield api.updateOrderStatus({ id: req.params.id, status });
        res.json(order);
    }
    catch (error) {
        console.error('Order status update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update order status' });
    }
}));
app.put('/api/orders/:id/payment', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const order = yield api.updatePaymentStatus({ orderId: req.params.id, status });
        res.json(order);
    }
    catch (error) {
        console.error('Payment status update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update payment status' });
    }
}));
// Analytics
app.get('/api/analytics', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analytics = yield api.getUserAnalytics();
        res.json(analytics);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(400).json({ error: error.message || 'Failed to get analytics' });
    }
}));
// Financial Reports
app.get('/api/financial-reports/yearly/:year', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const year = parseInt(req.params.year);
        const reports = yield api.getYearlyFinancialReports({ year });
        res.json(reports);
    }
    catch (error) {
        console.error('Yearly reports error:', error);
        res.status(400).json({ error: error.message || 'Failed to get yearly reports' });
    }
}));
app.get('/api/financial-reports/monthly/:year/:month', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const report = yield api.getMonthlyFinancialReport({ year, month });
        res.json(report);
    }
    catch (error) {
        console.error('Monthly report error:', error);
        res.status(400).json({ error: error.message || 'Failed to get monthly report' });
    }
}));
// Admin routes
app.get('/api/admin/orders', adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield api.getAllOrders();
        res.json(orders);
    }
    catch (error) {
        console.error('Admin orders error:', error);
        res.status(400).json({ error: error.message || 'Failed to get all orders' });
    }
}));
// Yandex Maps API
app.get('/api/maps/config', (req, res) => {
    const apiKey = process.env.YANDEX_MAPS_API_KEY || '8cd50efd-1a88-46d3-821a-643cbfcc250a';
    res.json({
        apiKey,
        scriptUrl: `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API: http://localhost:${PORT}/api`);
    });
}
exports.default = app;
