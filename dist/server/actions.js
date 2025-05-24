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
exports.sendSMS = exports.sendPushNotification = exports.updateOrderPaymentStatus = exports.updateUser = exports.getUserById = exports.requireAdmin = exports.requireAuth = exports.signOut = exports.signUp = exports.signIn = exports.sendEmail = exports.getAuth = void 0;
// Server actions for authentication, user management, and communications
const db_1 = require("./db");
// In-memory store for user sessions
const sessions = [
    // Add a default session for development
    {
        userId: "user-1",
        token: "test-token-for-development",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        role: 'client'
    },
    {
        userId: "admin-1",
        token: "admin-token-for-development",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        role: 'admin'
    }
];
// Authentication actions
const getAuth = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // For development, return a default authenticated user if no token is provided
    if (!token && process.env.NODE_ENV === 'development') {
        return {
            userId: "user-1",
            status: "authenticated",
            role: 'client'
        };
    }
    // Find session by token
    const session = sessions.find(s => s.token === token);
    // Check if session exists and is not expired
    if (session && new Date() < session.expiresAt) {
        return {
            userId: session.userId,
            status: "authenticated",
            role: session.role
        };
    }
    return {
        userId: null,
        status: "unauthenticated",
        role: null
    };
});
exports.getAuth = getAuth;
// Email sending action
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real application, you would integrate with an email service 
    // like SendGrid, Mailgun, AWS SES, etc.
    console.log(`Email sent to ${options.to}: ${options.subject}`);
    if (options.html) {
        console.log("HTML content:", options.html.substring(0, 100) + (options.html.length > 100 ? '...' : ''));
    }
    else if (options.text) {
        console.log("Text content:", options.text.substring(0, 100) + (options.text.length > 100 ? '...' : ''));
    }
    return { success: true, messageId: `msg_${Date.now()}` };
});
exports.sendEmail = sendEmail;
// Authentication and user management functions
const signIn = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real app, you would validate credentials against hashed passwords
    // For now, we'll just check if a user with this email exists
    const user = yield db_1.db.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    // Generate a token
    const token = `token_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    // Determine role based on user data
    let role = 'client';
    if (user.isAdmin) {
        role = 'admin';
    }
    else if (email.endsWith('@manager.com')) {
        role = 'manager';
    }
    else if (email.endsWith('@logistic.com')) {
        role = 'logistic';
    }
    // Create session
    const session = {
        userId: user.id,
        token,
        expiresAt,
        role
    };
    // Remove any existing sessions for this user
    const existingSessionIndex = sessions.findIndex(s => s.userId === user.id);
    if (existingSessionIndex !== -1) {
        sessions.splice(existingSessionIndex, 1);
    }
    // Add new session
    sessions.push(session);
    return { token, user, role };
});
exports.signIn = signIn;
const signUp = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists
    const existingUser = yield db_1.db.user.findUnique({
        where: { email: userData.email }
    });
    if (existingUser) {
        throw new Error("Email already in use");
    }
    // In a real app, you would hash the password before storing
    // For now, we'll skip password storage for simplicity
    const newUser = yield db_1.db.user.create({
        name: userData.name,
        email: userData.email,
        companyName: userData.companyName || "",
        isAdmin: false,
        dashboardSettings: JSON.stringify([
            { id: 'w1', type: 'totalOrders', position: 0, size: 'small' },
            { id: 'w2', type: 'totalEarnings', position: 1, size: 'small' },
            { id: 'w3', type: 'environmentalImpact', position: 2, size: 'small' },
        ])
    });
    // Generate a token and create session
    const token = `token_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    // Determine role based on email domain
    let role = 'client';
    if (userData.email.endsWith('@manager.com')) {
        role = 'manager';
    }
    else if (userData.email.endsWith('@logistic.com')) {
        role = 'logistic';
    }
    else if (userData.email.endsWith('@admin.com')) {
        role = 'admin';
    }
    // Create session
    const session = {
        userId: newUser.id,
        token,
        expiresAt,
        role
    };
    sessions.push(session);
    return { token, user: newUser, role };
});
exports.signUp = signUp;
const signOut = (token) => {
    const sessionIndex = sessions.findIndex(s => s.token === token);
    if (sessionIndex !== -1) {
        sessions.splice(sessionIndex, 1);
    }
};
exports.signOut = signOut;
// Helper functions for API
const requireAuth = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = yield (0, exports.getAuth)(token);
    if (auth.status !== "authenticated") {
        throw new Error("Authentication required");
    }
    return auth;
});
exports.requireAuth = requireAuth;
const requireAdmin = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = yield (0, exports.getAuth)(token);
    if (auth.status !== "authenticated" || auth.role !== 'admin') {
        throw new Error("Admin privileges required");
    }
    return auth;
});
exports.requireAdmin = requireAdmin;
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.db.user.findUnique({
        where: { id: userId }
    });
});
exports.getUserById = getUserById;
const updateUser = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.db.user.update({
        where: { id: userId },
        data
    });
});
exports.updateUser = updateUser;
// Order-related actions
const updateOrderPaymentStatus = (orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.db.order.update({
        where: { id: orderId },
        data: { paymentStatus: status }
    });
});
exports.updateOrderPaymentStatus = updateOrderPaymentStatus;
// Export notifications to simulate real-time updates
const sendPushNotification = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[PUSH] Notification to user ${userId}: ${message}`);
    return { success: true };
});
exports.sendPushNotification = sendPushNotification;
const sendSMS = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[SMS] Message to ${phoneNumber}: ${message}`);
    return { success: true };
});
exports.sendSMS = sendSMS;
