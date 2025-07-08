import { NodeSDK } from '@opentelemetry/sdk-node';
//import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
//import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredVars = ['APP_NAME', 'OTEL_EXPORTER_OTLP_ENDPOINT'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Set up diagnostic logging, tells you if something has failed
//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.APP_NAME,
        [ATTR_SERVICE_VERSION]: process.env.APP_VERSION ? process.env.APP_VERSION : "1.0",
    }),

    traceExporter: new OTLPTraceExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
        headers: {}
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
            headers: {}
        }),
    }),
    logRecordProcessor: new SimpleLogRecordProcessor(
        new OTLPLogExporter({
            url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
            headers: {}
        })
    ),
    instrumentations: [getNodeAutoInstrumentations()],
});




async function initOtel() {
    await sdk.start();
    console.log('OTel initialized');
}


export const logger = {
    info: (message: string, attributes?: Record<string, string | number | boolean | undefined>) => {
        const logger = logs.getLogger(`${process.env.APP_NAME}`);

        logger.emit({
            severityNumber: SeverityNumber.INFO,
            severityText: 'INFO',
            body: message,
            attributes: attributes

        });
        console.log(message, attributes);
    },
    error: (message: string | Error, attributes?: Record<string, string | number | boolean | undefined>) => {
        const logger = logs.getLogger(`${process.env.APP_NAME}`);

        let body: string;
        let errorAttributes: Record<string, string | number | boolean | undefined> = {};

        if (message instanceof Error) {
            body = message.message;
            errorAttributes = {
                'error.name': message.name,
                'error.message': message.message,
                'error.stack': message.stack,
                ...attributes
            };
        } else {
            body = message;
            errorAttributes = attributes || {};
        }

        logger.emit({
            severityNumber: SeverityNumber.ERROR,
            severityText: 'ERROR',
            body: body,
            attributes: errorAttributes

        });
        console.log(body, errorAttributes);
    },

    warn: (message: string, attributes?: Record<string, string | number | boolean | undefined>) => {
        const logger = logs.getLogger(`${process.env.APP_NAME}`);

        logger.emit({
            severityNumber: SeverityNumber.WARN,
            severityText: 'WARN',
            body: message,
            attributes: attributes

        });
        console.log(message, attributes);
    },
};

initOtel().catch(console.error);