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
exports.db = void 0;
const pg_1 = require("pg");
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const toSnake = (str) => str.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
exports.db = {
    pool,
    // User operations
    user: {
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            if (query.where.id) {
                const res = yield pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [query.where.id]);
                return res.rows[0] || null;
            }
            if (query.where.email) {
                const res = yield pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [query.where.email]);
                return res.rows[0] || null;
            }
            return null;
        }),
        findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM users');
            return res.rows;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            const id = (0, crypto_1.randomUUID)();
            const res = yield pool.query(`INSERT INTO users (id, name, email, company_name, inn, kpp, billing_address, is_admin, dashboard_settings)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [id, data.name, data.email, data.companyName || null, data.inn || null, data.kpp || null, data.billingAddress || null, data.isAdmin, data.dashboardSettings]);
            return res.rows[0];
        }),
        update: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const fields = Object.keys(query.data);
            if (fields.length === 0) {
                const res = yield pool.query('SELECT * FROM users WHERE id=$1', [query.where.id]);
                if (!res.rows[0])
                    throw new Error(`User not found: ${query.where.id}`);
                return res.rows[0];
            }
            const sets = fields.map((f, i) => `${toSnake(f)}=$${i + 1}`).join(', ');
            const values = fields.map(f => query.data[f]);
            values.push(query.where.id);
            const res = yield pool.query(`UPDATE users SET ${sets} WHERE id=$${values.length} RETURNING *`, values);
            if (!res.rows[0])
                throw new Error(`User not found: ${query.where.id}`);
            return res.rows[0];
        }),
        delete: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [query.where.id]);
            if (!res.rows[0])
                throw new Error(`User not found: ${query.where.id}`);
            return res.rows[0];
        }),
    },
    // Order operations
    order: {
        findMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let sql = 'SELECT o.*';
            if ((_a = query === null || query === void 0 ? void 0 : query.include) === null || _a === void 0 ? void 0 : _a.user) {
                sql += ', u.* as user';
            }
            sql += ' FROM orders o';
            const values = [];
            if ((_b = query === null || query === void 0 ? void 0 : query.include) === null || _b === void 0 ? void 0 : _b.user) {
                sql += ' JOIN users u ON o.user_id = u.id';
            }
            if ((_c = query === null || query === void 0 ? void 0 : query.where) === null || _c === void 0 ? void 0 : _c.userId) {
                values.push(query.where.userId);
                sql += ` WHERE o.user_id = $${values.length}`;
            }
            if ((_d = query === null || query === void 0 ? void 0 : query.orderBy) === null || _d === void 0 ? void 0 : _d.createdAt) {
                sql += ` ORDER BY o.created_at ${query.orderBy.createdAt.toUpperCase()}`;
            }
            const res = yield pool.query(sql, values);
            return res.rows;
        }),
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM orders WHERE id=$1', [query.where.id]);
            return res.rows[0] || null;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            const id = (0, crypto_1.randomUUID)();
            const res = yield pool.query(`INSERT INTO orders (id, user_id, material_type, volume, pickup_address, price, status, payment_status, environmental_impact, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) RETURNING *`, [id, data.userId, data.materialType, data.volume, data.pickupAddress, data.price, data.status, data.paymentStatus || null, data.environmentalImpact || 0]);
            return res.rows[0];
        }),
        update: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const fields = Object.keys(query.data);
            if (fields.length === 0) {
                const res = yield pool.query('SELECT * FROM orders WHERE id=$1', [query.where.id]);
                if (!res.rows[0])
                    throw new Error(`Order not found: ${query.where.id}`);
                return res.rows[0];
            }
            const sets = fields.map((f, i) => `${toSnake(f)}=$${i + 1}`).join(', ');
            const values = fields.map(f => query.data[f]);
            values.push(query.where.id);
            const res = yield pool.query(`UPDATE orders SET ${sets}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`, values);
            if (!res.rows[0])
                throw new Error(`Order not found: ${query.where.id}`);
            return res.rows[0];
        }),
        delete: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('DELETE FROM orders WHERE id=$1 RETURNING *', [query.where.id]);
            if (!res.rows[0])
                throw new Error(`Order not found: ${query.where.id}`);
            return res.rows[0];
        }),
        updateMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            return exports.db.order.update(query);
        }),
    },
    // Market rate operations
    marketRate: {
        findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM market_rates');
            return res.rows;
        }),
        findFirst: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM market_rates WHERE material_type=$1 LIMIT 1', [query.where.materialType]);
            return res.rows[0] || null;
        }),
        updateMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const fields = Object.keys(query.data);
            const sets = fields.map((f, i) => `${toSnake(f)}=$${i + 1}`).join(', ');
            const values = fields.map(f => query.data[f]);
            values.push(query.where.materialType);
            const res = yield pool.query(`UPDATE market_rates SET ${sets} WHERE material_type=$${values.length} RETURNING *`, values);
            if (!res.rows[0])
                throw new Error(`Market rate not found: ${query.where.materialType}`);
            return res.rows[0];
        }),
        createMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const result = [];
            for (const rate of query.data) {
                const id = (0, crypto_1.randomUUID)();
                const res = yield pool.query(`INSERT INTO market_rates (id, material_type, price_per_kg, logistics_cost_per_km)
           VALUES ($1,$2,$3,$4) RETURNING *`, [id, rate.materialType, rate.pricePerKg, rate.logisticsCostPerKm]);
                result.push(res.rows[0]);
            }
            return result;
        }),
    },
    // Regional tax operations
    regionalTax: {
        findMany: () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM regional_taxes');
            return res.rows;
        }),
        findFirst: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM regional_taxes WHERE region=$1 LIMIT 1', [query.where.region]);
            if (res.rows[0])
                return res.rows[0];
            const def = yield pool.query('SELECT * FROM regional_taxes WHERE region=$1 LIMIT 1', ['По умолчанию']);
            return def.rows[0] || null;
        }),
        createMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const inserted = [];
            for (const t of query.data) {
                const res = yield pool.query(`INSERT INTO regional_taxes (region, environmental_tax, customs_duty)
           VALUES ($1,$2,$3) RETURNING *`, [t.region, t.environmentalTax, t.customsDuty]);
                inserted.push(res.rows[0]);
            }
            return inserted;
        }),
    },
    // Financial report operations
    financialReport: {
        findMany: (query) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            let sql = 'SELECT * FROM financial_reports';
            const values = [];
            const conditions = [];
            if ((_a = query === null || query === void 0 ? void 0 : query.where) === null || _a === void 0 ? void 0 : _a.year) {
                values.push(query.where.year);
                conditions.push(`year=$${values.length}`);
            }
            if (((_b = query === null || query === void 0 ? void 0 : query.where) === null || _b === void 0 ? void 0 : _b.month) !== undefined) {
                values.push(query.where.month);
                conditions.push(`month=$${values.length}`);
            }
            if (conditions.length)
                sql += ' WHERE ' + conditions.join(' AND ');
            const res = yield pool.query(sql, values);
            return res.rows;
        }),
        findUnique: (query) => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield pool.query('SELECT * FROM financial_reports WHERE id=$1', [query.where.id]);
            return res.rows[0] || null;
        }),
        create: (data) => __awaiter(void 0, void 0, void 0, function* () {
            const id = `report-${data.year}-${data.month}`;
            const res = yield pool.query(`INSERT INTO financial_reports (id, month, year, total_paid, volume, month_name)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           total_paid=EXCLUDED.total_paid,
           volume=EXCLUDED.volume,
           month_name=EXCLUDED.month_name
         RETURNING *`, [id, data.month, data.year, data.totalPaid, data.volume, data.monthName]);
            return res.rows[0];
        }),
    },
};
