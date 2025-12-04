import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import gatewayRouter from './routes/gateway';
import { requestLogger } from './middleware/logger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('combined'));
// Body parsers removed to allow proxy to handle request stream
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Custom request logger with database integration
app.use(requestLogger);

// Routes
app.use('/api', gatewayRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users/*',
      products: '/api/products/*',
      orders: '/api/orders/*'
    }
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 API Gateway Started Successfully');
  console.log('========================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📡 Service Routes:');
  console.log(`   User Service:    ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`   Product Service: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`   Order Service:   ${process.env.ORDER_SERVICE_URL || 'http://localhost:8080'}`);
  console.log('');
  console.log('🗄️  Database:');
  console.log(`   Host: ${process.env.DB_HOST || 'postgres-gateway'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'gateway_database'}`);
  console.log('');
  console.log('🔒 CORS Origin:', process.env.CORS_ORIGIN || '*');
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('   GET  / - Service information');
  console.log('   GET  /health - Health check');
  console.log('   *    /api/users/* - User Service');
  console.log('   *    /api/products/* - Product Service');
  console.log('   *    /api/categories/* - Product Service');
  console.log('   *    /api/orders/* - Order Service');
  console.log('   *    /api/payments/* - Order Service');
  console.log('========================================\n');
});

