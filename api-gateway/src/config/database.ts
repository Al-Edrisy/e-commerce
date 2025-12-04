import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'postgres-gateway',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gateway_database',
  user: process.env.DB_USER || 'gateway_user',
  password: process.env.DB_PASSWORD || 'gateway_pass',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(poolConfig);

// Connection retry logic with exponential backoff
const connectWithRetry = async (
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<void> => {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      console.log('✅ Successfully connected to Gateway PostgreSQL database');
      client.release();
      return;
    } catch (error) {
      retries++;
      console.error(
        `❌ Database connection attempt ${retries}/${maxRetries} failed:`,
        error instanceof Error ? error.message : error
      );

      if (retries >= maxRetries) {
        console.error('❌ Max retries reached. Could not connect to database.');
        throw new Error('Failed to connect to database after maximum retries');
      }

      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      // Exponential backoff with max delay of 10 seconds
      delay = Math.min(delay * 2, 10000);
    }
  }
};

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

// Initialize connection on module load
connectWithRetry().catch((error) => {
  console.error('Failed to initialize database connection:', error);
  // Don't exit process, allow application to start but log the error
});

export { pool, connectWithRetry };
export default pool;
