// =====================================================
// scripts/seedProperties.js
// Seeds the database with 16 Smart City Jamshoro property
// listings, each using one of the 16 PNG images shipped in
// backend/seed-images/. Images are uploaded through the SAME
// Cloudinary pipeline the app uses at runtime (config/cloudinary.js),
// so the seeded data exercises the real
//   PNG -> Cloudinary -> MongoDB URL -> Property API -> React -> PropertyCard
// flow rather than faking it.
//
// Safe to re-run: it looks for a seed marker feature tag on existing
// documents and SKIPS creating duplicates if the 16 seed properties
// already exist. It never touches or deletes any other data in the
// database.
//
// Usage (from the backend/ folder, with a real .env configured):
//   node scripts/seedProperties.js
//   (or)  npm run seed
// =====================================================
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require('dotenv').config();


const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const cloudinary = require('../config/cloudinary');
const Property = require('../models/Property');
const User = require('../models/User');

const SEED_IMAGES_DIR = path.join(__dirname, '..', 'seed-images');
const CLOUDINARY_FOLDER = 'smart-city-jamshoro/properties';

// Marker stored in every seeded property's `features` array so this
// script can recognize its own records on re-run and skip re-seeding,
// without touching any admin-created properties.
const SEED_TAG = 'seed:smart-city-jamshoro-v1';

