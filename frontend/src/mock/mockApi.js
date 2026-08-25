import {
  getStoredMockChat,
  getStoredMockInquiries,
  getStoredMockProperties,
  getStoredMockUsers,
  saveMockInquiries,
  saveMockProperties,
  saveMockUsers,
  saveStoredMockChat,
} from "./data";

const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));
const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const normalize = (value) => String(value || "").trim().toLowerCase();

const response = (data, message = "Success") => ({ data: { success: true, message, data } });
const error = (message, status = 400) => Object.assign(new Error(message), { friendlyMessage: message, response: { status } });

export const mockAuth = {
  async login({ email, password }) {
    await wait();
    if (normalize(email) === "admin@smartcityjamshoro.com" && password === "Admin@123") {
      const user = getStoredMockUsers()[0];
      return response({ token: "mock-token-admin", user }, "Login successful");
    }
    const users = getStoredMockUsers();
    const user = users.find((u) => normalize(u.email) === normalize(email));
    if (!user) throw error("Demo mode: account not found. Register a new account first, or use the seeded demo admin account (see README for local dev credentials).");
    const token = `mock-token-${user._id}`;
    return response({ token, user }, "Login successful");
  },
  async register(payload) {
    await wait();
    const users = getStoredMockUsers();
    if (users.some((u) => normalize(u.email) === normalize(payload.email))) throw error("An account with this email already exists.", 409);
    const user = { _id: id("user"), ...payload, role: "user", createdAt: new Date().toISOString() };
    saveMockUsers([...users, user]);
    return response({ token: `mock-token-${user._id}`, user }, "Account created successfully");
  },
  async getProfile() {
    await wait(160);
    const stored = localStorage.getItem("scj_user");
    if (!stored) throw error("Not authenticated", 401);
    return response(JSON.parse(stored), "Profile fetched successfully");
  },
  async updateProfile(payload) {
    await wait();
    const current = JSON.parse(localStorage.getItem("scj_user") || "null");
    const next = { ...current, ...payload };
    const users = getStoredMockUsers().map((u) => (u._id === current?._id ? next : u));
    saveMockUsers(users);
    return response(next, "Profile updated successfully");
  },
  async changePassword() { await wait(); return response(null, "Password updated successfully"); },
  async logout() { await wait(100); return response(null, "Logged out"); },
};

export const mockProperties = {
  async getAll(params = {}) {
    await wait();
    let items = [...getStoredMockProperties()];
    const search = normalize(params.search);
    if (search) items = items.filter((p) => [p.title, p.location, p.category].some((v) => normalize(v).includes(search)));
    if (params.category) items = items.filter((p) => p.category === params.category);
    if (params.featured !== undefined) items = items.filter((p) => Boolean(p.featured) === Boolean(params.featured));
    if (params.owner) items = items.filter((p) => p.owner === params.owner);
    if (params.minPrice) items = items.filter((p) => Number(p.price) >= Number(params.minPrice));
    if (params.maxPrice) items = items.filter((p) => Number(p.price) <= Number(params.maxPrice));
    if (params.sort === "price") items.sort((a, b) => a.price - b.price);
    else if (params.sort === "-price") items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Number(params.limit) || 12, 100);
    const total = items.length;
    const paged = items.slice((page - 1) * limit, page * limit);
    return response({ properties: paged, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, "Properties fetched successfully");
  },
  async getById(propertyId) {
    await wait();
    const property = getStoredMockProperties().find((p) => p._id === propertyId || p.id === propertyId);
    if (!property) throw error("Property not found", 404);
    return response({ property }, "Property fetched successfully");
  },
  async getBySlug(slug) {
    await wait();
    const property = getStoredMockProperties().find((p) => p.slug === slug);
    if (!property) throw error("Property not found", 404);
    return response({ property }, "Property fetched successfully");
  },
  async create(formData) {
    await wait();
    const entries = Object.fromEntries(formData.entries());
    const image = formData.get("image");
    const currentUser = JSON.parse(localStorage.getItem("scj_user") || "null");
    const property = { _id: id("property"), owner: currentUser?._id || currentUser?.id, ...entries, price: Number(entries.price || 0), areaSize: Number(entries.areaSize || 0), bedrooms: Number(entries.bedrooms || 0), bathrooms: Number(entries.bathrooms || 0), status: "Available", createdAt: new Date().toISOString(), images: [{ url: imageByCategory[entries.category] || "/assets/house-residential.svg" }] };
    saveMockProperties([property, ...getStoredMockProperties()]);
    return response({ property }, "Property created successfully");
  },
  async update(propertyId, formData) {
    await wait();
    const entries = Object.fromEntries(formData.entries());
    const items = getStoredMockProperties();
    const index = items.findIndex((p) => p._id === propertyId);
    if (index < 0) throw error("Property not found", 404);
    items[index] = { ...items[index], ...entries, price: Number(entries.price || items[index].price), areaSize: Number(entries.areaSize || items[index].areaSize) };
    saveMockProperties(items);
    return response({ property: items[index] }, "Property updated successfully");
  },
  async remove(propertyId) {
    await wait();
    saveMockProperties(getStoredMockProperties().filter((p) => p._id !== propertyId));
    return response(null, "Property deleted successfully");
  },
};

