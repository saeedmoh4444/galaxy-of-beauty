/**
 * 7.3 Observability 2.0 — tracing facade tests.
 *
 * OTel is a real dependency (unlike the sentry facade) but loads lazily
 * behind OTEL_ENABLED. These tests drive: the disabled fast-path, the
 * SDK bootstrap when enabled (mocked exporters), the noop span behavior
 * for call sites when no provider is registered, and a middleware smoke
 * test through a real tRPC caller.
 */
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { trace as apiTrace } from '@opentelemetry/api';
import { initTracing, isTracingEnabled, startProcedureSpan } from '../lib/tracing';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const { startMock, sdkMock } = vi.hoisted(() => {
  const startMock = vi.fn();
  const sdkMock = vi.fn().mockImplementation(() => ({ start: startMock }));
  return { startMock, sdkMock };
});

vi.mock('@opentelemetry/sdk-node', () => ({ NodeSDK: sdkMock }));
vi.mock('@opentelemetry/sdk-trace-node', () => ({
  ConsoleSpanExporter: vi.fn(),
}));
vi.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: vi.fn(),
}));

describe('tracing facade', () => {
  beforeEach(() => {
    delete process.env['OTEL_ENABLED'];
    delete process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
    sdkMock.mockClear();
    startMock.mockClear();
    // restoreAllMocks strips vi.fn implementations — re-apply the factory.
    sdkMock.mockImplementation(() => ({ start: startMock }));
  });

  afterEach(() => {
    delete process.env['OTEL_ENABLED'];
    delete process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
    // restoreAllMocks would strip the vi.mock factory impl — clear instead.
    sdkMock.mockClear();
    startMock.mockClear();
    vi.restoreAllMocks();
  });

  it('is disabled by default — no SDK bootstrap, spans are noops', async () => {
    const ok = await initTracing();
    expect(ok).toBe(false);
    expect(isTracingEnabled()).toBe(false);
    expect(sdkMock).not.toHaveBeenCalled();

    const span = startProcedureSpan('health.check', 'query');
    expect(span.isRecording()).toBe(false);
    expect(() => span.end()).not.toThrow();
  });

  it('bootstraps the SDK with a console exporter when enabled', async () => {
    process.env['OTEL_ENABLED'] = 'true';
    const ok = await initTracing();
    expect(ok).toBe(true);
    expect(isTracingEnabled()).toBe(true);
    expect(sdkMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it('degrades to disabled when the SDK import fails', async () => {
    process.env['OTEL_ENABLED'] = 'true';
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    sdkMock.mockImplementationOnce(() => {
      throw new Error('no sdk');
    });
    const ok = await initTracing();
    expect(ok).toBe(false);
    expect(isTracingEnabled()).toBe(false);
    expect(errSpy).toHaveBeenCalled();
  });

  it('passes procedure attributes to the tracer', () => {
    const startSpan = vi.fn().mockReturnValue({ end: vi.fn(), isRecording: () => true });
    vi.spyOn(apiTrace, 'getTracer').mockReturnValue({
      startSpan,
    } as never);

    startProcedureSpan('services.list', 'query', { 'user.id': 'anonymous' });

    expect(startSpan).toHaveBeenCalledWith('trpc.services.list', {
      attributes: { 'trpc.path': 'services.list', 'trpc.type': 'query', 'user.id': 'anonymous' },
    });
  });

  it('tRPC calls succeed with the tracing middleware in the chain', async () => {
    const ctx = await createTRPCContext();
    const caller = (appRouter as any).createCaller(ctx);
    const result = await caller.seasonalServices.active();
    expect(result).toHaveProperty('seasons');
    expect(result).toHaveProperty('items');
  });
});
