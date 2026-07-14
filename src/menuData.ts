/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MenuItem } from './types';

/**
 * Static Asset Imports (Premium Food Photography)
 * Vite processes these imports and replaces them with the resolved CDN/relative build paths.
 * Declared in src/vite-env.d.ts to provide strong type safety for static assets.
 */
import sausageSandwichImg from './assets/images/sausage_sandwich_1783718169266.jpg';
import stuffedPigeonImg from './assets/images/stuffed_pigeon_1783718188961.jpg';
import hawawshiImg from './assets/images/hawawshi_1783718201723.jpg';
import egyptianFattaImg from './assets/images/egyptian_fatta_1783718216600.jpg';
import okraTajineImg from './assets/images/okra_tajine_1783718231799.jpg';
import oxtailTajineImg from './assets/images/oxtail_tajine_1783718244964.jpg';
import macBechamelImg from './assets/images/mac_bechamel_1783718260359.jpg';
import bakedRicePuddingImg from './assets/images/baked_rice_pudding_1783718273127.jpg';
import omAliImg from './assets/images/om_ali_1783718285457.jpg';

export const CATEGORIES = [
  { id: 'all', name: 'الكل' },
  { id: 'meat_grills', name: 'مشويات اللحوم' },
  { id: 'chicken_grills', name: 'مشويات الدواجن' },
  { id: 'meals', name: 'الوجبات الفردية' },
  { id: 'platters', name: 'صواني اللمة والحبايب' },
  { id: 'tajines', name: 'الطواجن والورقة' },
  { id: 'oriental_kitchen', name: 'المطبخ الشرقي والفتات' },
  { id: 'sandwiches', name: 'الساندوتشات (تيك أوي)' },
  { id: 'sides', name: 'الشوربات والسلطات' },
  { id: 'drinks_desserts', name: 'الحلويات والمشروبات' }
];

