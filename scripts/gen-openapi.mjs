#!/usr/bin/env node
/**
 * F2 — generate postman/openapi.json from the tRPC appRouter.
 *
 * Walks the router tree (tRPC v11: `record` holds BOTH procedures —
 * entries with a `procedure` field — and sub-routers — entries with
 * `_def.record`), converts every procedure's zod input to JSON Schema
 * (zod-to-json-schema), and hands the meta to the pure builder.
 *
 * Run: pnpm --filter @galaxy/api exec tsx ../../scripts/gen-openapi.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { appRouter } from '../packages/api/src/routers/index.ts';
import { buildOpenApi } from './lib/openapi-builder.mjs';

const byRouter = new Map(); // routerName -> [{name, type, inputSchema}]

/**
 * zod 4 → JSON Schema, hand-rolled for the shapes this repo's validators
 * use (zod-to-json-schema 3.25 silently returns {} for zod 4's `.def`
 * internals). The def shapes were probed directly:
 *   object {type:'object', shape:{k:<instance>}} · string checks
 *   [{def:{check:'string_format',format:'email'|'url'}}] · number checks
 *   [{def:{check:'number_format',format:'safeint'}}] · enum {entries} ·
 *   array {innerType} · optional/nullable {innerType} · union {options} ·
 *   record {keyType,valueType} · literal {values} · date {type:'date'} ·
 *   default {innerType} · coerce {type:'number',coerce:true,…}
 */
function zodToJson(schema) {
  if (!schema || typeof schema !== 'object') return null;
  const def = schema.def ?? schema._def;
  if (!def || typeof def !== 'object') return null;
  switch (def.type) {
    case 'string': {
      const out = { type: 'string' };
      for (const c of def.checks ?? []) {
        const format = c?.def?.format;
        if (format === 'email') out.format = 'email';
        else if (format === 'url' || format === 'uri') out.format = 'uri';
        else if (format === 'uuid') out.format = 'uuid';
        else if (format === 'date-time' || format === 'datetime') out.format = 'date-time';
        else if (c?.def?.check === 'string_format' && format) out.format = format;
      }
      return out;
    }
    case 'number': {
      const out = { type: 'number' };
      const int = (def.checks ?? []).some(
        (c) => c?.def?.format === 'safeint' || c?.def?.check === 'number_format',
      );
      if (int) out.type = 'integer';
      return out;
    }
    case 'boolean':
      return { type: 'boolean' };
    case 'date':
      return { type: 'string', format: 'date-time' };
    case 'literal':
      return { enum: def.values ?? [def.value] };
    case 'enum':
      return { type: 'string', enum: Object.values(def.entries ?? {}) };
    case 'array': {
      const items = zodToJson(def.innerType ?? def.element) ?? {};
      return { type: 'array', items };
    }
    case 'object': {
      const properties = {};
      const required = [];
      for (const [k, v] of Object.entries(def.shape ?? {})) {
        const converted = zodToJson(v);
        if (!converted) continue;
        properties[k] = converted;
        if (!(
          v?.def?.type === 'optional' ||
          v?.def?.type === 'nullable' ||
          v?.def?.type === 'default'
        )) {
          required.push(k);
        }
      }
      return { type: 'object', properties, ...(required.length ? { required } : {}) };
    }
    case 'optional':
    case 'nullable': {
      const inner = zodToJson(def.innerType) ?? {};
      return { ...inner, nullable: true };
    }
    case 'default':
      return zodToJson(def.innerType);
    case 'union': {
      const opts = (def.options ?? []).map(zodToJson).filter(Boolean);
      return opts.length ? { oneOf: opts } : {};
    }
    case 'record': {
      const values = zodToJson(def.valueType ?? def.value) ?? {};
      return { type: 'object', additionalProperties: values };
    }
    case 'effects':
    case 'transform':
    case 'preprocess':
    case 'pipe':
      return zodToJson(def.schema ?? def.innerType ?? def.type);
    case 'tuple':
      return {
        type: 'array',
        items: { oneOf: (def.items ?? []).map(zodToJson).filter(Boolean) },
      };
    case 'discriminated_union':
      return { oneOf: (def.options ?? []).map(zodToJson).filter(Boolean) };
    default:
      return null;
  }
}

function pushProcedure(routerName, procName, entry) {
  const def = entry?._def ?? {};
  // zod 4: the input entry IS the schema instance (it carries .def);
  // older tRPC shapes wrapped it as {type: <schema>}.
  const inputEntry = def.inputs?.[0] ?? null;
  const zodType = inputEntry?.def ? inputEntry : (inputEntry?.type ?? null);
  const inputSchema = zodType ? zodToJson(zodType) : null;
  const list = byRouter.get(routerName) ?? [];
  list.push({
    name: procName,
    type: entry?.procedure === 'mutation' ? 'mutation' : 'query',
    inputSchema,
  });
  byRouter.set(routerName, list);
}

/**
 * tRPC v11 record shape: the appRouter's `_def.record` maps each child to
 * EITHER a procedure def (top-level procedures like `health` — entries with
 * a `procedure` field) OR the child router's own procedure map (an object
 * of procedure defs, possibly nested for sub-routers).
 */
function walk(record, prefix) {
  for (const [key, entry] of Object.entries(record)) {
    // tRPC procedure defs are CALLABLE FUNCTIONS (typeof 'function'), not
    // plain objects — both must pass the guard.
    if (!entry || (typeof entry !== 'object' && typeof entry !== 'function')) continue;
    if (entry.procedure !== undefined) {
      pushProcedure(prefix || 'root', key, entry);
    } else {
      walk(entry, prefix ? `${prefix}.${key}` : key);
    }
  }
}

walk(appRouter._def.record, '');

const routers = [...byRouter.entries()].map(([name, procedures]) => ({ name, procedures }));
const spec = buildOpenApi({ routers });

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'postman');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'openapi.json');
writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n');

const total = routers.reduce((n, r) => n + r.procedures.length, 0);
console.log(`OpenAPI generated: ${routers.length} routers, ${total} procedures -> ${outPath}`);
// The API's worker schedulers keep the event loop alive after imports —
// the generation is done, exit explicitly.
process.exit(0);
