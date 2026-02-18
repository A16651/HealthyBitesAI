/**
 * Centralized Configuration for Food Doctor Application
 * All API endpoints, settings, and external resources defined here
 *
 * ARCHITECTURE NOTE (Two-Service Deployment):
 *   Backend  → FastAPI on its own Render service (port 8000)
 *   Frontend → Next.js on its own Render service (port 3000)
 *   They are fully independent — NO reverse proxy, NO same-origin.
 *
 *   NEXT_PUBLIC_API_URL must be set to the backend's public URL so that
 *   all API calls (e.g. fetch(`${BASE_URL}/api/v1/search`)) reach the
 *   correct backend service.
 *
 *   - Production: NEXT_PUBLIC_API_URL = https://healthybitesai-backend.onrender.com
 *   - Local dev:  NEXT_PUBLIC_API_URL = http://127.0.0.1:8000
 */

// Backend API Configuration
//
// NEXT_PUBLIC_API_URL is baked in at build time by Next.js:
//   - Production (Render): set to the backend's public URL
//   - Local dev (`npm run dev`): set to 'http://127.0.0.1:8000' via .env
//
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL ?? '';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    SEARCH: '/api/v1/search',
    ANALYZE: '/api/v1/analyze/product',
    PRODUCT: '/api/v1/product',
    OCR: '/api/v1/ocr',
    BARCODE: '/api/v1/barcode',
  },
} as const;

// External APIs
export const EXTERNAL_APIS = {
  OPEN_FOOD_FACTS: {
    BASE_URL: 'https://world.openfoodfacts.org/api/v0',
    PRODUCT: (barcode: string) => `${EXTERNAL_APIS.OPEN_FOOD_FACTS.BASE_URL}/product/${barcode}.json`,
  },
} as const;

// Application Settings
export const APP_SETTINGS = {
  DEFAULT_SEARCH_LIMIT: 5,
  SEARCH_LIMITS: [5, 10, 20, 50],
  THEME: {
    STORAGE_KEY: 'fdark',
    DEFAULT: 'light',
  },
  SETTINGS: {
    STORAGE_KEY: 'fd_settings',
  },
} as const;

// Popular Indian Products for "Try These" section
export const TOP_PRODUCTS = [
  { name: 'Maggi Noodles', barcode: '8901058851441', img: "https://images.openfoodfacts.org/images/products/890/105/800/0290/front_en.26.400.jpg" },
  { name: 'Parle G', barcode: '8901719110009', img: "https://images.openfoodfacts.org/images/products/890/171/912/5478/front_en.7.200.jpg" },
  { name: 'Amul Butter', barcode: '8901430000116', img: "https://m.media-amazon.com/images/I/717GgfVk6YL._AC_UF894,1000_QL80_.jpg" },
  { name: 'Bournvita', barcode: '8901719110016', img: "https://www.planethealth.in/image/cache/catalog/10165-500x500.jpg" },
  { name: 'Britannia Good Day', barcode: '8901063018976', img: "https://www.glubery.com/public/uploads/1716960366Britannia_Good_Day_Butter_Cookies_27.5_g_-_Pack_of_12.jpg" },
  { name: 'Dairy Milk', barcode: '8901719110023', img: "https://images.apollo247.in/pub/media/catalog/product/c/a/cad0090_1_1.jpg?tr=q-80,f-webp,w-400,dpr-3,c-at_max%20400w" },
  { name: 'Lays Classic', barcode: '8901491101516', img: "https://images-cdn.ubuy.co.in/6941305648563ba0b006c886-lay-s-potato-chips-classic-10-ounce.jpg" },
  { name: 'Kissan Jam', barcode: '8901491101523', img: "https://m.media-amazon.com/images/I/51NJJNAATTL._AC_UF894,1000_QL80_.jpg" },
] as const;

// External Health Resources
export const HEALTH_RESOURCES = {
  FSSAI: {
    name: 'FSSAI - Food Safety and Standards Authority of India',
    url: 'https://www.fssai.gov.in/',
    description: 'Official food safety standards and regulations',
  },
  WHO_NUTRITION: {
    name: 'WHO - Healthy Diet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    description: 'World Health Organization nutrition guidelines',
  },
  NUTRITION_DATA: {
    name: 'Nutritionix Database',
    url: 'https://www.nutritionix.com/',
    description: 'Comprehensive nutrition database',
  },
  OPEN_FOOD_FACTS_ORG: {
    name: 'Open Food Facts',
    url: 'https://world.openfoodfacts.org/',
    description: 'Free food products database',
  },
} as const;

// Helper function to build full API URL
export function getApiUrl(endpoint: keyof typeof API_CONFIG.ENDPOINTS, path?: string): string {
  const baseEndpoint = API_CONFIG.ENDPOINTS[endpoint];
  const baseUrl = API_CONFIG.BASE_URL;
  if (path) {
    return `${baseUrl}${baseEndpoint}/${path}`;
  }
  return `${baseUrl}${baseEndpoint}`;
}
