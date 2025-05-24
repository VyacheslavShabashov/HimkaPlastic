import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { User, Order, MarketRate, FinancialReport } from '../utils/api';

dotenv.config();

export interface RegionalTax {
  region: string;
  environmentalTax: number;
  customsDuty: number;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const toSnake = (str: string) => str.replace(/[A-Z]/g, c => '_' + c.toLowerCase());

export const db = {
  pool,
  // User operations
  user: {
    findUnique: async (query: { where: { id?: string; email?: string } }): Promise<User | null> => {
      if (query.where.id) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [query.where.id]);
        return res.rows[0] || null;
      }
      if (query.where.email) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [query.where.email]);
        return res.rows[0] || null;
      }
      return null;
    },
    findMany: async (): Promise<User[]> => {
      const res = await pool.query('SELECT * FROM users');
      return res.rows;
    },
    create: async (data: Omit<User, "id">): Promise<User> => {
      const id = randomUUID();
      const res = await pool.query(
        `INSERT INTO users (id, name, email, company_name, inn, kpp, billing_address, is_admin, dashboard_settings)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [id, data.name, data.email, data.companyName || null, data.inn || null, data.kpp || null, data.billingAddress || null, data.isAdmin, data.dashboardSettings]
      );
      return res.rows[0];
    },
    update: async (query: { where: { id: string }; data: Partial<User> }): Promise<User> => {
      const fields = Object.keys(query.data);
      if (fields.length === 0) {
        const res = await pool.query('SELECT * FROM users WHERE id=$1', [query.where.id]);
        if (!res.rows[0]) throw new Error(`User not found: ${query.where.id}`);
        return res.rows[0];
      }
      const sets = fields.map((f, i) => `${toSnake(f)}=$${i + 1}`).join(', ');
      const values = fields.map(f => (query.data as any)[f]);
      values.push(query.where.id);
      const res = await pool.query(`UPDATE users SET ${sets} WHERE id=$${values.length} RETURNING *`, values);
      if (!res.rows[0]) throw new Error(`User not found: ${query.where.id}`);
      return res.rows[0];
    },
    delete: async (query: { where: { id: string } }): Promise<User> => {
      const res = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [query.where.id]);
      if (!res.rows[0]) throw new Error(`User not found: ${query.where.id}`);
      return res.rows[0];
    },
  },

  // Order operations
  order: {
    findMany: async (query?: { where?: { userId?: string }; orderBy?: { createdAt: 'desc' | 'asc' }; include?: { user?: boolean } }): Promise<any[]> => {
      let sql = 'SELECT o.*';
      if (query?.include?.user) {
        sql += ', u.* as user';
      }
      sql += ' FROM orders o';
      const values: any[] = [];
      if (query?.include?.user) {
        sql += ' JOIN users u ON o.user_id = u.id';
      }
      if (query?.where?.userId) {
        values.push(query.where.userId);
        sql += ` WHERE o.user_id = $${values.length}`;
      }
      if (query?.orderBy?.createdAt) {
        sql += ` ORDER BY o.created_at ${query.orderBy.createdAt.toUpperCase()}`;
      }
      const res = await pool.query(sql, values);
      return res.rows;
    },
    findUnique: async (query: { where: { id: string } }): Promise<Order | null> => {
      const res = await pool.query('SELECT * FROM orders WHERE id=$1', [query.where.id]);
      return res.rows[0] || null;
    },
    create: async (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
      const id = randomUUID();
      const res = await pool.query(
        `INSERT INTO orders (id, user_id, material_type, volume, pickup_address, price, status, payment_status, environmental_impact, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) RETURNING *`,
        [id, data.userId, data.materialType, data.volume, data.pickupAddress, data.price, data.status, data.paymentStatus || null, data.environmentalImpact || 0]
      );
      return res.rows[0];
    },
    update: async (query: { where: { id: string }; data: Partial<Order> }): Promise<Order> => {
      const fields = Object.keys(query.data);
      if (fields.length === 0) {
        const res = await pool.query('SELECT * FROM orders WHERE id=$1', [query.where.id]);
        if (!res.rows[0]) throw new Error(`Order not found: ${query.where.id}`);
        return res.rows[0];
      }
      const sets = fields.map((f, i) => `${toSnake(f)}=$${i + 1}`).join(', ');
      const values = fields.map(f => (query.data as any)[f]);
      values.push(query.where.id);
      const res = await pool.query(`UPDATE orders SET ${sets}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`, values);
      if (!res.rows[0]) throw new Error(`Order not found: ${query.where.id}`);
      return res.rows[0];
    },
    delete: async (query: { where: { id: string } }): Promise<Order> => {
      const res = await pool.query('DELETE FROM orders WHERE id=$1 RETURNING *', [query.where.id]);
      if (!res.rows[0]) throw new Error(`Order not found: ${query.where.id}`);
      return res.rows[0];
    },
    updateMany: async (query: { where: { id: string }; data: Partial<Order> }) => {
      return db.order.update(query);
    },
  },

  // Market rate operations
  marketRate: {
    findMany: async (): Promise<MarketRate[]> => {
      const res = await pool.query('SELECT * FROM market_rates');
      return res.rows;
    },
    findFirst: async (query: { where: { materialType: string } }): Promise<MarketRate | null> => {
      const res = await pool.query('SELECT * FROM market_rates WHERE material_type=$1 LIMIT 1', [query.where.materialType]);
      return res.rows[0] || null;
    },
    updateMany: async (query: { where: { materialType: string }; data: Partial<MarketRate> }): Promise<MarketRate> => {
      const fields = Object.keys(query.data);
      const sets = fields.map((f, i) => `${toSnake(f)}=$${i + 1}`).join(', ');
      const values = fields.map(f => (query.data as any)[f]);
      values.push(query.where.materialType);
      const res = await pool.query(`UPDATE market_rates SET ${sets} WHERE material_type=$${values.length} RETURNING *`, values);
      if (!res.rows[0]) throw new Error(`Market rate not found: ${query.where.materialType}`);
      return res.rows[0];
    },
    createMany: async (query: { data: Omit<MarketRate, 'id'>[] }): Promise<MarketRate[]> => {
      const result: MarketRate[] = [];
      for (const rate of query.data) {
        const id = randomUUID();
        const res = await pool.query(
          `INSERT INTO market_rates (id, material_type, price_per_kg, logistics_cost_per_km)
           VALUES ($1,$2,$3,$4) RETURNING *`,
          [id, rate.materialType, rate.pricePerKg, (rate as any).logisticsCostPerKm]
        );
        result.push(res.rows[0]);
      }
      return result;
    },
  },

  // Regional tax operations
  regionalTax: {
    findMany: async (): Promise<RegionalTax[]> => {
      const res = await pool.query('SELECT * FROM regional_taxes');
      return res.rows;
    },
    findFirst: async (query: { where: { region: string } }): Promise<RegionalTax | null> => {
      const res = await pool.query('SELECT * FROM regional_taxes WHERE region=$1 LIMIT 1', [query.where.region]);
      if (res.rows[0]) return res.rows[0];
      const def = await pool.query('SELECT * FROM regional_taxes WHERE region=$1 LIMIT 1', ['По умолчанию']);
      return def.rows[0] || null;
    },
    createMany: async (query: { data: RegionalTax[] }): Promise<RegionalTax[]> => {
      const inserted: RegionalTax[] = [];
      for (const t of query.data) {
        const res = await pool.query(
          `INSERT INTO regional_taxes (region, environmental_tax, customs_duty)
           VALUES ($1,$2,$3) RETURNING *`,
          [t.region, t.environmentalTax, t.customsDuty]
        );
        inserted.push(res.rows[0]);
      }
      return inserted;
    },
  },

  // Financial report operations
  financialReport: {
    findMany: async (query?: { where?: { year: number; month?: number } }): Promise<FinancialReport[]> => {
      let sql = 'SELECT * FROM financial_reports';
      const values: any[] = [];
      const conditions: string[] = [];
      if (query?.where?.year) {
        values.push(query.where.year);
        conditions.push(`year=$${values.length}`);
      }
      if (query?.where?.month !== undefined) {
        values.push(query.where.month);
        conditions.push(`month=$${values.length}`);
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      const res = await pool.query(sql, values);
      return res.rows;
    },
    findUnique: async (query: { where: { id: string } }): Promise<FinancialReport | null> => {
      const res = await pool.query('SELECT * FROM financial_reports WHERE id=$1', [query.where.id]);
      return res.rows[0] || null;
    },
    create: async (data: Omit<FinancialReport, 'id'>): Promise<FinancialReport> => {
      const id = `report-${data.year}-${data.month}`;
      const res = await pool.query(
        `INSERT INTO financial_reports (id, month, year, total_paid, volume, month_name)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           total_paid=EXCLUDED.total_paid,
           volume=EXCLUDED.volume,
           month_name=EXCLUDED.month_name
         RETURNING *`,
        [id, data.month, data.year, data.totalPaid, data.volume, data.monthName]
      );
      return res.rows[0];
    },
  },
};
