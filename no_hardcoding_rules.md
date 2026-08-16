# No‑Hardcoding Rules (Master File)

## For Existing Large Projects

- This ruleset applies to **all new code** you generate.
- When touching existing code, refactor **only the part you are changing**, using the same patterns. Do not rewrite the whole file.
- If you see a hard‑coded value in a line you are **not** modifying, leave it alone unless explicitly asked to fix it.
- When a task requires a new value, always externalise it – even if the surrounding old code does not. Be the good example.

---

## 1. Core Principle

Every value that might change between environments (dev, staging, prod), be reused elsewhere, or requires secrecy must live in configuration – **never inside the logic**.

Think of the code as a fixed blueprint, and configuration as the interchangeable parts.

---

## 2. What Is Hard‑coding (Forbidden)

- API base URLs, endpoints, paths
- Credentials, API keys, tokens, secrets
- Timeouts, limits, thresholds, sizes, retry counts
- File paths, directories, server addresses
- Environment names, feature flags, runtime modes
- Database connection strings, ports, hostnames
- Any business‑meaningful literal number or string

**Allowed**: Pure mathematical constants (`math.pi`, 180 degrees, milliseconds in a second), loop counters starting at 0, empty string `""` as a default initialiser, and language keywords.

---

## 3. The Only Correct Ways to Inject Values

1. **Environment variables** – loaded once at startup (`.env` file with a loader)
2. **Configuration files** – YAML, JSON, TOML, .ini – loaded once at startup
3. **Named constants at module level** – only if the value is truly invariant across all environments (still document with a comment)

Never put a changeable value inside a function, method, or class body.

---

## 4. Language Patterns (copy‑paste ready)

### JavaScript / TypeScript

// BAD
const url = "https://api.example.com/v2/data";

// GOOD
const API_BASE = process.env.API_BASE_URL || "https://api.example.com/v2";
const TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || "30", 10);
fetch(`${API_BASE}/data`, { signal: AbortSignal.timeout(TIMEOUT) });