export const MENU_ITEMS: MenuItem[] = [
  // 1. مشويات الفراخ (شيش او تكة)
  {
    id: 'ch_sada',
    name: 'فرخة سادة مشوية (شيش أو تكة)',
    category: 'chicken_grills',
    price: 360,
    description: 'فرخة كاملة متبلة ومفتوحة مشوية على الفحم بالتتبيلة الخاصة'
  },
  {
    id: 'ch_half_sada',
    name: 'نصف فرخة سادة مشوية',
    category: 'chicken_grills',
    price: 195,
    description: 'نصف فرخة متبلة مشوية على الفحم بالتتبيلة الخاصة'
  },
  {
    id: 'ch_rice',
    name: 'فرخة مشوية مع أرز',
    category: 'chicken_grills',
    price: 400,
    description: 'فرخة كاملة مشوية على الفحم تقدم مع أرز بسمتي فاخر خلطة'
  },
  {
    id: 'ch_half_rice',
    name: 'نصف فرخة مشوية مع أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'نصف فرخة مشوية على الفحم تقدم مع أرز بسمتي فاخر خلطة'
  },
  {
    id: 'ch_quarter_sada',
    name: 'ربع فرخة سادة مشوية',
    category: 'chicken_grills',
    price: 110,
    description: 'ربع فرخة متبلة مشوية على الفحم'
  },
  {
    id: 'ch_quarter_rice',
    name: 'ربع فرخة مشوية مع أرز',
    category: 'chicken_grills',
    price: 125,
    description: 'ربع فرخة مشوية على الفحم تقدم مع أرز بسمتي فاخر خلطة'
  },

  // ركن الحمام والبط
  {
    id: 'samman',
    name: 'فرد سمان مشوي',
    category: 'chicken_grills',
    price: 170,
    description: 'سمان بلدي متبل ومشوي على الفحم بتتبيلة أبو قورة السرية'
  },
  {
    id: 'hamam_rice',
    name: 'فرد حمام محشي أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'حمام بلدي محشي أرز بالخلطة ومحمر بالسمن البلدي'
  },
  {
    id: 'hamam_frik',
    name: 'فرد حمام محشي فريك',
    category: 'chicken_grills',
    price: 220,
    description: 'حمام بلدي محشي فريك بلدي فاخر ومحمر بالسمن البلدي'
  },
  {
    id: 'batta',
    name: 'بطة بلدي كاملة',
    category: 'chicken_grills',
    price: 680,
    description: 'بطة بلدي كاملة مطهوة ببطء في الفرن مع التتبيلة والمكسرات'
  },
  {
    id: 'half_batta',
    name: 'نصف بطة بلدي',
    category: 'chicken_grills',
    price: 350,
    description: 'نصف بطة بلدي مطهوة في الفرن ومحمرة بالسمن البلدي'
  },

  // ركن الساندوتشات (تك أوي فقط)
  {
    id: 'sd_kofta_shani',
    name: 'ساندوتش كفتة ضاني',
    category: 'sandwiches',
    price: 100,
    description: 'كفتة ضاني مشوية على الفحم في خبز بلدي ساخن مع مخلل وطحينة'
  },
  {
    id: 'sd_kofta_kandooz',
    name: 'ساندوتش كفتة كندوز',
    category: 'sandwiches',
    price: 90,
    description: 'كفتة كندوز مشوية على الفحم في خبز بلدي ساخن مع مخلل وطحينة'
  },
  {
    id: 'sd_hawawshi_shani',
    name: 'ساندوتش حواوشي ضاني',
    category: 'sandwiches',
    price: 100,
    description: 'رغيف حواوشي بلدي غني باللحم الضاني المتبل والمطهو ببراعة على الفحم'
  },
  {
    id: 'sd_hawawshi_kandooz',
    name: 'ساندوتش حواوشي كندوز',
    category: 'sandwiches',
    price: 90,
    description: 'رغيف حواوشي بلدي غني باللحم الكندوز المتبل والمقرمش من الخارج'
  },
  {
    id: 'sd_kabab',
    name: 'ساندوتش كباب',
    category: 'sandwiches',
    price: 150,
    description: 'قطع كباب ضاني مشوي على الفحم في خبز بلدي مع طحينة'
  },
  {
    id: 'sd_tarb',
    name: 'ساندوتش طرب',
    category: 'sandwiches',
    price: 105,
    description: 'طرب ضاني مشوي على الفحم رائع المذاق'
  },
  {
    id: 'sd_shish',
    name: 'ساندوتش شيش طاووق',
    category: 'sandwiches',
    price: 80,
    description: 'شيش طاووق متبل بخلطة الزبادي والبهارات تقدم ساخنة'
  },
  {
    id: 'sd_sojok',
    name: 'ساندوتش سجق',
    category: 'sandwiches',
    price: 90,
    description: 'سجق بلدي شرقي متبل بصوص الطماطم والخلطة'
  },

  // ركن مشويات اللحوم (بالوزن)
  {
    id: 'kabab_shani',
    name: 'كباب ضاني (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 285, 'تلت': 420, 'نص': 560, 'كيلو': 1100 },
    description: 'قطع اللحم الضاني الفاخر المشوي بخلطة أبو قورة المميزة على الفحم'
  },
  {
    id: 'riash_shani',
    name: 'ريش ضاني (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 310, 'تلت': 460, 'نص': 610, 'كيلو': 1200 },
    description: 'ريش ضاني طازجة مشوية ببطء على الفحم لتذوب في الفم'
  },
  {
    id: 'kofta_kandooz',
    name: 'كفتة كندوز (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 165, 'تلت': 250, 'نص': 325, 'كيلو': 640 },
    description: 'كفتة بلدي كندوز مشوية على الفحم بتتبيلة غنية'
  },
  {
    id: 'kofta_shani',
    name: 'كفتة ضاني (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 190, 'تلت': 285, 'نص': 375, 'كيلو': 740 },
    description: 'كفتة ضاني بلدي ممتازة مشوية على الفحم برائحة زمان'
  },
  {
    id: 'kabd_kalawi',
    name: 'كبد وكلاوي مشوية (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 155, 'تلت': 205, 'نص': 305, 'كيلو': 600 },
    description: 'كبدة وكلاوي بلدي مشوية على الفحم بالتتبيلة الثومية الشهية'
  },
  {
    id: 'steak',
    name: 'استيك مشوي (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 310, 'تلت': 460, 'نص': 610, 'كيلو': 1200 },
    description: 'قطع ستيك بقري فاخر مشوي على الجريل بصوص التتبيلة الرائع'
  },
  {
    id: 'tarb_grill',
    name: 'طرب ضاني فاخر (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 215, 'تلت': 315, 'نص': 420, 'كيلو': 820 },
    description: 'طرب ضاني محشو باللحم البلدي المفروم والمتبل، مشوي على الفحم بدسمية رائعة'
  },
  {
    id: 'sojok_grill',
    name: 'سجق مشوي على الفحم (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 170, 'تلت': 250, 'نص': 330, 'كيلو': 650 },
    description: 'سجق بلدي بالبهارات والخلطة مشوي على الفحم مباشرة'
  },
  {
    id: 'meshakel_meat',
    name: 'مشكل كباب وكفتة (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 220, 'نص': 435, 'كيلو': 850 },
    description: 'مزيج رائع من قطع الكباب الضاني والكفتة المشوية على الفحم'
  },
  {
    id: 'mix_grill',
    name: 'ميكس جريل (بالوزن)',
    category: 'meat_grills',
    sizes: ['نص', 'كيلو'],
    price: { 'نص': 410, 'كيلو': 800 },
    description: 'تشكيلة خارقة من: كباب + كفتة + شيش طاووق + طرب، مشوية كلها على الفحم لتشبع رغباتك'
  },

  // ركن فراخ الشواية
  {
    id: 'ch_shawaya',
    name: 'فرخة شواية سادة',
    category: 'chicken_grills',
    price: 370,
    description: 'فرخة شواية تدور على الشواية لتصبح مقرمشة ولذيذة'
  },
  {
    id: 'ch_shawaya_rice',
    name: 'فرخة شواية مع أرز',
    category: 'chicken_grills',
    price: 410,
    description: 'فرخة شواية تدور تقدم مع أرز بسمتي فاخر متبل'
  },
  {
    id: 'ch_half_shawaya',
    name: 'نصف فرخة شواية',
    category: 'chicken_grills',
    price: 195,
    description: 'نصف فرخة شواية مقرمشة ولذيذة'
  },
  {
    id: 'ch_half_shawaya_rice',
    name: 'نصف فرخة شواية مع أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'نصف فرخة شواية تقدم مع أرز بسمتي وتومية ومخلل وعيش'
  },

  // ركن فراخ المندي
  {
    id: 'ch_mandi',
    name: 'فرخة مندي مع أرز',
    category: 'chicken_grills',
    price: 370,
    description: 'فرخة مطبوخة على الطريقة المندية الأصلية تقدم مع أرز مندي طويل الحبة وصوص الدقوس'
  },
  {
    id: 'ch_half_mandi',
    name: 'نصف فرخة مندي مع أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'نصف فرخة مندي تقدم مع أرز مندي طويل الحبة وصوص الدقوس'
  },

  // المطبخ الشرقي والمعجنات والمكرونة
  {
    id: 'moza_sada',
    name: 'موزة ضاني سادة',
    category: 'oriental_kitchen',
    price: 400,
    description: 'موزة ضاني بلدي مطهوة في الفرن ببطء حتى تذوب مع التوابل الشرقية'
  },
  {
    id: 'ouzi_sada',
    name: 'أوزي سادة فاخر',
    category: 'oriental_kitchen',
    price: 400,
    description: 'أوزي اللحم البلدي ببهارات الشرق الغنية'
  },
  {
    id: 'waraq_enab_plate',
    name: 'طبق ورق عنب بلدي',
    category: 'oriental_kitchen',
    price: 80,
    description: 'طبق ورق عنب محشو بخلطة الأرز اللذيذة والليمون'
  },
  {
    id: 'mahshi_big',
    name: 'محشي مشكل كبير',
    category: 'oriental_kitchen',
    price: 175,
    description: 'طبق مشكل كبير من الكوسة والباذنجان والفلفل وورق العنب والكرنب'
  },
  {
    id: 'mahshi_med',
    name: 'محشي مشكل وسط',
    category: 'oriental_kitchen',
    price: 115,
    description: 'طبق مشكل وسط لجميع أنواع المحاشي الشهية بخلطة السمن البلدي'
  },
  {
    id: 'krn_plate',
    name: 'طبق محشي كرنب',
    category: 'oriental_kitchen',
    price: 80,
    description: 'أصابع محشي كرنب مسبك بالسمن البلدي والصلصة ومطهو ببراعة'
  },
  {
    id: 'mombar',
    name: 'ممبار بلدي (بالوزن)',
    category: 'oriental_kitchen',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 100, 'نص': 200, 'كيلو': 380 },
    description: 'ممبار بلدي محشو بالأرز المتبل والخلطة الحارة، مقلي ومقرمش بامتياز'
  },
  {
    id: 'roqaq',
    name: 'رقاق باللحمة المفرومة (4 قطع)',
    category: 'oriental_kitchen',
    price: 135,
    description: 'صينية رقاق بلدي بالسمن والشوربة محشو باللحم المفروم المتبل والمقرمش'
  },
  {
    id: 'samb_cheese',
    name: 'سمبوسة جبنة (6 قطع)',
    category: 'oriental_kitchen',
    price: 90,
    description: 'سمبوسة مقلية مقرمشة محشوة بمزيج من الأجبان الرائعة'
  },
  {
    id: 'samb_meat',
    name: 'سمبوسة لحمة (6 قطع)',
    category: 'oriental_kitchen',
    price: 95,
    description: 'سمبوسة مقلية مقرمشة محشوة باللحم المفروم المتبل والبصل'
  },
  {
    id: 'samb_mix',
    name: 'سمبوسة ميكس (6 قطع)',
    category: 'oriental_kitchen',
    price: 95,
    description: 'سمبوسة مقرمشة مشكلة بين أجبان ولحم مفروم'
  },
  {
    id: 'french_fries',
    name: 'باكت بطاطس محمرة متبلة',
    category: 'oriental_kitchen',
    price: 45,
    description: 'باكت كبير بطاطس محمرة ومقرمشة متبلة ببهارات البطاطس اللذيذة'
  },

  // مكرونات
  {
    id: 'mac_bashamel',
    name: 'مكرونة بشاميل باللحمة المفرومة',
    category: 'oriental_kitchen',
    price: 90,
    description: 'صينية مكرونة بالبشاميل الغني واللحم المفروم الفاخر مغطاة بجبنة محمرة'
  },
  {
    id: 'mac_bolognese',
    name: 'مكرونة اسباجيتي بولونيز',
    category: 'oriental_kitchen',
    price: 110,
    description: 'مكرونة اسباجيتي تقدم مع صوص طماطم غني باللحم المفروم المتبل'
  },
  {
    id: 'mac_sada',
    name: 'مكرونة بالصلصة سادة',
    category: 'oriental_kitchen',
    price: 65,
    description: 'مكرونة بالصلصة الحمراء المتبلة بنكهة مصرية أصيلة'
  },

  // طواجن ورقة
  {
    id: 'tj_akawi',
    name: 'طاجن عكاوي بالبصل',
    category: 'tajines',
    price: 350,
    description: 'طاجن عكاوي بلدي مع البصل المكرمل مسبك في الفرن الفخار لمذاق لا ينسى'
  },
  {
    id: 'tj_waraq_kware',
    name: 'طاجن ورق عنب بالكوارع',
    category: 'tajines',
    price: 370,
    description: 'مزيج فاخر من ورق العنب الحامض مع قطع كوارع بلدي مخلية ودايبة بصوص الصلصة'
  },
  {
    id: 'tj_molo_kware',
    name: 'طاجن ملوخية بالكوارع',
    category: 'tajines',
    price: 370,
    description: 'ملوخية خضراء مصرية بطشة الثوم والكزبرة غنية بقطع الكوارع البلدي المخلاة'
  },
  {
    id: 'tj_meat_fried',
    name: 'طاجن لحمة محمرة بلدي',
    category: 'tajines',
    price: 280,
    description: 'طاجن قطع لحم بلدي محمر بالسمن والبهارات مع تتبيلة البصل والبهار في طاجن فخار'
  },
  {
    id: 'tj_krn_meat',
    name: 'طاجن كرنب باللحمة',
    category: 'tajines',
    price: 320,
    description: 'محشي كرنب بلدي مطبوخ بمرقة اللحم ومزين بقطع لحم دايبة'
  },
  {
    id: 'tj_lesan_meat',
    name: 'طاجن لسان عصفور باللحمة',
    category: 'tajines',
    price: 295,
    description: 'مكرونة لسان عصفور محمرة بالسمن مع قطع لحم بلدي متبل في طاجن فخار بالفرن'
  },
  {
    id: 'tj_vegetables_meat',
    name: 'طاجن خضار مشكل باللحمة',
    category: 'tajines',
    price: 285,
    description: 'تورلي خضار مشكل طازج مع قطع لحم بلدي مطبوخ في الصلصة المصرية وطشة الثوم'
  },
  {
    id: 'meat_onion',
    name: 'طاجن لحمة بالبصل بلدي',
    category: 'tajines',
    price: 275,
    description: 'قطع لحم بلدي مطبوخة ببطء مع كمية وفيرة من البصل والتوابل كباب حلة'
  },
  {
    id: 'meat_potatoes',
    name: 'طاجن بطاطس باللحمة في الفخار',
    category: 'tajines',
    price: 275,
    description: 'طاجن صينية بطاطس شرائح باللحم البلدي والصلصة الغنية'
  },
  {
    id: 'bamia_shani',
    name: 'طاجن بامية باللحمة الضاني',
    category: 'tajines',
    price: 295,
    description: 'طاجن بامية بلدي بالثوم والليمون والصلصة واللحم الضاني الدايب كلياً'
  },
  {
    id: 'tj_sojok',
    name: 'طاجن سجق بلدي شرقي',
    category: 'tajines',
    price: 280,
    description: 'سجق بلدي مع البصل والفلفل الألوان والطماطم في طاجن فخار'
  },
  {
    id: 'tj_molo_meat',
    name: 'طاجن ملوخية باللحمة',
    category: 'tajines',
    price: 275,
    description: 'طاجن ملوخية خضراء طازجة تقدم مع قطع لحم بلدي مطهو ببطء'
  },
  {
    id: 'tj_msaqaa',
    name: 'طاجن مسقعة باللحمة المفرومة',
    category: 'tajines',
    price: 230,
    description: 'باذنجان وفلفل وبطاطس مقلية مطبوخة بالثوم والخل والصلصة واللحم المفروم البقري'
  },

  // ورقة وطاسة
  {
    id: 'warqat_meat',
    name: 'ورقة لحمة بلدي بالخضار',
    category: 'tajines',
    price: 270,
    description: 'قطع اللحم البلدي الفاخر مغلفة في ورق الزبدة والفويل مع الخضار المتبل ومطهوة ببطء بالفرن'
  },
  {
    id: 'warqat_sojok',
    name: 'ورقة سجق بلدي بالخضار',
    category: 'tajines',
    price: 250,
    description: 'سجق بلدي متبل مع الخضار والبهارات مطبوخة داخل ورقة محكمة بالفرن'
  },
  {
    id: 'tasa_kabd_baladi',
    name: 'طاسة كبدة بلدي بالثوم والفلفل',
    category: 'tajines',
    price: 270,
    description: 'كبدة بلدي طازجة مشوحة بالسمن والبهارات مع ثوم وفلفل حار تقدم ساخنة'
  },
  {
    id: 'tasa_kabd_shani',
    name: 'طاسة كبدة ضاني مشوحة',
    category: 'tajines',
    price: 270,
    description: 'كبدة ضاني بلدي مشوحة بقطع اللية الضاني والثوم والكزبرة'
  },

  // ركن الوجبات الفردية
  {
    id: 'wj_pane',
    name: 'وجبة بانيه ممتازة',
    category: 'meals',
    price: 190,
    description: 'شرائح بانيه مقلي ذهبي + بطاطس مقرمشة + مكرونة اسباجيتي بصلصة أبو قورة اللذيذة'
  },
  {
    id: 'wj_shd_grill',
    name: 'وجبة صدور مشوية صحية',
    category: 'meals',
    price: 200,
    description: 'صدور دجاج مشوية على الجريل متبلة + بطاطس + أرز أبيض + خضار سوتيه خفيف'
  },
  {
    id: 'wj_super',
    name: 'وجبة السوبر (توفير)',
    category: 'meals',
    price: 125,
    description: 'ربع فرخة مشوية على الفحم + أرز خلطة بسمتي + شوربة وسلطات ومخلل وعيش'
  },
  {
    id: 'wj_gamid',
    name: 'وجبة الجامد (كاملة)',
    category: 'meals',
    price: 165,
    description: 'ربع فرخة مشوية + أرز خلطة + خضار مطبوخ طازج + سلطة وطحينة وعيش'
  },
  {
    id: 'wj_dynamite',
    name: 'وجبة الديناميت الخارقة',
    category: 'meals',
    price: 210,
    description: 'ربع فرخة مشوية على الفحم + ثمن كفتة ضاني + أرز خلطة + خضار مطبوخ وسلطات'
  },
  {
    id: 'wj_single',
    name: 'وجبة السنجل اللذيذة',
    category: 'meals',
    price: 195,
    description: 'ربع فرخة مشوية على الفحم + ثمن كفتة ضاني + أرز خلطة بسمتي + سلطات وعيش'
  },
  {
    id: 'wj_kabab',
    name: 'وجبة الكباب واللحم الفاخر',
    category: 'meals',
    price: 315,
    description: 'ثمن كباب ضاني + ثمن كفتة + ثمن شيش طاووق + أرز خلطة بسمتي + سلطة وطحينة وعيش'
  },

  // لحمة مندي
  {
    id: 'nafar_mandi',
    name: 'نفر لحمة مندي بلدي',
    category: 'oriental_kitchen',
    price: 420,
    description: 'نفر لحم مندي بلدي فاخر مطهو ببطء في حفرة المندي، يقدم مع أرز مندي ودقوس'
  },
  {
    id: 'thomn_teis',
    name: 'ثمن تيس مندي كامل',
    category: 'oriental_kitchen',
    price: 870,
    description: 'ثمن تيس بلدي مندي مطبوخ ببطء لدرجة الذوبان مع الأرز المندي والصوصات والسلطة وعيش'
  },
  {
    id: 'rob_teis',
    name: 'ربع تيس مندي بلدي',
    category: 'oriental_kitchen',
    price: 1500,
    description: 'ربع تيس بلدي مندي مطهو على الأصول ليكون طرياً جداً مع الأرز المندي الفاخر'
  },
  {
    id: 'nos_teis',
    name: 'نصف تيس مندي بلدي',
    category: 'oriental_kitchen',
    price: 3000,
    description: 'نصف تيس بلدي مندي مع صواني الأرز البسمتي المزين بالمكسرات والزبيب والسلطات'
  },

  // الفتات
  {
    id: 'moza_fatta',
    name: 'فتة موزة ضاني',
    category: 'oriental_kitchen',
    price: 450,
    description: 'موزة ضاني بلدي كاملة دايبة تقدم فوق طبق فتة مصري بالخل والثوم والسمن البلدي والصلصة'
  },
  {
    id: 'fatta_sada',
    name: 'طبق فتة سادة بالخل والثوم',
    category: 'oriental_kitchen',
    price: 50,
    description: 'طبق فتة مصري أصيل بالعيش المقرمش والأرز والسمن البلدي وصلصة الخل والثوم'
  },
  {
    id: 'fatta_kware',
    name: 'فتة كوارع بلدي',
    category: 'oriental_kitchen',
    price: 360,
    description: 'قطع كوارع بلدي مخلاة مطهوة فوق طبق الفتة المصري بالخل والثوم والصلصة'
  },
  {
    id: 'fatta_meat_fried',
    name: 'فتة باللحمة المحمرة',
    category: 'oriental_kitchen',
    price: 320,
    description: 'قطع لحم بلدي محمر في السمن البلدي فوق طبق الفتة بالصلصة والخل والثوم'
  },

  // مشويات الدواجن (شيش طاووق وبانيه بالوزن)
  {
    id: 'shish_tawook_weight',
    name: 'شيش طاووق مشوي (بالوزن)',
    category: 'chicken_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 125, 'تلت': 185, 'نص': 245, 'كيلو': 480 },
    description: 'قطع صدور وأوراك الدجاج المتبلة ببهارات الشيش المشوية على الفحم بالتناوب مع الخضار'
  },
  {
    id: 'pane_meshwi_weight',
    name: 'بانيه مشوي على الجريل (بالوزن)',
    category: 'chicken_grills',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 135, 'نص': 260, 'كيلو': 500 },
    description: 'صدور بانيه متبلة بصوص البصل والليمون ومشوية صحية على الجريل'
  },
  {
    id: 'pane_maq_weight',
    name: 'بانيه مقلي ذهبي (بالوزن)',
    category: 'chicken_grills',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 135, 'نص': 260, 'كيلو': 500 },
    description: 'صدور دجاج بانيه متبلة ومغطاة بالبقسماط المقرمش ومقلية بالزيت النظيف لتصبح مقرمشة ذهبية'
  },

  // خضار سادة
  {
    id: 'veg_bamia',
    name: 'طبق بامية بلدي سادة',
    category: 'sides',
    price: 50,
    description: 'طبق بامية بلدي مطبوخ بالصلصة والثوم والليمون ومرقة اللحم'
  },
  {
    id: 'veg_meshakel',
    name: 'طبق خضار مشكل سادة (تورلي)',
    category: 'sides',
    price: 40,
    description: 'تشكيلة خضار طازجة مطبوخة بالصلصة المسبكة اللذيذة'
  },
  {
    id: 'veg_potatoes',
    name: 'طبق بطاطس مطبوخة بالصلصة',
    category: 'sides',
    price: 40,
    description: 'مكعبات بطاطس مطبوخة بمرقة اللحم والصلصة'
  },
  {
    id: 'veg_molokhia',
    name: 'طبق ملوخية خضراء سادة',
    category: 'sides',
    price: 40,
    description: 'طبق ملوخية خضراء بطشة الثوم والكزبرة الشهيرة بسمن بلدي'
  },
  {
    id: 'veg_soute',
    name: 'طبق خضار سوتيه سادة',
    category: 'sides',
    price: 40,
    description: 'خضار مشكل مطهو على البخار خفيف وصحي'
  },

  // شوربة
  {
    id: 'sh_lesan',
    name: 'شوربة لسان عصفور بلدي',
    category: 'sides',
    price: 35,
    description: 'شوربة لسان عصفور محمر بالسمن بمرقة اللحم الغنية والليمون'
  },
  {
    id: 'sh_adas',
    name: 'شوربة عدس دافئة',
    category: 'sides',
    price: 40,
    description: 'شوربة عدس أصفر مصري بالسمن والخلطة والخبز المحمص'
  },
  {
    id: 'sh_kware',
    name: 'شوربة كوارع مخلية بلدي',
    category: 'sides',
    price: 145,
    description: 'شوربة كوارع بلدي مخلاة دسمة وغنية بالبهارات والليمون لتقوية الجسم'
  },
  {
    id: 'sh_hamam',
    name: 'شوربة حمام دسمة',
    category: 'sides',
    price: 160,
    description: 'شوربة بمرقة الحمام البلدي دسمة وغنية ومفيدة جداً'
  },
  {
    id: 'sh_crema',
    name: 'شوربة كريمة بالفراخ',
    category: 'sides',
    price: 90,
    description: 'شوربة كريمة غنية ولذيذة مع قطع الدجاج الطرية والمشروم'
  },

  // المعجنات (أرز)
  {
    id: 'rz_mamar_sada',
    name: 'طاجن أرز معمر سادة بالفرن',
    category: 'oriental_kitchen',
    price: 130,
    description: 'أرز معمر بالحليب والقشطة والسمن البلدي مخبوز بالفرن الفخار'
  },
  {
    id: 'rz_mamar_meat',
    name: 'طاجن أرز معمر باللحمة البلدي',
    category: 'oriental_kitchen',
    price: 210,
    description: 'أرز معمر غني بالحليب والقشطة محشو بقطع اللحم البلدي الطري ومخبوز بالفرن'
  },
  {
    id: 'rz_basmati',
    name: 'طبق أرز بسمتي أصفر طويل الحبة',
    category: 'oriental_kitchen',
    price: 55,
    description: 'أرز بسمتي أصفر مطبوخ ببهارات الكبسة الفاخرة والمكسرات'
  },
  {
    id: 'rz_shaerya',
    name: 'طبق أرز بالشعرية بلدي',
    category: 'oriental_kitchen',
    price: 45,
    description: 'أرز مصري مفلفل بالشعرية المحمرة بالسمن البلدي'
  },
  {
    id: 'rz_abiad',
    name: 'طبق أرز أبيض بلدي سادة',
    category: 'oriental_kitchen',
    price: 40,
    description: 'أرز مصري أبيض مطهو بالسمن البلدي بطعم زمان'
  },
  {
    id: 'rz_kholta',
    name: 'طبق أرز خلطة أبو قورة المميز',
    category: 'oriental_kitchen',
    price: 55,
    description: 'أرز بالخلطة البنية والبهارات والمكسرات والزبيب'
  },

  // سلطات
  {
    id: 'sl_khadra',
    name: 'سلطة خضراء بلدي طازجة',
    category: 'sides',
    price: 20,
    description: 'طماطم وخيار وجرجير وفلفل وبقدونس مع تتبيلة الليمون والخل'
  },
  {
    id: 'sl_water',
    name: 'مياه سلطة بلدي (ويسكي الغلابة)',
    category: 'sides',
    price: 10,
    description: 'مياه مخلل وسلطة متبلة ومبهرة حار لفتح الشهية'
  },
  {
    id: 'sl_tahina',
    name: 'سلطة طحينة سمسم فاخرة',
    category: 'sides',
    price: 20,
    description: 'طحينة خام مخلوطة بالثوم والليمون والخل والكمون'
  },
  {
    id: 'sl_baba',
    name: 'سلطة بابا غنوج بالخلطة',
    category: 'sides',
    price: 25,
    description: 'باذنجان مشوي على الفحم مهروس مع الطحينة والثوم والبهارات'
  },
  {
    id: 'sl_tom_tomato',
    name: 'طماطم متبلة بالثوم والخل',
    category: 'sides',
    price: 25,
    description: 'شرائح طماطم طازجة متبلة بخلطة الثوم والخل والكزبرة والفلفل الحار'
  },
  {
    id: 'sl_toumeya',
    name: 'ثومية شامية غنية',
    category: 'sides',
    price: 20,
    description: 'صوص الثومية الكريمي اللذيذ الممتاز مع المشويات'
  },
  {
    id: 'sl_mekhalel',
    name: 'مخلل بلدي مشكل لفتح النفس',
    category: 'sides',
    price: 20,
    description: 'تشكيلة مخللات لفت وخيار وجزر وفلفل بلدي ممتازة'
  },
  {
    id: 'sl_ba_mekhalel',
    name: 'باذنجان مخلل بالخلطة الحارة',
    category: 'sides',
    price: 20,
    description: 'باذنجان مقلي مخلل بخلطة الثوم والخل والليمون والفلفل الأحمر الحار'
  },
  {
    id: 'sl_old_cheese',
    name: 'جبنة قديمة بالطماطم والطحينة',
    category: 'sides',
    price: 35,
    description: 'جبنة مش مش المصرية الشهيرة مع زيت الزيتون وقطع الطماطم والخيار والطحينة'
  },
  {
    id: 'sl_daqoos',
    name: 'سلطة دقوس حارة للمندي',
    category: 'sides',
    price: 20,
    description: 'طماطم مفرومة ناعمة مع فلفل حار وثوم وليمون وكزبرة ممتازة مع الأرز'
  },
  {
    id: 'sl_zabadi',
    name: 'سلطة زبادي بالخيار والنعناع',
    category: 'sides',
    price: 35,
    description: 'زبادي طازج مع خيار مبشور ونعناع جاف زيت زيتون خفيف وصحي'
  },

  // صواني اللمة والحبايب
  {
    id: 'sn_habayeb',
    name: 'صينية الحبايب (تكفي فردين)',
    category: 'platters',
    price: 700,
    description: 'ربع كفتة + نصف فرخة + ربع طرب + ربع ممبار + نصف كيلو أرز بسمتي + سلطات + عيش بلدي ساخن'
  },
  {
    id: 'sn_shmlool',
    name: 'صينية الشملول (تكفي 4 أفراد)',
    category: 'platters',
    price: 1100,
    description: 'فرخة شواية كاملة + نصف كفتة + نصف سجق مشوي + محشي مشكل طبق + كيلو ونصف أرز بسمتي + سلطات + عيش'
  },
  {
    id: 'sn_omda',
    name: 'صينية عمدة البلد (تكفي 5 أفراد)',
    category: 'platters',
    price: 1500,
    description: 'نصف كفتة + نصف طرب + نصف شيش طاووق + نصف فرخة مشوية + 4 قطع رقاق + 3 قطع مندي لحم + 2 كيلو أرز بسمتي + سلطات + عيش'
  },
  {
    id: 'sn_atwla',
    name: 'صينية العتاولة الجبارة (تكفي 5 أفراد)',
    category: 'platters',
    price: 1650,
    description: 'نصف فرخة مشوية + نصف فرخة مندي + نصف كفتة + نصف سجق + نفر لحمة مندي + طبق محشي مشكل + أرز بسمتي كافٍ + سلطات + عيش'
  },
  {
    id: 'sn_arees',
    name: 'صينية العريس الفخمة (تكفي 5 أفراد)',
    category: 'platters',
    price: 1700,
    description: 'فرخة مندي + نصف ستيك مشوي + ربع بانيه مشوي + ربع شيش طاووق + ربع ممبار + 6 سمبوسة ميكس + كيلو ونصف أرز بسمتي خلطة + سلطات + عيش'
  },
  {
    id: 'sn_akela',
    name: 'صينية الأكيلة (تكفي 6 أفراد)',
    category: 'platters',
    price: 1800,
    description: 'نصف كباب ضاني + نصف بطة بلدي + نصف كفتة ضاني + نصف فرخة مشوية + 4 قطع رقاق + نصف سجق + 2 كيلو أرز + سلطات وعيش'
  },
  {
    id: 'sn_kabeer',
    name: 'صينية الكبير أوي (تكفي 6 أفراد)',
    category: 'platters',
    price: 1850,
    description: '4 فرد حمام بلدي + نفر لحمة مندي + ربع طرب + ربع سجق + ربع شيش طاووق + نصف فرخة مشوية + طبق محشي مشكل + أرز بسمتي كافٍ + سلطات + عيش'
  },
  {
    id: 'sn_wohoosh',
    name: 'صينية الوحوش الصاعقة (تكفي 7 أفراد)',
    category: 'platters',
    price: 2000,
    description: 'نصف كفتة + نصف شيش طاووق + نصف سجق + نصف طرب + ربع ممبار + نفر لحمة مندي + 2 كيلو أرز بسمتي + سلطة خضراء وطحينة وعيش'
  },
  {
    id: 'sn_anteel',
    name: 'صينية العنتيل الملوكية (تكفي 8 أفراد)',
    category: 'platters',
    price: 2350,
    description: 'نصف كفتة + نصف نيفة ضاني + نصف طرب + نصف كباب ضاني + نصف سجق + نصف ريش ضاني + 2 كيلو أرز + سلطات وعيش'
  },
  {
    id: 'sn_balad',
    name: 'صينية البلد (تكفي 8 أفراد)',
    category: 'platters',
    price: 2250,
    description: 'نصف فرخة مندي + نصف كفتة + نصف شيش طاووق + نصف طرب + نصف سجق + نصف ممبار + 2 كيلو أرز + سلطة خضراء وطحينة ودقوس وعيش'
  },
  {
    id: 'sn_zelzal',
    name: 'صينية زلزال الأرض (تكفي 9 أفراد)',
    category: 'platters',
    price: 2475,
    description: 'نفر لحم مندي + 3 أرباع فراخ مندي + 3 فرد حمام بلدي + ربع شيش طاووق + ربع كفتة + ربع طرب + ربع سجق + 4 قطع رقاق + نصف كيلو ورق عنب + 2 كيلو أرز + سلطات وعيش'
  },
  {
    id: 'sn_hadaeq',
    name: 'صينية أهل الحدائق الضخمة (تكفي 10 أفراد)',
    category: 'platters',
    price: 2790,
    description: 'أربع فراخ مشوية + 5 حمام بلدي + 5 صوابع طرب + 5 صوابع كفتة + 5 قطع شيش طاووق + 5 قطع سجق + 5 ممبار + طبق محشي مشكل + 3 كيلو أرز + سلطة خضراء وطحينة ودقوس وعيش'
  },
  {
    id: 'sn_abugoura_12',
    name: 'صينية أبو قورة الملكية (تكفي 12 فرداً)',
    category: 'platters',
    price: 3300,
    description: 'كيلو لحم مندي + فرخة مشوية كاملة + تلت طرب + تلت كفتة + تلت سجق + تلت ريش + تلت شيش طاووق + طبق محشي مشكل + 8 قطع سمبوسة + نصف كيلو ورق عنب + 2 كيلو أرز بسمتي بالخلطة والمكسرات والزبيب + سلطات وعيش'
  },
  {
    id: 'table_abugoura',
    name: 'طبلية أبو قورة التاريخية الكبرى',
    category: 'platters',
    price: 2500,
    description: 'طاجن رز معمر باللحمة البلدي + صينية رقاق باللحمة المفرومة (8 قطع) + طاجن بطاطس باللحمة + طبق فتة كوارع + طاجن عكاوي بالبصل + نصف فرخة مشوية على الفحم + بطة بلدي روستو كاملة + 6 طواجن ملوخية خضراء + 6 شوربة لسان عصفور دسمة مع العيش والسلطات'
  },

  // الحلو
  {
    id: 'ds_rz_forn',
    name: 'طاجن أرز بلبن في الفرن بلدي',
    category: 'drinks_desserts',
    price: 50,
    description: 'طاجن أرز باللبن مخبوز بالفرن بالسمن والقشطة ليعلوه وش محمر شهي'
  },
  {
    id: 'ds_mhalabya',
    name: 'مهلبية بالفرن غنية',
    category: 'drinks_desserts',
    price: 50,
    description: 'مهلبية الحليب بالقشطة مخبوزة بالفرن طعم ناعم ولذيذ'
  },
  {
    id: 'ds_om_ali',
    name: 'أم علي بالقشطة والمكسرات',
    category: 'drinks_desserts',
    price: 55,
    description: 'رقائق الباف باستري الهشة باللبن الساخن والقشطة والمكسرات والزبيب وجوز الهند'
  },
  {
    id: 'ds_konafa',
    name: 'طبق كنافة بالسمن البلدي',
    category: 'drinks_desserts',
    price: 45,
    description: 'كنافة ذهبية مقرمشة محشوة بالكريمة الغنية ومسقية بالشربات الحلو'
  },

  // مشروبات
  {
    id: 'dr_shai',
    name: 'كوب شاي أحمر مصري',
    category: 'drinks_desserts',
    price: 30,
    description: 'كوب شاي مصري في الخمسينة بالنعناع أو سادة'
  },
  {
    id: 'dr_shai_2',
    name: 'براد شاي (يكفي فردين)',
    category: 'drinks_desserts',
    price: 35,
    description: 'براد شاي بلدي ساخن مع النعناع الأخضر الطازج'
  },
  {
    id: 'dr_qahwa',
    name: 'فنجان قهوة تركي بلدي',
    category: 'drinks_desserts',
    price: 35,
    description: 'فنجان قهوة محوجة رائع المذاق بوش ممتاز'
  },
  {
    id: 'dr_yansoon',
    name: 'كوب يانسون دافئ مريح',
    category: 'drinks_desserts',
    price: 25,
    description: 'يانسون طبيعي دافئ ومريح للأعصاب والمعدة'
  },
  {
    id: 'dr_shai_green',
    name: 'كوب شاي أخضر صحي',
    category: 'drinks_desserts',
    price: 25,
    description: 'شاي أخضر طبيعي دافئ وصحي للهضم بعد الأكل الدسم'
  },
  {
    id: 'dr_canz',
    name: 'كانز مياه غازية باردة',
    category: 'drinks_desserts',
    price: 25,
    description: 'مياه غازية باردة منعشة (كوكاكولا / بيبسي / سفن أب / ميرندا)'
  },
  {
    id: 'dr_water_small',
    name: 'زجاجة مياه معدنية صغيرة',
    category: 'drinks_desserts',
    price: 15,
    description: 'زجاجة مياه معدنية طبيعية باردة'
  },
  {
    id: 'dr_juice_fresh',
    name: 'كوب عصير فريش طازج',
    category: 'drinks_desserts',
    price: 60,
    description: 'عصير فواكه طازج ومنعش حسب الموسم (مانجو / فراولة / برتقال / ليمون نعناع)'
  }
];

