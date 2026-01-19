/**
 * Trade-Specific Sample Invoices
 * Provides realistic sample invoice line items for each trade
 * Used to create demo invoices when users first select their trade
 */

export interface SampleLineItem {
  description: string;
  price: number;
  quantity: number;
}

export interface TradeSample {
  clientName: string;
  items: SampleLineItem[];
  notes?: string;
}

// Sample invoices for each trade - extremely relevant to each industry
export const TRADE_SAMPLES: Record<string, TradeSample> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL
  // ═══════════════════════════════════════════════════════════════════════════
  carpenter: {
    clientName: "Maria Rodriguez",
    items: [
      { description: "Custom oak kitchen cabinets (8 units)", price: 4800, quantity: 1 },
      { description: "Crown molding installation - living room", price: 650, quantity: 1 },
      { description: "Built-in bookshelf with adjustable shelves", price: 1200, quantity: 1 },
      { description: "Door frame repair and trim work", price: 350, quantity: 1 },
    ],
    notes: "All materials included. Oak sourced from local supplier.",
  },

  general: {
    clientName: "Johnson Family",
    items: [
      { description: "Bathroom remodel - complete gut and rebuild", price: 8500, quantity: 1 },
      { description: "Permit fees and inspections", price: 450, quantity: 1 },
      { description: "New vanity and fixtures installation", price: 1200, quantity: 1 },
      { description: "Tile work - floor and shower walls", price: 2400, quantity: 1 },
    ],
    notes: "Project includes all labor and materials. 2-week timeline.",
  },

  handyman: {
    clientName: "Sarah Chen",
    items: [
      { description: "Ceiling fan installation", price: 85, quantity: 2 },
      { description: "Garbage disposal replacement", price: 175, quantity: 1 },
      { description: "Door lock replacement - deadbolt upgrade", price: 120, quantity: 1 },
      { description: "Drywall patch and paint - bedroom", price: 150, quantity: 1 },
      { description: "Caulking - bathroom and kitchen", price: 95, quantity: 1 },
    ],
    notes: "Half-day service call. Materials included.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERIOR
  // ═══════════════════════════════════════════════════════════════════════════
  appliance_repair: {
    clientName: "Thompson Residence",
    items: [
      { description: "Refrigerator compressor diagnosis and repair", price: 285, quantity: 1 },
      { description: "Replacement compressor unit", price: 420, quantity: 1 },
      { description: "Refrigerant recharge", price: 95, quantity: 1 },
      { description: "Service call fee", price: 75, quantity: 1 },
    ],
    notes: "90-day warranty on parts and labor.",
  },

  cabinet_kitchen_bath: {
    clientName: "Williams Home",
    items: [
      { description: "Kitchen cabinet refacing - shaker style", price: 6200, quantity: 1 },
      { description: "Soft-close hinges upgrade (24 doors)", price: 480, quantity: 1 },
      { description: "New drawer slides - full extension", price: 320, quantity: 1 },
      { description: "Granite countertop installation", price: 3800, quantity: 1 },
    ],
    notes: "10-year warranty on cabinets. Color: Arctic White.",
  },

  drywall: {
    clientName: "New Construction LLC",
    items: [
      { description: "Drywall installation - 2,400 sq ft", price: 4800, quantity: 1 },
      { description: "Taping and mudding - level 4 finish", price: 2400, quantity: 1 },
      { description: "Ceiling texture - knockdown pattern", price: 1200, quantity: 1 },
      { description: "Corner bead installation", price: 350, quantity: 1 },
    ],
    notes: "Materials included. Ready for paint upon completion.",
  },

  flooring: {
    clientName: "Garcia Residence",
    items: [
      { description: "Hardwood floor installation - 800 sq ft", price: 4800, quantity: 1 },
      { description: "Red oak hardwood (select grade)", price: 3200, quantity: 1 },
      { description: "Floor preparation and leveling", price: 600, quantity: 1 },
      { description: "Baseboard removal and reinstall", price: 400, quantity: 1 },
      { description: "Stain and 3-coat polyurethane finish", price: 1200, quantity: 1 },
    ],
    notes: "Dust containment included. Allow 48 hrs cure time.",
  },

  insulation: {
    clientName: "Energy Efficient Homes",
    items: [
      { description: "Attic blown-in insulation - R-49", price: 2800, quantity: 1 },
      { description: "Air sealing - attic penetrations", price: 650, quantity: 1 },
      { description: "Batt insulation - crawl space", price: 1400, quantity: 1 },
      { description: "Vapor barrier installation", price: 800, quantity: 1 },
    ],
    notes: "Meets current energy code. Rebate eligible.",
  },

  painter: {
    clientName: "Anderson Family",
    items: [
      { description: "Interior painting - 4 bedrooms", price: 2400, quantity: 1 },
      { description: "Living room and dining room", price: 1200, quantity: 1 },
      { description: "Trim and door painting", price: 800, quantity: 1 },
      { description: "Premium paint - Benjamin Moore Regal", price: 650, quantity: 1 },
      { description: "Ceiling painting - flat white", price: 600, quantity: 1 },
    ],
    notes: "2 coats on walls, 1 coat primer + 2 coats on trim.",
  },

  tile_stone: {
    clientName: "Martinez Remodel",
    items: [
      { description: "Bathroom floor tile - 12x24 porcelain", price: 1800, quantity: 1 },
      { description: "Shower wall tile - subway pattern", price: 2200, quantity: 1 },
      { description: "Custom shower niche installation", price: 350, quantity: 1 },
      { description: "Waterproofing membrane - Kerdi system", price: 600, quantity: 1 },
      { description: "Grout sealing", price: 150, quantity: 1 },
    ],
    notes: "Tile material provided by homeowner. Labor only.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERIOR
  // ═══════════════════════════════════════════════════════════════════════════
  concrete: {
    clientName: "Peterson Property",
    items: [
      { description: "Driveway replacement - 600 sq ft", price: 5400, quantity: 1 },
      { description: "Demolition and haul-away", price: 1200, quantity: 1 },
      { description: "Rebar reinforcement grid", price: 450, quantity: 1 },
      { description: "Broom finish with control joints", price: 300, quantity: 1 },
      { description: "Concrete sealer application", price: 350, quantity: 1 },
    ],
    notes: "4\" thick with 6x6 wire mesh. 28-day cure time.",
  },

  deck_builder: {
    clientName: "Outdoor Living Co.",
    items: [
      { description: "Composite deck - 400 sq ft", price: 12000, quantity: 1 },
      { description: "Trex Transcend decking material", price: 4800, quantity: 1 },
      { description: "Aluminum railing system - 60 linear ft", price: 3600, quantity: 1 },
      { description: "Built-in bench seating", price: 1200, quantity: 1 },
      { description: "Permit and engineering", price: 500, quantity: 1 },
    ],
    notes: "25-year material warranty. Color: Havana Gold.",
  },

  fencing: {
    clientName: "Miller Property",
    items: [
      { description: "Cedar privacy fence - 150 linear ft", price: 6750, quantity: 1 },
      { description: "6ft dog-ear panels", price: 3000, quantity: 1 },
      { description: "4x4 treated posts with concrete footings", price: 1200, quantity: 1 },
      { description: "Walk-through gate with hardware", price: 450, quantity: 1 },
      { description: "Double drive gate - 8ft opening", price: 850, quantity: 1 },
    ],
    notes: "Natural cedar, no stain. Optional staining available.",
  },

  garage_door: {
    clientName: "Henderson Home",
    items: [
      { description: "Insulated steel garage door - 16x7", price: 1800, quantity: 1 },
      { description: "LiftMaster belt drive opener", price: 450, quantity: 1 },
      { description: "Smart home integration kit", price: 125, quantity: 1 },
      { description: "Old door removal and disposal", price: 150, quantity: 1 },
      { description: "Weather stripping package", price: 85, quantity: 1 },
    ],
    notes: "R-16 insulation value. Includes 2 remotes and keypad.",
  },

  gutters: {
    clientName: "Clark Residence",
    items: [
      { description: "Seamless aluminum gutters - 180 linear ft", price: 2160, quantity: 1 },
      { description: "Downspouts with extensions (6 units)", price: 480, quantity: 1 },
      { description: "Gutter guards - micro mesh", price: 1080, quantity: 1 },
      { description: "Old gutter removal and disposal", price: 250, quantity: 1 },
    ],
    notes: "Color matched to fascia. Lifetime warranty on guards.",
  },

  landscaper: {
    clientName: "New Home Landscaping",
    items: [
      { description: "Lawn installation - 3,000 sq ft sod", price: 2700, quantity: 1 },
      { description: "Irrigation system - 6 zones", price: 3200, quantity: 1 },
      { description: "Shrub and tree planting (15 plants)", price: 1800, quantity: 1 },
      { description: "Mulch beds - 8 cubic yards", price: 560, quantity: 1 },
      { description: "Landscape lighting - 12 fixtures", price: 1400, quantity: 1 },
    ],
    notes: "Includes 90-day plant warranty. Irrigation winterization extra.",
  },

  masonry: {
    clientName: "Historic Restoration Inc.",
    items: [
      { description: "Brick repointing - 200 sq ft", price: 2400, quantity: 1 },
      { description: "Chimney rebuild - top 3 feet", price: 1800, quantity: 1 },
      { description: "New chimney cap - stainless steel", price: 350, quantity: 1 },
      { description: "Brick cleaning and sealing", price: 600, quantity: 1 },
    ],
    notes: "Type S mortar to match existing. Color-matched to original.",
  },

  paver: {
    clientName: "Backyard Dreams",
    items: [
      { description: "Paver patio installation - 500 sq ft", price: 6500, quantity: 1 },
      { description: "Cambridge Pavingstones - Ledgestone", price: 3000, quantity: 1 },
      { description: "Base preparation - gravel and sand", price: 1200, quantity: 1 },
      { description: "Soldier course border", price: 800, quantity: 1 },
      { description: "Polymeric sand and sealer", price: 450, quantity: 1 },
    ],
    notes: "Includes proper drainage slope. Lifetime warranty on pavers.",
  },

  pool_service: {
    clientName: "Sunshine Pools",
    items: [
      { description: "Pool opening service", price: 350, quantity: 1 },
      { description: "Chemical balancing and shock treatment", price: 125, quantity: 1 },
      { description: "Filter cleaning and inspection", price: 175, quantity: 1 },
      { description: "Monthly maintenance plan (3 months)", price: 450, quantity: 1 },
    ],
    notes: "Chemicals included in monthly plan. Weekly visits.",
  },

  pressure_washing: {
    clientName: "Spring Clean Properties",
    items: [
      { description: "House wash - 2 story vinyl siding", price: 450, quantity: 1 },
      { description: "Driveway and walkway cleaning", price: 275, quantity: 1 },
      { description: "Deck cleaning and brightening", price: 225, quantity: 1 },
      { description: "Patio furniture cleaning", price: 75, quantity: 1 },
    ],
    notes: "Soft wash method for siding. Safe for plants.",
  },

  roofer: {
    clientName: "Wilson Home",
    items: [
      { description: "Complete roof replacement - 28 squares", price: 11200, quantity: 1 },
      { description: "GAF Timberline HDZ shingles", price: 5600, quantity: 1 },
      { description: "Ice and water shield - valleys and edges", price: 800, quantity: 1 },
      { description: "New roof vents (4 units)", price: 400, quantity: 1 },
      { description: "Tear-off and disposal", price: 2100, quantity: 1 },
    ],
    notes: "50-year warranty. GAF Golden Pledge coverage included.",
  },

  siding: {
    clientName: "Exterior Makeover",
    items: [
      { description: "James Hardie fiber cement siding - 1,800 sq ft", price: 14400, quantity: 1 },
      { description: "House wrap installation", price: 1200, quantity: 1 },
      { description: "Trim and fascia replacement", price: 2800, quantity: 1 },
      { description: "Old siding removal and disposal", price: 1800, quantity: 1 },
    ],
    notes: "Color: Arctic White. 30-year warranty. Primed and ready.",
  },

  stucco: {
    clientName: "Mediterranean Homes",
    items: [
      { description: "Stucco application - 1,500 sq ft", price: 9750, quantity: 1 },
      { description: "Wire lath and scratch coat", price: 2250, quantity: 1 },
      { description: "Color coat - Santa Fe Tan", price: 1500, quantity: 1 },
      { description: "Crack repair and patching", price: 650, quantity: 1 },
    ],
    notes: "3-coat system. Elastomeric finish for flexibility.",
  },

  windows_doors: {
    clientName: "Energy Upgrade Program",
    items: [
      { description: "Double-hung vinyl windows (8 units)", price: 4800, quantity: 1 },
      { description: "Fiberglass entry door with sidelights", price: 2400, quantity: 1 },
      { description: "Sliding patio door - 6ft", price: 1800, quantity: 1 },
      { description: "Installation labor", price: 2400, quantity: 1 },
      { description: "Old window disposal", price: 300, quantity: 1 },
    ],
    notes: "Low-E glass, argon filled. ENERGY STAR certified.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MECHANICAL & SPECIALTY
  // ═══════════════════════════════════════════════════════════════════════════
  electrician: {
    clientName: "Brown Residence",
    items: [
      { description: "200 amp panel upgrade", price: 2200, quantity: 1 },
      { description: "Whole-house surge protector", price: 350, quantity: 1 },
      { description: "EV charger installation - Level 2", price: 850, quantity: 1 },
      { description: "Permit and inspection fees", price: 175, quantity: 1 },
    ],
    notes: "Includes load calculation. Up to code with arc-fault breakers.",
  },

  glass_glazier: {
    clientName: "Storefront Solutions",
    items: [
      { description: "Commercial storefront glass replacement", price: 1200, quantity: 1 },
      { description: "Tempered safety glass - 1/4\"", price: 650, quantity: 1 },
      { description: "Emergency board-up service", price: 250, quantity: 1 },
      { description: "New weatherstripping and caulk", price: 125, quantity: 1 },
    ],
    notes: "24-hour emergency service available. Glass warranty included.",
  },

  hvac: {
    clientName: "Davis Family",
    items: [
      { description: "16 SEER AC unit installation - 3 ton", price: 4500, quantity: 1 },
      { description: "Gas furnace - 80,000 BTU", price: 2800, quantity: 1 },
      { description: "New ductwork modifications", price: 1200, quantity: 1 },
      { description: "Smart thermostat - Ecobee", price: 350, quantity: 1 },
      { description: "Refrigerant line set", price: 400, quantity: 1 },
    ],
    notes: "10-year parts warranty. Annual maintenance plan available.",
  },

  locksmith: {
    clientName: "Secure Homes LLC",
    items: [
      { description: "High-security deadbolt installation", price: 185, quantity: 3 },
      { description: "Smart lock - Schlage Encode", price: 280, quantity: 1 },
      { description: "Re-key existing locks (5 locks)", price: 125, quantity: 1 },
      { description: "Emergency lockout service", price: 95, quantity: 1 },
    ],
    notes: "All locks keyed alike. Bump and pick resistant.",
  },

  plumber: {
    clientName: "Taylor Home",
    items: [
      { description: "Water heater replacement - 50 gallon", price: 1400, quantity: 1 },
      { description: "Expansion tank installation", price: 175, quantity: 1 },
      { description: "New water supply lines", price: 225, quantity: 1 },
      { description: "Old unit disposal", price: 75, quantity: 1 },
      { description: "Permit fee", price: 85, quantity: 1 },
    ],
    notes: "Bradford White unit. 6-year warranty. Same-day service.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER
  // ═══════════════════════════════════════════════════════════════════════════
  other: {
    clientName: "Sample Customer",
    items: [
      { description: "Service call", price: 150, quantity: 1 },
      { description: "Labor - 4 hours", price: 400, quantity: 1 },
      { description: "Materials", price: 250, quantity: 1 },
    ],
    notes: "Thank you for your business!",
  },
};

/**
 * Get sample invoice data for a specific trade
 * Returns null if trade is not found
 */
export function getSampleInvoiceForTrade(tradeId: string): TradeSample | null {
  return TRADE_SAMPLES[tradeId] || null;
}

/**
 * Calculate total for a sample invoice
 */
export function calculateSampleTotal(sample: TradeSample): number {
  return sample.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
