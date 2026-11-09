// --- Women-Specific Service Catalog (Static Data) ---
// 94 categories split across womensServicesCatalog1..4.ts (contiguous
// chunks of the original 3,359-line monolith). Merge order matches the
// original file exactly, so the categories endpoint order is unchanged.
// Imported by womensServices.ts for use in the API router.

import { womensCatalog1 } from './womensServicesCatalog1';
import { womensCatalog2 } from './womensServicesCatalog2';
import { womensCatalog3 } from './womensServicesCatalog3';
import { womensCatalog4 } from './womensServicesCatalog4';

export const WOMENS_SERVICES = {
  ...womensCatalog1,
  ...womensCatalog2,
  ...womensCatalog3,
  ...womensCatalog4,
};
