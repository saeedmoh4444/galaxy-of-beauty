import { View, Text, TouchableOpacity } from 'react-native';

interface Addon {
  id: number;
  title: string;
  price: number;
  emoji: string;
}

const ADDONS: Record<string, Addon[]> = {
  hair: [
    { id: 1, title: 'علاج الشعر العميق', price: 50, emoji: '💆‍♀️' },
    { id: 2, title: 'سيروم لمعان', price: 30, emoji: '✨' },
  ],
  makeup: [
    { id: 4, title: 'تركيب رموش', price: 60, emoji: '👁️' },
    { id: 5, title: 'تحديد حواجب', price: 35, emoji: '✨' },
  ],
  nails: [
    { id: 7, title: 'طلاء جيل', price: 40, emoji: '💅' },
    { id: 8, title: 'نقش أظافر', price: 30, emoji: '🎨' },
  ],
  skin: [
    { id: 10, title: 'ماسك وجه', price: 45, emoji: '😊' },
    { id: 11, title: 'تقشير كيميائي', price: 80, emoji: '✨' },
  ],
  default: [{ id: 13, title: 'مساج سريع', price: 40, emoji: '💆‍♀️' }],
};

interface Props {
  category?: string;
  onSelect: (a: Addon) => void;
  selected: number[];
}

export function AddonSuggestions({ category, onSelect, selected }: Props): JSX.Element {
  const addons = ADDONS[category || 'default'] || ADDONS['default']!;
  return (
    <View>
      <Text style={{ fontWeight: '600', marginBottom: 8, fontSize: 14 }}>✨ أضيفي إلى حجزكِ</Text>
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
              <Text style={{ fontWeight: '500' }}>{a.title}</Text>
              <Text style={{ color: '#7c3aed', fontWeight: 'bold', fontSize: 12 }}>
                +{a.price} ر.س
              </Text>
            </View>
            {isSelected && <Text style={{ color: '#7c3aed' }}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
