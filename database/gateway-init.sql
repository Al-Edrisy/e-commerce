-- API Gateway Database Initialization Script
-- Database: gateway_database
-- User: gateway_user

-- ============================================================================
-- SCHEMA CREATION
-- ============================================================================

-- API Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50),
    path TEXT,
    method VARCHAR(10),
    status_code INTEGER,
    latency_ms INTEGER,
    user_uid VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Logs Indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_service_name ON api_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_uid ON api_logs(user_uid);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100),
    user_uid VARCHAR(255),
    session_id VARCHAR(100),
    properties JSONB,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_uid ON analytics_events(user_uid);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'API Gateway database initialization completed successfully';
    RAISE NOTICE 'Created tables: api_logs, analytics_events';
    RAISE NOTICE 'GIN indexes created for JSONB columns';
END $$;
