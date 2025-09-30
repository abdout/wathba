import PublicLayoutWithTranslations from "@/components/PublicLayoutWithTranslations";
import { getDictionary } from "@/components/internationalization/dictionaries";
import OptimizedImage from "@/components/OptimizedImage";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import Link from "next/link";

// Prevent pre-rendering on server due to Redux in layout
export const dynamic = 'force-dynamic';

// Blog data
const blogPosts = {
  1: {
    image: "https://ik.imagekit.io/osmanabdout/assets/oranges.jpg",
    title: {
      en: "Fresh Orange Season: Health Benefits and Seasonal Recipes",
      ar: "موسم البرتقال الطازج: الفوائد الصحية والوصفات الموسمية"
    },
    description: {
      en: "Discover the amazing health benefits of fresh oranges and creative ways to incorporate them into your daily diet",
      ar: "اكتشف الفوائد الصحية المذهلة للبرتقال الطازج والطرق الإبداعية لدمجها في نظامك الغذائي اليومي"
    },
    content: {
      en: `
        <h2>The Power of Fresh Oranges</h2>
        <p>Oranges are not just delicious; they're packed with nutrients that can transform your health. As we enter the peak orange season, it's the perfect time to explore the incredible benefits of this citrus powerhouse.</p>

        <h3>Nutritional Benefits</h3>
        <p>A single medium orange contains over 100% of your daily vitamin C needs, supporting immune function and skin health. Beyond vitamin C, oranges provide:</p>
        <ul>
          <li>Fiber for digestive health</li>
          <li>Folate for cell division and DNA synthesis</li>
          <li>Potassium for heart health</li>
          <li>Antioxidants that fight inflammation</li>
        </ul>

        <h3>Seasonal Recipes to Try</h3>
        <p>Make the most of orange season with these creative recipes:</p>

        <h4>1. Morning Orange Smoothie Bowl</h4>
        <p>Blend fresh oranges with banana and Greek yogurt, then top with granola, nuts, and orange segments for a nutritious breakfast that will energize your day.</p>

        <h4>2. Orange-Glazed Chicken</h4>
        <p>Create a tangy glaze using fresh orange juice, honey, and herbs for a dinner that's both healthy and delicious.</p>

        <h4>3. Citrus Winter Salad</h4>
        <p>Combine orange segments with mixed greens, pomegranate seeds, and walnuts for a refreshing salad that's perfect for the season.</p>

        <h3>Storage Tips</h3>
        <p>Keep your oranges fresh longer by storing them in the refrigerator's crisper drawer. At room temperature, they'll last about a week, but refrigerated oranges can stay fresh for up to three weeks.</p>
      `,
      ar: `
        <h2>قوة البرتقال الطازج</h2>
        <p>البرتقال ليس لذيذًا فحسب؛ بل مليء بالعناصر الغذائية التي يمكن أن تحسن صحتك. مع دخولنا ذروة موسم البرتقال، إنه الوقت المثالي لاستكشاف الفوائد المذهلة لهذه الفاكهة الحمضية القوية.</p>

        <h3>الفوائد الغذائية</h3>
        <p>تحتوي برتقالة واحدة متوسطة الحجم على أكثر من 100% من احتياجاتك اليومية من فيتامين C، مما يدعم وظائف المناعة وصحة البشرة. بالإضافة إلى فيتامين C، يوفر البرتقال:</p>
        <ul>
          <li>الألياف لصحة الجهاز الهضمي</li>
          <li>حمض الفوليك لانقسام الخلايا وتخليق الحمض النووي</li>
          <li>البوتاسيوم لصحة القلب</li>
          <li>مضادات الأكسدة التي تحارب الالتهاب</li>
        </ul>

        <h3>وصفات موسمية للتجربة</h3>
        <p>استفد من موسم البرتقال مع هذه الوصفات الإبداعية:</p>

        <h4>1. وعاء عصير البرتقال الصباحي</h4>
        <p>امزج البرتقال الطازج مع الموز والزبادي اليوناني، ثم أضف الجرانولا والمكسرات وشرائح البرتقال لوجبة إفطار مغذية تنشط يومك.</p>

        <h4>2. دجاج بصلصة البرتقال</h4>
        <p>اصنع صلصة لذيذة باستخدام عصير البرتقال الطازج والعسل والأعشاب لعشاء صحي ولذيذ.</p>

        <h4>3. سلطة الحمضيات الشتوية</h4>
        <p>امزج شرائح البرتقال مع الخضار المشكلة وبذور الرمان والجوز للحصول على سلطة منعشة مثالية للموسم.</p>

        <h3>نصائح التخزين</h3>
        <p>احتفظ بالبرتقال طازجًا لفترة أطول بتخزينه في درج الخضار بالثلاجة. في درجة حرارة الغرفة، سيستمر لمدة أسبوع تقريبًا، لكن البرتقال المبرد يمكن أن يبقى طازجًا لمدة تصل إلى ثلاثة أسابيع.</p>
      `
    },
    category: { en: "Food", ar: "طعام" },
    date: { day: "18", month: { en: "NOV", ar: "نوفمبر" } }
  },
  2: {
    image: "https://ik.imagekit.io/osmanabdout/assets/olive-oil.jpg",
    title: {
      en: "Premium Olive Oil: Your Guide to Quality and Health",
      ar: "زيت الزيتون الممتاز: دليلك للجودة والصحة"
    },
    description: {
      en: "Learn how to choose the best olive oil and understand its numerous health benefits for your family",
      ar: "تعلم كيفية اختيار أفضل زيت زيتون وفهم فوائده الصحية العديدة لعائلتك"
    },
    content: {
      en: `
        <h2>The Golden Elixir: Understanding Olive Oil</h2>
        <p>Olive oil has been cherished for thousands of years, not just for its flavor but for its remarkable health properties. Let's explore how to choose quality olive oil and maximize its benefits.</p>

        <h3>Choosing Quality Olive Oil</h3>
        <p>Not all olive oils are created equal. Here's what to look for:</p>
        <ul>
          <li><strong>Extra Virgin:</strong> The highest quality, cold-pressed without chemicals</li>
          <li><strong>Dark Bottles:</strong> Protects oil from light damage</li>
          <li><strong>Harvest Date:</strong> Fresher is better - look for recent dates</li>
          <li><strong>Origin:</strong> Single-origin oils often have better quality control</li>
        </ul>

        <h3>Health Benefits</h3>
        <p>Extra virgin olive oil is a cornerstone of the Mediterranean diet, associated with numerous health benefits:</p>
        <ul>
          <li>Heart health: Reduces bad cholesterol and blood pressure</li>
          <li>Anti-inflammatory properties: Contains compounds that fight inflammation</li>
          <li>Brain health: May reduce risk of cognitive decline</li>
          <li>Antioxidants: Protects cells from damage</li>
        </ul>

        <h3>Cooking with Olive Oil</h3>
        <p>Contrary to popular belief, extra virgin olive oil is excellent for cooking:</p>

        <h4>Best Uses:</h4>
        <ul>
          <li>Salad dressings and marinades</li>
          <li>Sautéing vegetables at medium heat</li>
          <li>Drizzling over finished dishes</li>
          <li>Baking as a butter substitute</li>
        </ul>

        <h3>Storage Tips</h3>
        <p>Preserve your olive oil's quality by storing it in a cool, dark place away from heat and light. Use within 18-24 months of harvest date for best quality.</p>
      `,
      ar: `
        <h2>الإكسير الذهبي: فهم زيت الزيتون</h2>
        <p>لقد تم تقدير زيت الزيتون لآلاف السنين، ليس فقط لنكهته ولكن لخصائصه الصحية الرائعة. دعنا نستكشف كيفية اختيار زيت الزيتون عالي الجودة والاستفادة القصوى من فوائده.</p>

        <h3>اختيار زيت الزيتون عالي الجودة</h3>
        <p>ليست كل زيوت الزيتون متساوية. إليك ما يجب البحث عنه:</p>
        <ul>
          <li><strong>البكر الممتاز:</strong> أعلى جودة، معصور على البارد بدون كيماويات</li>
          <li><strong>الزجاجات الداكنة:</strong> تحمي الزيت من أضرار الضوء</li>
          <li><strong>تاريخ الحصاد:</strong> الأحدث أفضل - ابحث عن التواريخ الحديثة</li>
          <li><strong>المنشأ:</strong> الزيوت أحادية المنشأ غالباً ما تتمتع بمراقبة جودة أفضل</li>
        </ul>

        <h3>الفوائد الصحية</h3>
        <p>زيت الزيتون البكر الممتاز هو حجر الزاوية في النظام الغذائي للبحر الأبيض المتوسط، المرتبط بفوائد صحية عديدة:</p>
        <ul>
          <li>صحة القلب: يقلل من الكوليسترول الضار وضغط الدم</li>
          <li>خصائص مضادة للالتهابات: يحتوي على مركبات تحارب الالتهاب</li>
          <li>صحة الدماغ: قد يقلل من خطر التدهور المعرفي</li>
          <li>مضادات الأكسدة: تحمي الخلايا من التلف</li>
        </ul>

        <h3>الطبخ بزيت الزيتون</h3>
        <p>على عكس الاعتقاد الشائع، زيت الزيتون البكر الممتاز ممتاز للطبخ:</p>

        <h4>أفضل الاستخدامات:</h4>
        <ul>
          <li>تتبيلات السلطة والنقع</li>
          <li>قلي الخضروات على حرارة متوسطة</li>
          <li>الرش على الأطباق المنتهية</li>
          <li>الخبز كبديل للزبدة</li>
        </ul>

        <h3>نصائح التخزين</h3>
        <p>احفظ جودة زيت الزيتون بتخزينه في مكان بارد ومظلم بعيداً عن الحرارة والضوء. استخدمه خلال 18-24 شهراً من تاريخ الحصاد للحصول على أفضل جودة.</p>
      `
    },
    category: { en: "Food", ar: "طعام" },
    date: { day: "29", month: { en: "JAN", ar: "يناير" } }
  },
  3: {
    image: "https://ik.imagekit.io/osmanabdout/assets/washing-machine.jpg",
    title: {
      en: "Smart Washing Machines: Save Water and Energy",
      ar: "الغسالات الذكية: وفر الماء والطاقة"
    },
    description: {
      en: "Explore the latest washing machine technologies that help you save on utility bills while protecting the environment",
      ar: "استكشف أحدث تقنيات الغسالات التي تساعدك على توفير فواتير الخدمات مع حماية البيئة"
    },
    content: {
      en: `
        <h2>The Evolution of Washing Technology</h2>
        <p>Modern washing machines have come a long way from their predecessors. Today's smart models offer unprecedented efficiency, convenience, and environmental benefits.</p>

        <h3>Key Features to Look For</h3>
        <p>When choosing a smart washing machine, consider these energy-saving features:</p>
        <ul>
          <li><strong>Auto-dosing:</strong> Automatically dispenses the right amount of detergent</li>
          <li><strong>Load sensing:</strong> Adjusts water levels based on load size</li>
          <li><strong>Eco modes:</strong> Optimized cycles for energy efficiency</li>
          <li><strong>Smart connectivity:</strong> Control and monitor via smartphone</li>
          <li><strong>Steam cleaning:</strong> Reduces wrinkles and sanitizes without hot water</li>
        </ul>

        <h3>Environmental Impact</h3>
        <p>Smart washing machines can significantly reduce your environmental footprint:</p>
        <ul>
          <li>Up to 50% less water consumption compared to older models</li>
          <li>Energy Star certified models use 25% less energy</li>
          <li>Reduced detergent usage means less chemical runoff</li>
          <li>Longer garment life due to gentler wash cycles</li>
        </ul>

        <h3>Money-Saving Tips</h3>
        <p>Maximize your savings with these smart washing practices:</p>

        <h4>1. Wash with Cold Water</h4>
        <p>90% of energy used goes to heating water. Cold washing saves energy and preserves fabric colors.</p>

        <h4>2. Full Loads Only</h4>
        <p>Wait until you have a full load to maximize efficiency per wash.</p>

        <h4>3. Use High Spin Speeds</h4>
        <p>Higher spin speeds extract more water, reducing drying time and energy.</p>

        <h4>4. Regular Maintenance</h4>
        <p>Clean filters monthly and run maintenance cycles to keep your machine efficient.</p>

        <h3>Smart Features Worth Having</h3>
        <ul>
          <li>Delay start: Run during off-peak electricity hours</li>
          <li>App notifications: Know when your laundry is done</li>
          <li>Custom programs: Save your favorite settings</li>
          <li>Diagnostic features: Troubleshoot issues remotely</li>
        </ul>
      `,
      ar: `
        <h2>تطور تكنولوجيا الغسيل</h2>
        <p>لقد قطعت الغسالات الحديثة شوطًا طويلاً من أسلافها. توفر الموديلات الذكية اليوم كفاءة وراحة وفوائد بيئية غير مسبوقة.</p>

        <h3>الميزات الرئيسية التي يجب البحث عنها</h3>
        <p>عند اختيار غسالة ذكية، ضع في اعتبارك ميزات توفير الطاقة هذه:</p>
        <ul>
          <li><strong>الجرعات التلقائية:</strong> توزع تلقائيًا الكمية المناسبة من المنظف</li>
          <li><strong>استشعار الحمولة:</strong> تضبط مستويات المياه بناءً على حجم الحمولة</li>
          <li><strong>الأوضاع الاقتصادية:</strong> دورات محسنة لكفاءة الطاقة</li>
          <li><strong>الاتصال الذكي:</strong> التحكم والمراقبة عبر الهاتف الذكي</li>
          <li><strong>التنظيف بالبخار:</strong> يقلل التجاعيد ويعقم بدون ماء ساخن</li>
        </ul>

        <h3>التأثير البيئي</h3>
        <p>يمكن للغسالات الذكية أن تقلل بشكل كبير من بصمتك البيئية:</p>
        <ul>
          <li>انخفاض استهلاك المياه بنسبة تصل إلى 50% مقارنة بالموديلات القديمة</li>
          <li>تستخدم الموديلات المعتمدة من Energy Star طاقة أقل بنسبة 25%</li>
          <li>انخفاض استخدام المنظفات يعني تقليل الجريان الكيميائي</li>
          <li>عمر أطول للملابس بسبب دورات الغسيل الألطف</li>
        </ul>

        <h3>نصائح لتوفير المال</h3>
        <p>زد من مدخراتك مع ممارسات الغسيل الذكية هذه:</p>

        <h4>1. الغسيل بالماء البارد</h4>
        <p>90% من الطاقة المستخدمة تذهب لتسخين المياه. الغسيل البارد يوفر الطاقة ويحافظ على ألوان الأقمشة.</p>

        <h4>2. الأحمال الكاملة فقط</h4>
        <p>انتظر حتى يكون لديك حمولة كاملة لتحقيق أقصى قدر من الكفاءة لكل غسلة.</p>

        <h4>3. استخدم سرعات دوران عالية</h4>
        <p>سرعات الدوران الأعلى تستخرج المزيد من الماء، مما يقلل من وقت التجفيف والطاقة.</p>

        <h4>4. الصيانة المنتظمة</h4>
        <p>نظف المرشحات شهريًا وقم بتشغيل دورات الصيانة للحفاظ على كفاءة جهازك.</p>

        <h3>الميزات الذكية التي تستحق الاقتناء</h3>
        <ul>
          <li>البدء المتأخر: التشغيل خلال ساعات انخفاض الكهرباء</li>
          <li>إشعارات التطبيق: اعرف متى ينتهي غسيلك</li>
          <li>البرامج المخصصة: احفظ إعداداتك المفضلة</li>
          <li>ميزات التشخيص: استكشاف المشاكل وحلها عن بُعد</li>
        </ul>
      `
    },
    category: { en: "Appliances", ar: "أجهزة منزلية" },
    date: { day: "21", month: { en: "FEB", ar: "فبراير" } }
  }
};

