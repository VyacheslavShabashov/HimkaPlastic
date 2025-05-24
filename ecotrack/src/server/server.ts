import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as api from '../api/api';
import { requireAuth, requireAdmin, getAuth } from './actions';
import { getYandexMapsApiScript } from '../utils/yandexMaps';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Authentication middleware
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const auth = await getAuth(token);
    
    if (auth.status !== 'authenticated') {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Attach user info to request
    (req as any).auth = auth;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Admin middleware
const adminMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const auth = await getAuth(token);
    
    if (auth.status !== 'authenticated' || auth.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    
    // Attach user info to request
    (req as any).auth = auth;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({ error: 'Admin privileges required' });
  }
};

// API Routes
// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, totp } = req.body;
    const result = await api.signIn(email, password, totp);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: (error as Error).message || 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, companyName } = req.body;
    const result = await api.signUp({ email, password, name, companyName });
    res.json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: (error as Error).message || 'Registration failed' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await api.signOut(token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(400).json({ error: (error as Error).message || 'Logout failed' });
  }
});

// User profile
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await api.getCurrentUser();
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to get profile' });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userData = req.body;
    const updatedUser = await api.updateUserProfile(userData);
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to update profile' });
  }
});

// Market Rates
app.get('/api/market-rates', async (req, res) => {
  try {
    const rates = await api.getMarketRates();
    res.json(rates);
  } catch (error) {
    console.error('Market rates error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to get market rates' });
  }
});

app.put('/api/market-rates', adminMiddleware, async (req, res) => {
  try {
    const { materialType, pricePerKg } = req.body;
    const updatedRate = await api.updateMarketRate({ materialType, pricePerKg });
    res.json(updatedRate);
  } catch (error) {
    console.error('Market rate update error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to update market rate' });
  }
});

// Order Management
app.post('/api/calculate-price', async (req, res) => {
  try {
    const orderData = req.body;
    const priceCalculation = await api.calculateOrderPrice(orderData);
    res.json(priceCalculation);
  } catch (error) {
    console.error('Price calculation error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to calculate price' });
  }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orderData = req.body;
    const order = await api.createOrder(orderData);
    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to create order' });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await api.getUserOrders();
    res.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await api.getOrderById({ id: req.params.id });
    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to fetch order' });
  }
});

app.put('/api/orders/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await api.updateOrderStatus({ id: req.params.id, status });
    res.json(order);
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to update order status' });
  }
});

app.put('/api/orders/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await api.updatePaymentStatus({ orderId: req.params.id, status });
    res.json(order);
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to update payment status' });
  }
});

// Analytics
app.get('/api/analytics', authMiddleware, async (req, res) => {
  try {
    const analytics = await api.getUserAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to get analytics' });
  }
});

// Financial Reports
app.get('/api/financial-reports/yearly/:year', authMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const reports = await api.getYearlyFinancialReports({ year });
    res.json(reports);
  } catch (error) {
    console.error('Yearly reports error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to get yearly reports' });
  }
});

app.get('/api/financial-reports/monthly/:year/:month', authMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const report = await api.getMonthlyFinancialReport({ year, month });
    res.json(report);
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to get monthly report' });
  }
});

// Admin routes
app.get('/api/admin/orders', adminMiddleware, async (req, res) => {
  try {
    const orders = await api.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(400).json({ error: (error as Error).message || 'Failed to get all orders' });
  }
});

// Yandex Maps API
app.get('/api/maps/config', (req, res) => {
  const apiKey = process.env.YANDEX_MAPS_API_KEY as string;
  if (!apiKey) {
    return res.status(500).json({ error: 'YANDEX_MAPS_API_KEY is not configured' });
  }
  res.json({
    apiKey,
    scriptUrl: `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app; 