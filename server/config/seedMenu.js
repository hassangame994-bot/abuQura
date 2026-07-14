export const INITIAL_CATEGORIES = [
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

export const INITIAL_MENU_ITEMS = [
  {
    id: 'ch_sada',
    name: 'فرخة سادة مشوية (شيش أو تكة)',
    category: 'chicken_grills',
    price: 360,
    description: 'فرخة كاملة متبلة ومفتوحة مشوية على الفحم بالتتبيلة الخاصة',
    isAvailable: true
  },
  {
    id: 'ch_half_sada',
    name: 'نصف فرخة سادة مشوية',
    category: 'chicken_grills',
    price: 195,
    description: 'نصف فرخة متبلة مشوية على الفحم بالتتبيلة الخاصة',
    isAvailable: true
  },
  {
    id: 'ch_rice',
    name: 'فرخة مشوية مع أرز',
    category: 'chicken_grills',
    price: 400,
    description: 'فرخة كاملة مشوية على الفحم تقدم مع أرز بسمتي فاخر خلطة',
    isAvailable: true
  },
  {
    id: 'ch_half_rice',
    name: 'نصف فرخة مشوية مع أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'نصف فرخة مشوية على الفحم تقدم مع أرز بسمتي فاخر خلطة',
    isAvailable: true
  },
  {
    id: 'ch_quarter_sada',
    name: 'ربع فرخة سادة مشوية',
    category: 'chicken_grills',
    price: 110,
    description: 'ربع فرخة متبلة مشوية على الفحم',
    isAvailable: true
  },
  {
    id: 'ch_quarter_rice',
    name: 'ربع فرخة مشوية مع أرز',
    category: 'chicken_grills',
    price: 125,
    description: 'ربع فرخة مشوية على الفحم تقدم مع أرز بسمتي فاخر خلطة',
    isAvailable: true
  },
  {
    id: 'samman',
    name: 'فرد سمان مشوي',
    category: 'chicken_grills',
    price: 170,
    description: 'سمان بلدي متبل ومشوي على الفحم بتتبيلة أبو قورة السرية',
    isAvailable: true
  },
  {
    id: 'hamam_rice',
    name: 'فرد حمام محشي أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'حمام بلدي محشي أرز بالخلطة ومحمر بالسمن البلدي',
    isAvailable: true
  },
  {
    id: 'hamam_frik',
    name: 'فرد حمام محشي فريك',
    category: 'chicken_grills',
    price: 220,
    description: 'حمام بلدي محشي فريك بلدي فاخر ومحمر بالسمن البلدي',
    isAvailable: true
  },
  {
    id: 'batta',
    name: 'بطة بلدي كاملة',
    category: 'chicken_grills',
    price: 680,
    description: 'بطة بلدي كاملة مطهوة ببطء في الفرن مع التتبيلة والمكسرات',
    isAvailable: true
  },
  {
    id: 'half_batta',
    name: 'نصف بطة بلدي',
    category: 'chicken_grills',
    price: 350,
    description: 'نصف بطة بلدي مطهوة في الفرن ومحمرة بالسمن البلدي',
    isAvailable: true
  },
  {
    id: 'sd_kofta_shani',
    name: 'ساندوتش كفتة ضاني',
    category: 'sandwiches',
    price: 100,
    description: 'كفتة ضاني مشوية على الفحم في خبز بلدي ساخن مع مخلل وطحينة',
    isAvailable: true
  },
  {
    id: 'sd_kofta_kandooz',
    name: 'ساندوتش كفتة كندوز',
    category: 'sandwiches',
    price: 90,
    description: 'كفتة كندوز مشوية على الفحم في خبز بلدي ساخن مع مخلل وطحينة',
    isAvailable: true
  },
  {
    id: 'sd_hawawshi_shani',
    name: 'ساندوتش حواوشي ضاني',
    category: 'sandwiches',
    price: 100,
    description: 'رغيف حواوشي بلدي غني باللحم الضاني المتبل والمطهو ببراعة على الفحم',
    isAvailable: true
  },
  {
    id: 'sd_hawawshi_kandooz',
    name: 'ساندوتش حواوشي كندوز',
    category: 'sandwiches',
    price: 90,
    description: 'رغيف حواوشي بلدي غني باللحم الكندوز المتبل والمقرمش من الخارج',
    isAvailable: true
  },
  {
    id: 'sd_kabab',
    name: 'ساندوتش كباب',
    category: 'sandwiches',
    price: 150,
    description: 'قطع كباب ضاني مشوي على الفحم في خبز بلدي مع طحينة',
    isAvailable: true
  },
  {
    id: 'sd_tarb',
    name: 'ساندوتش طرب',
    category: 'sandwiches',
    price: 105,
    description: 'طرب ضاني مشوي على الفحم رائع المذاق',
    isAvailable: true
  },
  {
    id: 'sd_shish',
    name: 'ساندوتش شيش طاووق',
    category: 'sandwiches',
    price: 80,
    description: 'شيش طاووق متبل بخلطة الزبادي والبهارات تقدم ساخنة',
    isAvailable: true
  },
  {
    id: 'sd_sojok',
    name: 'ساندوتش سجق',
    category: 'sandwiches',
    price: 90,
    description: 'سجق بلدي شرقي متبل بصوص الطماطم والخلطة',
    isAvailable: true
  },
  {
    id: 'kabab_shani',
    name: 'كباب ضاني (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 285, 'تلت': 420, 'نص': 560, 'كيلو': 1100 },
    description: 'قطع اللحم الضاني الفاخر المشوي بخلطة أبو قورة المميزة على الفحم',
    isAvailable: true
  },
  {
    id: 'riash_shani',
    name: 'ريش ضاني (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 310, 'تلت': 460, 'نص': 610, 'كيلو': 1200 },
    description: 'ريش ضاني طازجة مشوية ببطء على الفحم لتذوب في الفم',
    isAvailable: true
  },
  {
    id: 'kofta_kandooz',
    name: 'كفتة كندوز (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 165, 'تلت': 250, 'نص': 325, 'كيلو': 640 },
    description: 'كفتة بلدي كندوز مشوية على الفحم بتتبيلة غنية',
    isAvailable: true
  },
  {
    id: 'kofta_shani',
    name: 'كفتة ضاني (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 190, 'تلت': 285, 'نص': 375, 'كيلو': 740 },
    description: 'كفتة ضاني بلدي ممتازة مشوية على الفحم برائحة زمان',
    isAvailable: true
  },
  {
    id: 'kabd_kalawi',
    name: 'كبد وكلاوي مشوية (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 155, 'تلت': 205, 'نص': 305, 'كيلو': 600 },
    description: 'كبدة وكلاوي بلدي مشوية على الفحم بالتتبيلة الثومية الشهية',
    isAvailable: true
  },
  {
    id: 'steak',
    name: 'استيك مشوي (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 310, 'تلت': 460, 'نص': 610, 'كيلو': 1200 },
    description: 'قطع ستيك بقري فاخر مشوي على الجريل بصوص التتبيلة الرائع',
    isAvailable: true
  },
  {
    id: 'tarb_grill',
    name: 'طرب ضاني فاخر (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 215, 'تلت': 315, 'نص': 420, 'كيلو': 820 },
    description: 'طرب ضاني محشو باللحم البلدي المفروم والمتبل، مشوي على الفحم بدسمية رائعة',
    isAvailable: true
  },
  {
    id: 'sojok_grill',
    name: 'سجق مشوي على الفحم (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 170, 'تلت': 250, 'نص': 330, 'كيلو': 650 },
    description: 'سجق بلدي بالبهارات والخلطة مشوي على الفحم مباشرة',
    isAvailable: true
  },
  {
    id: 'meshakel_meat',
    name: 'مشكل كباب وكفتة (بالوزن)',
    category: 'meat_grills',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 220, 'نص': 435, 'كيلو': 850 },
    description: 'مزيج رائع من قطع الكباب الضاني والكفتة المشوية على الفحم',
    isAvailable: true
  },
  {
    id: 'mix_grill',
    name: 'ميكس جريل (بالوزن)',
    category: 'meat_grills',
    sizes: ['نص', 'كيلو'],
    price: { 'نص': 410, 'كيلو': 800 },
    description: 'تشكيلة خارقة من: كباب + كفتة + شيش طاووق + طرب، مشوية كلها على الفحم لتشبع رغباتك',
    isAvailable: true
  },
  {
    id: 'ch_shawaya',
    name: 'فرخة شواية سادة',
    category: 'chicken_grills',
    price: 370,
    description: 'فرخة شواية تدور على الشواية لتصبح مقرمشة ولذيذة',
    isAvailable: true
  },
  {
    id: 'ch_shawaya_rice',
    name: 'فرخة شواية مع أرز',
    category: 'chicken_grills',
    price: 410,
    description: 'فرخة شواية تدور تقدم مع أرز بسمتي فاخر متبل',
    isAvailable: true
  },
  {
    id: 'ch_half_shawaya',
    name: 'نصف فرخة شواية',
    category: 'chicken_grills',
    price: 195,
    description: 'نصف فرخة شواية مقرمشة ولذيذة',
    isAvailable: true
  },
  {
    id: 'ch_half_shawaya_rice',
    name: 'نصف فرخة شواية مع أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'نصف فرخة شواية تقدم مع أرز بسمتي وتومية ومخلل وعيش',
    isAvailable: true
  },
  {
    id: 'ch_mandi',
    name: 'فرخة مندي مع أرز',
    category: 'chicken_grills',
    price: 370,
    description: 'فرخة مطبوخة على الطريقة المندية الأصلية تقدم مع أرز مندي طويل الحبة وصوص الدقوس',
    isAvailable: true
  },
  {
    id: 'ch_half_mandi',
    name: 'نصف فرخة مندي مع أرز',
    category: 'chicken_grills',
    price: 210,
    description: 'نصف فرخة مندي تقدم مع أرز مندي طويل الحبة وصوص الدقوس',
    isAvailable: true
  },
  {
    id: 'moza_sada',
    name: 'موزة ضاني سادة',
    category: 'oriental_kitchen',
    price: 400,
    description: 'موزة ضاني بلدي مطهوة في الفرن ببطء حتى تذوب مع التوابل الشرقية',
    isAvailable: true
  },
  {
    id: 'ouzi_sada',
    name: 'أوزي سادة فاخر',
    category: 'oriental_kitchen',
    price: 400,
    description: 'أوزي اللحم البلدي ببهارات الشرق الغنية',
    isAvailable: true
  },
  {
    id: 'waraq_enab_plate',
    name: 'طبق ورق عنب بلدي',
    category: 'oriental_kitchen',
    price: 80,
    description: 'طبق ورق عنب محشو بخلطة الأرز اللذيذة والليمون',
    isAvailable: true
  },
  {
    id: 'mahshi_big',
    name: 'محشي مشكل كبير',
    category: 'oriental_kitchen',
    price: 175,
    description: 'طبق مشكل كبير من الكوسة والباذنجان والفلفل وورق العنب والكرنب',
    isAvailable: true
  },
  {
    id: 'mahshi_med',
    name: 'محشي مشكل وسط',
    category: 'oriental_kitchen',
    price: 115,
    description: 'طبق مشكل وسط لجميع أنواع المحاشي الشهية بخلطة السمن البلدي',
    isAvailable: true
  },
  {
    id: 'krn_plate',
    name: 'طبق محشي كرنب',
    category: 'oriental_kitchen',
    price: 80,
    description: 'أصابع محشي كرنب مسبك بالسمن البلدي والصلصة ومطهو ببراعة',
    isAvailable: true
  },
  {
    id: 'mombar',
    name: 'ممبار بلدي (بالوزن)',
    category: 'oriental_kitchen',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 100, 'نص': 200, 'كيلو': 380 },
    description: 'ممبار بلدي محشو بالأرز المتبل والخلطة الحارة، مقلي ومقرمش بامتياز',
    isAvailable: true
  },
  {
    id: 'roqaq',
    name: 'رقاق باللحمة المفرومة (4 قطع)',
    category: 'oriental_kitchen',
    price: 135,
    description: 'صينية رقاق بلدي بالسمن والشوربة محشو باللحم المفروم المتبل والمقرمش',
    isAvailable: true
  },
  {
    id: 'samb_cheese',
    name: 'سمبوسة جبنة (6 قطع)',
    category: 'oriental_kitchen',
    price: 90,
    description: 'سمبوسة مقلية مقرمشة محشوة بمزيج من الأجبان الرائعة',
    isAvailable: true
  },
  {
    id: 'samb_meat',
    name: 'سمبوسة لحمة (6 قطع)',
    category: 'oriental_kitchen',
    price: 95,
    description: 'سمبوسة مقلية مقرمشة محشوة باللحم المفروم المتبل والبصل',
    isAvailable: true
  },
  {
    id: 'samb_mix',
    name: 'سمبوسة ميكس (6 قطع)',
    category: 'oriental_kitchen',
    price: 95,
    description: 'سمبوسة مقرمشة مشكلة بين أجبان ولحم مفروم',
    isAvailable: true
  },
  {
    id: 'french_fries',
    name: 'باكت بطاطس محمرة متبلة',
    category: 'oriental_kitchen',
    price: 45,
    description: 'باكت كبير بطاطس محمرة ومقرمشة متبلة ببهارات البطاطس اللذيذة',
    isAvailable: true
  },
  {
    id: 'mac_bashamel',
    name: 'مكرونة بشاميل باللحمة المفرومة',
    category: 'oriental_kitchen',
    price: 90,
    description: 'صينية مكرونة بالبشاميل الغني واللحم المفروم الفاخر مغطاة بجبنة محمرة',
    isAvailable: true
  },
  {
    id: 'mac_bolognese',
    name: 'مكرونة اسباجيتي بولونيز',
    category: 'oriental_kitchen',
    price: 110,
    description: 'مكرونة اسباجيتي تقدم مع صوص طماطم غني باللحم المفروم المتبل',
    isAvailable: true
  },
  {
    id: 'mac_sada',
    name: 'مكرونة بالصلصة سادة',
    category: 'oriental_kitchen',
    price: 65,
    description: 'مكرونة بالصلصة الحمراء المتبلة بنكهة مصرية أصيلة',
    isAvailable: true
  },
  {
    id: 'tj_akawi',
    name: 'طاجن عكاوي بالبصل',
    category: 'tajines',
    price: 350,
    description: 'طاجن عكاوي بلدي مع البصل المكرمل مسبك في الفرن الفخار لمذاق لا ينسى',
    isAvailable: true
  },
  {
    id: 'tj_waraq_kware',
    name: 'طاجن ورق عنب بالكوارع',
    category: 'tajines',
    price: 370,
    description: 'مزيج فاخر من ورق العنب الحامض مع قطع كوارع بلدي مخلية ودايبة بصوص الصلصة',
    isAvailable: true
  },
  {
    id: 'tj_molo_kware',
    name: 'طاجن ملوخية بالكوارع',
    category: 'tajines',
    price: 370,
    description: 'ملوخية خضراء مصرية بطشة الثوم والكزبرة غنية بقطع الكوارع البلدي المخلاة',
    isAvailable: true
  },
  {
    id: 'tj_meat_fried',
    name: 'طاجن لحمة محمرة بلدي',
    category: 'tajines',
    price: 280,
    description: 'طاجن قطع لحم بلدي محمر بالسمن والبهارات مع تتبيلة البصل والبهار في طاجن فخار',
    isAvailable: true
  },
  {
    id: 'tj_krn_meat',
    name: 'طاجن كرنب باللحمة',
    category: 'tajines',
    price: 320,
    description: 'محشي كرنب بلدي مطبوخ بمرقة اللحم ومزين بقطع لحم دايبة',
    isAvailable: true
  },
  {
    id: 'tj_lesan_meat',
    name: 'طاجن لسان عصفور باللحمة',
    category: 'tajines',
    price: 295,
    description: 'مكرونة لسان عصفور محمرة بالسمن مع قطع لحم بلدي متبل في طاجن فخار بالفرن',
    isAvailable: true
  },
  {
    id: 'tj_vegetables_meat',
    name: 'طاجن خضار مشكل باللحمة',
    category: 'tajines',
    price: 285,
    description: 'تورلي خضار مشكل طازج مع قطع لحم بلدي مطبوخ في الصلصة المصرية وطشة الثوم',
    isAvailable: true
  },
  {
    id: 'meat_onion',
    name: 'طاجن لحمة بالبصل بلدي',
    category: 'tajines',
    price: 275,
    description: 'قطع لحم بلدي مطبوخة ببطء مع كمية وفيرة من البصل والتوابل كباب حلة',
    isAvailable: true
  },
  {
    id: 'meat_potatoes',
    name: 'طاجن بطاطس باللحمة في الفخار',
    category: 'tajines',
    price: 275,
    description: 'طاجن صينية بطاطس شرائح باللحم البلدي والصلصة الغنية',
    isAvailable: true
  },
  {
    id: 'bamia_shani',
    name: 'طاجن بامية باللحمة الضاني',
    category: 'tajines',
    price: 295,
    description: 'طاجن بامية بلدي بالثوم والليمون والصلصة واللحم الضاني الدايب كلياً',
    isAvailable: true
  },
  {
    id: 'tj_sojok',
    name: 'طاجن سجق بلدي شرقي',
    category: 'tajines',
    price: 280,
    description: 'سجق بلدي مع البصل والفلفل الألوان والطماطم في طاجن فخار',
    isAvailable: true
  },
  {
    id: 'tj_molo_meat',
    name: 'طاجن ملوخية باللحمة',
    category: 'tajines',
    price: 275,
    description: 'طاجن ملوخية خضراء طازجة تقدم مع قطع لحم بلدي مطهو ببطء',
    isAvailable: true
  },
  {
    id: 'tj_msaqaa',
    name: 'طاجن مسقعة باللحمة المفرومة',
    category: 'tajines',
    price: 230,
    description: 'باذنجان وفلفل وبطاطس مقلية مطبوخة بالثوم والخل والصلصة واللحم المفروم البقري',
    isAvailable: true
  },
  {
    id: 'warqat_meat',
    name: 'ورقة لحمة بلدي بالخضار',
    category: 'tajines',
    price: 270,
    description: 'قطع اللحم البلدي الفاخر مغلفة في ورق الزبدة والفويل مع الخضار المتبل ومطهوة ببطء بالفرن',
    isAvailable: true
  },
  {
    id: 'warqat_sojok',
    name: 'ورقة سجق بلدي بالخضار',
    category: 'tajines',
    price: 250,
    description: 'سجق بلدي متبل مع الخضار والبهارات مطبوخة داخل ورقة محكمة بالفرن',
    isAvailable: true
  },
  {
    id: 'tasa_kabd_baladi',
    name: 'طاسة كبدة بلدي بالثوم والفلفل',
    category: 'tajines',
    price: 270,
    description: 'كبدة بلدي طازجة مشوحة بالسمن والبهارات مع ثوم وفلفل حار تقدم ساخنة',
    isAvailable: true
  },
  {
    id: 'tasa_kabd_shani',
    name: 'طاسة كبدة ضاني مشوحة',
    category: 'tajines',
    price: 270,
    description: 'كبدة ضاني بلدي مشوحة بقطع اللية الضاني والثوم والكزبرة',
    isAvailable: true
  },
  {
    id: 'wj_pane',
    name: 'وجبة بانيه ممتازة',
    category: 'meals',
    price: 190,
    description: 'شرائح بانيه مقلي ذهبي + بطاطس مقرمشة + مكرونة اسباجيتي بصلصة أبو قورة اللذيذة',
    isAvailable: true
  },
  {
    id: 'wj_shd_grill',
    name: 'وجبة صدور مشوية صحية',
    category: 'meals',
    price: 200,
    description: 'صدور دجاج مشوية على الجريل متبلة + بطاطس + أرز أبيض + خضار سوتيه خفيف',
    isAvailable: true
  },
  {
    id: 'wj_super',
    name: 'وجبة السوبر (توفير)',
    category: 'meals',
    price: 125,
    description: 'ربع فرخة مشوية على الفحم + أرز خلطة بسمتي + شوربة وسلطات ومخلل وعيش',
    isAvailable: true
  },
  {
    id: 'wj_gamid',
    name: 'وجبة الجامد (كاملة)',
    category: 'meals',
    price: 165,
    description: 'ربع فرخة مشوية + أرز خلطة + خضار مطبوخ طازج + سلطة وطحينة وعيش',
    isAvailable: true
  },
  {
    id: 'wj_dynamite',
    name: 'وجبة الديناميت الخارقة',
    category: 'meals',
    price: 210,
    description: 'ربع فرخة مشوية على الفحم + ثمن كفتة ضاني + أرز خلطة + خضار مطبوخ وسلطات',
    isAvailable: true
  },
  {
    id: 'wj_single',
    name: 'وجبة السنجل اللذيذة',
    category: 'meals',
    price: 195,
    description: 'ربع فرخة مشوية على الفحم + ثمن كفتة ضاني + أرز خلطة بسمتي + سلطات وعيش',
    isAvailable: true
  },
  {
    id: 'wj_kabab',
    name: 'وجبة الكباب واللحم الفاخر',
    category: 'meals',
    price: 315,
    description: 'ثمن كباب ضاني + ثمن كفتة + ثمن شيش طاووق + أرز خلطة بسمتي + سلطة وطحينة وعيش',
    isAvailable: true
  },
  {
    id: 'nafar_mandi',
    name: 'نفر لحمة مندي بلدي',
    category: 'oriental_kitchen',
    price: 420,
    description: 'نفر لحم مندي بلدي فاخر مطهو ببطء في حفرة المندي، يقدم مع أرز مندي ودقوس',
    isAvailable: true
  },
  {
    id: 'thomn_teis',
    name: 'ثمن تيس مندي كامل',
    category: 'oriental_kitchen',
    price: 870,
    description: 'ثمن تيس بلدي مندي مطبوخ ببطء لدرجة الذوبان مع الأرز المندي والصوصات والسلطة وعيش',
    isAvailable: true
  },
  {
    id: 'rob_teis',
    name: 'ربع تيس مندي بلدي',
    category: 'oriental_kitchen',
    price: 1500,
    description: 'ربع تيس بلدي مندي مطهو على الأصول ليكون طرياً جداً مع الأرز المندي الفاخر',
    isAvailable: true
  },
  {
    id: 'nos_teis',
    name: 'نصف تيس مندي بلدي',
    category: 'oriental_kitchen',
    price: 3000,
    description: 'نصف تيس بلدي مندي مع صواني الأرز البسمتي المزين بالمكسرات والزبيب والسلطات',
    isAvailable: true
  },
  {
    id: 'moza_fatta',
    name: 'فتة موزة ضاني',
    category: 'oriental_kitchen',
    price: 450,
    description: 'موزة ضاني بلدي كاملة دايبة تقدم فوق طبق فتة مصري بالخل والثوم والسمن البلدي والصلصة',
    isAvailable: true
  },
  {
    id: 'fatta_sada',
    name: 'طبق فتة سادة بالخل والثوم',
    category: 'oriental_kitchen',
    price: 50,
    description: 'طبق فتة مصري أصيل بالعيش المقرمش والأرز والسمن البلدي وصلصة الخل والثوم',
    isAvailable: true
  },
  {
    id: 'fatta_kware',
    name: 'فتة كوارع بلدي',
    category: 'oriental_kitchen',
    price: 360,
    description: 'قطع كوارع بلدي مخلاة مطهوة فوق طبق الفتة المصري بالخل والثوم والصلصة',
    isAvailable: true
  },
  {
    id: 'fatta_meat_fried',
    name: 'فتة باللحمة المحمرة',
    category: 'oriental_kitchen',
    price: 320,
    description: 'قطع لحم بلدي محمر في السمن البلدي فوق طبق الفتة بالصلصة والخل والثوم',
    isAvailable: true
  },
  {
    id: 'shish_tawook_weight',
    name: 'شيش طاووق مشوي (بالوزن)',
    category: 'chicken_grills',
    sizes: ['ربع', 'تلت', 'نص', 'كيلو'],
    price: { 'ربع': 125, 'تلت': 185, 'نص': 245, 'كيلو': 480 },
    description: 'قطع صدور وأوراك الدجاج المتبلة ببهارات الشيش المشوية على الفحم بالتناوب مع الخضار',
    isAvailable: true
  },
  {
    id: 'pane_meshwi_weight',
    name: 'بانيه مشوي على الجريل (بالوزن)',
    category: 'chicken_grills',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 135, 'نص': 260, 'كيلو': 500 },
    description: 'صدور بانيه متبلة بصوص البصل والليمون ومشوية صحية على الجريل',
    isAvailable: true
  },
  {
    id: 'pane_maq_weight',
    name: 'بانيه مقلي ذهبي (بالوزن)',
    category: 'chicken_grills',
    sizes: ['ربع', 'نص', 'كيلو'],
    price: { 'ربع': 135, 'نص': 260, 'كيلو': 500 },
    description: 'صدور دجاج بانيه متبلة ومغطاة بالبقسماط المقرمش ومقلية بالزيت النظيف لتصبح مقرمشة ذهبية',
    isAvailable: true
  },
  {
    id: 'veg_bamia',
    name: 'طبق بامية بلدي سادة',
    category: 'sides',
    price: 50,
    description: 'طبق بامية بلدي مطبوخ بالصلصة والثوم والليمون ومرقة اللحم',
    isAvailable: true
  },
  {
    id: 'veg_meshakel',
    name: 'طبق خضار مشكل سادة (تورلي)',
    category: 'sides',
    price: 40,
    description: 'تشكيلة خضار طازجة مطبوخة بالصلصة المسبكة اللذيذة',
    isAvailable: true
  },
  {
    id: 'veg_potatoes',
    name: 'طبق بطاطس مطبوخة بالصلصة',
    category: 'sides',
    price: 40,
    description: 'مكعبات بطاطس مطبوخة بمرقة اللحم والصلصة',
    isAvailable: true
  },
  {
    id: 'veg_molokhia',
    name: 'طبق ملوخية خضراء سادة',
    category: 'sides',
    price: 40,
    description: 'طبق ملوخية خضراء بطشة الثوم والكزبرة الشهيرة بسمن بلدي',
    isAvailable: true
  },
  {
    id: 'veg_soute',
    name: 'طبق خضار سوتيه سادة',
    category: 'sides',
    price: 40,
    description: 'خضار مشكل مطهو على البخار خفيف وصحي',
    isAvailable: true
  },
  {
    id: 'sh_lesan',
    name: 'شوربة لسان عصفور بلدي',
    category: 'sides',
    price: 35,
    description: 'شوربة لسان عصفور محمر بالسمن بمرقة اللحم الغنية والليمون',
    isAvailable: true
  },
  {
    id: 'sh_adas',
    name: 'شوربة عدس دافئة',
    category: 'sides',
    price: 40,
    description: 'شوربة عدس أصفر مصري بالسمن والخلطة والخبز المحمص',
    isAvailable: true
  },
  {
    id: 'sh_kware',
    name: 'شوربة كوارع مخلية بلدي',
    category: 'sides',
    price: 145,
    description: 'شوربة كوارع بلدي مخلاة دسمة وغنية بالبهارات والليمون لتقوية الجسم',
    isAvailable: true
  },
  {
    id: 'sh_hamam',
    name: 'شوربة حمام دسمة',
    category: 'sides',
    price: 160,
    description: 'شوربة بمرقة الحمام البلدي دسمة وغنية ومفيدة جداً',
    isAvailable: true
  },
  {
    id: 'sh_crema',
    name: 'شوربة كريمة بالفراخ',
    category: 'sides',
    price: 90,
    description: 'شوربة كريمة غنية ولذيذة مع قطع الدجاج الطرية والمشروم',
    isAvailable: true
  },
  {
    id: 'rz_mamar_sada',
    name: 'طاجن أرز معمر سادة بالفرن',
    category: 'oriental_kitchen',
    price: 130,
    description: 'أرز معمر بالحليب والقشطة والسمن البلدي مخبوز بالفرن الفخار',
    isAvailable: true
  },
  {
    id: 'rz_mamar_meat',
    name: 'طاجن أرز معمر باللحمة البلدي',
    category: 'oriental_kitchen',
    price: 210,
    description: 'أرز معمر غني بالحليب والقشطة محشو بقطع اللحم البلدي الطري ومخبوز بالفرن',
    isAvailable: true
  },
  {
    id: 'rz_basmati',
    name: 'طبق أرز بسمتي أصفر طويل الحبة',
    category: 'oriental_kitchen',
    price: 55,
    description: 'أرز بسمتي أصفر مطبوخ ببهارات الكبسة الفاخرة والمكسرات',
    isAvailable: true
  },
  {
    id: 'rz_shaerya',
    name: 'طبق أرز بالشعرية بلدي',
    category: 'oriental_kitchen',
    price: 45,
    description: 'أرز مصري مفلفل بالشعرية المحمرة بالسمن البلدي',
    isAvailable: true
  },
  {
    id: 'rz_abiad',
    name: 'طبق أرز أبيض بلدي سادة',
    category: 'oriental_kitchen',
    price: 40,
    description: 'أرز مصري أبيض مطهو بالسمن البلدي بطعم زمان',
    isAvailable: true
  },
  {
    id: 'rz_kholta',
    name: 'طبق أرز خلطة أبو قورة المميز',
    category: 'oriental_kitchen',
    price: 55,
    description: 'أرز بالخلطة البنية والبهارات والمكسرات والزبيب',
    isAvailable: true
  },
  {
    id: 'sl_khadra',
    name: 'سلطة خضراء بلدي طازجة',
    category: 'sides',
    price: 20,
    description: 'طماطم وخيار وجرجير وفلفل وبقدونس مع تتبيلة الليمون والخل',
    isAvailable: true
  },
  {
    id: 'sl_water',
    name: 'مياه سلطة بلدي (ويسكي الغلابة)',
    category: 'sides',
    price: 10,
    description: 'مياه مخلل وسلطة متبلة ومبهرة حار لفتح الشهية',
    isAvailable: true
  },
  {
    id: 'sl_tahina',
    name: 'سلطة طحينة سمسم فاخرة',
    category: 'sides',
    price: 20,
    description: 'طحينة خام مخلوطة بالثوم والليمون والخل والكمون',
    isAvailable: true
  },
  {
    id: 'sl_baba',
    name: 'سلطة بابا غنوج بالخلطة',
    category: 'sides',
    price: 25,
    description: 'باذنجان مشوي على الفحم مهروس مع الطحينة والثوم والبهارات',
    isAvailable: true
  },
  {
    id: 'sl_tom_tomato',
    name: 'طماطم متبلة بالثوم والخل',
    category: 'sides',
    price: 25,
    description: 'شرائح طماطم طازجة متبلة بخلطة الثوم والخل والكزبرة والفلفل الحار',
    isAvailable: true
  },
  {
    id: 'sl_toumeya',
    name: 'ثومية شامية غنية',
    category: 'sides',
    price: 20,
    description: 'صوص الثومية الكريمي اللذيذ الممتاز مع المشويات',
    isAvailable: true
  },
  {
    id: 'sl_mekhalel',
    name: 'مخلل بلدي مشكل لفتح النفس',
    category: 'sides',
    price: 20,
    description: 'تشكيلة مخللات لفت وخيار وجزر وفلفل بلدي ممتازة',
    isAvailable: true
  },
  {
    id: 'sl_ba_mekhalel',
    name: 'باذنجان مخلل بالخلطة الحارة',
    category: 'sides',
    price: 20,
    description: 'باذنجان مقلي مخلل بخلطة الثوم والخل والليمون والفلفل الأحمر الحار',
    isAvailable: true
  },
  {
    id: 'sl_old_cheese',
    name: 'جبنة قديمة بالطماطم والطحينة',
    category: 'sides',
    price: 35,
    description: 'جبنة مش مش المصرية الشهيرة مع زيت الزيتون وقطع الطماطم والخيار والطحينة',
    isAvailable: true
  },
  {
    id: 'sl_daqoos',
    name: 'سلطة دقوس حارة للمندي',
    category: 'sides',
    price: 20,
    description: 'طماطم مفرومة ناعمة مع فلفل حار وثوم وليمون وكزبرة ممتازة مع الأرز',
    isAvailable: true
  },
  {
    id: 'sl_zabadi',
    name: 'سلطة زبادي بالخيار والنعناع',
    category: 'sides',
    price: 35,
    description: 'زبادي طازج مع خيار مبشور ونعناع جاف زيت زيتون خفيف وصحي',
    isAvailable: true
  },
  {
    id: 'sn_habayeb',
    name: 'صينية الحبايب (تكفي فردين)',
    category: 'platters',
    price: 700,
    description: 'ربع كفتة + نصف فرخة + ربع طرب + ربع ممبار + نصف كيلو أرز بسمتي + سلطات + عيش بلدي ساخن',
    isAvailable: true
  },
  {
    id: 'sn_shmlool',
    name: 'صينية الشملول (تكفي 4 أفراد)',
    category: 'platters',
    price: 1100,
    description: 'فرخة شواية كاملة + نصف كفتة + نصف سجق مشوي + محشي مشكل طبق + كيلو ونصف أرز بسمتي + سلطات + عيش',
    isAvailable: true
  },
  {
    id: 'sn_omda',
    name: 'صينية عمدة البلد (تكفي 5 أفراد)',
    category: 'platters',
    price: 1500,
    description: 'نصف كفتة + نصف طرب + نصف شيش طاووق + نصف فرخة مشوية + 4 قطع رقاق + 3 قطع مندي لحم + 2 كيلو أرز بسمتي + سلطات + عيش',
    isAvailable: true
  },
  {
    id: 'sn_atwla',
    name: 'صينية العتاولة الجبارة (تكفي 5 أفراد)',
    category: 'platters',
    price: 1650,
    description: 'نصف فرخة مشوية + نصف فرخة مندي + نصف كفتة + نصف سجق + نفر لحمة مندي + طبق محشي مشكل + أرز بسمتي كافٍ + سلطات + عيش',
    isAvailable: true
  },
  {
    id: 'sn_arees',
    name: 'صينية العريس الفخمة (تكفي 5 أفراد)',
    category: 'platters',
    price: 1700,
    description: 'فرخة مندي + نصف ستيك مشوي + ربع بانيه مشوي + ربع شيش طاووق + ربع ممبار + 6 سمبوسة ميكس + كيلو ونصف أرز بسمتي خلطة + سلطات + عيش',
    isAvailable: true
  },
  {
    id: 'sn_akela',
    name: 'صينية الأكيلة (تكفي 6 أفراد)',
    category: 'platters',
    price: 1800,
    description: 'نصف كباب ضاني + نصف بطة بلدي + نصف كفتة ضاني + نصف فرخة مشوية + 4 قطع رقاق + نصف سجق + 2 كيلو أرز + سلطات وعيش',
    isAvailable: true
  },
  {
    id: 'sn_kabeer',
    name: 'صينية الكبير أوي (تكفي 6 أفراد)',
    category: 'platters',
    price: 1850,
    description: '4 فرد حمام بلدي + نفر لحمة مندي + ربع طرب + ربع سجق + ربع شيش طاووق + نصف فرخة مشوية + طبق محشي مشكل + أرز بسمتي كافٍ + سلطات + عيش',
    isAvailable: true
  },
  {
    id: 'sn_wohoosh',
    name: 'صينية الوحوش الصاعقة (تكفي 7 أفراد)',
    category: 'platters',
    price: 2000,
    description: 'نصف كفتة + نصف شيش طاووق + نصف سجق + نصف طرب + ربع ممبار + نفر لحمة مندي + 2 كيلو أرز بسمتي + سلطة خضراء وطحينة وعيش',
    isAvailable: true
  },
  {
    id: 'sn_anteel',
    name: 'صينية العنتيل الملوكية (تكفي 8 أفراد)',
    category: 'platters',
    price: 2350,
    description: 'نصف كفتة + نصف نيفة ضاني + نصف طرب + نصف كباب ضاني + نصف سجق + نصف ريش ضاني + 2 كيلو أرز + سلطات وعيش',
    isAvailable: true
  },
  {
    id: 'sn_balad',
    name: 'صينية البلد (تكفي 8 أفراد)',
    category: 'platters',
    price: 2250,
    description: 'نصف فرخة مندي + نصف كفتة + نصف شيش طاووق + نصف طرب + نصف سجق + نصف ممبار + 2 كيلو أرز + سلطة خضراء وطحينة ودقوس وعيش',
    isAvailable: true
  },
  {
    id: 'sn_zelzal',
    name: 'صينية زلزال الأرض (تكفي 9 أفراد)',
    category: 'platters',
    price: 2475,
    description: 'نفر لحم مندي + 3 أرباع فراخ مندي + 3 فرد حمام بلدي + ربع شيش طاووق + ربع كفتة + ربع طرب + ربع سجق + 4 قطع رقاق + نصف كيلو ورق عنب + 2 كيلو أرز + سلطات وعيش',
    isAvailable: true
  },
  {
    id: 'sn_hadaeq',
    name: 'صينية أهل الحدائق الضخمة (تكفي 10 أفراد)',
    category: 'platters',
    price: 2790,
    description: 'أربع فراخ مشوية + 5 حمام بلدي + 5 صوابع طرب + 5 صوابع كفتة + 5 قطع شيش طاووق + 5 قطع سجق + 5 ممبار + طبق محشي مشكل + 3 كيلو أرز + سلطة خضراء وطحينة ودقوس وعيش',
    isAvailable: true
  },
  {
    id: 'sn_abugoura_12',
    name: 'صينية أبو قورة الملكية (تكفي 12 فرداً)',
    category: 'platters',
    price: 3300,
    description: 'كيلو لحم مندي + فرخة مشوية كاملة + تلت طرب + تلت كفتة + تلت سجق + تلت ريش + تلت شيش طاووق + طبق محشي مشكل + 8 قطع سمبوسة + نصف كيلو ورق عنب + 2 كيلو أرز بسمتي بالخلطة والمكسرات والزبيب + سلطات وعيش',
    isAvailable: true
  },
  {
    id: 'table_abugoura',
    name: 'طبلية أبو قورة التاريخية الكبرى',
    category: 'platters',
    price: 2500,
    description: 'طاجن رز معمر باللحمة البلدي + صينية رقاق باللحمة المفرومة (8 قطع) + طاجن بطاطس باللحمة + طبق فتة كوارع + طاجن عكاوي بالبصل + نصف فرخة مشوية على الفحم + بطة بلدي روستو كاملة + 6 طواجن ملوخية خضراء + 6 شوربة لسان عصفور دسمة مع العيش والسلطات',
    isAvailable: true
  },
  {
    id: 'ds_rz_forn',
    name: 'طاجن أرز بلبن في الفرن بلدي',
    category: 'drinks_desserts',
    price: 50,
    description: 'طاجن أرز باللبن مخبوز بالفرن بالسمن والقشطة ليعلوه وش محمر شهي',
    isAvailable: true
  },
  {
    id: 'ds_mhalabya',
    name: 'مهلبية بالفرن غنية',
    category: 'drinks_desserts',
    price: 50,
    description: 'مهلبية الحليب بالقشطة مخبوزة بالفرن طعم ناعم ولذيذ',
    isAvailable: true
  },
  {
    id: 'ds_om_ali',
    name: 'أم علي بالقشطة والمكسرات',
    category: 'drinks_desserts',
    price: 55,
    description: 'رقائق الباف باستري الهشة باللبن الساخن والقشطة والمكسرات والزبيب وجوز الهند',
    isAvailable: true
  },
  {
    id: 'ds_konafa',
    name: 'طبق كنافة بالسمن البلدي',
    category: 'drinks_desserts',
    price: 45,
    description: 'كنافة ذهبية مقرمشة محشوة بالكريمة الغنية ومسقية بالشربات الحلو',
    isAvailable: true
  },
  {
    id: 'dr_shai',
    name: 'كوب شاي أحمر مصري',
    category: 'drinks_desserts',
    price: 30,
    description: 'كوب شاي مصري في الخمسينة بالنعناع أو سادة',
    isAvailable: true
  },
  {
    id: 'dr_shai_2',
    name: 'براد شاي (يكفي فردين)',
    category: 'drinks_desserts',
    price: 35,
    description: 'براد شاي بلدي ساخن مع النعناع الأخضر الطازج',
    isAvailable: true
  },
  {
    id: 'dr_qahwa',
    name: 'فنجان قهوة تركي بلدي',
    category: 'drinks_desserts',
    price: 35,
    description: 'فنجان قهوة محوجة رائع المذاق بوش ممتاز',
    isAvailable: true
  },
  {
    id: 'dr_yansoon',
    name: 'كوب يانسون دافئ مريح',
    category: 'drinks_desserts',
    price: 25,
    description: 'يانسون طبيعي دافئ ومريح للأعصاب والمعدة',
    isAvailable: true
  },
  {
    id: 'dr_shai_green',
    name: 'كوب شاي أخضر صحي',
    category: 'drinks_desserts',
    price: 25,
    description: 'شاي أخضر طبيعي دافئ وصحي للهضم بعد الأكل الدسم',
    isAvailable: true
  },
  {
    id: 'dr_canz',
    name: 'كانز مياه غازية باردة',
    category: 'drinks_desserts',
    price: 25,
    description: 'مياه غازية باردة منعشة (كوكاكولا / بيبسي / سفن أب / ميرندا)',
    isAvailable: true
  },
  {
    id: 'dr_water_small',
    name: 'زجاجة مياه معدنية صغيرة',
    category: 'drinks_desserts',
    price: 15,
    description: 'زجاجة مياه معدنية طبيعية باردة',
    isAvailable: true
  },
  {
    id: 'dr_juice_fresh',
    name: 'كوب عصير فريش طازج',
    category: 'drinks_desserts',
    price: 60,
    description: 'عصير فواكه طازج ومنعش حسب الموسم (مانجو / فراولة / برتقال / ليمون نعناع)',
    isAvailable: true
  }
];
