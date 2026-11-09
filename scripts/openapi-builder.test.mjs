/**
 * F2 — the OpenAPI builder's contract: one path per procedure, the input
 * schema lands inside the tRPC batch envelope, and no-input procedures
 * get an empty-object envelope. Pure — no TS imports, runs under
 * `node --test scripts/*.test.mjs` in the Architecture Gates job.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenApi } from './lib/openapi-builder.mjs';

const sampleMeta = {
  routers: [
    {
      name: 'auth',
      procedures: [
        {
          name: 'login',
          type: 'mutation',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              password: { type: 'string', minLength: 8 },
            },
            required: ['email', 'password'],
          },
        },
        { name: 'logout', type: 'mutation', inputSchema: null },
      ],
    },
  ],
};

test('emits one POST path per procedure with the batch envelope', () => {
  const spec = buildOpenApi(sampleMeta);
  const login = spec.paths['/api/trpc/auth.login'].post;
  assert.ok(login);
  assert.equal(login.operationId, 'auth_login');
  assert.deepEqual(login.tags, ['auth']);
  const env = login.requestBody.content['application/json'].schema.properties['0'];
  assert.ok(env);
  const ref = env.properties.json.$ref;
  assert.equal(ref, '#/components/schemas/auth_login_input');
  assert.deepEqual(spec.components.schemas.auth_login_input, {
    type: 'object',
    properties: { email: { type: 'string' }, password: { type: 'string', minLength: 8 } },
    required: ['email', 'password'],
  });
});

test('procedures without input get an empty-object envelope', () => {
  const spec = buildOpenApi(sampleMeta);
  const logout = spec.paths['/api/trpc/auth.logout'].post;
  const env = logout.requestBody.content['application/json'].schema.properties['0'];
  const ref = env.properties.json.$ref;
  assert.deepEqual(spec.components.schemas[ref.replace('#/components/schemas/', '')], {
    type: 'object',
    additionalProperties: false,
  });
});

test('documents the tRPC envelope responses', () => {
  const spec = buildOpenApi(sampleMeta);
  const res = spec.paths['/api/trpc/auth.login'].post.responses;
  assert.ok(res['200']);
  assert.ok(res['415']); // the missing-content-type contract
});

test('carries info + servers overrides', () => {
  const spec = buildOpenApi(sampleMeta, {
    title: 'X',
    version: '1.0.0',
    servers: [{ url: 'https://api.example.com' }],
  });
  assert.equal(spec.info.title, 'X');
  assert.equal(spec.info.version, '1.0.0');
  assert.deepEqual(spec.servers, [{ url: 'https://api.example.com' }]);
});
