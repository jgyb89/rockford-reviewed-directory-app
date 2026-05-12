export const DIRECTORY_TYPES = [
  { name: "Food & Drink", slug: "food-drink" },
  { name: "Health & Wellness", slug: "health-wellness" },
  { name: "Home & Local Services", slug: "home-local-services" },
];

export const ALL_CATEGORIES = [
  // ====================
  // FOOD & DRINK
  // ====================
  {
    name: "Bars & Nightlife",
    slug: "bars-nightlife-en",
    directoryType: "food-drink",
    isParent: true,
  },
  { name: "Breweries", slug: "breweries-en", parentSlug: "bars-nightlife-en" },
  {
    name: "Pubs & Grills",
    slug: "pubs-grills-en",
    parentSlug: "bars-nightlife-en",
  },
  {
    name: "Sports Bars",
    slug: "sports-bars-en",
    parentSlug: "bars-nightlife-en",
  },
  {
    name: "Wine & Cocktail Bars",
    slug: "wine-cocktail-bars-en",
    parentSlug: "bars-nightlife-en",
  },

  {
    name: "Cafes & Bakeries",
    slug: "cafes-bakeries-en",
    directoryType: "food-drink",
    isParent: true,
  },
  { name: "Bakeries", slug: "bakeries-en", parentSlug: "cafes-bakeries-en" },
  { name: "Boba", slug: "boba-en", parentSlug: "cafes-bakeries-en" },
  {
    name: "Coffee & Tea",
    slug: "coffee-tea-en",
    parentSlug: "cafes-bakeries-en",
  },
  { name: "Ice Cream", slug: "ice-cream-en", parentSlug: "cafes-bakeries-en" },
  { name: "Juice", slug: "juice-en", parentSlug: "cafes-bakeries-en" },

  {
    name: "Restaurants",
    slug: "restaurants-en",
    directoryType: "food-drink",
    isParent: true,
  },
  { name: "Pizza", slug: "pizza-en", parentSlug: "restaurants-en" },
  { name: "Seafood", slug: "seafood-en", parentSlug: "restaurants-en" },
  {
    name: "American (New & Traditional)",
    slug: "american-food-en",
    parentSlug: "restaurants-en",
  },
  {
    name: "Mexican & Latin",
    slug: "mexican-latin-en",
    parentSlug: "restaurants-en",
  },
  {
    name: "Asian & Chinese",
    slug: "asian-chinese-en",
    parentSlug: "restaurants-en",
  },

  {
    name: "Grocery",
    slug: "grocery",
    directoryType: "food-drink",
    isParent: true,
  },
  {
    name: "Produce",
    slug: "produce-en",
    directoryType: "food-drink",
    isParent: true,
  },

  // ====================
  // HEALTH & WELLNESS
  // ====================
  {
    name: "Alternative & Therapy",
    slug: "alternative-therapy-en",
    directoryType: "health-wellness",
    isParent: true,
  },
  {
    name: "Chiropractors",
    slug: "chiropractors-en",
    parentSlug: "alternative-therapy-en",
  },
  {
    name: "Mental Health Services",
    slug: "mental-health-services-en",
    parentSlug: "alternative-therapy-en",
  },
  {
    name: "Physical Therapy",
    slug: "physical-therapy-en",
    parentSlug: "alternative-therapy-en",
  },

  {
    name: "Beauty & Spas",
    slug: "beauty-spas-en",
    directoryType: "health-wellness",
    isParent: true,
  },
  { name: "Hair Salons", slug: "hair-salons-en", parentSlug: "beauty-spas-en" },
  {
    name: "Massage Therapy",
    slug: "massage-therapy-en",
    parentSlug: "beauty-spas-en",
  },
  {
    name: "Med Spas & Weight Loss",
    slug: "med-spas-weight-loss-en",
    parentSlug: "beauty-spas-en",
  },
  { name: "Nail Salons", slug: "nail-salons-en", parentSlug: "beauty-spas-en" },

  {
    name: "Fitness & Sports",
    slug: "fitness-sports-en",
    directoryType: "health-wellness",
    isParent: true,
  },
  {
    name: "Gyms & Health Clubs",
    slug: "gyms-health-clubs-en",
    parentSlug: "fitness-sports-en",
  },
  { name: "Pilates", slug: "pilates-en", parentSlug: "fitness-sports-en" },
  {
    name: "Swim Schools & Recreation",
    slug: "swim-schools-recreation-en",
    parentSlug: "fitness-sports-en",
  },
  { name: "Yoga", slug: "yoga-en", parentSlug: "fitness-sports-en" },

  {
    name: "Medical & Dental",
    slug: "medical-dental-en",
    directoryType: "health-wellness",
    isParent: true,
  },
  {
    name: "Dentists & Orthodontics",
    slug: "dentists-orthodontics-en",
    parentSlug: "medical-dental-en",
  },
  {
    name: "Optometrists/Eye Care",
    slug: "optometrists-eye-care-en",
    parentSlug: "medical-dental-en",
  },
  {
    name: "Primary Care & Doctors",
    slug: "primary-care-doctors-en",
    parentSlug: "medical-dental-en",
  },
  {
    name: "Urgent Care",
    slug: "urgent-care-en",
    parentSlug: "medical-dental-en",
  },

  // ====================
  // HOME & LOCAL SERVICES
  // ====================
  {
    name: "Auto & Transport",
    slug: "auto-transport-en",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Auto Repair & Mechanics",
    slug: "auto-repair-mechanics-en",
    parentSlug: "auto-transport-en",
  },
  {
    name: "Car Wash & Detailing",
    slug: "car-wash-detailing-en",
    parentSlug: "auto-transport-en",
  },

  {
    name: "Contractors & Repair",
    slug: "contractors-repair-en",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Electricians",
    slug: "electricians-en",
    parentSlug: "contractors-repair-en",
  },
  {
    name: "Handyman Services",
    slug: "handyman-services-en",
    parentSlug: "contractors-repair-en",
  },
  {
    name: "HVAC & AC Repair",
    slug: "hvac-ac-repair-en",
    parentSlug: "contractors-repair-en",
  },
  {
    name: "Plumbers",
    slug: "plumbers-en",
    parentSlug: "contractors-repair-en",
  },
  {
    name: "Roofing Contractors",
    slug: "roofing-contractors-en",
    parentSlug: "contractors-repair-en",
  },

  {
    name: "Home & Property",
    slug: "home-property-en",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Cleaning & Pressure Washing",
    slug: "cleaning-pressure-washing-en",
    parentSlug: "home-property-en",
  },
  {
    name: "Hurricane Shutters & Windows",
    slug: "shutters-windows-en",
    parentSlug: "home-property-en",
  },
  {
    name: "Landscaping & Lawn Care",
    slug: "landscaping-lawn-care-en",
    parentSlug: "home-property-en",
  },
  {
    name: "Marine & Boat Services",
    slug: "marine-boat-services-en",
    parentSlug: "home-property-en",
  },
  {
    name: "Pool Services",
    slug: "pool-services-en",
    parentSlug: "home-property-en",
  },

  {
    name: "Pet Services",
    slug: "pet-services-en",
    directoryType: "home-local-services",
    isParent: true,
  },
  { name: "Boarding", slug: "boarding-en", parentSlug: "pet-services-en" },
  {
    name: "Pet Grooming",
    slug: "pet-grooming-en",
    parentSlug: "pet-services-en",
  },
  {
    name: "Veterinarians",
    slug: "veterinarians-en",
    parentSlug: "pet-services-en",
  },

  {
    name: "Real Estate",
    slug: "real-estate-en",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Apartments & Property Mgmt",
    slug: "apartments-property-mgmt-en",
    parentSlug: "real-estate-en",
  },
  {
    name: "Realtors & Agents",
    slug: "realtors-en",
    parentSlug: "real-estate-en",
  },
];

export function getLocalizedUrl(path, locale) {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}