const imageByCategory = { "Residential Plot": "/assets/residential-plot.svg", "Commercial Plot": "/assets/commercial-plot.svg", House: "/assets/house-residential.svg", Apartment: "/assets/apartment.svg", Farmhouse: "/assets/farmhouse.svg" };

export const mockInquiries = {
  async create(payload) {
    await wait();
    const property = getStoredMockProperties().find((p) => p._id === payload.property);
    const item = { _id: id("inq"), ...payload, property: property || payload.property || null, status: "New", createdAt: new Date().toISOString() };
    saveMockInquiries([item, ...getStoredMockInquiries()]);
    return response({ inquiry: item }, "Inquiry submitted successfully");
  },
  async getAll() { await wait(); return response(getStoredMockInquiries(), "Inquiries fetched successfully"); },
  async updateStatus(idValue, status) { await wait(); const items = getStoredMockInquiries().map((i) => (i._id === idValue ? { ...i, status } : i)); saveMockInquiries(items); return response({ inquiry: items.find((i) => i._id === idValue) }, "Inquiry status updated"); },
  async remove(idValue) { await wait(); saveMockInquiries(getStoredMockInquiries().filter((i) => i._id !== idValue)); return response(null, "Inquiry deleted"); },
};

export const mockChat = {
  async sendMessage(prompt) {
    await wait(650);
    const text = String(prompt).trim();
    let reply = "I can help you explore Smart City Jamshoro properties, compare plot sizes, understand listings, and plan a site visit.";
    if (/price|cost|budget|rate/i.test(text)) reply = "For current listings, tell me your preferred category and budget. In the frontend demo, you can browse Residential Plots, Commercial Plots, Houses, Apartments and Farmhouses.";
    if (/5 marla/i.test(text)) reply = "We have 5 Marla residential options in the demo catalogue. Open Properties and filter by Residential Plot to explore them.";
    if (/visit|location|address/i.test(text)) reply = "The project team can coordinate a site visit. The current frontend location is F7VC+RXR, Jamshoro, Sindh, Pakistan.";
    const entry = { _id: id("chat"), prompt: text, response: reply, createdAt: new Date().toISOString() };
    saveStoredMockChat([entry, ...getStoredMockChat()]);
    return response({ prompt: text, response: reply, chatId: entry._id }, "AI response generated successfully");
  },
  async getHistory() { await wait(180); return response({ history: getStoredMockChat().reverse(), pagination: { total: getStoredMockChat().length, page: 1, limit: 50, totalPages: 1 } }, "Chat history fetched successfully"); },
};

export const mockUsers = {
  async getAll() { await wait(); return response(getStoredMockUsers(), "Users fetched successfully"); },
  async updateRole(userId, role) { await wait(); const users = getStoredMockUsers().map((u) => (u._id === userId ? { ...u, role } : u)); saveMockUsers(users); return response(users.find((u) => u._id === userId), "User role updated"); },
  async remove(userId) { await wait(); saveMockUsers(getStoredMockUsers().filter((u) => u._id !== userId)); return response(null, "User removed"); },
};
