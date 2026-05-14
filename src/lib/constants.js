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
    slug: "bars-nightlife",
    directoryType: "food-drink",
    isParent: true,
  },
  { name: "Breweries", slug: "breweries", parentSlug: "bars-nightlife" },
  {
    name: "Pubs & Grills",
    slug: "pubs-grills",
    parentSlug: "bars-nightlife",
  },
  {
    name: "Sports Bars",
    slug: "sports-bars",
    parentSlug: "bars-nightlife",
  },
  {
    name: "Wine & Cocktail Bars",
    slug: "wine-cocktail-bars",
    parentSlug: "bars-nightlife",
  },

  {
    name: "Cafes & Bakeries",
    slug: "cafes-bakeries",
    directoryType: "food-drink",
    isParent: true,
  },
  { name: "Bakeries", slug: "bakeries", parentSlug: "cafes-bakeries" },
  { name: "Boba", slug: "boba", parentSlug: "cafes-bakeries" },
  {
    name: "Coffee & Tea",
    slug: "coffee-tea",
    parentSlug: "cafes-bakeries",
  },
  { name: "Ice Cream", slug: "ice-cream", parentSlug: "cafes-bakeries" },
  { name: "Juice", slug: "juice", parentSlug: "cafes-bakeries" },

  {
    name: "Restaurants",
    slug: "restaurants",
    directoryType: "food-drink",
    isParent: true,
  },
  { name: "Pizza", slug: "pizza", parentSlug: "restaurants" },
  { name: "Seafood", slug: "seafood", parentSlug: "restaurants" },
  {
    name: "American (New & Traditional)",
    slug: "american-food",
    parentSlug: "restaurants",
  },
  {
    name: "Mexican & Latin",
    slug: "mexican-latin",
    parentSlug: "restaurants",
  },
  {
    name: "Asian & Chinese",
    slug: "asian-chinese",
    parentSlug: "restaurants",
  },

  {
    name: "Grocery",
    slug: "grocery",
    directoryType: "food-drink",
    isParent: true,
  },
  {
    name: "Produce",
    slug: "produce",
    directoryType: "food-drink",
    isParent: true,
  },

  // ====================
  // HEALTH & WELLNESS
  // ====================
  {
    name: "Alternative & Therapy",
    slug: "alternative-therapy",
    directoryType: "health-wellness",
    isParent: true,
  },
  {
    name: "Chiropractors",
    slug: "chiropractors",
    parentSlug: "alternative-therapy",
  },
  {
    name: "Mental Health Services",
    slug: "mental-health-services",
    parentSlug: "alternative-therapy",
  },
  {
    name: "Physical Therapy",
    slug: "physical-therapy",
    parentSlug: "alternative-therapy",
  },

  {
    name: "Beauty & Spas",
    slug: "beauty-spas",
    directoryType: "health-wellness",
    isParent: true,
  },
  { name: "Hair Salons", slug: "hair-salons", parentSlug: "beauty-spas" },
  {
    name: "Massage Therapy",
    slug: "massage-therapy",
    parentSlug: "beauty-spas",
  },
  {
    name: "Med Spas & Weight Loss",
    slug: "med-spas-weight-loss",
    parentSlug: "beauty-spas",
  },
  { name: "Nail Salons", slug: "nail-salons", parentSlug: "beauty-spas" },

  {
    name: "Fitness & Sports",
    slug: "fitness-sports",
    directoryType: "health-wellness",
    isParent: true,
  },
  {
    name: "Gyms & Health Clubs",
    slug: "gyms-health-clubs",
    parentSlug: "fitness-sports",
  },
  { name: "Pilates", slug: "pilates", parentSlug: "fitness-sports" },
  {
    name: "Swim Schools & Recreation",
    slug: "swim-schools-recreation",
    parentSlug: "fitness-sports",
  },
  { name: "Yoga", slug: "yoga", parentSlug: "fitness-sports" },

  {
    name: "Medical & Dental",
    slug: "medical-dental",
    directoryType: "health-wellness",
    isParent: true,
  },
  {
    name: "Dentists & Orthodontics",
    slug: "dentists-orthodontics",
    parentSlug: "medical-dental",
  },
  {
    name: "Optometrists/Eye Care",
    slug: "optometrists-eye-care",
    parentSlug: "medical-dental",
  },
  {
    name: "Primary Care & Doctors",
    slug: "primary-care-doctors",
    parentSlug: "medical-dental",
  },
  {
    name: "Urgent Care",
    slug: "urgent-care",
    parentSlug: "medical-dental",
  },

  // ====================
  // HOME & LOCAL SERVICES
  // ====================
  {
    name: "Auto & Transport",
    slug: "auto-transport",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Auto Repair & Mechanics",
    slug: "auto-repair-mechanics",
    parentSlug: "auto-transport",
  },
  {
    name: "Car Wash & Detailing",
    slug: "car-wash-detailing",
    parentSlug: "auto-transport",
  },

  {
    name: "Contractors & Repair",
    slug: "contractors-repair",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Electricians",
    slug: "electricians",
    parentSlug: "contractors-repair",
  },
  {
    name: "Handyman Services",
    slug: "handyman-services",
    parentSlug: "contractors-repair",
  },
  {
    name: "HVAC & AC Repair",
    slug: "hvac-ac-repair",
    parentSlug: "contractors-repair",
  },
  {
    name: "Plumbers",
    slug: "plumbers",
    parentSlug: "contractors-repair",
  },
  {
    name: "Roofing Contractors",
    slug: "roofing-contractors",
    parentSlug: "contractors-repair",
  },

  {
    name: "Home & Property",
    slug: "home-property",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Cleaning & Pressure Washing",
    slug: "cleaning-pressure-washing",
    parentSlug: "home-property",
  },
  {
    name: "Hurricane Shutters & Windows",
    slug: "shutters-windows",
    parentSlug: "home-property",
  },
  {
    name: "Landscaping & Lawn Care",
    slug: "landscaping-lawn-care",
    parentSlug: "home-property",
  },
  {
    name: "Marine & Boat Services",
    slug: "marine-boat-services",
    parentSlug: "home-property",
  },
  {
    name: "Pool Services",
    slug: "pool-services",
    parentSlug: "home-property",
  },

  {
    name: "Pet Services",
    slug: "pet-services",
    directoryType: "home-local-services",
    isParent: true,
  },
  { name: "Boarding", slug: "boarding", parentSlug: "pet-services" },
  {
    name: "Pet Grooming",
    slug: "pet-grooming",
    parentSlug: "pet-services",
  },
  {
    name: "Veterinarians",
    slug: "veterinarians",
    parentSlug: "pet-services",
  },

  {
    name: "Real Estate",
    slug: "real-estate",
    directoryType: "home-local-services",
    isParent: true,
  },
  {
    name: "Apartments & Property Mgmt",
    slug: "apartments-property-mgmt",
    parentSlug: "real-estate",
  },
  {
    name: "Realtors & Agents",
    slug: "realtors-agencies",
    parentSlug: "real-estate",
  },
];

export function getLocalizedUrl(path, locale) {
  return path;
}
