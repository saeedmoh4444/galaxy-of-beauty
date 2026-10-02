import { describe, expect, it } from 'vitest';

import * as ui from './index';
import * as shared from '@galaxy/shared';
import * as components from './components/index';
import * as hooks from './hooks/index';
import * as utils from './utils/index';

describe('@galaxy/ui barrel', () => {
  it('re-exports the shared surface (types, theme, i18n, constants)', () => {
    for (const key of Object.keys(shared)) {
      expect(ui[key as keyof typeof ui], `missing shared export: ${key}`).toBeDefined();
    }
  });

  it('re-exports all components', () => {
    for (const key of Object.keys(components)) {
      expect(ui[key as keyof typeof ui], `missing component export: ${key}`).toBeDefined();
    }
  });

  it('re-exports all hooks', () => {
    for (const key of Object.keys(hooks)) {
      expect(ui[key as keyof typeof ui], `missing hook export: ${key}`).toBeDefined();
    }
  });

  it('re-exports all utils', () => {
    for (const key of Object.keys(utils)) {
      expect(ui[key as keyof typeof ui], `missing util export: ${key}`).toBeDefined();
    }
  });

  it('exposes the convenience helpers used across web', () => {
    expect(typeof ui.cn).toBe('function');
    expect(typeof ui.formatCurrency).toBe('function');
  });
});