export default async function BlogDetailPage({ params }) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const isRTL = lang === 'ar';

  const post = blogPosts[id];

  if (!post) {
    return (
      <PublicLayoutWithTranslations dict={dict} lang={lang}>
        <div className="min-h-screen px-8">
          <div className="max-w-4xl mx-auto py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Blog post not found</h1>
            <Link href={`/${lang}`} className="text-green-600 hover:text-green-700">
              Return to Home
            </Link>
          </div>
        </div>
      </PublicLayoutWithTranslations>
    );
  }

  return (
    <PublicLayoutWithTranslations dict={dict} lang={lang}>
      <div className="min-h-screen px-4 sm:px-8">
        <div className="max-w-4xl mx-auto py-16">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/${lang}`}
              className={`inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {dict?.general?.back || 'Back'}
            </Link>

            <h1 className={`text-3xl sm:text-4xl font-bold text-gray-800 mb-4 ${isRTL ? 'text-right font-rubik' : 'text-left font-outfit'}`}>
              {post.title[lang]}
            </h1>

            <p className={`text-lg text-gray-600 mb-6 ${isRTL ? 'text-right font-rubik' : 'text-left font-outfit'}`}>
              {post.description[lang]}
            </p>

            <div className={`flex items-center gap-4 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-4 h-4" />
                <span>{post.date.day} {post.date.month[lang]}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Tag className="w-4 h-4" />
                <span>{post.category[lang]}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-lg overflow-hidden">
            <OptimizedImage
              src={post.image}
              alt={post.title[lang]}
              width={800}
              height={500}
              className="w-full h-auto object-cover"
              transformation={[
                { width: 800, height: 500, quality: 90 }
              ]}
            />
          </div>

          {/* Content */}
          <div
            className={`prose prose-lg max-w-none ${isRTL ? 'prose-rtl text-right' : ''}`}
            dangerouslySetInnerHTML={{ __html: post.content[lang] }}
            style={{
              fontFamily: isRTL ? 'Rubik, sans-serif' : 'Outfit, sans-serif'
            }}
          />

          {/* Share Section */}
          <div className={`border-t border-gray-200 mt-12 pt-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-rubik' : 'font-outfit'}`}>
              {dict?.blog?.share || 'Share this article'}
            </h3>
            {/* You can add social sharing buttons here */}
          </div>
        </div>
      </div>
    </PublicLayoutWithTranslations>
  );
}