// -----------------------------------------------------
// 16 property definitions — one per PNG in seed-images/.
// Confirmed project boundaries: Rs. 1,725,000 minimum residential plot and Rs. 7,500,000 maximum commercial plot.
// A mix of types/purposes/locations/statuses, several featured.
// -----------------------------------------------------
const PROPERTY_DEFINITIONS = [
  {
    image: 'images (1).png',
    title: 'Sector A Corner Residential Plot',
    type: 'plot',
    purpose: 'sale',
    location: 'Sector A, Smart City Jamshoro',
    price: 1725000,
    bedrooms: 0,
    bathrooms: 0,
    area: '150 Sq.Yds',
    description:
      'A corner residential plot in Sector A with wide-facing frontage, ready for immediate construction. Located minutes from the main boulevard with clean, verified title documentation.',
    features: ['Corner Plot', 'Gated Community', 'Verified Title'],
    featured: true,
    coordinates: { lat: 25.4295, lng: 68.2777 },
  },
  {
    image: 'images (2).png',
    title: 'Green Belt View 10 Marla Plot',
    type: 'plot',
    purpose: 'sale',
    location: 'Sector B, Smart City Jamshoro',
    price: 3200000,
    bedrooms: 0,
    bathrooms: 0,
    area: '10 Marla',
    description:
      'A 10 Marla residential plot directly facing the community green belt, ideal for families who want a quiet, park-facing setting close to planned schools.',
    features: ['Park Facing', 'Wide Road', 'Underground Electrification'],
    featured: false,
    coordinates: { lat: 25.4312, lng: 68.2801 },
  },
  {
    image: 'images (3).png',
    title: 'Modern 5 Marla Single-Story House',
    type: 'house',
    purpose: 'sale',
    location: 'Sector C, Smart City Jamshoro',
    price: 6500000,
    bedrooms: 3,
    bathrooms: 2,
    area: '5 Marla',
    description:
      'A brand-new single-story house with a modern grey-stone facade, three bedrooms, an open-plan lounge, and a small front lawn. Move-in ready.',
    features: ['Modern Facade', 'Tiled Flooring', 'Covered Parking'],
    featured: true,
    coordinates: { lat: 25.428, lng: 68.2755 },
  },
  {
    image: 'images (4).png',
    title: 'Family Home Near Community Park',
    type: 'house',
    purpose: 'sale',
    location: 'Sector D, Smart City Jamshoro',
    price: 7200000,
    bedrooms: 4,
    bathrooms: 3,
    area: '8 Marla',
    description:
      'A spacious double-story family home a short walk from the central community park, with four bedrooms, a dedicated dining area, and a rooftop terrace.',
    features: ['Double Story', 'Rooftop Terrace', 'Near Park'],
    featured: false,
    coordinates: { lat: 25.4258, lng: 68.2822 },
  },
  {
    image: 'images (5).png',
    title: 'Budget-Friendly 3 Marla House',
    type: 'house',
    purpose: 'sale',
    location: 'Sector E, Smart City Jamshoro',
    price: 1650000,
    bedrooms: 2,
    bathrooms: 1,
    area: '3 Marla',
    description:
      'An affordable, compact single-story house suited to a small family or first-time buyer, with an efficient layout and low-maintenance finishes.',
    features: ['Affordable', 'Compact Layout'],
    featured: false,
    coordinates: { lat: 25.4331, lng: 68.2769 },
  },
  {
    image: 'images (6).png',
    title: 'Skyline Residency 2-Bed Apartment',
    type: 'apartment',
    purpose: 'sale',
    location: 'Skyline Residency, Smart City Jamshoro',
    price: 4500000,
    bedrooms: 2,
    bathrooms: 2,
    area: '1050 sqft',
    description:
      'A mid-floor 2-bedroom apartment in Skyline Residency with a balcony overlooking the community boulevard, lift access, and reserved parking.',
    features: ['Lift Access', 'Balcony', 'Reserved Parking'],
    featured: true,
    coordinates: { lat: 25.4269, lng: 68.2793 },
  },
  {
    image: 'images (7).png',
    title: 'Riverside Towers 3-Bed Apartment',
    type: 'apartment',
    purpose: 'rent',
    location: 'Riverside Towers, Smart City Jamshoro',
    price: 3800000,
    bedrooms: 3,
    bathrooms: 2,
    area: '1400 sqft',
    description:
      'A bright, well-ventilated 3-bedroom apartment available for rent in Riverside Towers, close to the main commercial strip and public transport links.',
    features: ['Furnished Kitchen', 'Backup Power', '24/7 Security'],
    featured: false,
    coordinates: { lat: 25.4304, lng: 68.2748 },
  },
  {
    image: 'images (8).png',
    title: 'Main Boulevard Commercial Shop',
    type: 'commercial',
    purpose: 'sale',
    location: 'Main Boulevard, Smart City Jamshoro',
    price: 5900000,
    bedrooms: 0,
    bathrooms: 1,
    area: '400 sqft',
    description:
      'A ground-floor commercial shop unit on the high-footfall Main Boulevard, suited to retail or a franchise outlet, with a glass storefront.',
    features: ['High Footfall', 'Glass Storefront', 'Corner Unit'],
    featured: true,
    coordinates: { lat: 25.4241, lng: 68.2811 },
  },
  {
    image: 'images (9).png',
    title: 'Commercial Plaza Office Space',
    type: 'commercial',
    purpose: 'rent',
    location: 'Business District, Smart City Jamshoro',
    price: 2950000,
    bedrooms: 0,
    bathrooms: 1,
    area: '650 sqft',
    description:
      'A flexible commercial space inside the Smart City Business Plaza, suitable for a small office, clinic, or showroom, with shared elevator access.',
    features: ['Elevator Access', 'Shared Parking', 'Flexible Layout'],
    featured: false,
    coordinates: { lat: 25.4287, lng: 68.2762 },
  },
  {
    image: 'images (10).png',
    title: 'Executive Office Suite',
    type: 'office',
    purpose: 'rent',
    location: 'Corporate Sector, Smart City Jamshoro',
    price: 4100000,
    bedrooms: 0,
    bathrooms: 2,
    area: '900 sqft',
    description:
      'A fitted-out executive office suite with partitioned rooms, a reception area, and dedicated parking, ready for a professional services firm.',
    features: ['Partitioned Rooms', 'Reception Area', 'Dedicated Parking'],
    featured: false,
    coordinates: { lat: 25.4256, lng: 68.2734 },
  },
  {
    image: 'images (11).png',
    title: 'Tech Park Co-Working Office',
    type: 'office',
    purpose: 'sale',
    location: 'Tech Park, Smart City Jamshoro',
    price: 6800000,
    bedrooms: 0,
    bathrooms: 2,
    area: '1200 sqft',
    description:
      'An open-plan office floor within the Tech Park block, wired for high-speed connectivity and suited to a growing team or co-working operator.',
    features: ['Open Plan', 'Fibre Ready', 'Meeting Rooms'],
    featured: false,
    coordinates: { lat: 25.4319, lng: 68.2785 },
  },
  {
    image: 'images (12).png',
    title: 'Orchard View Farmhouse Plot',
    type: 'farmhouse',
    purpose: 'sale',
    location: 'Orchard Sector, Smart City Jamshoro',
    price: 7500000,
    bedrooms: 3,
    bathrooms: 2,
    area: '2 Acres',
    description:
      'A generous farmhouse plot on the edge of the orchard sector with an existing boundary wall, mature trees, and space for a private garden.',
    features: ['Boundary Wall', 'Mature Trees', 'Private Garden'],
    featured: true,
    coordinates: { lat: 25.4372, lng: 68.2703 },
  },
  {
    image: 'images (13).png',
    title: 'Countryside Weekend Farmhouse',
    type: 'farmhouse',
    purpose: 'rent',
    location: 'Green Valley Sector, Smart City Jamshoro',
    price: 3400000,
    bedrooms: 2,
    bathrooms: 2,
    area: '1 Acre',
    description:
      'A cozy weekend farmhouse with an open courtyard and lawn, available for rent — a quiet retreat within easy reach of the main city sectors.',
    features: ['Open Courtyard', 'Lawn Area', 'Quiet Location'],
    featured: false,
    coordinates: { lat: 25.4218, lng: 68.2839 },
  },
  {
    image: 'images (14).png',
    title: 'Lakeview Residential Plot',
    type: 'plot',
    purpose: 'sale',
    location: 'Lakeview Sector, Smart City Jamshoro',
    price: 2750000,
    bedrooms: 0,
    bathrooms: 0,
    area: '7 Marla',
    description:
      'A residential plot in the Lakeview Sector with partial lake views, paved access road, and proximity to the planned community clubhouse.',
    features: ['Lake View', 'Paved Access Road'],
    featured: false,
    coordinates: { lat: 25.4344, lng: 68.2814 },
  },
  {
    image: 'images (15).png',
    title: 'Twin Villas Duplex House',
    type: 'house',
    purpose: 'sale',
    location: 'Sector F, Smart City Jamshoro',
    price: 5400000,
    bedrooms: 3,
    bathrooms: 3,
    area: '6 Marla',
    description:
      'One of a pair of twin villas with a duplex layout, private driveway, and a small backyard, finished with contemporary interior fittings.',
    features: ['Duplex Layout', 'Private Driveway', 'Contemporary Fittings'],
    featured: false,
    coordinates: { lat: 25.4227, lng: 68.2768 },
  },
  {
    image: 'images (16).png',
    title: 'Grand Avenue Show Room',
    type: 'commercial',
    purpose: 'sale',
    location: 'Grand Avenue, Smart City Jamshoro',
    price: 7500000,
    bedrooms: 0,
    bathrooms: 1,
    area: '250 Sq.Yds',
    description:
      'A double-height showroom unit on Grand Avenue with full-glass frontage, suited to a car dealership, furniture showroom, or flagship retail store.',
    features: ['Double Height', 'Full Glass Frontage', 'Flagship Location'],
    featured: true,
    coordinates: { lat: 25.4263, lng: 68.2726 },
  },
];

