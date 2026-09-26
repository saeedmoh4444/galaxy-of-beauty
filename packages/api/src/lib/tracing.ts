/**
 * 7.3 Observability 2.0 — OpenTelemetry tracing facade.
 *
 * The OTel SDK is loaded lazily behind OTEL_ENABLED (same pattern as the
 * sentry facade): when disabled, spans are no-ops via the OTel API's
 * noop tracer, so call sites never branch. Exporter: OTLP HTTP when
 * OTEL_EXPORTER_OTLP_ENDPOINT is set, else console (dev).
 */
import { trace, type Span, type Attributes } from '@opentelemetry/api';

let enabled = false;

export async function initTracing(): Promise<boolean> {
  if (process.env.OTEL_ENABLED !== 'true') return false;
  enabled = false; // reset before (re)bootstrap so a failed init degrades cleanly
  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { ConsoleSpanExporter } = await import('@opentelemetry/sdk-trace-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const sdk = new NodeSDK({
      serviceName: process.env.OTEL_SERVICE_NAME ?? 'galaxy-api',
      traceExporter: endpoint
        ? new OTLPTraceExporter({ url: endpoint })
        : new ConsoleSpanExporter(),
    });
    sdk.start();
    enabled = true;
    return true;
  } catch (err) {
    console.error('[tracing] OTel init failed, tracing disabled:', err);
    return false;
  }
}

export function isTracingEnabled(): boolean {
  return enabled;
}

/** Span per tRPC procedure; attrs recorded when a real provider exists. */
export function startProcedureSpan(
  path: string,
  type: 'query' | 'mutation',
  attrs?: Attributes,
): Span {
  return trace.getTracer('galaxy-api').startSpan(`trpc.${path}`, {
    attributes: { 'trpc.path': path, 'trpc.type': type, ...attrs },
  });
}