// Dynamic Image Mapping for international, high-end professional restaurant aesthetic
export const ITEM_SPECIFIC_IMAGES: { [id: string]: string } = {
  // Pigeons & Ducks
  'samman': stuffedPigeonImg,
  'hamam_rice': stuffedPigeonImg,
  'hamam_frik': stuffedPigeonImg,
  'batta': 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?auto=format&fit=crop&w=600&q=80',
  'half_batta': 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',

  // Mandi chicken
  'ch_mandi': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'ch_half_mandi': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',

  // Grilled Chicken & Shawaya
  'ch_sada': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'ch_half_sada': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'ch_rice': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'ch_half_rice': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'ch_quarter_sada': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'ch_quarter_rice': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'ch_shawaya': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'ch_shawaya_rice': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'ch_half_shawaya': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'ch_half_shawaya_rice': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',

  // Grills & Meats (kabab, kofta, riash, ribs)
  'kabab_shani': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
  'riash_shani': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  'kofta_kandooz': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=600&q=80',
  'kofta_shani': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=600&q=80',
  'kabd_kalawi': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
  'steak': 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
  'tarb_grill': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=600&q=80',
  'sojok_grill': 'https://images.unsplash.com/photo-1532246420281-12590929add5?auto=format&fit=crop&w=600&q=80',
  'meshakel_meat': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
  'mix_grill': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',

  // Sandwiches
  'sd_kofta_shani': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=600&q=80',
  'sd_kofta_kandooz': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
  'sd_hawawshi_shani': hawawshiImg,
  'sd_hawawshi_kandooz': hawawshiImg,
  'sd_kabab': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  'sd_tarb': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=600&q=80',
  'sd_shish': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  'sd_sojok': sausageSandwichImg,

  // Mandi Meat
  'nafar_mandi': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
  'thomn_teis': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
  'rob_teis': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
  'nos_teis': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',

  // Fatta & Moza
  'moza_sada': 'https://images.unsplash.com/photo-1514516317515-f120cc95d52b?auto=format&fit=crop&w=600&q=80',
  'ouzi_sada': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'moza_fatta': egyptianFattaImg,
  'fatta_sada': egyptianFattaImg,
  'fatta_kware': egyptianFattaImg,
  'fatta_meat_fried': egyptianFattaImg,

  // Stuffed items / Vine leaves / Mahshi / Mombar
  'waraq_enab_plate': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'mahshi_big': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'mahshi_med': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'krn_plate': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'mombar': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',

  // Sambousek & Appetizers
  'samb_cheese': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80',
  'samb_meat': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80',
  'samb_mix': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80',
  'roqaq': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80',
  'french_fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',

  // Pasta / Macaroni
  'mac_bashamel': macBechamelImg,
  'mac_bolognese': 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=600&q=80',
  'mac_sada': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',

  // Clay pots / Tajines
  'tj_akawi': oxtailTajineImg,
  'tj_waraq_kware': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'tj_molo_kware': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'tj_meat_fried': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'tj_krn_meat': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'tj_lesan_meat': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'tj_vegetables_meat': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'meat_onion': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'meat_potatoes': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'bamia_shani': okraTajineImg,
  'tj_sojok': 'https://images.unsplash.com/photo-1532246420281-12590929add5?auto=format&fit=crop&w=600&q=80',
  'tj_molo_meat': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'tj_msaqaa': 'https://images.unsplash.com/photo-1623428187969-5da2d8a6f157?auto=format&fit=crop&w=600&q=80',
  'warqat_meat': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'warqat_sojok': 'https://images.unsplash.com/photo-1532246420281-12590929add5?auto=format&fit=crop&w=600&q=80',
  'tasa_kabd_baladi': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'tasa_kabd_shani': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',

  // Rice dishes / Maammar
  'rz_mamar_sada': 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80',
  'rz_mamar_meat': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
  'rz_basmati': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=600&q=80',
  'rz_shaerya': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
  'rz_abiad': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
  'rz_kholta': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=600&q=80',

  // Salads & Dips
  'sl_khadra': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  'sl_water': 'https://images.unsplash.com/photo-1623428187969-5da2d8a6f157?auto=format&fit=crop&w=600&q=80',
  'sl_tahina': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'sl_baba': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'sl_tom_tomato': 'https://images.unsplash.com/photo-1623428187969-5da2d8a6f157?auto=format&fit=crop&w=600&q=80',
  'sl_toumeya': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'sl_mekhalel': 'https://images.unsplash.com/photo-1623428187969-5da2d8a6f157?auto=format&fit=crop&w=600&q=80',
  'sl_ba_mekhalel': 'https://images.unsplash.com/photo-1623428187969-5da2d8a6f157?auto=format&fit=crop&w=600&q=80',
  'sl_old_cheese': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  'sl_daqoos': 'https://images.unsplash.com/photo-1623428187969-5da2d8a6f157?auto=format&fit=crop&w=600&q=80',
  'sl_zabadi': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',

  // Soups
  'sh_lesan': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'sh_adas': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'sh_kware': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'sh_hamam': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'sh_crema': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',

  // Desserts
  'ds_rz_forn': bakedRicePuddingImg,
  'ds_mhalabya': 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=600&q=80',
  'ds_om_ali': omAliImg,
  'ds_konafa': 'https://images.unsplash.com/photo-1571861825852-6461a0edd822?auto=format&fit=crop&w=600&q=80',

  // Drinks
  'dr_shai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'dr_shai_2': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'dr_qahwa': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  'dr_yansoon': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'dr_shai_green': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'dr_canz': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
  'dr_water_small': 'https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&w=600&q=80',
  'dr_juice_fresh': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',

  // --- ADDED PREMIUM IMAGE MAPPINGS FOR COMPLETENESS ---
  // Individual Meals
  'wj_pane': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
  'wj_shd_grill': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  'wj_super': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'wj_gamid': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'wj_dynamite': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  'wj_single': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  'wj_kabab': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',

  // Chicken grills by weight
  'shish_tawook_weight': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  'pane_meshwi_weight': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  'pane_maq_weight': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',

  // Vegetable dishes
  'veg_bamia': okraTajineImg,
  'veg_meshakel': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'veg_potatoes': 'https://images.unsplash.com/photo-1547058886-af3b09a9678c?auto=format&fit=crop&w=600&q=80',
  'veg_molokhia': 'https://images.unsplash.com/photo-1547592165-e1d17f57655c?auto=format&fit=crop&w=600&q=80',
  'veg_soute': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',

  // Sharing Platters
  'sn_habayeb': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_shmlool': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_omda': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_atwla': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_arees': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_akela': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_kabeer': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_wohoosh': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_anteel': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_balad': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_zelzal': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_hadaeq': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'sn_abugoura_12': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
  'table_abugoura': 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&w=600&q=80',
};

// Fallback high-quality category images
export const CATEGORY_IMAGES: { [catId: string]: string } = {
  'meat_grills': 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?auto=format&fit=crop&w=600&q=80',
  'chicken_grills': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
  'meals': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  'platters': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  'tajines': 'https://images.unsplash.com/photo-1547928500-3049282362b1?auto=format&fit=crop&w=600&q=80',
  'oriental_kitchen': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=600&q=80',
  'sandwiches': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  'sides': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  'drinks_desserts': 'https://images.unsplash.com/photo-1571861825852-6461a0edd822?auto=format&fit=crop&w=600&q=80'
};

// Map each menu item to its premium image url
MENU_ITEMS.forEach(item => {
  item.image = ITEM_SPECIFIC_IMAGES[item.id] || CATEGORY_IMAGES[item.category] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80';
});
