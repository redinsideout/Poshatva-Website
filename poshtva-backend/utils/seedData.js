require('dns').setServers(['8.8.8.8']);
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const categories = [
  { name: 'Cocopeat', slug: 'cocopeat', description: 'Premium cocopeat growing medium for plants', image: '' },
  { name: 'Vermicompost', slug: 'vermicompost', description: 'Organic vermicompost fertilizer', image: '' },
  { name: 'Bone Meal', slug: 'bone-meal', description: 'Natural bone meal for plant growth', image: '' },
  { name: 'Potting Mix', slug: 'potting-mix', description: 'Ready-to-use premium potting mix', image: '' },
  { name: 'Fertilizers', slug: 'fertilizers', description: 'Organic fertilizers for all plants', image: '' },
];

const seedData = async () => {
  await connectDB();
  await Category.deleteMany();
  await Product.deleteMany();

  const createdCategories = await Category.insertMany(categories);
  const catMap = {};
  createdCategories.forEach((c) => { catMap[c.slug] = c._id; });

  const products = [
    {
      name: 'Premium Cocopeat Block 5kg',
      slug: 'premium-cocopeat-block-5kg',
      description: 'Expand up to 70–75L of coco peat from one block. Ideal growing medium for vegetables, herbs, and flowers.',
      richDescription: 'Our premium cocopeat is sustainably sourced from coconut husks. It provides excellent water retention, aeration, and root support for all types of plants.',
      category: catMap['cocopeat'],
      price: 349,
      discountPrice: 299,
      stock: 150,
      images: [],
      weight: '5',
      unit: 'kg',
      tags: ['cocopeat', 'growing medium', 'organic'],
      isFeatured: true,
      benefits: ['Retains moisture up to 8x its weight', 'pH neutral (5.8–6.8)', 'Reusable for 3–4 years', 'Eco-friendly and sustainable'],
      howToUse: 'Soak in water for 30 minutes. Break apart and mix with garden soil or use as standalone growing medium.',
    },
    {
      name: 'Organic Vermicompost 5kg',
      slug: 'organic-vermicompost-5kg',
      description: 'Pure earthworm castings — nature\'s finest fertilizer. Enriches soil with essential macro and micronutrients.',
      richDescription: 'Produced by red wiggler worms from organic waste, our vermicompost is odorless, ready to use, and safe for all plants including edibles.',
      category: catMap['vermicompost'],
      price: 399,
      discountPrice: 349,
      stock: 200,
      images: [],
      weight: '5',
      unit: 'kg',
      tags: ['vermicompost', 'organic', 'fertilizer', 'soil amendment'],
      isFeatured: true,
      benefits: ['Rich in NPK and micronutrients', 'Improves soil structure', 'Boosts plant immunity', '100% organic'],
      howToUse: 'Mix 10–20% vermicompost into soil or use as top dressing. Apply once every 30–45 days.',
    },
    {
      name: 'Steamed Bone Meal 2kg',
      slug: 'steamed-bone-meal-2kg',
      description: 'High phosphorus content promotes strong root development and vibrant blooms.',
      richDescription: 'Our steamed bone meal is processed at high temperature to remove pathogens while preserving nutrients. NPK: 3-15-0.',
      category: catMap['bone-meal'],
      price: 279,
      discountPrice: 249,
      stock: 100,
      images: [],
      weight: '2',
      unit: 'kg',
      tags: ['bone meal', 'phosphorus', 'root growth', 'organic'],
      isFeatured: false,
      benefits: ['High in phosphorus (15%)', 'Promotes root growth', 'Aids in flowering', 'Slow-release nutrient'],
      howToUse: 'Mix 2–3 tbsp per gallon of soil at planting. Reapply every 2–3 months.',
    },
    {
      name: 'All-Purpose Potting Mix 10kg',
      slug: 'all-purpose-potting-mix-10kg',
      description: 'Ready-to-use premium blend for containers, raised beds, and indoor plants.',
      richDescription: 'A perfectly balanced mix of cocopeat, vermicompost, perlite, and neem cake suitable for all types of plants.',
      category: catMap['potting-mix'],
      price: 599,
      discountPrice: 499,
      stock: 80,
      images: [],
      weight: '10',
      unit: 'kg',
      tags: ['potting mix', 'container gardening', 'organic', 'indoor plants'],
      isFeatured: true,
      benefits: ['Perfect drainage and aeration', 'Pre-loaded with nutrients', 'No mixing required', 'Suitable for all plants'],
      howToUse: 'Fill containers directly. For ground use, mix 30–40% with existing soil.',
    },
    {
      name: 'Seaweed Liquid Fertilizer 500ml',
      slug: 'seaweed-liquid-fertilizer-500ml',
      description: 'Cold-processed seaweed extract packed with growth hormones, trace minerals, and amino acids.',
      richDescription: 'Derived from sustainably harvested seaweed, this concentrate improves plant vigor, stress resistance, and yield quality.',
      category: catMap['fertilizers'],
      price: 449,
      discountPrice: 399,
      stock: 120,
      images: [],
      weight: '500',
      unit: 'ml',
      tags: ['seaweed', 'liquid fertilizer', 'organic', 'growth booster'],
      isFeatured: true,
      benefits: ['Contains 60+ trace minerals', 'Improves stress resistance', 'Enhances fruit and flower quality', 'Safe for all plants'],
      howToUse: 'Dilute 2ml per liter of water. Spray on leaves or water around roots every 2 weeks.',
    },
    {
      name: 'Neem Cake Fertilizer 3kg',
      slug: 'neem-cake-fertilizer-3kg',
      description: 'Dual-action organic fertilizer and natural pesticide. Protects roots from nematodes and soil pests.',
      richDescription: 'Cold-pressed neem cake is a by-product of neem oil extraction. It enriches soil while naturally repelling root-eating pests.',
      category: catMap['fertilizers'],
      price: 299,
      discountPrice: 259,
      stock: 90,
      images: [],
      weight: '3',
      unit: 'kg',
      tags: ['neem cake', 'organic pesticide', 'fertilizer', 'soil health'],
      isFeatured: false,
      benefits: ['NPK: 4-1-2', 'Natural pest deterrent', 'Improves soil microbiology', 'Safe for organic farming'],
      howToUse: 'Mix 100g per square foot of soil before planting. Apply every 45–60 days.',
    },
    {
      name: 'Cocopeat + Perlite Mix 8kg',
      slug: 'cocopeat-perlite-mix-8kg',
      description: 'Perfect hydroponic and propagation medium. Excellent drainage with superior water holding.',
      richDescription: 'A 70:30 blend of premium cocopeat and horticultural perlite — ideal for cuttings, seedlings, and hydroponic systems.',
      category: catMap['cocopeat'],
      price: 549,
      discountPrice: 479,
      stock: 60,
      images: [],
      weight: '8',
      unit: 'kg',
      tags: ['cocopeat', 'perlite', 'hydroponics', 'propagation'],
      isFeatured: false,
      benefits: ['Excellent aeration', 'Superior drainage', 'Reusable', 'Lightweight'],
      howToUse: 'Use directly for cuttings and seedlings. Mix with soil for raised beds.',
    },
    {
      name: 'Castor Cake Organic Fertilizer 2kg',
      slug: 'castor-cake-organic-fertilizer-2kg',
      description: 'High nitrogen organic fertilizer from castor bean press cake.',
      category: catMap['fertilizers'],
      price: 199,
      discountPrice: 0,
      stock: 75,
      images: [],
      weight: '2',
      unit: 'kg',
      tags: ['castor cake', 'nitrogen fertilizer', 'organic'],
      isFeatured: false,
      benefits: ['High in nitrogen', 'Slow release', 'Improves soil texture', 'Eco-friendly'],
      howToUse: 'Incorporate into soil at 100g per sq ft before planting.',
    },
  ];

  await Product.insertMany(products);

  // Create admin user
  const adminExists = await User.findOne({ email: 'admin@Poshatva.com' });
  if (!adminExists) {
    await User.create({
      name: 'Poshatva Admin',
      email: 'admin@Poshatva.com',
      password: 'Admin@1234',
      role: 'admin',
    });
  }

  console.log('✅ Seed data inserted successfully!');
  console.log('📧 Admin: admin@Poshatva.com | 🔑 Password: Admin@1234');
  process.exit(0);
};

seedData().catch((err) => {
  console.error(err);
  process.exit(1);
});
