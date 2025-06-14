# @dayus/logger

A reusable Winston-based logger module with Loki support.

## Features

- Console and file logging out of the box
- Optional Loki integration for centralized logging
- TypeScript support
- Singleton pattern with lazy initialization

## Installation

```bash
npm install @dayus/logger
```

## Usage

### Basic Setup

```typescript
import { createLogger, getLogger } from '@dayus/logger';

// Initialize the logger
createLogger({
  jobName: 'my-app',
  appName: 'backend-service',
  logLevel: 'info'
});

// Get logger instance
const logger = getLogger();
logger.info('Application started');
```

### With Loki

```typescript
createLogger({
  jobName: 'my-app',
  appName: 'backend-service',
  lokiUrl: 'http://loki:3100',
  logLevel: 'debug'
});
```

### Environment Variables

The logger can also be configured via environment variables:

- `LOG_LEVEL`: Log level (default: 'info')
- `LOKI_URL`: Loki endpoint URL (optional)
- `NODE_ENV`: Environment (default: 'development')

## API

### `createLogger(options: LoggerOptions): winston.Logger`

Initializes the logger with the given options.

### `getLogger(): winston.Logger`

Returns the logger instance. Throws if not initialized.

### `resetLogger(): void`

Resets the logger instance (primarily for testing).

## LoggerOptions

```typescript
interface LoggerOptions {
  jobName: string;    // Identifier for the logging job
  appName: string;    // Application identifier
  lokiUrl?: string;   // Optional Loki URL
  logLevel?: string;  // Log level (default: 'info')
  nodeEnv?: string;   // Environment (default: 'development')
}
```

## Testing

```bash
npm test
