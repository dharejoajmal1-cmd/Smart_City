const now = new Date();

const imageByCategory = {
  "Residential Plot": "/assets/residential-plot.svg",
  "Commercial Plot": "/assets/commercial-plot.svg",
  House: "/assets/house-residential.svg",
  Apartment: "/assets/apartment.svg",
  Farmhouse: "/assets/farmhouse.svg",
};

export const MOCK_PROPERTIES = [
  { _id: "mock-1", slug: "5-marla-residential-plot-sector-a", title: "5 Marla Residential Plot — Sector A", price: 4250000, location: "Sector A, Smart City Jamshoro", category: "Residential Plot", areaSize: 5, areaUnit: "Marla", status: "Available", featured: true, createdAt: new Date(now - 1 * 86400000).toISOString(), description: "A premium residential plot in a planned sector with access to roads, parks and essential amenities.", amenities: ["Wide Road", "Park Facing", "Electricity", "Water", "Gated Community"], images: [imageByCategory["Residential Plot"]] },
  { _id: "mock-2", slug: "10-marla-residential-plot-sector-b", title: "10 Marla Residential Plot — Sector B", price: 7900000, location: "Sector B, Smart City Jamshoro", category: "Residential Plot", areaSize: 10, areaUnit: "Marla", status: "Available", featured: true, createdAt: new Date(now - 2 * 86400000).toISOString(), description: "Spacious residential plot ideal for a family home in a green, secure neighbourhood.", amenities: ["Corner Options", "Park Nearby", "Security", "Road Access"], images: [imageByCategory["Residential Plot"]] },
  { _id: "mock-3", slug: "commercial-plot-main-boulevard", title: "Commercial Plot — Main Boulevard", price: 18500000, location: "Main Boulevard, Smart City Jamshoro", category: "Commercial Plot", areaSize: 8, areaUnit: "Marla", status: "Hot", featured: true, createdAt: new Date(now - 3 * 86400000).toISOString(), description: "High-visibility commercial opportunity positioned for shops, offices and neighbourhood services.", amenities: ["Main Boulevard", "High Footfall", "Parking", "Utilities"], images: [imageByCategory["Commercial Plot"]] },
  { _id: "mock-4", slug: "5-marla-modern-house-sector-c", title: "Modern 5 Marla House — Sector C", price: 16800000, location: "Sector C, Smart City Jamshoro", category: "House", areaSize: 5, areaUnit: "Marla", bedrooms: 3, bathrooms: 3, status: "Ready", featured: true, createdAt: new Date(now - 4 * 86400000).toISOString(), description: "A contemporary family home with practical layouts, natural light and community amenities nearby.", amenities: ["3 Bedrooms", "3 Bathrooms", "Car Porch", "Kitchen", "Lawn"], images: [imageByCategory.House] },
  { _id: "mock-5", slug: "3-bed-apartment-central-district", title: "3 Bed Apartment — Central District", price: 12500000, location: "Central District, Smart City Jamshoro", category: "Apartment", areaSize: 1450, areaUnit: "sqft", bedrooms: 3, bathrooms: 2, status: "Available", featured: false, createdAt: new Date(now - 5 * 86400000).toISOString(), description: "Modern apartment living with easy access to commercial facilities and landscaped public spaces.", amenities: ["Lift", "Parking", "Security", "Balcony"], images: [imageByCategory.Apartment] },
  { _id: "mock-6", slug: "1-kanal-farmhouse-green-belt", title: "1 Kanal Farmhouse — Green Belt", price: 32000000, location: "Green Belt, Jamshoro", category: "Farmhouse", areaSize: 1, areaUnit: "Kanal", bedrooms: 4, bathrooms: 4, status: "Available", featured: true, createdAt: new Date(now - 6 * 86400000).toISOString(), description: "A peaceful farmhouse-style property for families who want space, greenery and privacy.", amenities: ["Garden", "4 Bedrooms", "4 Bathrooms", "Private Parking"], images: [imageByCategory.Farmhouse] },
  { _id: "mock-7", slug: "8-marla-residential-plot-sector-d", title: "8 Marla Residential Plot — Sector D", price: 6400000, location: "Sector D, Smart City Jamshoro", category: "Residential Plot", areaSize: 8, areaUnit: "Marla", status: "Available", featured: false, createdAt: new Date(now - 7 * 86400000).toISOString(), description: "An attractive mid-size plot with family-friendly surroundings and straightforward road access.", amenities: ["Park Nearby", "Utilities", "Security"], images: [imageByCategory["Residential Plot"]] },
  { _id: "mock-8", slug: "6-marla-townhouse-sector-e", title: "6 Marla Townhouse — Sector E", price: 19500000, location: "Sector E, Smart City Jamshoro", category: "House", areaSize: 6, areaUnit: "Marla", bedrooms: 4, bathrooms: 4, status: "New", featured: false, createdAt: new Date(now - 8 * 86400000).toISOString(), description: "A stylish townhouse concept for growing families, close to parks and everyday conveniences.", amenities: ["4 Bedrooms", "4 Bathrooms", "Car Porch", "Family Lounge"], images: [imageByCategory.House] },
  { _id: "mock-9", slug: "12-marla-commercial-plot-market", title: "12 Marla Commercial Plot — Market", price: 27000000, location: "Commercial Market, Smart City Jamshoro", category: "Commercial Plot", areaSize: 12, areaUnit: "Marla", status: "Available", featured: false, createdAt: new Date(now - 9 * 86400000).toISOString(), description: "A larger commercial parcel for investors looking for visibility and long-term growth potential.", amenities: ["Market Access", "Wide Road", "Utilities", "Parking Potential"], images: [imageByCategory["Commercial Plot"]] },
];

export const MOCK_USERS = [
  { _id: "mock-admin", name: "Smart City Admin", email: "admin@smartcityjamshoro.com", phone: "", role: "admin", createdAt: now.toISOString() },
];

export const MOCK_INQUIRIES = [];
export const MOCK_CHAT_HISTORY = [];

export const getStoredMockProperties = () => {
  try {
    const raw = localStorage.getItem("scj_mock_properties");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem("scj_mock_properties", JSON.stringify(MOCK_PROPERTIES));
  return [...MOCK_PROPERTIES];
};

export const saveMockProperties = (items) => {
  localStorage.setItem("scj_mock_properties", JSON.stringify(items));
  return items;
};

export const getStoredMockInquiries = () => {
  try { return JSON.parse(localStorage.getItem("scj_mock_inquiries") || "[]"); } catch { return []; }
};

export const saveMockInquiries = (items) => {
  localStorage.setItem("scj_mock_inquiries", JSON.stringify(items));
  return items;
};

export const getStoredMockUsers = () => {
  try { return JSON.parse(localStorage.getItem("scj_mock_users") || JSON.stringify(MOCK_USERS)); } catch { return [...MOCK_USERS]; }
};

export const saveMockUsers = (items) => {
  localStorage.setItem("scj_mock_users", JSON.stringify(items));
  return items;
};

export const getStoredMockChat = () => {
  try { return JSON.parse(localStorage.getItem("scj_mock_chat") || "[]"); } catch { return []; }
};

export const saveStoredMockChat = (items) => {
  localStorage.setItem("scj_mock_chat", JSON.stringify(items));
  return items;
};
