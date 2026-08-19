import { View, Text, TouchableOpacity } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Addon {
  id: number;
  titleKey: TranslationKey;
  price: number;
  emoji: string;
}

const ADDONS: Record<string, Addon[]> = {
  hair: [
    { id: 1, titleKey: 'addon.deep-hair-treatment', price: 50, emoji: '‍️' },
    { id: 2, titleKey: 'addon.shine-serum', price: 30, emoji: '' },
  ],
  makeup: [
    { id: 4, titleKey: 'addon.lash-extensions', price: 60, emoji: '️' },
    { id: 5, titleKey: 'addon.brow-shaping', price: 35, emoji: '' },
  ],
  nails: [
    { id: 7, titleKey: 'addon.gel-polish', price: 40, emoji: '' },
    { id: 8, titleKey: 'addon.nail-art', price: 30, emoji: '' },
  ],
  skin: [
    { id: 10, titleKey: 'addon.face-mask', price: 45, emoji: '' },
    { id: 11, titleKey: 'addon.chemical-peel', price: 80, emoji: '' },
  ],
  default: [{ id: 13, titleKey: 'mobile.core.quickMassage', price: 40, emoji: '‍️' }],
};

interface Props {
  category?: string;
  onSelect: (a: Addon) => void;
  selected: number[];
}

export function AddonSuggestions({ category, onSelect, selected }: Props): JSX.Element {
  const { t } = useLocale();
  const addons = ADDONS[category || 'default'] || ADDONS['default']!;
  return (
    <View>
      <Text style={{ fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
        {t('mobile.core.addonTitle')}
      </Text>
      {addons.map((a) => {
        const isSelected = selected.includes(a.id);
        return (
          <TouchableOpacity
            key={a.id}
            onPress={() => onSelect(a)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              marginBottom: 6,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: isSelected ? '#7c3aed' : '#e5e7eb',
              backgroundColor: isSelected ? '#f5f3ff' : '#fff',
            }}
          >
            <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '500' }}>{t(a.titleKey)}</Text>
              <Text style={{ color: '#7c3aed', fontWeight: 'bold', fontSize: 12 }}>
                +{a.price} {t('misc.sar')}
              </Text>
            </View>
            {isSelected && <Text style={{ color: '#7c3aed' }}></Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