async function uploadOneImage(filePath) {
  const ready = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  if (!ready) {
    const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    return { url: `${base}/seed-images/${encodeURIComponent(path.basename(filePath))}`, publicId: `seed-local:${path.basename(filePath)}` };
  }
  const result = await cloudinary.uploader.upload(filePath, { folder: CLOUDINARY_FOLDER, resource_type: 'image' });
  return { url: result.secure_url, publicId: result.public_id };
}

async function resolveSeedOwner() {
  // Prefer the configured admin account so seeded listings show up as
  // created by the real admin. Falls back to any existing admin user,
  // and only creates a dedicated seed-owner account as a last resort.
  const adminEmail = process.env.ADMIN_EMAIL
    ? String(process.env.ADMIN_EMAIL).trim().toLowerCase()
    : null;

  if (adminEmail) {
    const configuredAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (configuredAdmin) return configuredAdmin;
  }

  const anyAdmin = await User.findOne({ role: 'admin' });
  if (anyAdmin) return anyAdmin;

  console.warn(
    '⚠️  No admin user found. Run `npm run create-admin` first so seeded ' +
      'properties are attributed to the real admin account. Falling back ' +
      'to a dedicated seed-owner account for now.'
  );

  return User.create({
    name: 'Smart City Seed Owner',
    email: 'seed-owner@smartcityjamshoro.local',
    password: 'ChangeMe123!',
    role: 'admin',
  });
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in the environment. Aborting.');
    process.exit(1);
  }

  // Cloudinary is optional for local development; seed records fall back to /seed-images.

  if (!fs.existsSync(SEED_IMAGES_DIR)) {
    console.error(`❌ seed-images directory not found at ${SEED_IMAGES_DIR}. Aborting.`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB');

  try {
    const owner = await resolveSeedOwner();
    console.log(`✅ Seeding properties as: ${owner.email} (${owner.role})`);

    let created = 0;
    for (const def of PROPERTY_DEFINITIONS) {
      const imagePath = path.join(SEED_IMAGES_DIR, def.image);

      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️  Skipping "${def.title}" — image not found: ${imagePath}`);
        // eslint-disable-next-line no-continue
        continue;
      }

      const alreadyExists = await Property.findOne({ title: def.title, features: SEED_TAG });
      // eslint-disable-next-line no-await-in-loop
      const uploadedImage = await uploadOneImage(imagePath);
      if (alreadyExists) {
        alreadyExists.images = [uploadedImage];
        alreadyExists.seedImage = def.image;
        alreadyExists.price = def.price;
        alreadyExists.area = def.area;
        alreadyExists.featured = def.featured;
        await alreadyExists.save();
        console.log(`↻  Updated seeded property: "${def.title}"`);
        continue;
      }

      console.log(`  ⬆  Image ready ${def.image} -> ${uploadedImage.url}`);

      // eslint-disable-next-line no-await-in-loop
      await Property.create({
        title: def.title,
        description: def.description,
        city: 'Jamshoro',
        location: def.location,
        price: def.price,
        purpose: def.purpose,
        type: def.type,
        bedrooms: def.bedrooms,
        bathrooms: def.bathrooms,
        area: def.area,
        images: [uploadedImage],
        seedImage: def.image,
        features: [...def.features, SEED_TAG],
        status: 'available',
        featured: def.featured,
        coordinates: def.coordinates,
        createdBy: owner._id,
      });

      created += 1;
      console.log(`  ✅ Created property: "${def.title}"`);
    }

    console.log(`\n🎉 Done. ${created} new properties created (of ${PROPERTY_DEFINITIONS.length} defined).`);
    const featuredCount = PROPERTY_DEFINITIONS.filter((d) => d.featured).length;
    console.log(`   Featured: ${featuredCount} | Non-featured: ${PROPERTY_DEFINITIONS.length - featuredCount}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
