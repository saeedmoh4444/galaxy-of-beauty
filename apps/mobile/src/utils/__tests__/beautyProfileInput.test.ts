import { describe, it, expect } from 'vitest';
import { buildBeautyProfileInput, BEAUTY_PROFILE_OPTIONS } from '@galaxy/shared';

describe('BEAUTY_PROFILE_OPTIONS', () => {
  it('covers every selectable category with at least 3 options', () => {
    const cats: Array<keyof typeof BEAUTY_PROFILE_OPTIONS> = [
      'skinTypes',
      'hairTypes',
      'hairLengths',
      'skinTones',
      'makeupStyles',
      'concerns',
      'scents',
    ];
    cats.forEach((k) => {
      expect(BEAUTY_PROFILE_OPTIONS[k].length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('buildBeautyProfileInput', () => {
  const base = {
    skinType: '',
    hairType: '',
    hairLength: '',
    skinTone: '',
    makeupStyle: '',
    concerns: [] as string[],
    scents: [] as string[],
    notes: '',
    heightCm: '',
    weightKg: '',
    waistCm: '',
    fitnessGoals: [] as string[],
  };

  it('maps filled form state onto the upsert input', () => {
    const input = buildBeautyProfileInput({
      ...base,
      skinType: 'dry',
      hairType: 'curly',
      hairLength: 'long',
      skinTone: 'olive',
      makeupStyle: 'natural',
      concerns: ['acne', 'aging'],
      scents: ['floral'],
      notes: 'مفضلاتي',
      heightCm: '165',
      weightKg: '60',
      waistCm: '70',
      fitnessGoals: ['tone'],
    });

    expect(input).toEqual({
      skinType: 'dry',
      hairType: 'curly',
      hairLength: 'long',
      skinTone: 'olive',
      makeupStyle: 'natural',
      concerns: ['acne', 'aging'],
      preferredScents: ['floral'],
      notes: 'مفضلاتي',
      measurements: { heightCm: 165, weightKg: 60, waistCm: 70 },
      fitnessGoals: ['tone'],
    });
  });

  it('omits empty optional fields and never sends undefined arrays', () => {
    const input = buildBeautyProfileInput(base);

    expect(input).toEqual({ measurements: {} });
    expect('skinType' in input).toBe(false);
    expect('concerns' in input).toBe(false);
    expect('preferredScents' in input).toBe(false);
    expect('notes' in input).toBe(false);
    expect('fitnessGoals' in input).toBe(false);
  });

  it('parses measurements defensively (garbage → omitted)', () => {
    const input = buildBeautyProfileInput({ ...base, heightCm: 'abc', weightKg: '-5' });

    expect(input.measurements).toEqual({});
  });

  it('filters blank concerns/scents entries', () => {
    const input = buildBeautyProfileInput({
      ...base,
      concerns: ['acne', '', '  '],
      scents: ['floral', ''],
    });

    expect(input.concerns).toEqual(['acne']);
    expect(input.preferredScents).toEqual(['floral']);
  });
});
