// src/services/eventService.js
// Basic event system stub for section 12.2
const logger = require('./loggingService');

const eventQueue = [];

function emitEvent(type, data) {
  const event = {
    type,
    data,
    timestamp: new Date().toISOString()
  };
  // TODO: In production, push to real message queue (e.g., RabbitMQ, Kafka)
  eventQueue.push(event);
  logger.info(`[EVENT] ${type} - ${JSON.stringify(data)}`);
}

module.exports = {
  emitEvent,
  // In production add: subscribeEvent, publish to MQ, etc.
};
