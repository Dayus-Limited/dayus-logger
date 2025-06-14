import { createLogger, getLogger, resetLogger } from '../src';

jest.mock('winston', () => ({
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        json: jest.fn(),
        label: jest.fn(),
        metadata: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn()
    },
    createLogger: jest.fn().mockImplementation(() => ({
        info: jest.fn(),
        error: jest.fn(),
        close: jest.fn((cb) => cb())
    }))
}));

jest.mock('winston-loki', () => {
    return jest.fn().mockImplementation(() => ({
        onConnectionError: jest.fn()
    }));
});

describe('Logger Module', () => {
    beforeEach(() => {
        resetLogger();
        process.env = {
            JOB_NAME: 'test-job',
            APP_NAME: 'test-app',
            LOKI_URL: 'http://localhost:3100'
        };
    });


    afterEach(() => {
        resetLogger();
        jest.clearAllMocks();
    });



    it('should create a logger instance', () => {
        const logger = createLogger({
            jobName: process.env.JOB_NAME!,
            appName: process.env.APP_NAME!,
            lokiUrl: process.env.LOKI_URL!
        });

        expect(logger).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.error).toBeDefined();
    });

    it('should return same instance via getLogger', () => {
        const logger1 = createLogger({
            jobName: process.env.JOB_NAME!,
            appName: process.env.APP_NAME!,
            lokiUrl: process.env.LOKI_URL!
        });
        const logger2 = getLogger();

        expect(logger1).toBe(logger2);
    });

});
