import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface Card { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: Card[] = [
  { emoji:'🌿',title:'صالون أخضر',subtitle:'ممارسات صديقة للبيئة',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'♻️',text:'إعادة تدوير — جميع العبوات قابلة للتدوير'},{emoji:'🌱',text:'منتجات عضوية — خالية من المواد الضارة'},{emoji:'💡',text:'توفير طاقة — إضاءة LED وأجهزة موفرة'},{emoji:'💧',text:'ترشيد مياه — أنظمة ذكية لتوفير المياه'}]},
  { emoji:'♿',title:'صالون متاح',subtitle:'للجميع بدون استثناء',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'🦽',text:'مداخل ومخارج — مناسبة للكراسي المتحركة'},{emoji:'🤟',text:'لغة إشارة — موظفات مدربات'},{emoji:'🦻',text:'مساعدات سمعية — أجهزة متوفرة'},{emoji:'📋',text:'قائمة برايل — للخدمات والأسعار'}]},
  { emoji:'🧘',title:'صالون حسي',subtitle:'بيئة هادئة ومريحة',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'🔇',text:'ساعات هادئة — بدون موسيقى أو ضوضاء'},{emoji:'💡',text:'إضاءة خافتة — مناسبة للحساسية الضوئية'},{emoji:'🌸',text:'خالٍ من العطور — للمتحسسات'},{emoji:'👩‍🦯',text:'خريطة حسية — وصف لكل منطقة'}]},
  { emoji:'💖',title:'جمال للجميع',subtitle:'جميع أنواع البشرة والشعر',color:'#db2777',bg:'#fdf2f8',tips:[{emoji:'🎨',text:'جميع ألوان البشرة — منتجات مناسبة للجميع'},{emoji:'💇',text:'جميع أنواع الشعر — خبيرات لكل الأنواع'},{emoji:'👩‍🦰',text:'جميع الأعمار — من المراهقة للذهبية'},{emoji:'🌈',text:'جميع الأجسام — Beauty at every size'}]},
  { emoji:'🕌',title:'غرفة صلاة',subtitle:'مكان هادئ للعبادة',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'🧎',text:'سجادات — نظيفة ومعطرة'},{emoji:'🧕',text:'عباءات — متوفرة للصلاة'},{emoji:'🕋',text:'اتجاه القبلة — محدد بوضوح'},{emoji:'💧',text:'مكان وضوء — مجهز بالكامل'}]},
  { emoji:'☕',title:'ركن الضيافة',subtitle:'مشروبات ساخنة وباردة',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'☕',text:'قهوة — عربية وتركية'},{emoji:'🍵',text:'شاي — أخضر وأسود وأعشاب'},{emoji:'💧',text:'ماء — بارد ومعطر بالفواكه'},{emoji:'🍪',text:'تمر وضيافة — ترحيب حار'}]},
  { emoji:'🎁',title:'هدية غير متوقعة',subtitle:'فاجئي زائرة اليوم',color:'#c026d3',bg:'#fdf4ff',tips:[{emoji:'🌸',text:'باقة ورود — بدون مناسبة'},{emoji:'💌',text:'بطاقة شكر — بخط اليد'},{emoji:'🎀',text:'عينة مجانية — منتج جديد'},{emoji:'💝',text:'العطاء — الجمال في التفاصيل'}]},
  { emoji:'⏰',title:'بدون استعجال',subtitle:'خذي وقتكِ — لا نستعجلكِ',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'☕',text:'استرخي — قهوة قبل الخدمة'},{emoji:'💬',text:'استشارة — مناقشة كاملة قبل البدء'},{emoji:'⏰',text:'لا مواعيد متلاحقة — وقت كافٍ'},{emoji:'🙋',text:'أي سؤال — نحن هنا للمساعدة'}]},
  { emoji:'♻️',title:'الجمال بدون نفايات',subtitle:'جميلة — وكوكب أجمل',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🧼',text:'شامبو صلب — يدوم 3 شهور'},{emoji:'🧻',text:'فوط قماش — بدل القطن أحادي الاستخدام'},{emoji:'🔄',text:'عبوات كبيرة — وأعيدي تعبئة الصغيرة'},{emoji:'🌱',text:'منتجات قابلة للتحلل — تغليف ورقي'}]},
  { emoji:'🔄',title:'عبوات قابلة للتعبئة',subtitle:'اشتري مرة — استخدمي للأبد',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'💰',text:'أوفر — العبوة الأصلية مرة واحدة'},{emoji:'🌍',text:'تقلل النفايات — 70% أقل بلاستيك'},{emoji:'💄',text:'أحمر شفاه — كريم أساس — عطور'},{emoji:'♻️',text:'ارجعي الفارغة — لخصم على القادمة'}]},
  { emoji:'🌿',title:'الجمال النظيف',subtitle:'منتجات آمنة — بدون سموم',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'🚫',text:'بدون: بارابين سلفات فثالات'},{emoji:'🌱',text:'مكونات نباتية — غير مختبرة على الحيوانات'},{emoji:'🔍',text:'اقرئي الملصق — أول 5 مكونات'},{emoji:'✅',text:'شهادات: EWG COSMOS Leaping Bunny'}]},
  { emoji:'🌟',title:'الجمال المُعاد تدويره',subtitle:'من النفايات — إلى الذهب',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'☕',text:'بقايا القهوة — مقشر طبيعي'},{emoji:'🍊',text:'قشور الحمضيات — زيوت عطرية'},{emoji:'🥑',text:'بذور الأفوكادو — صبغة وردية'},{emoji:'🌾',text:'نخالة الأرز — مقشر لطيف للوجه'}]},
  { emoji:'🚫',title:'الجمال بدون بلاستيك',subtitle:'بدائل ذكية للبلاستيك',color:'#4f46e5',bg:'#eef2ff',tips:[{emoji:'🪥',text:'فرشاة بامبو — قابلة للتحلل'},{emoji:'🧴',text:'زجاج وألمنيوم — تدوير للأبد'},{emoji:'🪒',text:'شفرة معدنية — تدوم سنوات'},{emoji:'🧼',text:'صابون صلب — بدون تغليف'}]},
];

