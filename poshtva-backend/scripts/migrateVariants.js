const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected.');

    const Product = require('../models/Product');

    const totalProducts = await Product.countDocuments({});
    console.log(`\n--- BEFORE MIGRATION STATS ---`);
    console.log(`Total Products: ${totalProducts}`);

    const missingVariantsCount = await Product.countDocuments({
      $or: [{ variants: { $exists: false } }, { variants: null }],
    });
    console.log(`Products with missing/null variants: ${missingVariantsCount}`);

    const emptyVariantsCount = await Product.countDocuments({
      variants: { $eq: [] },
    });
    console.log(`Products with empty variants array ([]): ${emptyVariantsCount}`);

    const populatedVariantsCount = await Product.countDocuments({
      'variants.0': { $exists: true },
    });
    console.log(`Products with populated variants (>0): ${populatedVariantsCount}`);

    // Idempotent Migration: Update all products where variants is missing or null to []
    if (missingVariantsCount > 0) {
      console.log('\nRunning migration to set variants: [] for products missing variants field...');
      const updateResult = await Product.updateMany(
        { $or: [{ variants: { $exists: false } }, { variants: null }] },
        { $set: { variants: [] } }
      );
      console.log(`✅ Migration complete. Modified ${updateResult.modifiedCount} document(s).`);
    } else {
      console.log('\n✅ All products already have the variants field initialized.');
    }

    console.log(`\n--- AFTER MIGRATION VERIFICATION STATS ---`);
    const afterTotal = await Product.countDocuments({});
    const afterMissing = await Product.countDocuments({
      $or: [{ variants: { $exists: false } }, { variants: null }],
    });
    const afterEmpty = await Product.countDocuments({
      variants: { $eq: [] },
    });
    const afterPopulated = await Product.countDocuments({
      'variants.0': { $exists: true },
    });

    console.log(`Total Products: ${afterTotal}`);
    console.log(`Products with missing/null variants: ${afterMissing}`);
    console.log(`Products with empty variants array ([]): ${afterEmpty}`);
    console.log(`Products with populated variants (>0): ${afterPopulated}`);

    if (afterMissing === 0) {
      console.log('\n🎉 SUCCESS: 100% of products now safely contain a valid variants array!');
    } else {
      console.error(`\n⚠️ WARNING: ${afterMissing} products still have missing/null variants.`);
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    process.exit(1);
  }
}

runMigration();
