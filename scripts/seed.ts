import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import Product from "../lib/models/Product";
import DeliveryZone from "../lib/models/DeliveryZone";

const MONGODB_URI = process.env.MONGODB_URI;

const products = [
  {
    slug: "groundnut-oil",
    name: {
      mr: "शेंगदाणा तेल (कोल्ड प्रेस)",
      hi: "मूंगफली का तेल (कोल्ड प्रेस)",
      en: "Groundnut (Peanut) Cold Pressed Oil",
    },
    category: "oil",
    description: {
      mr: "पारंपरिक घाण्यावर काढलेले १००% शुद्ध व नैसर्गिक शेंगदाणा तेल. कोणतेही रसायन किंवा भेसळ नाही — भरपूर पोषण आणि अस्सल गावरान चव.",
      hi: "पारंपरिक घानी पर निकाला गया १००% शुद्ध और प्राकृतिक मूंगफली का तेल। कोई रसायन या मिलावट नहीं — भरपूर पोषण और असली स्वाद।",
      en: "100% pure & natural groundnut oil extracted on traditional cold-press ghani. Zero chemicals, zero blending — authentic natural nutrition.",
    },
    badges: ["chemical_free", "cold_pressed", "grade_1"],
    images: ["/images/products/groundnut-oil.jpg"],
    variants: [
      { sku: "OIL-GNUT-500ML", size: "500ml", unitLabel: "500 ml", price: 180, stock: 40 },
      { sku: "OIL-GNUT-1L", size: "1L", unitLabel: "1 litre", price: 340, stock: 30 },
      { sku: "OIL-GNUT-5L", size: "5L", unitLabel: "5 litre", price: 1650, stock: 12 },
    ],
  },
  {
    slug: "sunflower-oil",
    name: {
      mr: "सूर्यफूल तेल (कोल्ड प्रेस)",
      hi: "सूरजमुखी का तेल (कोल्ड प्रेस)",
      en: "Sunflower Cold Pressed Oil",
    },
    category: "oil",
    description: {
      mr: "घाण्यावर काढलेले हलके, पचायला सुलभ व आरोग्यदायी सूर्यफूल तेल. रोजच्या स्वयंपाकासाठी आणि संपूर्ण कुटुंबाच्या आरोग्यासाठी उत्तम.",
      hi: "घानी पर निकाला गया हल्का, सुपाच्य और सेहतमंद सूरजमुखी तेल। रोज़ के खाना पकाने के लिए बेहतरीन।",
      en: "Light and healthy cold-pressed sunflower oil. Easy to digest and rich in natural nutrients for everyday family cooking.",
    },
    badges: ["chemical_free", "cold_pressed", "grade_1"],
    images: ["/images/products/sunflower-oil.jpg"],
    variants: [
      { sku: "OIL-SUN-500ML", size: "500ml", unitLabel: "500 ml", price: 140, stock: 45 },
      { sku: "OIL-SUN-1L", size: "1L", unitLabel: "1 litre", price: 270, stock: 35 },
      { sku: "OIL-SUN-5L", size: "5L", unitLabel: "5 litre", price: 1300, stock: 10 },
    ],
  },
  {
    slug: "safflower-oil",
    name: {
      mr: "करडई तेल (कोल्ड प्रेस)",
      hi: "कुसुम का तेल (कोल्ड प्रेस)",
      en: "Safflower (Kardi) Cold Pressed Oil",
    },
    category: "oil",
    description: {
      mr: "पारंपरिक पद्धतीने करडईच्या बियांपासून काढलेले अस्सल घाणीचे तेल. हृदयाच्या आरोग्यासाठी व कोलेस्ट्रॉल नियंत्रणासाठी अत्यंत गुणकारी.",
      hi: "पारंपरिक तरीके से कुसुम के बीजों से निकाला गया शुद्ध घानी तेल। हृदय के स्वास्थ्य और कोलेस्ट्रॉल नियंत्रण के लिए अत्यंत लाभकारी।",
      en: "Nutritious cold-pressed safflower (kardi) oil extracted traditionally. Highly recommended for cardiovascular wellness.",
    },
    badges: ["chemical_free", "cold_pressed", "grade_1"],
    images: ["/images/products/safflower-oil.jpg"],
    variants: [
      { sku: "OIL-SAF-500ML", size: "500ml", unitLabel: "500 ml", price: 220, stock: 25 },
      { sku: "OIL-SAF-1L", size: "1L", unitLabel: "1 litre", price: 420, stock: 20 },
      { sku: "OIL-SAF-5L", size: "5L", unitLabel: "5 litre", price: 2000, stock: 6 },
    ],
  },
  {
    slug: "wheat-grain",
    name: {
      mr: "स्वच्छ व ग्रेडिंग केलेले गहू",
      hi: "साफ और ग्रेडेड गेहूं",
      en: "Cleaned & Graded Wheat",
    },
    category: "grain",
    description: {
      mr: "मशिन क्लिनिंग व ग्रेडिंग युनिटमध्ये स्वच्छ आणि प्रतवारी केलेला दर्जेदार गहू. खडे, काडीकचरा व भेसळमुक्त, घरगुती वापरासाठी थेट तयार.",
      hi: "मशीन क्लीनिंग और ग्रेडिंग यूनिट में साफ किया गया बढ़िया गेहूं। कंकड़ और कचरा मुक्त, घरेलू उपयोग के लिए तैयार।",
      en: "Premium quality wheat cleaned and graded in our modern unit. Free from dust, stones and impurities, ready for milling.",
    },
    badges: ["chemical_free", "grade_1"],
    images: ["/images/products/wheat-grain.jpg"],
    variants: [
      { sku: "GRAIN-WHEAT-1KG", size: "1kg", unitLabel: "1 kg", price: 45, stock: 100 },
      { sku: "GRAIN-WHEAT-5KG", size: "5kg", unitLabel: "5 kg", price: 220, stock: 60 },
      { sku: "GRAIN-WHEAT-25KG", size: "25kg", unitLabel: "25 kg", price: 1050, stock: 20 },
    ],
  },
  {
    slug: "jowar-grain",
    name: {
      mr: "स्वच्छ व ग्रेडिंग केलेली ज्वारी (शाळू)",
      hi: "साफ और ग्रेडेड ज्वार (शालू)",
      en: "Cleaned & Graded Jowar (Sorghum)",
    },
    category: "grain",
    description: {
      mr: "अस्सल गावरान शाळू ज्वारी, अत्याधुनिक मशिन क्लिनिंग व ग्रेडिंग करून पॅक केलेली. पांढरीशुभ्र, मऊ आणि चवदार भाकरीसाठी सर्वोत्तम.",
      hi: "शुद्ध देशी शालू ज्वार, आधुनिक मशीन क्लीनिंग और ग्रेडिंग द्वारा तैयार। स्वादिष्ट और मुलायम रोटी के लिए उत्तम।",
      en: "Farm-fresh premium Shalu Jowar sorghum, cleaned & graded to perfection for soft, delicious and nutritious rotis.",
    },
    badges: ["chemical_free", "grade_1"],
    images: ["/images/products/jowar-grain.jpg"],
    variants: [
      { sku: "GRAIN-JOWAR-1KG", size: "1kg", unitLabel: "1 kg", price: 50, stock: 90 },
      { sku: "GRAIN-JOWAR-5KG", size: "5kg", unitLabel: "5 kg", price: 240, stock: 50 },
      { sku: "GRAIN-JOWAR-25KG", size: "25kg", unitLabel: "25 kg", price: 1150, stock: 15 },
    ],
  },
  {
    slug: "bajra-grain",
    name: {
      mr: "स्वच्छ व ग्रेडिंग केलेली बाजरी",
      hi: "साफ और ग्रेडेड बाजरा",
      en: "Cleaned & Graded Bajra (Pearl Millet)",
    },
    category: "grain",
    description: {
      mr: "शेतकऱ्यांच्या शेतातून थेट आणलेली, मशिन क्लिनिंग व ग्रेडिंग केलेली पोषणयुक्त बाजरी. खडे व कचरामुक्त, उत्कृष्ट भाकरीसाठी योग्य.",
      hi: "सीधे किसानों के खेतों से लाई गई, मशीन से साफ और ग्रेडेड बाजरा। पौष्टिकता और स्वाद से भरपूर।",
      en: "Naturally grown pearl millet (bajra), cleaned and graded for premium taste and high fiber nutrition.",
    },
    badges: ["chemical_free", "grade_1"],
    images: ["/images/products/bajra-grain.jpg"],
    variants: [
      { sku: "GRAIN-BAJRA-1KG", size: "1kg", unitLabel: "1 kg", price: 45, stock: 80 },
      { sku: "GRAIN-BAJRA-5KG", size: "5kg", unitLabel: "5 kg", price: 220, stock: 45 },
      { sku: "GRAIN-BAJRA-25KG", size: "25kg", unitLabel: "25 kg", price: 1050, stock: 15 },
    ],
  },
];

// Starter zones for Karjat taluka / Ahilyanagar district
const deliveryZones = [
  { pincode: "413201", area: "Karjat" },
  { pincode: "413202", area: "Rashin" },
  { pincode: "413203", area: "Miri" },
  { pincode: "414001", area: "Ahilyanagar (city)" },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const p of products) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, returnDocument: "after" });
    console.log(`Upserted product: ${p.slug}`);
  }

  for (const z of deliveryZones) {
    await DeliveryZone.findOneAndUpdate({ pincode: z.pincode }, z, { upsert: true, returnDocument: "after" });
    console.log(`Upserted delivery zone: ${z.pincode} (${z.area})`);
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