export default function SustainabilityScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>🌿 الاستدامة والإتاحة</Text>
      <Text style={s.sub}>جمال مستدام — للجميع</Text>
      <View style={s.grid}>{CARDS.map((c,i)=>(<View key={i} style={[s.card,{borderColor:c.color+'30'}]}><View style={s.ch}><Text style={s.ce}>{c.emoji}</Text><View style={s.cw}><Text style={[s.ct,{color:c.color}]}>{c.title}</Text><Text style={s.cs}>{c.subtitle}</Text></View></View><View style={s.tl}>{c.tips.map((t,j)=>(<View key={j} style={[s.tr,{backgroundColor:c.bg}]}><Text style={s.te}>{t.emoji}</Text><Text style={[s.tt,{color:c.color}]}>{t.text}</Text></View>))}</View></View>))}</View>
    </ScrollView>
  );
}

const sc=StyleSheet.create({c:{flex:1,backgroundColor:'#ecfdf5'},i:{padding:16,paddingTop:40,paddingBottom:60},h:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:6},sub:{fontSize:13,color:'#6b7280',textAlign:'center',marginBottom:24,lineHeight:22},grid:{gap:12},card:{backgroundColor:'#fff',borderRadius:16,borderWidth:1,padding:16,marginBottom:4},ch:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},ce:{fontSize:28},cw:{flex:1},ct:{fontSize:15,fontWeight:'700'},cs:{fontSize:11,color:'#9ca3af',marginTop:2},tl:{gap:6},tr:{flexDirection:'row',alignItems:'center',gap:8,borderRadius:10,paddingHorizontal:12,paddingVertical:10},te:{fontSize:14,width:20,textAlign:'center'},tt:{fontSize:12,fontWeight:'500',flex:1,textAlign:'right'}});const s=sc;
