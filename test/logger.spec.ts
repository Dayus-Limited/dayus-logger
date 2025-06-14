import { createLogger, getLogger, resetLogger } from '../src';
import winston from 'winston';

describe('Logger Module', () => {
    beforeEach(() => {
        resetLogger();
    });

    it('should create a logger instance', () => {
        const logger = createLogger({
            jobName: 'test-job',
            appName: 'test-app'
        });

        expect(logger).toBeInstanceOf(winston.Logger);
    });

    it('should throw if getLogger called before initialization', () => {
        resetLogger();
        expect(() => getLogger()).toThrow('Logger not initialized. Call createLogger() first.');
    });

    it('should return same instance via getLogger', () => {
        const logger1 = createLogger({
            jobName: 'test-job',
            appName: 'test-app'
        });
        const logger2 = getLogger();

        expect(logger1).toBe(logger2);
    });
});
