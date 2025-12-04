import pool from '../config/database';

/**
 * Interface for API request log data
 */
export interface ApiLogData {
  service_name: string;
  path: string;
  method: string;
  status_code: number;
  latency_ms: number;
  user_uid?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
}

/**
 * Interface for analytics event data
 */
export interface AnalyticsEventData {
  event_name: string;
  user_uid?: string | null;
  session_id?: string | null;
  properties?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

/**
 * Log an API request to the database
 * @param logData - API request log data
 * @returns Promise<void>
 */
export const logApiRequest = async (logData: ApiLogData): Promise<void> => {
  const query = `
    INSERT INTO api_logs (
      service_name,
      path,
      method,
      status_code,
      latency_ms,
      user_uid,
      ip_address,
      user_agent,
      request_id,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
  `;

  const values = [
    logData.service_name,
    logData.path,
    logData.method,
    logData.status_code,
    logData.latency_ms,
    logData.user_uid || null,
    logData.ip_address || null,
    logData.user_agent || null,
    logData.request_id || null,
  ];

  try {
    await pool.query(query, values);
  } catch (error) {
    // Log error but don't throw to prevent logging failures from breaking the application
    console.error('Failed to log API request to database:', error instanceof Error ? error.message : error);
  }
};

/**
 * Log an analytics event to the database
 * @param eventData - Analytics event data
 * @returns Promise<void>
 */
export const logAnalyticsEvent = async (eventData: AnalyticsEventData): Promise<void> => {
  const query = `
    INSERT INTO analytics_events (
      event_name,
      user_uid,
      session_id,
      properties,
      ip_address,
      user_agent,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
  `;

  const values = [
    eventData.event_name,
    eventData.user_uid || null,
    eventData.session_id || null,
    eventData.properties ? JSON.stringify(eventData.properties) : null,
    eventData.ip_address || null,
    eventData.user_agent || null,
    eventData.referrer || null,
    eventData.utm_source || null,
    eventData.utm_medium || null,
    eventData.utm_campaign || null,
  ];

  try {
    await pool.query(query, values);
  } catch (error) {
    // Log error but don't throw to prevent logging failures from breaking the application
    console.error('Failed to log analytics event to database:', error instanceof Error ? error.message : error);
  }
};

/**
 * Log an analytics event asynchronously (fire and forget)
 * @param eventData - Analytics event data
 */
export const logAnalyticsEventAsync = (eventData: AnalyticsEventData): void => {
  logAnalyticsEvent(eventData).catch((error) => {
    console.error('Async analytics event logging failed:', error);
  });
};

/**
 * Log an API request asynchronously (fire and forget)
 * @param logData - API request log data
 */
export const logApiRequestAsync = (logData: ApiLogData): void => {
  logApiRequest(logData).catch((error) => {
    console.error('Async API request logging failed:', error);
  });
};
