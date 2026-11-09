/**
 * F2 — pure OpenAPI builder for the tRPC contract.
 *
 * Takes router meta (extracted from the appRouter by gen-openapi.mjs — the
 * zod schemas arrive PRE-converted to plain JSON Schema so this module has
 * zero runtime dependencies and is directly testable under node --test.
 *
 * The documented wire contract is the app's own HTTP shape:
 *   POST /api/trpc/<router>.<procedure>?batch=1
 *   body: {"0": {"json": <input>}}        (procedures with input)
 *   body: {"0": {"json": {}}}             (procedures without input)
 */

export function buildOpenApi(meta, info = {}) {
  const paths = {};
  const schemas = {};

  for (const router of meta.routers) {
    for (const proc of router.procedures) {
      const path = `/api/trpc/${router.name}.${proc.name}`;
      const inputSchema = proc.inputSchema ?? { type: 'object', additionalProperties: false };

      const schemaName = `${router.name}_${proc.name}_input`;
      schemas[schemaName] = inputSchema;

      paths[path] = {
        post: {
          operationId: `${router.name}_${proc.name}`,
          tags: [router.name],
          summary: `${router.name}.${proc.name} (${proc.type})`,
          description:
            'tRPC procedure. POST with the batch envelope — body `{"0":{"json":<input>}}`; ' +
            'responses arrive as `[{"result":{"data":…}}]` or `[{"error":{…}}]`.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    0: {
                      type: 'object',
                      properties: {
                        json: { $ref: `#/components/schemas/${schemaName}` },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'tRPC batch envelope — result.data or error',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: { result: { type: 'object' } },
                          required: ['result'],
                        },
                        {
                          type: 'object',
                          properties: { error: { type: 'object' } },
                          required: ['error'],
                        },
                      ],
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request — invalid input or missing content-type' },
            403: { description: 'CSRF failure (browser POST without x-csrf-token)' },
            415: { description: 'Missing Content-Type: application/json on POST' },
          },
        },
      };
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: info.title ?? 'Galaxy of Beauty API (tRPC)',
      version: info.version ?? '2.2.0',
      description:
        info.description ??
        'Machine-readable contract for the tRPC API. Generated from the appRouter — ' +
          'one path per procedure with its zod input schema; the batch envelope ' +
          '{"0":{"json":…}} is the wire format the web and mobile clients send.',
    },
    servers: info.servers ?? [{ url: 'http://localhost:3000' }],
    paths,
    components: { schemas },
  };
}
