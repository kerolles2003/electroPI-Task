import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const CATEGORIES = [
  { slug: 'burgers', nameEn: 'Burgers', nameAr: 'برغر', sortOrder: 1 },
  { slug: 'pizza', nameEn: 'Pizza', nameAr: 'بيتزا', sortOrder: 2 },
  { slug: 'chicken', nameEn: 'Chicken', nameAr: 'دجاج', sortOrder: 3 },
  { slug: 'pasta', nameEn: 'Pasta', nameAr: 'مكرونة', sortOrder: 4 },
  { slug: 'drinks', nameEn: 'Drinks', nameAr: 'مشروبات', sortOrder: 5 },
  { slug: 'salads', nameEn: 'Salads', nameAr: 'سلطات', sortOrder: 6 },
];

const PRODUCTS: {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  imageId: string;
  categorySlug: string;
}[] = [
  // BURGERS
  {
    slug: 'classic-beef-burger',
    nameEn: 'Classic Beef Burger',
    nameAr: 'برغر لحم كلاسيك',
    descriptionEn: 'Juicy 180g beef patty with fresh lettuce, tomato, onion, and our signature sauce in a brioche bun.',
    descriptionAr: 'باتي لحم بقري طازج 180 جرام مع خس وطماطم وبصل وصلصتنا المميزة في خبز بريوش.',
    price: 8.99,
    imageId: '1568901346375-23c9450c58cd',
    categorySlug: 'burgers',
  },
  {
    slug: 'double-smash-burger',
    nameEn: 'Double Smash Burger',
    nameAr: 'برغر سماش مزدوج',
    descriptionEn: 'Two smashed patties, American cheese, pickles, mustard, and caramelized onions.',
    descriptionAr: 'باتيتان مسطحتان مع جبن أمريكي ومخللات وخردل وبصل مكرمل.',
    price: 12.49,
    imageId: '1550547660-d9450f859349',
    categorySlug: 'burgers',
  },
  {
    slug: 'bbq-bacon-burger',
    nameEn: 'BBQ Bacon Burger',
    nameAr: 'برغر بيكون بي بي كيو',
    descriptionEn: 'Smoky BBQ sauce, crispy bacon strips, cheddar cheese, and onion rings on a toasted bun.',
    descriptionAr: 'صلصة بي بي كيو مدخنة مع شرائح بيكون مقرمشة وجبن شيدر وحلقات بصل.',
    price: 13.99,
    imageId: '1571091718767-18b5b1457add',
    categorySlug: 'burgers',
  },
  {
    slug: 'mushroom-swiss-burger',
    nameEn: 'Mushroom Swiss Burger',
    nameAr: 'برغر مشروم سويسري',
    descriptionEn: 'Sautéed mushrooms, Swiss cheese, garlic aioli, and fresh arugula on a sesame bun.',
    descriptionAr: 'مشروم مقلي مع جبن سويسري وأيولي ثوم وجرجير طازج على خبز بالسمسم.',
    price: 11.99,
    imageId: '1586190848861-99aa4a171e90',
    categorySlug: 'burgers',
  },
  {
    slug: 'spicy-jalapeño-burger',
    nameEn: 'Spicy Jalapeño Burger',
    nameAr: 'برغر هالبينيو حار',
    descriptionEn: 'Beef patty with sliced jalapeños, pepper jack cheese, chipotle mayo, and crispy onions.',
    descriptionAr: 'باتي لحم مع هالبينيو وجبن فلفل وتشيبوتلي مايو وبصل مقرمش.',
    price: 10.99,
    imageId: '1596956470007-2bf6095e7e16',
    categorySlug: 'burgers',
  },
  {
    slug: 'veggie-black-bean-burger',
    nameEn: 'Veggie Black Bean Burger',
    nameAr: 'برغر فاصولياء سوداء نباتي',
    descriptionEn: 'Hearty black bean patty, avocado, pico de gallo, and chipotle sauce on a whole-wheat bun.',
    descriptionAr: 'باتي فاصولياء سوداء مع أفوكادو وبيكو دي غالو وصلصة تشيبوتلي على خبز قمح.',
    price: 9.49,
    imageId: '1525059696034-4967a8e1dca2',
    categorySlug: 'burgers',
  },
  {
    slug: 'truffle-wagyu-burger',
    nameEn: 'Truffle Wagyu Burger',
    nameAr: 'برغر واغيو بالكمأ',
    descriptionEn: 'Premium wagyu patty with truffle aioli, brie cheese, caramelized onions, and mixed greens.',
    descriptionAr: 'باتي واغيو فاخر مع أيولي الكمأ وجبن بري وبصل مكرمل وخضروات مشكلة.',
    price: 18.99,
    imageId: '1609167830220-7164aa360951',
    categorySlug: 'burgers',
  },

  // PIZZA
  {
    slug: 'margherita-pizza',
    nameEn: 'Margherita Pizza',
    nameAr: 'بيتزا مارغريتا',
    descriptionEn: 'Classic Neapolitan pizza with San Marzano tomato sauce, fresh mozzarella, and basil leaves.',
    descriptionAr: 'بيتزا نابولية كلاسيكية بصلصة طماطم سان مارزانو وموزاريلا طازجة وأوراق ريحان.',
    price: 11.99,
    imageId: '1565299624946-b28f40a0ae38',
    categorySlug: 'pizza',
  },
  {
    slug: 'pepperoni-feast',
    nameEn: 'Pepperoni Feast',
    nameAr: 'بيتزا بيبيروني',
    descriptionEn: 'Loaded with premium pepperoni slices, mozzarella, and a rich tomato base.',
    descriptionAr: 'محملة بشرائح بيبيروني فاخرة وموزاريلا وصلصة طماطم غنية.',
    price: 13.99,
    imageId: '1534308983496-4fabb1a015ee',
    categorySlug: 'pizza',
  },
  {
    slug: 'bbq-chicken-pizza',
    nameEn: 'BBQ Chicken Pizza',
    nameAr: 'بيتزا دجاج بي بي كيو',
    descriptionEn: 'Grilled chicken, BBQ sauce, red onion, cilantro, and mozzarella on a thin crust.',
    descriptionAr: 'دجاج مشوي وصلصة بي بي كيو وبصل أحمر وكزبرة وموزاريلا على عجينة رفيعة.',
    price: 14.49,
    imageId: '1513104890138-7c749659a591',
    categorySlug: 'pizza',
  },
  {
    slug: 'four-cheese-pizza',
    nameEn: 'Four Cheese Pizza',
    nameAr: 'بيتزا أربعة أجبان',
    descriptionEn: 'Mozzarella, gorgonzola, parmesan, and ricotta on a white garlic cream base.',
    descriptionAr: 'موزاريلا وجورجونزولا وبارميزان وريكوتا على قاعدة كريمة ثوم بيضاء.',
    price: 15.99,
    imageId: '1571407970349-bc81e7e96d47',
    categorySlug: 'pizza',
  },
  {
    slug: 'veggie-supreme',
    nameEn: 'Veggie Supreme',
    nameAr: 'بيتزا خضروات سوبريم',
    descriptionEn: 'Bell peppers, mushrooms, black olives, red onion, and spinach on tomato sauce.',
    descriptionAr: 'فلفل رومي ومشروم وزيتون أسود وبصل أحمر وسبانخ على صلصة طماطم.',
    price: 12.99,
    imageId: '1574071318508-1cdbab80d002',
    categorySlug: 'pizza',
  },
  {
    slug: 'meat-lovers-pizza',
    nameEn: 'Meat Lovers Pizza',
    nameAr: 'بيتزا محبي اللحوم',
    descriptionEn: 'Pepperoni, beef, chicken, and crispy bacon with mozzarella on a rich tomato base.',
    descriptionAr: 'بيبيروني ولحم بقري ودجاج وبيكون مقرمش مع موزاريلا على صلصة طماطم.',
    price: 16.99,
    imageId: '1604382354936-07c5d9983bd3',
    categorySlug: 'pizza',
  },
  {
    slug: 'spicy-arrabbiata-pizza',
    nameEn: 'Spicy Arrabbiata Pizza',
    nameAr: 'بيتزا أرابياتا حارة',
    descriptionEn: 'Spicy arrabbiata sauce, salami, chilli flakes, capers, and fresh basil.',
    descriptionAr: 'صلصة أرابياتا حارة وسلامي ورقائق الفلفل الحار وكبر وريحان طازج.',
    price: 13.49,
    imageId: '1565299624946-b28f40a0ae38',
    categorySlug: 'pizza',
  },

  // CHICKEN
  {
    slug: 'crispy-fried-chicken',
    nameEn: 'Crispy Fried Chicken',
    nameAr: 'دجاج مقلي مقرمش',
    descriptionEn: 'Southern-style crispy fried chicken with a golden crust, served with dipping sauce.',
    descriptionAr: 'دجاج مقلي مقرمش بأسلوب الجنوب بقشرة ذهبية مع صلصة للتغميس.',
    price: 10.99,
    imageId: '1598103442097-8b74394b95c3',
    categorySlug: 'chicken',
  },
  {
    slug: 'buffalo-wings',
    nameEn: 'Buffalo Chicken Wings',
    nameAr: 'أجنحة دجاج بافالو',
    descriptionEn: 'Crispy wings tossed in tangy buffalo sauce, served with blue cheese dip and celery.',
    descriptionAr: 'أجنحة مقرمشة مع صلصة بافالو لاذعة وجبن أزرق وكرفس.',
    price: 12.99,
    imageId: '1527477396000-e27163b481c2',
    categorySlug: 'chicken',
  },
  {
    slug: 'chicken-nuggets-combo',
    nameEn: 'Chicken Nuggets Combo',
    nameAr: 'كومبو ناغيتس دجاج',
    descriptionEn: 'Twelve golden nuggets made from 100% chicken breast, with your choice of sauce.',
    descriptionAr: 'اثنا عشر ناغت ذهبي من صدر دجاج 100% مع صلصة من اختيارك.',
    price: 9.49,
    imageId: '1562802378-063ec186a863',
    categorySlug: 'chicken',
  },
  {
    slug: 'grilled-chicken-breast',
    nameEn: 'Grilled Chicken Breast',
    nameAr: 'صدر دجاج مشوي',
    descriptionEn: 'Herb-marinated grilled chicken breast served with roasted vegetables and lemon sauce.',
    descriptionAr: 'صدر دجاج مشوي متبل بالأعشاب مع خضروات مشوية وصلصة الليمون.',
    price: 13.99,
    imageId: '1532550907401-a500c9a57435',
    categorySlug: 'chicken',
  },
  {
    slug: 'chicken-shawarma-plate',
    nameEn: 'Chicken Shawarma Plate',
    nameAr: 'طبق شاورما دجاج',
    descriptionEn: 'Thinly sliced spiced chicken shawarma with garlic sauce, pickles, and fresh veggies.',
    descriptionAr: 'شاورما دجاج متبل بشرائح رفيعة مع صلصة ثوم ومخللات وخضروات طازجة.',
    price: 11.49,
    imageId: '1633945274405-b6c8069047b0',
    categorySlug: 'chicken',
  },
  {
    slug: 'honey-garlic-chicken-tenders',
    nameEn: 'Honey Garlic Tenders',
    nameAr: 'قطع دجاج بالعسل والثوم',
    descriptionEn: 'Tender chicken strips glazed with honey garlic sauce, served with coleslaw.',
    descriptionAr: 'شرائح دجاج طرية مطلية بصلصة العسل والثوم مع سلطة الكول سلو.',
    price: 11.99,
    imageId: '1626645738196-c2a7c87a8f58',
    categorySlug: 'chicken',
  },
  {
    slug: 'rotisserie-chicken',
    nameEn: 'Rotisserie Chicken',
    nameAr: 'دجاج روتيسري',
    descriptionEn: 'Slow-roasted whole chicken with aromatic herbs and spices, crispy on the outside.',
    descriptionAr: 'دجاج كامل مشوي ببطء مع الأعشاب والتوابل العطرية، مقرمش من الخارج.',
    price: 16.99,
    imageId: '1587848596161-a523c35f5a30',
    categorySlug: 'chicken',
  },

  // PASTA
  {
    slug: 'spaghetti-bolognese',
    nameEn: 'Spaghetti Bolognese',
    nameAr: 'سباغيتي بولونيز',
    descriptionEn: 'Classic spaghetti with slow-cooked meat sauce, fresh parmesan, and basil.',
    descriptionAr: 'سباغيتي كلاسيك مع صلصة لحم مطبوخة ببطء وبارميزان طازج وريحان.',
    price: 12.99,
    imageId: '1565958011703-44f9829ba187',
    categorySlug: 'pasta',
  },
  {
    slug: 'fettuccine-alfredo',
    nameEn: 'Fettuccine Alfredo',
    nameAr: 'فيتوتشيني ألفريدو',
    descriptionEn: 'Silky fettuccine pasta in a rich parmesan cream sauce with black pepper.',
    descriptionAr: 'معكرونة فيتوتشيني حريرية في صلصة كريمة بارميزان غنية مع فلفل أسود.',
    price: 13.49,
    imageId: '1621996346565-e3dbc646d9a9',
    categorySlug: 'pasta',
  },
  {
    slug: 'penne-arrabbiata',
    nameEn: 'Penne Arrabbiata',
    nameAr: 'بيني أرابياتا',
    descriptionEn: 'Penne pasta in a fiery tomato sauce with garlic, chilli, and fresh parsley.',
    descriptionAr: 'معكرونة بيني في صلصة طماطم حارة مع ثوم وفلفل حار وبقدونس طازج.',
    price: 11.99,
    imageId: '1567620832903-9fc6debc209f',
    categorySlug: 'pasta',
  },
  {
    slug: 'classic-lasagna',
    nameEn: 'Classic Lasagna',
    nameAr: 'لازانيا كلاسيكية',
    descriptionEn: 'Layered lasagna with beef ragù, béchamel sauce, and three-cheese blend.',
    descriptionAr: 'لازانيا طبقات مع راغو لحم وصلصة بيشاميل وخليط ثلاثة أجبان.',
    price: 14.99,
    imageId: '1574484284002-952d92456975',
    categorySlug: 'pasta',
  },
  {
    slug: 'carbonara',
    nameEn: 'Spaghetti Carbonara',
    nameAr: 'سباغيتي كاربونارا',
    descriptionEn: 'Roman classic with pancetta, egg yolk sauce, pecorino cheese, and black pepper.',
    descriptionAr: 'كلاسيكي روماني مع بانشيتا وصلصة صفار البيض وجبن بيكورينو وفلفل أسود.',
    price: 13.99,
    imageId: '1612874742237-6526221588e3',
    categorySlug: 'pasta',
  },
  {
    slug: 'seafood-linguine',
    nameEn: 'Seafood Linguine',
    nameAr: 'لينغويني بالمأكولات البحرية',
    descriptionEn: 'Linguine with shrimp, mussels, and squid in a light white wine and garlic sauce.',
    descriptionAr: 'لينغويني مع روبيان وبلح البحر وحبار في صلصة خفيفة من النبيذ الأبيض والثوم.',
    price: 16.49,
    imageId: '1551183053-bf91798d832f',
    categorySlug: 'pasta',
  },
  {
    slug: 'pesto-farfalle',
    nameEn: 'Pesto Farfalle',
    nameAr: 'فارفالي بالبيستو',
    descriptionEn: 'Bow-tie pasta tossed in fresh basil pesto, sun-dried tomatoes, and pine nuts.',
    descriptionAr: 'معكرونة ربطة العنق مع بيستو الريحان الطازج وطماطم مجففة وصنوبر.',
    price: 12.49,
    imageId: '1632778594688-74d9c53a8d1a',
    categorySlug: 'pasta',
  },

  // DRINKS
  {
    slug: 'classic-lemonade',
    nameEn: 'Classic Lemonade',
    nameAr: 'ليمونادة كلاسيكية',
    descriptionEn: 'Freshly squeezed lemon juice with sugar syrup and mint over crushed ice.',
    descriptionAr: 'عصير ليمون طازج مع شراب سكر ونعناع على ثلج مجروش.',
    price: 3.99,
    imageId: '1621506289937-a8e4df240d0b',
    categorySlug: 'drinks',
  },
  {
    slug: 'mango-smoothie',
    nameEn: 'Mango Smoothie',
    nameAr: 'سموذي المانغو',
    descriptionEn: 'Thick and creamy mango smoothie made with fresh mango, yogurt, and honey.',
    descriptionAr: 'سموذي مانغو كثيف وكريمي من مانغو طازج وزبادي وعسل.',
    price: 5.49,
    imageId: '1553530666-ba11a7da3888',
    categorySlug: 'drinks',
  },
  {
    slug: 'chocolate-milkshake',
    nameEn: 'Chocolate Milkshake',
    nameAr: 'ميلك شيك شوكولاتة',
    descriptionEn: 'Rich chocolate milkshake blended with premium ice cream, topped with whipped cream.',
    descriptionAr: 'ميلك شيك شوكولاتة غني ممزوج بآيس كريم فاخر مع كريمة مخفوقة.',
    price: 5.99,
    imageId: '1572490122747-3f4940ce6f9b',
    categorySlug: 'drinks',
  },
  {
    slug: 'fresh-orange-juice',
    nameEn: 'Fresh Orange Juice',
    nameAr: 'عصير برتقال طازج',
    descriptionEn: 'Cold-pressed freshly squeezed orange juice, 100% natural with no added sugar.',
    descriptionAr: 'عصير برتقال طازج بالضغط البارد، طبيعي 100% بدون سكر مضاف.',
    price: 4.49,
    imageId: '1603833665858-e61d17a86224',
    categorySlug: 'drinks',
  },
  {
    slug: 'iced-green-tea',
    nameEn: 'Iced Green Tea',
    nameAr: 'شاي أخضر بارد',
    descriptionEn: 'Chilled green tea with lemon, honey, and fresh mint leaves.',
    descriptionAr: 'شاي أخضر مبرد مع ليمون وعسل وأوراق نعناع طازجة.',
    price: 3.49,
    imageId: '1556679343-c7306c1976bc',
    categorySlug: 'drinks',
  },
  {
    slug: 'strawberry-lemonade',
    nameEn: 'Strawberry Lemonade',
    nameAr: 'ليمونادة الفراولة',
    descriptionEn: 'Blended fresh strawberries with homemade lemonade, served chilled.',
    descriptionAr: 'فراولة طازجة ممزوجة مع ليمونادة منزلية الصنع، تقدم مبردة.',
    price: 4.99,
    imageId: '1544145945-f90425340c7e',
    categorySlug: 'drinks',
  },
  {
    slug: 'cola-zero',
    nameEn: 'Cola Zero',
    nameAr: 'كولا زيرو',
    descriptionEn: 'Ice cold cola zero served over ice in a tall glass.',
    descriptionAr: 'كولا زيرو مثلجة تقدم على الثلج في كوب طويل.',
    price: 2.49,
    imageId: '1554456854-55a089fd4cb2',
    categorySlug: 'drinks',
  },

  // SALADS
  {
    slug: 'caesar-salad',
    nameEn: 'Caesar Salad',
    nameAr: 'سلطة قيصر',
    descriptionEn: 'Crisp romaine lettuce, parmesan shavings, croutons, and Caesar dressing.',
    descriptionAr: 'خس روميني هش مع رقائق بارميزان وكروتون وصلصة قيصر.',
    price: 9.99,
    imageId: '1512621776951-a57141f2eefd',
    categorySlug: 'salads',
  },
  {
    slug: 'greek-salad',
    nameEn: 'Greek Salad',
    nameAr: 'سلطة يونانية',
    descriptionEn: 'Tomatoes, cucumbers, olives, red onion, and feta cheese with oregano and olive oil.',
    descriptionAr: 'طماطم وخيار وزيتون وبصل أحمر وجبن فيتا مع أوريغانو وزيت زيتون.',
    price: 8.99,
    imageId: '1540189549336-e6e99c3679fe',
    categorySlug: 'salads',
  },
  {
    slug: 'grilled-chicken-salad',
    nameEn: 'Grilled Chicken Salad',
    nameAr: 'سلطة دجاج مشوي',
    descriptionEn: 'Sliced grilled chicken, mixed greens, avocado, cherry tomatoes, and lemon vinaigrette.',
    descriptionAr: 'شرائح دجاج مشوي مع خضار مشكل وأفوكادو وطماطم كرزية وصلصة ليمون.',
    price: 12.49,
    imageId: '1607532941433-304659e8198a',
    categorySlug: 'salads',
  },
  {
    slug: 'garden-fresh-salad',
    nameEn: 'Garden Fresh Salad',
    nameAr: 'سلطة الحديقة الطازجة',
    descriptionEn: 'Seasonal garden vegetables, mixed greens, seeds, and a light herb dressing.',
    descriptionAr: 'خضروات الحديقة الموسمية مع خضار مشكل وبذور وتتبيلة أعشاب خفيفة.',
    price: 7.99,
    imageId: '1546793665-c74683f339c1',
    categorySlug: 'salads',
  },
  {
    slug: 'tuna-nicoise-salad',
    nameEn: 'Tuna Niçoise Salad',
    nameAr: 'سلطة تونة نيسواز',
    descriptionEn: 'Seared tuna, green beans, hard-boiled eggs, olives, and potatoes with Dijon dressing.',
    descriptionAr: 'تونة مشوية وفاصولياء خضراء وبيض مسلوق وزيتون وبطاطا مع صلصة ديجون.',
    price: 13.99,
    imageId: '1505253716362-afaea1d3d1af',
    categorySlug: 'salads',
  },
  {
    slug: 'quinoa-power-bowl',
    nameEn: 'Quinoa Power Bowl',
    nameAr: 'طبق كينوا الصحي',
    descriptionEn: 'Tri-color quinoa, roasted chickpeas, cucumber, pomegranate, and tahini dressing.',
    descriptionAr: 'كينوا ثلاثية الألوان مع حمص مشوي وخيار ورمان وصلصة طحينة.',
    price: 11.99,
    imageId: '1525351484163-7529414344d8',
    categorySlug: 'salads',
  },
];

async function main(): Promise<void> {
  console.log('[seed] Starting data seed...');

  // Admin user
  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@electro-pi.com' },
    update: {},
    create: {
      email: 'admin@electro-pi.com',
      fullName: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      preferredLocale: 'EN',
      emailVerified: true,
    },
  });
  console.log('[seed] Admin user ready.');

  // Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameEn: cat.nameEn, nameAr: cat.nameAr, sortOrder: cat.sortOrder },
      create: {
        slug: cat.slug,
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap[cat.slug] = result.id;
    console.log(`[seed] Category: ${cat.nameEn}`);
  }

  // Products
  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        descriptionEn: p.descriptionEn,
        descriptionAr: p.descriptionAr,
        price: p.price,
        imageUrl: IMG(p.imageId),
        isAvailable: true,
        categoryId,
      },
      create: {
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        descriptionEn: p.descriptionEn,
        descriptionAr: p.descriptionAr,
        price: p.price,
        imageUrl: IMG(p.imageId),
        isAvailable: true,
        categoryId,
      },
    });
    console.log(`[seed] Product: ${p.nameEn}`);
  }

  console.log(`[seed] Done. ${PRODUCTS.length} products seeded.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
