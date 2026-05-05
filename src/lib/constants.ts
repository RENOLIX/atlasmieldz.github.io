import honeyLiquid from "@/assets/honey-liquid.png";
import hiveProducts from "@/assets/hive-products.png";
import ctaHoneycomb from "@/assets/golden-honey-dripping-from-honeycomb.jpg";
import arabicHoneyShowcase from "@/assets/arabic-honey-showcase.png";
import atlasLogo from "@/assets/atlas-logo.webp";
import type { ProductRecord } from "@/types";

export const SITE = {
  name: "ATLAS MIEL DZ",
  domain: "https://renolix.github.io/atlasmieldz.github.io",
  phone: "+213 561 45 82 86",
  email: "contact@atlas-miel.com",
  city: "الجزائر العاصمة",
};

export const ASSETS = {
  heroVideo: `${import.meta.env.BASE_URL}videos/atlas-hero.mp4`,
  introVideo: `${import.meta.env.BASE_URL}videos/atlas-intro.mp4`,
  logo: atlasLogo,
  honeyLiquid,
  hiveProducts,
  ctaHoneycomb,
  arabicHoneyShowcase,
};

export const DEFAULT_PRODUCTS: ProductRecord[] = [
  {
    id: "miel-montagne",
    name: "عسل الجبال",
    description:
      "عسل طبيعي أصيل بطابع جبلي غني، يتميز بنكهة عميقة وقوام متوازن ومذاق فاخر مناسب للاستهلاك اليومي والضيافة.",
    images: [
      "https://images.unsplash.com/photo-1545246909-b4e087f05214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    stock: 24,
    featured: true,
    active: true,
    weightOptions: [
      { label: "500غ", price: 1800, comparePrice: 2100 },
      { label: "1كغ", price: 3400, comparePrice: 3900 },
    ],
  },
  {
    id: "miel-sidr",
    name: "عسل السدر",
    description:
      "من أشهر أنواع العسل الفاخر، يتميز بطعمه القوي وقيمته العالية، مختار بعناية لعشاق الجودة والنكهة الأصيلة.",
    images: [
      "https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1545246909-b4e087f05214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1761416351532-ede97c29fab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    stock: 18,
    featured: true,
    active: true,
    weightOptions: [
      { label: "500غ", price: 2500, comparePrice: 2900 },
      { label: "1كغ", price: 4700, comparePrice: 5400 },
    ],
  },
  {
    id: "miel-fleurs",
    name: "عسل الأزهار",
    description:
      "عسل زهري خفيف ولذيذ، مناسب لكل أفراد العائلة، يجمع بين الحلاوة الطبيعية والرائحة الهادئة.",
    images: [
      "https://images.unsplash.com/photo-1740506569102-1bb75e5e1afe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    stock: 31,
    featured: true,
    active: true,
    weightOptions: [
      { label: "500غ", price: 1400, comparePrice: 1700 },
      { label: "1كغ", price: 2600, comparePrice: 3100 },
    ],
  },
  {
    id: "miel-romarin",
    name: "عسل إكليل الجبل",
    description:
      "عسل عطري بنفحات عشبية ناعمة، مثالي للشاي والاستخدام اليومي، مع جودة منتقاة بعناية.",
    images: [
      "https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1545246909-b4e087f05214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1740506569102-1bb75e5e1afe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    stock: 16,
    featured: false,
    active: true,
    weightOptions: [
      { label: "500غ", price: 2200, comparePrice: 2500 },
      { label: "1كغ", price: 4200, comparePrice: 4800 },
    ],
  },
  {
    id: "miel-thym",
    name: "عسل الزعتر",
    description:
      "عسل قوي ومميز بنكهة متوسطية مركزة، لمحبي العسل العطري ذي الشخصية القوية.",
    images: [
      "https://images.unsplash.com/photo-1761416351532-ede97c29fab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1773957949154-a7d1ef35ae76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      "https://images.unsplash.com/photo-1573697610008-4c72b4e9508f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    stock: 12,
    featured: false,
    active: true,
    weightOptions: [
      { label: "500غ", price: 2800, comparePrice: 3200 },
      { label: "1كغ", price: 5200, comparePrice: 5900 },
    ],
  },
];

export const HONEY_PILLARS = [
  {
    title: "النقاء",
    text: "عسل طبيعي خالص، خالٍ من الإضافات والمواد الحافظة، محافظ على طبيعته كما منحته لنا الطبيعة.",
  },
  {
    title: "الفوائد الصحية",
    text: "غني بالمغذيات ومضادات الأكسدة، ويدعم نمط حياة صحي ومتوازن بمنتج موثوق وأصيل.",
  },
  {
    title: "الجودة",
    text: "انتقاء دقيق من مصادر موثوقة، وتقديم منتج ثابت المستوى يليق بثقة عملائنا في كل طلب.",
  },
];

export const TESTIMONIALS = [
  {
    quote: "منتج في القمة، التغليف مليح والعسل جودة عالية.",
    author: "عبد القادر زروقي",
  },
  {
    quote: "العسل هايل بزاف، طبيعي وبنّة تاعو تشهي. ننصح بيه.",
    author: "أمين بن عمر",
  },
  {
    quote: "منتوج مليح، التوصيل كان سريع والعسل نوعية ممتازة.",
    author: "محمد أمين قادري",
  },
];

export const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia", "Biskra", "Bechar", "Blida", "Bouira",
  "Tamanrasset", "Tebessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Setif", "Saida",
  "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma", "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara",
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdes", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama", "Ain Temouchent", "Ghardaia",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Beni Abbes", "In Salah", "In Guezzam",
  "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
];

export const SHIPPING_PRICES: Record<string, { domicile: number; bureau: number }> = {
  Adrar: { domicile: 1200, bureau: 750 },
  Chlef: { domicile: 550, bureau: 350 },
  Laghouat: { domicile: 700, bureau: 350 },
  "Oum El Bouaghi": { domicile: 700, bureau: 350 },
  Batna: { domicile: 700, bureau: 350 },
  Bejaia: { domicile: 700, bureau: 350 },
  Biskra: { domicile: 800, bureau: 350 },
  Bechar: { domicile: 900, bureau: 450 },
  Blida: { domicile: 550, bureau: 350 },
  Bouira: { domicile: 600, bureau: 350 },
  Tamanrasset: { domicile: 1300, bureau: 800 },
  Tebessa: { domicile: 700, bureau: 350 },
  Tlemcen: { domicile: 700, bureau: 350 },
  Tiaret: { domicile: 700, bureau: 350 },
  "Tizi Ouzou": { domicile: 700, bureau: 350 },
  Alger: { domicile: 350, bureau: 350 },
  Djelfa: { domicile: 800, bureau: 350 },
  Jijel: { domicile: 700, bureau: 350 },
  Setif: { domicile: 700, bureau: 350 },
  Saida: { domicile: 700, bureau: 350 },
  Skikda: { domicile: 700, bureau: 350 },
  "Sidi Bel Abbes": { domicile: 700, bureau: 350 },
  Annaba: { domicile: 700, bureau: 350 },
  Guelma: { domicile: 700, bureau: 350 },
  Constantine: { domicile: 700, bureau: 350 },
  Medea: { domicile: 700, bureau: 350 },
  Mostaganem: { domicile: 700, bureau: 350 },
  "M'Sila": { domicile: 700, bureau: 350 },
  Mascara: { domicile: 700, bureau: 350 },
  Ouargla: { domicile: 800, bureau: 400 },
  Oran: { domicile: 700, bureau: 350 },
  "El Bayadh": { domicile: 800, bureau: 400 },
  Illizi: { domicile: 1200, bureau: 750 },
  "Bordj Bou Arreridj": { domicile: 700, bureau: 350 },
  Boumerdes: { domicile: 550, bureau: 350 },
  "El Tarf": { domicile: 700, bureau: 350 },
  Tindouf: { domicile: 1200, bureau: 750 },
  Tissemsilt: { domicile: 700, bureau: 350 },
  "El Oued": { domicile: 800, bureau: 400 },
  Khenchela: { domicile: 700, bureau: 350 },
  "Souk Ahras": { domicile: 700, bureau: 350 },
  Tipaza: { domicile: 550, bureau: 350 },
  Mila: { domicile: 700, bureau: 350 },
  "Ain Defla": { domicile: 700, bureau: 350 },
  Naama: { domicile: 800, bureau: 400 },
  "Ain Temouchent": { domicile: 700, bureau: 350 },
  Ghardaia: { domicile: 800, bureau: 400 },
  Relizane: { domicile: 700, bureau: 350 },
  Timimoun: { domicile: 1200, bureau: 750 },
  "Bordj Badji Mokhtar": { domicile: 1600, bureau: 800 },
  "Ouled Djellal": { domicile: 800, bureau: 400 },
  "Beni Abbes": { domicile: 1200, bureau: 750 },
  "In Salah": { domicile: 1200, bureau: 750 },
  "In Guezzam": { domicile: 1500, bureau: 750 },
  Touggourt: { domicile: 800, bureau: 400 },
  Djanet: { domicile: 1200, bureau: 750 },
  "El M'Ghair": { domicile: 800, bureau: 400 },
  "El Meniaa": { domicile: 800, bureau: 400 },
};

export const FREE_SHIPPING_THRESHOLD = 6000;

export const PIXEL_SETTINGS_KEY = "meta_pixel";
