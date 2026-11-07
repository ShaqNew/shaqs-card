export type DressCodeProfile =
  | "temple"
  | "rooftop"
  | "daytime"
  | "beach"
  | "transit";

export interface GarmentLink {
  id: string;
  label: string;
  url: string;
  imageUrl?: string;
  category?:
    | "Top"
    | "Bottom"
    | "One-Piece / Dress"
    | "Footwear"
    | "Accessory";
}

export interface WardrobeOutfit {
  id: string;
  title: string;
  owner: "shaq" | "naana" | "both";
  dressCode: DressCodeProfile;
  climateTag: string;
  notes?: string;
  garments: GarmentLink[];
  isDefault?: boolean;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  category:
    | "flight"
    | "hotel"
    | "transit"
    | "dining"
    | "culture"
    | "beach"
    | "spa"
    | "romance"
    | "custom";
  location?: string;
  mapUrl?: string;
  notes?: string;
  isLocked?: boolean;
  completed?: boolean;
  outfitId?: string;
}

export interface TripDay {
  dayNumber: number;
  dateIso: string;
  dateLabel: string;
  shortDate: string;
  phase: "outbound" | "bangkok" | "transfer" | "phuket" | "return";
  locationBadge: string;
  title: string;
  vibe: string;
  weatherSummary: string;
  accommodation?: string;
  defaultOutfitId?: string;
  defaultActivities: ItineraryActivity[];
  quickSuggestions?: {
    title: string;
    time: string;
    category: ItineraryActivity["category"];
    location?: string;
    notes?: string;
    bookingGuide?: string;
    serviceLinks?: { label: string; url: string }[];
  }[];
}

export interface PrepCheckItem {
  id: string;
  category: "immigration" | "money" | "documents";
  title: string;
  detail: string;
  assignee: "both" | "shaq" | "naana";
  urgentTag?: string;
}

export interface EssentialAppItem {
  id: string;
  name: string;
  category: "Mobility & Taxis" | "Connectivity" | "Navigation & Transit" | "Communication & Translation";
  icon: string;
  badge: string;
  description: string;
  proTip: string;
}

export interface PackingItem {
  id: string;
  category:
    | "Daytime & Temple Wear"
    | "Evening & Fine Dining"
    | "Resort & Beach (Phuket)"
    | "Health & Pharmacy"
    | "Toiletries & Sun Care"
    | "Electronics & Power"
    | "Carry-On & Documents";
  label: string;
  note?: string;
  forWho: "both" | "shaq" | "naana";
  essential?: boolean;
}

export interface PlannedExpense {
  id: string;
  title: string;
  category: "Dining" | "Spa & Wellness" | "Beach & Excursions" | "Transit & Cash" | "Birthday Treat";
  amountThb: number;
  city: "Bangkok" | "Phuket" | "Both";
  isBooked?: boolean;
}

export interface FoodSafetyGuideline {
  id: string;
  badge: string;
  title: string;
  guidelines: string[];
}

export const TRIP_METADATA = {
  title: "Thailand 2027: Naana's Birthday Escape",
  occasion: "Celebrating Naana's Birthday",
  leadPassenger: "Shaq Newell",
  partnerPassenger: "Naana Binfoh",
  startDateIso: "2027-02-04T16:40:00Z",
  landingDateIso: "2027-02-05T10:05:00Z", // 17:05 ICT
  tdacOpenDateIso: "2027-02-02T00:00:00Z", // 3 days before landing
  endDateIso: "2027-02-14T07:45:00Z",
  datesDisplay: "Thursday, 4 Feb 2027 – Sunday, 14 Feb 2027",
  nightsInThailand: 8,
  bangkokNights: 3,
  phuketNights: 5,
  exchangeRateBenchmark: 44.5, // 1 GBP = 44.50 THB
  accommodationBudgetMaxGbp: 1405.0,
  accommodationActualThb: 59304.26,
  accommodationActualGbp: 1332.35,
  accommodationSurplusGbp: 72.65,
  grandTotalGbp: 3051.9,
};

export const FLIGHT_BOOKINGS = [
  {
    id: "outbound-intl",
    direction: "Outbound International",
    airline: "Air Arabia",
    pnr: "6I8SOP",
    fareClass: "Ultimate Fare",
    farePerks: [
      "20kg Checked Baggage each",
      "10kg Hand Baggage each",
      "Seat Selection included",
      "Flight Flexibility",
      "Travel Insurance included",
    ],
    totalPaidDisplay: "£770.14",
    paymentMethod: "Visa ending in -1305",
    manageUrl: "https://www.airarabia.com/en/manage-booking",
    extraLinks: [
      { label: "London Gatwick Info", url: "https://www.gatwickairport.com" },
      { label: "Suvarnabhumi Airport (BKK)", url: "https://suvarnabhumi.airportthai.co.th" },
    ],
    layover: "Sharjah (SHJ) • 4h 00m transfer window",
    segments: [
      {
        flightNumber: "G9259",
        fromCode: "LGW",
        fromCity: "London Gatwick (North Terminal)",
        toCode: "SHJ",
        toCity: "Sharjah International",
        depDate: "Thu, 4 Feb 2027",
        depTime: "16:40 GMT",
        arrDate: "Fri, 5 Feb 2027 (+1)",
        arrTime: "03:50 GST",
        duration: "7h 10m",
      },
      {
        flightNumber: "G9816",
        fromCode: "SHJ",
        fromCity: "Sharjah International",
        toCode: "BKK",
        toCity: "Bangkok Suvarnabhumi",
        depDate: "Fri, 5 Feb 2027",
        depTime: "07:50 GST",
        arrDate: "Fri, 5 Feb 2027",
        arrTime: "17:05 ICT",
        duration: "6h 15m",
      },
    ],
  },
  {
    id: "domestic-bkk-hkt",
    direction: "Domestic Connection (Bangkok → Phuket)",
    airline: "Thai Vietjet Air",
    pnr: "2GXDQP",
    fareClass: "Eco Fare + Custom Add-ons (VZ306)",
    farePerks: [
      "Shaq: Seat 16A (Window) • 25kg Checked + 7kg Carry-on",
      "Naana: Seat 16B (Middle) • 30kg Checked + 7kg Carry-on",
      "Non-stop 1h 35m flight",
    ],
    totalPaidDisplay: "THB 6,443.48 (~£144.75)",
    paymentMethod: "Confirmed via 2C2P Payment Gateway",
    manageUrl: "https://www.vietjetair.com",
    extraLinks: [],
    layover: null,
    passengerDetails: [
      {
        name: "Shaq Newell",
        seat: "16A (Window)",
        checkedBag: "25 kg Checked Bag",
        cabinBag: "7 kg Carry-on",
      },
      {
        name: "Naana Binfoh",
        seat: "16B (Middle)",
        checkedBag: "30 kg Checked Bag",
        cabinBag: "7 kg Carry-on",
      },
    ],
    segments: [
      {
        flightNumber: "VZ306",
        fromCode: "BKK",
        fromCity: "Bangkok Suvarnabhumi (Domestic)",
        toCode: "HKT",
        toCity: "Phuket International",
        depDate: "Mon, 8 Feb 2027",
        depTime: "15:25 ICT",
        arrDate: "Mon, 8 Feb 2027",
        arrTime: "17:00 ICT",
        duration: "1h 35m",
      },
    ],
  },
  {
    id: "return-intl",
    direction: "Return International",
    airline: "Air Arabia",
    pnr: "6LDREI",
    fareClass: "Ultimate Fare",
    farePerks: [
      "20kg Checked Baggage each",
      "10kg Cabin Bag each",
      "Seat Selection included",
      "Travel Insurance included",
    ],
    totalPaidDisplay: "£804.66",
    paymentMethod: "Visa ending in -5053",
    manageUrl: "https://www.airarabia.com/en/manage-booking",
    extraLinks: [],
    layover: "Sharjah (SHJ) • 5h 35m transfer window",
    segments: [
      {
        flightNumber: "G9715",
        fromCode: "HKT",
        fromCity: "Phuket International",
        toCode: "SHJ",
        toCity: "Sharjah International",
        depDate: "Sat, 13 Feb 2027",
        depTime: "18:20 ICT",
        arrDate: "Sat, 13 Feb 2027",
        arrTime: "22:05 GST",
        duration: "6h 45m",
      },
      {
        flightNumber: "G9265",
        fromCode: "SHJ",
        fromCity: "Sharjah International",
        toCode: "LGW",
        toCity: "London Gatwick (North Terminal)",
        depDate: "Sun, 14 Feb 2027",
        depTime: "03:40 GST",
        arrDate: "Sun, 14 Feb 2027",
        arrTime: "07:45 GMT",
        duration: "8h 05m",
      },
    ],
  },
];

export const HOTEL_BOOKINGS = [
  {
    id: "shangri-la-bangkok",
    city: "Bangkok • Riverside",
    name: "Shangri-La Bangkok",
    bookingRef: "12891938794",
    dates: "Friday, 5 Feb 2027 – Monday, 8 Feb 2027",
    nights: 3,
    checkIn: "15:00 (Arrival post-flight ~19:30 on 5 Feb)",
    checkOut: "12:00 PM (8 Feb)",
    roomCategory: "Shangri-La Wing Deluxe King Room",
    totalThb: 19279.26,
    totalGbp: 433.15,
    paymentNote: "All taxes & 10% service charge included",
    address: "89 Soi Wat Suan Plu, New Road, Bangrak, Bangkok 10500, Thailand",
    thaiName: "โรงแรมแชงกรี-ลา กรุงเทพฯ (อาคารแชงกรี-ลา วิง)",
    thaiAddress:
      "89 ซอยวัดสวนพลู ถนนเจริญกรุง แขวงบางรัก เขตบางรัก กรุงเทพมหานคร 10500",
    thaiDirectionsNote:
      "อยู่ติดท่าเรือสาทร (ตากสิน) และสถานีรถไฟฟ้า BTS สะพานตากสิน กรุณาส่งที่ฝั่ง Shangri-La Wing",
    phone: "+66 2 236 7777",
    coordinates: "13.7203° N, 100.5142° E",
    mapUrl: "https://maps.google.com/?q=Shangri-La+Bangkok",
    highlights: [
      "Directly on the scenic Chao Phraya Riverfront",
      "Direct 2-minute foot connection to BTS Saphan Taksin Station (Silom Line) & Sathorn Central Pier",
      "Free hotel shuttle boat connecting Sathorn Pier to ICONSIAM & Asiatique",
      "Multiple riverfront swimming pools, world-class CHI Spa & 6 dining outlets",
    ],
    balanceDueThb: 0,
  },
  {
    id: "pavilions-phuket",
    city: "Phuket • Layan / Choeng Thale",
    name: "The Pavilions Phuket",
    bookingRef: "78165SH099776",
    dates: "Monday, 8 Feb 2027 – Saturday, 13 Feb 2027",
    nights: 5,
    checkIn: "15:00 (Arrival post-flight ~18:15 on 8 Feb)",
    checkOut: "12:00 PM (13 Feb)",
    roomCategory: "Deluxe Tropical View Suite (81 sqm)",
    roomDescription:
      "Spacious 81 sqm sanctuary with separate lounge/bar, luxury bathtub & romantic outdoor rain shower",
    totalThb: 40025.0,
    totalGbp: 899.2,
    prepaidThb: 38625.0,
    balanceDueThb: 1190.0,
    paymentNote:
      "Prepaid THB 38,625.00 via Red Dot Payment • Remaining Balance: THB 1,190.00 (Airport Transfer)",
    address: "31/1 Moo 6, Choeng Thale, Thalang District, Phuket 83110, Thailand",
    thaiName: "เดอะ พาวิลเลี่ยนส์ ภูเก็ต (The Pavilions Phuket)",
    thaiAddress:
      "31/1 หมู่ 6 ตำบลเชิงทะเล อำเภอถลาง จังหวัดภูเก็ต 83110",
    thaiDirectionsNote:
      "ตั้งอยู่บนเนินเขาหาดลายัน (Layan Beach) ตำบลเชิงทะเล อำเภอถลาง",
    phone: "+66 76 317 600",
    coordinates: "8.0215° N, 98.2982° E",
    mapUrl: "https://maps.google.com/?q=The+Pavilions+Phuket",
    highlights: [
      "Private Airport Arrival Transfer from Phuket Airport (HKT) directly to resort included",
      "Priority access & dining reservations at Firefly Pool & Restaurant",
      "Scheduled complimentary shuttle service down to tranquil Layan Beach",
      "Iconic hilltop sunset venue: 360 Bar + expansive freeform Firefly Pool & Pavilions Spa",
    ],
  },
];

export const FINANCIAL_MATRIX = [
  {
    component: "Outbound Flight (LGW → BKK)",
    currencyAmount: "£770.14",
    gbpEquivalent: 770.14,
    notes: "Visa (-1305) • Air Arabia Ultimate Fare • PNR 6I8SOP",
  },
  {
    component: "Bangkok Hotel (3 Nights)",
    currencyAmount: "THB 19,279.26",
    gbpEquivalent: 433.15,
    notes: "Shangri-La Bangkok • Confirmed ref 12891938794",
  },
  {
    component: "Domestic Flight (BKK → HKT)",
    currencyAmount: "THB 6,443.48",
    gbpEquivalent: 144.75,
    notes: "2C2P Gateway • Thai Vietjet VZ306 • PNR 2GXDQP",
  },
  {
    component: "Phuket Hotel (5 Nights + Transfer)",
    currencyAmount: "THB 40,025.00",
    gbpEquivalent: 899.2,
    notes: "Red Dot Payment • The Pavilions • Ref 78165SH099776",
  },
  {
    component: "Return Flight (HKT → LGW)",
    currencyAmount: "£804.66",
    gbpEquivalent: 804.66,
    notes: "Visa (-5053) • Air Arabia Ultimate Fare • PNR 6LDREI",
  },
];

export const TRIP_DAYS: TripDay[] = [
  {
    dayNumber: 0,
    dateIso: "2027-02-04",
    dateLabel: "Thursday, 4 February 2027",
    shortDate: "Thu 4 Feb",
    phase: "outbound",
    locationBadge: "London LGW → Sharjah SHJ",
    title: "Departure Day: The Birthday Escape Begins",
    vibe: "Airport champagne, stress-free Ultimate Fare perks & overnight flight east",
    weatherSummary: "London Cool → Tropical Bound",
    defaultOutfitId: "outfit-transit-lounge",
    defaultActivities: [
      {
        id: "d0-lgw-checkin",
        time: "13:30 GMT",
        title: "Arrive at London Gatwick (North Terminal)",
        subtitle: "Air Arabia Ultimate Fare Desk (PNR: 6I8SOP)",
        category: "transit",
        location: "LGW North Terminal",
        notes: "Drop 20kg checked bags each. Keep 10kg cabin bag + power banks in carry-on.",
        isLocked: true,
      },
      {
        id: "d0-flight-g9259",
        time: "16:40 GMT",
        title: "Flight G9259: London Gatwick (LGW) → Sharjah (SHJ)",
        subtitle: "Duration: 7h 10m • Lands 03:50 GST (+1 day)",
        category: "flight",
        location: "Gate TBD • LGW North",
        notes: "Air Arabia Ultimate Fare includes seat selection & travel insurance.",
        isLocked: true,
      },
    ],
    quickSuggestions: [
      {
        title: "Pre-Flight Birthday Toast at Gatwick North Lounge / Champagne Bar",
        time: "14:45 GMT",
        category: "romance",
        location: "LGW North Terminal",
        notes: "Kick off Naana's birthday celebration before boarding!",
        bookingGuide:
          "Pre-book No1 Lounges or Clubrooms (Gatwick North Terminal) 4–6 weeks ahead online for guaranteed entry, or walk straight up to Searcys Champagne Bar airside after security (no reservation needed).",
        serviceLinks: [
          {
            label: "No1 Lounges LGW",
            url: "https://no1lounges.com/lounges/london-gatwick",
          },
          {
            label: "Gatwick Lounges",
            url: "https://www.gatwickairport.com/at-the-airport/flying-out/lounges.html",
          },
        ],
      },
      {
        title: "Activate Thailand eSIM (Airalo / Nomad / Holafly) before takeoff",
        time: "15:30 GMT",
        category: "transit",
        notes: "Install eSIM profile so data connects immediately upon landing at BKK.",
        bookingGuide:
          "Purchase an 8–15 day Thailand eSIM (AIS or TrueMove 5G network) in the Airalo or Holafly app 24h before flying. Install the eSIM on airport Wi-Fi and switch on 'Data Roaming' for that line upon landing at BKK.",
        serviceLinks: [
          {
            label: "Airalo Thailand",
            url: "https://www.airalo.com/thailand-esim",
          },
          {
            label: "Holafly Thailand",
            url: "https://esim.holafly.com/esim-thailand/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 1,
    dateIso: "2027-02-05",
    dateLabel: "Friday, 5 February 2027",
    shortDate: "Fri 5 Feb",
    phase: "bangkok",
    locationBadge: "Bangkok • Chao Phraya Riverfront",
    title: "Touchdown in Bangkok & Shangri-La Check-In",
    vibe: "Warm tropical evening breeze on the Chao Phraya River",
    weatherSummary: "Bangkok: 33°C Day / 24°C Night • Warm & Dry",
    accommodation: "Shangri-La Bangkok (Deluxe King Room)",
    defaultOutfitId: "outfit-bkk-daytime-linen",
    defaultActivities: [
      {
        id: "d1-shj-layover",
        time: "03:50 – 07:50 GST",
        title: "Sharjah (SHJ) Transit Layover (4h 00m)",
        subtitle: "Connect to Bangkok Gate",
        category: "transit",
        location: "Sharjah International Airport (SHJ)",
        isLocked: true,
      },
      {
        id: "d1-flight-g9816",
        time: "07:50 GST",
        title: "Flight G9816: Sharjah (SHJ) → Bangkok Suvarnabhumi (BKK)",
        subtitle: "Duration: 6h 15m • Lands 17:05 ICT Local Time",
        category: "flight",
        location: "Suvarnabhumi Airport (BKK)",
        isLocked: true,
      },
      {
        id: "d1-bkk-arrival",
        time: "17:05 – 18:15 ICT",
        title: "Clear BKK Immigration, Bags & SuperRich Exchange",
        subtitle: "Have TDAC QR code ready • Exchange GBP cash at SuperRich (Floor B)",
        category: "transit",
        location: "BKK Floor B (Airport Rail Link Level) / Level 4 Door 4",
        notes: "Head to Level 1 for public taxi kiosk or Level 4 Door 4 for Grab pickup (~400–500 THB + Sirat Expressway tolls).",
        isLocked: true,
      },
      {
        id: "d1-shangrila-checkin",
        time: "19:30 ICT",
        title: "Check-in at Shangri-La Bangkok",
        subtitle: "Shangri-La Wing Deluxe King Room • Ref: 12891938794",
        category: "hotel",
        location: "89 Soi Wat Suan Plu, Bangrak, Bangkok",
        mapUrl: "https://maps.google.com/?q=Shangri-La+Bangkok",
        notes: "Unpack, freshen up, and step out onto the illuminated riverfront promenade.",
        isLocked: true,
      },
    ],
    quickSuggestions: [
      {
        title: "Free Hotel Shuttle Boat from Sathorn Pier to ICONSIAM & SookSiam",
        time: "20:15 ICT",
        category: "dining",
        location: "ICONSIAM Riverfront",
        notes: "Explore the glamorous riverfront mall & indoor floating market for a relaxed first-night dinner.",
        bookingGuide:
          "No advance boat ticket required. Walk 2 mins from Shangri-La to Sathorn Pier—free shuttle boats to ICONSIAM run every 15–20 mins until 22:00. For riverside terrace dining at ICONSIAM, ask Shangri-La Concierge to book a table upon check-in.",
        serviceLinks: [
          {
            label: "ICONSIAM Dining",
            url: "https://www.iconsiam.com/en/dining",
          },
        ],
      },
      {
        title: "Riverside Nightcap at Salathip or Lobby Lounge",
        time: "22:00 ICT",
        category: "romance",
        location: "Shangri-La Bangkok Riverfront",
        notes: "Watch the lit dinner barges glide along the Chao Phraya.",
        bookingGuide:
          "On-site at Shangri-La Bangkok. Walk-ins are welcome for nightcaps at the Lobby Lounge; for an outdoor riverside teak pavilion table at Salathip Thai Restaurant, reserve via Shangri-La dining or hotel concierge.",
        serviceLinks: [
          {
            label: "Shangri-La Dining",
            url: "https://www.shangri-la.com/bangkok/shangrila/dining/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 2,
    dateIso: "2027-02-06",
    dateLabel: "Saturday, 6 February 2027",
    shortDate: "Sat 6 Feb",
    phase: "bangkok",
    locationBadge: "Bangkok • Temples & Skyscrapers",
    title: "Golden Temples by River & Sky-High Romance",
    vibe: "Ancient royal splendour by day, glittering rooftop glamour by night",
    weatherSummary: "Bangkok: 33°C Sunny • Evening 24°C",
    accommodation: "Shangri-La Bangkok (Night 2 of 3)",
    defaultOutfitId: "outfit-temple-sanctuary",
    defaultActivities: [
      {
        id: "d2-morning-river",
        time: "09:00 ICT",
        title: "Chao Phraya Express Boat from Sathorn Central Pier",
        subtitle: "2-minute walk from Shangri-La • Scenic river hop north",
        category: "culture",
        location: "Sathorn Pier → Tha Tien / Wat Arun",
        notes: "Remember Temple Dress Code: shoulders & knees covered, slip-on shoes, linen shirt/sarong in daypack!",
        outfitId: "outfit-temple-sanctuary",
      },
    ],
    quickSuggestions: [
      {
        title: "Explore Wat Pho (Reclining Buddha) & Grand Palace",
        time: "09:30 ICT",
        category: "culture",
        location: "Rattanakosin Island",
        notes: "Go early before midday heat; pack water & electrolytes.",
        bookingGuide:
          "Take the Chao Phraya Express Boat (~16–30 THB cash) from Sathorn Pier to Tha Chang (N9) for Grand Palace (500 THB entry; buy at gate or online 24h ahead) and Tha Tien (N8) for Wat Pho (300 THB cash at gate). Strict temple dress code applies.",
        serviceLinks: [
          {
            label: "Grand Palace Tickets",
            url: "https://www.royalgrandpalace.th/en/home",
          },
          {
            label: "River Boat Guide",
            url: "https://www.chaophrayaexpressboat.com/?lang=en",
          },
        ],
      },
      {
        title: "Cross-River Ferry to Wat Arun (Temple of Dawn)",
        time: "11:45 ICT",
        category: "culture",
        location: "Wat Arun",
        notes: "Stunning porcelain spires—great spot for couples photos!",
        bookingGuide:
          "No reservation required. Board the 5 THB cross-river ferry from Tha Tien Pier (outside Wat Pho) directly across to Wat Arun (200 THB cash entry at gate).",
        serviceLinks: [
          {
            label: "Wat Arun Map",
            url: "https://maps.google.com/?q=Wat+Arun+Bangkok",
          },
        ],
      },
      {
        title: "Afternoon Poolside Recharge at Shangri-La River Pool",
        time: "14:30 ICT",
        category: "spa",
        location: "Shangri-La Bangkok",
        notes: "Escape the peak afternoon heat with iced coconuts by the river.",
        bookingGuide:
          "Complimentary for Shangri-La guests—no booking needed. Simply give your room number at the riverside pool deck for loungers and towel service.",
      },
      {
        title: "Sunset Cocktails & Fine Dining at a Bangkok Rooftop (Mahanakhon / Lebua / Vertigo)",
        time: "17:45 ICT",
        category: "romance",
        location: "Silom / Sathon",
        notes: "Smart casual dress code strictly enforced (men: collared linen shirt, trousers & closed-toe loafers/smart trainers).",
        bookingGuide:
          "Book 2–4 weeks in advance for a sunset table (~17:30 arrival). Top nearby rooftops: SkyBeach at The Standard Mahanakhon (highest in Bangkok), Vertigo & Moon Bar at Banyan Tree, or Sky Bar at Lebua (5-min walk from Shangri-La).",
        serviceLinks: [
          {
            label: "Mahanakhon SkyBeach",
            url: "https://www.standardhotels.com/bangkok/features/sky-beach",
          },
          {
            label: "Vertigo Banyan Tree",
            url: "https://www.banyantree.com/thailand/bangkok/dining/vertigo",
          },
          {
            label: "Lebua Sky Bar",
            url: "https://lebua.com/restaurants/sky-bar/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 3,
    dateIso: "2027-02-07",
    dateLabel: "Sunday, 7 February 2027",
    shortDate: "Sun 7 Feb",
    phase: "bangkok",
    locationBadge: "Bangkok • Spa, Siam & Nightlife",
    title: "Luxury Bangkok Indulgence & Farewell to the City",
    vibe: "BTS Skytrain adventures, world-class spa pampering & evening river romance",
    weatherSummary: "Bangkok: 34°C Sunny • Evening 25°C",
    accommodation: "Shangri-La Bangkok (Night 3 of 3)",
    defaultOutfitId: "outfit-rooftop-glamour",
    defaultActivities: [
      {
        id: "d3-bts-explore",
        time: "10:30 ICT",
        title: "BTS Saphan Taksin into Siam / Sukhumvit",
        subtitle: "Direct 2-minute walk from hotel to Silom Line",
        category: "custom",
        location: "Siam Paragon / CentralWorld / Talad Noi",
        notes: "Explore historic Talad Noi riverside alleyways or luxury cafés in Siam.",
      },
    ],
    quickSuggestions: [
      {
        title: "Couples Massage at CHI, The Spa at Shangri-La",
        time: "15:00 ICT",
        category: "spa",
        location: "Shangri-La Bangkok",
        notes: "Signature Thai aromatic massage before tomorrow's flight to Phuket.",
        bookingGuide:
          "Reserve 1–2 weeks ahead via the CHI Spa online portal or by emailing chi.slbk@shangri-la.com (quote hotel booking ref 12891938794 to request a private couples treatment suite).",
        serviceLinks: [
          {
            label: "Book CHI, The Spa",
            url: "https://www.shangri-la.com/bangkok/shangrila/health-leisure/chi-the-spa/",
          },
        ],
      },
      {
        title: "Evening Shuttle Boat to Asiatique The Riverfront or Chinatown (Yaowarat) Street Food",
        time: "19:30 ICT",
        category: "dining",
        location: "Asiatique / Yaowarat Road",
        notes: "Bring THB cash for Michelin-bib street food stalls or enjoy riverside Thai dining.",
        bookingGuide:
          "For Asiatique: take the free shuttle boat from Sathorn Pier (departs every 30 mins from 16:00). For Yaowarat (Chinatown): take Grab or MRT to Wat Mangkon Station—no booking needed for street food stalls (bring 1,000–2,000 THB cash).",
        serviceLinks: [
          {
            label: "Asiatique Info",
            url: "https://www.asiatiquethailand.com/en",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 4,
    dateIso: "2027-02-08",
    dateLabel: "Monday, 8 February 2027",
    shortDate: "Mon 8 Feb",
    phase: "transfer",
    locationBadge: "Bangkok BKK → Phuket HKT",
    title: "Island Transition Day: Touchdown in Tropical Phuket",
    vibe: "Seamless hop south to your 81 sqm hilltop suite & sunset drinks at 360 Bar",
    weatherSummary: "Phuket: 32°C Day / 25°C Night • Sea Breeze",
    accommodation: "The Pavilions Phuket (Deluxe Tropical View Suite)",
    defaultActivities: [
      {
        id: "d4-checkout-bkk",
        time: "12:00 ICT",
        title: "Check out from Shangri-La Bangkok",
        subtitle: "Settle any incidentals & prepare for airport transfer",
        category: "hotel",
        location: "Shangri-La Bangkok",
        isLocked: true,
      },
      {
        id: "d4-grab-to-bkk",
        time: "12:15 – 12:30 ICT",
        title: "Grab / Taxi to Suvarnabhumi Airport (BKK)",
        subtitle: "~45 min drive via Sirat Expressway",
        category: "transit",
        location: "BKK Domestic Terminal",
        isLocked: true,
      },
      {
        id: "d4-vietjet-bagdrop",
        time: "13:15 ICT",
        title: "Arrive BKK Domestic • Thai Vietjet Bag Drop & Security",
        subtitle: "PNR: 2GXDQP • Shaq: 25kg (Seat 16A) | Naana: 30kg (Seat 16B)",
        category: "transit",
        location: "BKK Domestic Check-in Counters",
        notes: "7kg carry-on allowance per passenger. Keep power banks in hand luggage.",
        isLocked: true,
      },
      {
        id: "d4-flight-vz306",
        time: "15:25 – 17:00 ICT",
        title: "Flight VZ306: Bangkok (BKK) → Phuket (HKT)",
        subtitle: "Non-stop 1h 35m • Seats 16A (Window) & 16B (Middle)",
        category: "flight",
        location: "BKK → HKT",
        isLocked: true,
      },
      {
        id: "d4-hkt-driver",
        time: "17:00 – 17:45 ICT",
        title: "Collect Bags at HKT & Meet Private Pavilions Driver",
        subtitle: "Look for 'The Pavilions Phuket' greeting sign in the arrival hall",
        category: "transit",
        location: "Phuket International Airport (HKT) Arrival Hall",
        notes: "Private transfer included in booking (THB 1,190 balance on resort folio).",
        isLocked: true,
      },
      {
        id: "d4-pavilions-checkin",
        time: "18:15 ICT",
        title: "Arrive at The Pavilions Phuket & Suite Check-In",
        subtitle: "Deluxe Tropical View Suite (81 sqm) • Ref: 78165SH099776",
        category: "hotel",
        location: "31/1 Moo 6, Choeng Thale, Thalang, Phuket",
        mapUrl: "https://maps.google.com/?q=The+Pavilions+Phuket",
        notes: "Enjoy your private lounge/bar, luxury bathtub & outdoor rain shower, then head up to 360 Bar or Firefly!",
        isLocked: true,
      },
    ],
    quickSuggestions: [
      {
        title: "Welcome Sunset Cocktails at 360 Bar & Dinner at Firefly Pool & Restaurant",
        time: "19:15 ICT",
        category: "romance",
        location: "The Pavilions Phuket",
        notes: "Priority dining access included with your suite booking!",
        bookingGuide:
          "Priority dining reservations at Firefly Pool & Restaurant are included in your Pavilions suite package (Ref 78165SH099776). Confirm your arrival table at check-in or email info.phuket@pavilionshotels.com ahead of travel.",
        serviceLinks: [
          {
            label: "Pavilions Dining",
            url: "https://www.pavilionshotels.com/phuket/dining/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 5,
    dateIso: "2027-02-09",
    dateLabel: "Tuesday, 9 February 2027",
    shortDate: "Tue 9 Feb",
    phase: "phuket",
    locationBadge: "Phuket • Layan Beach & Sanctuary",
    title: "First Full Day in Paradise: Layan Beach & Firefly Pool",
    vibe: "Crystal Andaman waters, shaded Casuarina trees & hilltop serenity",
    weatherSummary: "Phuket: 32°C Sunny • UV Index 10–11 (Pack SPF 50+)",
    accommodation: "The Pavilions Phuket (Night 2 of 5)",
    defaultOutfitId: "outfit-andaman-beach-club",
    defaultActivities: [
      {
        id: "d5-layan-shuttle",
        time: "10:00 ICT",
        title: "Complimentary Resort Shuttle to Layan Beach",
        subtitle: "5-minute drive down from the hilltop",
        category: "beach",
        location: "Layan Beach, Choeng Thale",
        notes: "Quiet, shaded, shallow crystal water—apply reef-safe SPF 50+ sunscreen.",
      },
    ],
    quickSuggestions: [
      {
        title: "Lazy Afternoon Lounging at the Expansive Firefly Pool",
        time: "14:30 ICT",
        category: "spa",
        location: "The Pavilions Phuket",
        notes: "Call a front desk golf buggy from your suite to Firefly Pool.",
        bookingGuide:
          "Complimentary for resort guests—no advance booking required. Dial '0' from your suite phone to summon a buggy down to Firefly Pool.",
      },
      {
        title: "Golden Hour Panorama at 360 Bar",
        time: "17:45 ICT",
        category: "romance",
        location: "360 Bar, The Pavilions Phuket",
        notes: "Famous hilltop sunset views over the Andaman Sea with tapas & cocktails.",
        bookingGuide:
          "360 Bar opens daily at 17:00 atop the resort's highest peak. Message the resort concierge on LINE or ask the front desk earlier in the afternoon to hold a front-row sunset sofa for two.",
        serviceLinks: [
          {
            label: "360 Bar Phuket",
            url: "https://www.pavilionshotels.com/phuket/360-bar/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 6,
    dateIso: "2027-02-10",
    dateLabel: "Wednesday, 10 February 2027",
    shortDate: "Wed 10 Feb",
    phase: "phuket",
    locationBadge: "Phuket • Bang Tao & Beach Clubs",
    title: "Beach Club Glamour & Andaman Sunset",
    vibe: "Chic daybeds, ocean swims & tropical birthday celebration",
    weatherSummary: "Phuket: 32°C Calm Seas • Gentle Breeze",
    accommodation: "The Pavilions Phuket (Night 3 of 5)",
    defaultActivities: [
      {
        id: "d6-bangtao",
        time: "11:30 ICT",
        title: "Explore Bang Tao Beach & Beach Clubs (10 mins south)",
        subtitle: "Catch Beach Club / Maya Beach Club via Bolt or Grab",
        category: "beach",
        location: "Bang Tao Beach",
        notes: "Long stretches of powdery white sand & vibrant beach club dining.",
      },
    ],
    quickSuggestions: [
      {
        title: "Couples Spa Ritual at Award-Winning Pavilions Spa",
        time: "16:00 ICT",
        category: "spa",
        location: "The Pavilions Phuket",
        notes: "Book via LINE or resort concierge using your £72.65 accommodation budget surplus!",
        bookingGuide:
          "Reserve 1–2 weeks in advance via info.phuket@pavilionshotels.com (quoting Ref 78165SH099776) or via the resort's LINE concierge upon check-in.",
        serviceLinks: [
          {
            label: "Pavilions Spa",
            url: "https://www.pavilionshotels.com/phuket/spa/",
          },
        ],
      },
      {
        title: "Celebration Birthday Dinner by Candlelight",
        time: "20:00 ICT",
        category: "romance",
        location: "Firefly Restaurant / ALTO Italian / Beachfront",
        notes: "Toast to Naana's Birthday under the stars!",
        bookingGuide:
          "Book 2–3 weeks ahead for a romantic birthday table: either arrange a private candlelit setup at Firefly / ALTO via The Pavilions Concierge, or reserve a beachfront table at Catch Beach Club on Bang Tao Beach.",
        serviceLinks: [
          {
            label: "Pavilions Dining",
            url: "https://www.pavilionshotels.com/phuket/dining/",
          },
          {
            label: "Catch Beach Club",
            url: "https://catchbeachclub.com/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 7,
    dateIso: "2027-02-11",
    dateLabel: "Thursday, 11 February 2027",
    shortDate: "Thu 11 Feb",
    phase: "phuket",
    locationBadge: "Phuket • Hidden Coves & Islands",
    title: "Hidden Romantic Coves & Island Adventures",
    vibe: "Turquoise hidden bays, longtail boats & tropical romance",
    weatherSummary: "Phuket: 31°C Bright Sunshine • Calm Andaman Sea",
    accommodation: "The Pavilions Phuket (Night 4 of 5)",
    defaultActivities: [
      {
        id: "d7-banana-beach",
        time: "10:00 ICT",
        title: "Discover Banana Beach (Hidden Romantic Cove)",
        subtitle: "12 minutes north of The Pavilions Phuket",
        category: "beach",
        location: "Banana Beach, Phuket",
        notes: "Bring your 10L waterproof dry bag, phone pouch & cash for beach kiosks.",
      },
    ],
    quickSuggestions: [
      {
        title: "Private Longtail / Speedboat Island Excursion (Phang Nga / Hong Islands)",
        time: "09:00 ICT",
        category: "beach",
        location: "Phuket Marina / Pier",
        notes: "Pack Stugeron motion sickness tablets, waterproof phone pouch & reef-safe sunscreen.",
        bookingGuide:
          "Book 1–2 weeks ahead either directly through The Pavilions Concierge (includes private resort pickup) or with a top-rated private boat operator such as 5 Star Marine Phuket.",
        serviceLinks: [
          {
            label: "5 Star Marine",
            url: "https://5starmarinephuket.com/",
          },
          {
            label: "Pavilions Experiences",
            url: "https://www.pavilionshotels.com/phuket/experiences/",
          },
        ],
      },
      {
        title: "Outdoor Rain Shower & Private Suite Lounge Evening",
        time: "19:00 ICT",
        category: "romance",
        location: "Deluxe Tropical View Suite",
        notes: "Use tropical DEET repellent in the lush evening resort gardens.",
        bookingGuide:
          "Private in-suite experience in your 81 sqm Deluxe Tropical View Suite. Dial '0' from your suite phone to order in-villa dining, ice buckets, or champagne.",
      },
    ],
  },
  {
    dayNumber: 8,
    dateIso: "2027-02-12",
    dateLabel: "Friday, 12 February 2027",
    shortDate: "Fri 12 Feb",
    phase: "phuket",
    locationBadge: "Phuket • Final Full Day",
    title: "Final Full Day in Paradise: Pure Relaxation & Farewell Sunset",
    vibe: "Soaking up every last drop of Andaman sunshine & romance",
    weatherSummary: "Phuket: 32°C Sunny • Balmy 25°C Night",
    accommodation: "The Pavilions Phuket (Night 5 of 5)",
    defaultActivities: [
      {
        id: "d8-relax-day",
        time: "10:30 ICT",
        title: "Slow Morning at Layan Beach or Firefly Pool",
        subtitle: "Savour the final full day of Naana's Birthday Trip",
        category: "romance",
        location: "The Pavilions Phuket / Layan Beach",
      },
    ],
    quickSuggestions: [
      {
        title: "Farewell Sunset Toast at 360 Bar",
        time: "17:45 ICT",
        category: "romance",
        location: "360 Bar, The Pavilions Phuket",
        notes: "Golden hour photos overlooking Layan hills.",
        bookingGuide:
          "Message the front desk via LINE or dial '0' to reserve a sunset table at 360 Bar for 17:30 and request buggy pickup from your suite.",
        serviceLinks: [
          {
            label: "360 Bar",
            url: "https://www.pavilionshotels.com/phuket/360-bar/",
          },
        ],
      },
      {
        title: "Final Night Romantic Dinner at Firefly Pool & Restaurant",
        time: "20:00 ICT",
        category: "dining",
        location: "The Pavilions Phuket",
        notes: "Pack main checked bags (20kg Air Arabia limit for return flight!) before bed.",
        bookingGuide:
          "Priority dining access at Firefly is included with your booking. Reserve your preferred poolside table with the concierge on the morning of 12 Feb.",
        serviceLinks: [
          {
            label: "Firefly Restaurant",
            url: "https://www.pavilionshotels.com/phuket/firefly/",
          },
        ],
      },
    ],
  },
  {
    dayNumber: 9,
    dateIso: "2027-02-13",
    dateLabel: "Saturday, 13 February 2027",
    shortDate: "Sat 13 Feb",
    phase: "return",
    locationBadge: "Phuket HKT → Sharjah SHJ",
    title: "Leisurely Resort Afternoon & Evening Departure",
    vibe: "Poolside afternoon before heading to Phuket International Airport",
    weatherSummary: "Phuket: 32°C Sunny",
    defaultActivities: [
      {
        id: "d9-checkout-pavilions",
        time: "12:00 ICT",
        title: "Check out from The Pavilions Phuket",
        subtitle: "Store luggage with concierge & enjoy resort facilities until 15:30",
        category: "hotel",
        location: "The Pavilions Phuket",
        notes: "Verify THB 1,190 transfer balance is settled on your resort bill.",
        isLocked: true,
      },
      {
        id: "d9-transfer-hkt",
        time: "15:30 ICT",
        title: "Transfer to Phuket International Airport (HKT)",
        subtitle: "Arrive ~3 hours before 18:20 international departure",
        category: "transit",
        location: "Phuket International Airport (HKT)",
        notes: "Ensure checked bags are within Air Arabia 20kg each (10kg cabin bag).",
        isLocked: true,
      },
      {
        id: "d9-flight-g9715",
        time: "18:20 – 22:05",
        title: "Flight G9715: Phuket (HKT) → Sharjah (SHJ)",
        subtitle: "PNR: 6LDREI • Duration: 6h 45m • Lands 22:05 GST",
        category: "flight",
        location: "HKT International Terminal",
        isLocked: true,
      },
    ],
  },
  {
    dayNumber: 10,
    dateIso: "2027-02-14",
    dateLabel: "Sunday, 14 February 2027",
    shortDate: "Sun 14 Feb",
    phase: "return",
    locationBadge: "Sharjah SHJ → London LGW",
    title: "Valentine's Day Touchdown Home in London",
    vibe: "Home sweet home with unforgettable birthday memories",
    weatherSummary: "London Morning Arrival",
    defaultActivities: [
      {
        id: "d10-shj-layover",
        time: "22:05 (13 Feb) – 03:40 GST",
        title: "Sharjah (SHJ) Transit Layover (5h 35m)",
        subtitle: "Connect to London Gatwick Gate",
        category: "transit",
        location: "Sharjah International Airport (SHJ)",
        isLocked: true,
      },
      {
        id: "d10-flight-g9265",
        time: "03:40 – 07:45 GMT",
        title: "Flight G9265: Sharjah (SHJ) → London Gatwick (LGW)",
        subtitle: "PNR: 6LDREI • Duration: 8h 05m • Lands 07:45 GMT (North Terminal)",
        category: "flight",
        location: "LGW North Terminal",
        isLocked: true,
      },
    ],
  },
];

export const PREP_CHECKLIST: PrepCheckItem[] = [
  {
    id: "prep-passport-shaq",
    category: "immigration",
    title: "Shaq's Passport Validity & Blank Pages Verified",
    detail:
      "Must have 6+ full months validity from 5 Feb 2027 (valid past mid-August 2027) and at least 2 blank pages.",
    assignee: "shaq",
    urgentTag: "Mandatory Entry Rule",
  },
  {
    id: "prep-passport-naana",
    category: "immigration",
    title: "Naana's Passport Validity & Blank Pages Verified",
    detail:
      "Must have 6+ full months validity from 5 Feb 2027 (valid past mid-August 2027) and at least 2 blank pages.",
    assignee: "naana",
    urgentTag: "Mandatory Entry Rule",
  },
  {
    id: "prep-tdac",
    category: "immigration",
    title: "Submit Thailand Digital Arrival Card (TDAC) Online",
    detail:
      "Submit within 3 days prior to landing in Bangkok (window opens Tuesday, 2 Feb 2027). Save QR codes and PDF copies offline on both phones.",
    assignee: "both",
    urgentTag: "Window: 2–5 Feb 2027",
  },
  {
    id: "prep-onward-proof",
    category: "documents",
    title: "Save Return Flight (6LDREI) & Hotel Confirmations Offline",
    detail:
      "Keep PDFs for Air Arabia (6I8SOP / 6LDREI), Vietjet (2GXDQP), Shangri-La (12891938794), and The Pavilions (78165SH099776) starred on both phones for immigration spot-checks.",
    assignee: "both",
  },
  {
    id: "prep-zero-fx-cards",
    category: "money",
    title: "Pack Zero-Foreign-Transaction-Fee Cards (Monzo / Starling / Revolut / Chase)",
    detail:
      "Ensure physical cards are packed and in-app travel settings are ready. Remember at Thai ATMs (220 THB flat fee): ALWAYS select 'Without Conversion'!",
    assignee: "both",
  },
  {
    id: "prep-cash-gbp",
    category: "money",
    title: "Withdraw Crisp GBP Notes for SuperRich Exchange at BKK",
    detail:
      "Bring clean, untorn £20/£50 notes to exchange at SuperRich (Orange or Green booths) on Floor B of Suvarnabhumi Airport (near Airport Rail Link) for the best THB cash rates.",
    assignee: "both",
  },
  {
    id: "prep-esim",
    category: "documents",
    title: "Purchase & Install Thailand eSIM (AIS or True 5G) 24h Before Departure",
    detail:
      "Install Airalo, Nomad, or Holafly eSIM on 3 Feb 2027 so both phones connect to 5G the moment you touch down at BKK.",
    assignee: "both",
    urgentTag: "24h Pre-Flight",
  },
  {
    id: "prep-pavilions-balance",
    category: "money",
    title: "Budget THB 1,190 (~£26.75) for The Pavilions Phuket Transfer Balance",
    detail:
      "THB 38,625.00 is prepaid via Red Dot Payment; remaining THB 1,190.00 is due for the private HKT airport arrival transfer.",
    assignee: "both",
  },
];

export const ESSENTIAL_APPS: EssentialAppItem[] = [
  {
    id: "app-grab",
    name: "Grab",
    category: "Mobility & Taxis",
    icon: "🚗",
    badge: "Must-Have #1",
    description:
      "Southeast Asia's Uber equivalent. Essential for transparent fares, linked credit card payments, food delivery, and airport pickups at both BKK (Level 4 Door 4) and HKT.",
    proTip: "Link your zero-FX card (Monzo/Starling/Revolut/Chase) in the UK before flying.",
  },
  {
    id: "app-bolt",
    name: "Bolt",
    category: "Mobility & Taxis",
    icon: "⚡",
    badge: "20–30% Cheaper",
    description:
      "Frequently 20–30% cheaper than Grab; fantastic for hopping around central Bangkok and western Phuket (Layan / Bang Tao).",
    proTip: "Keep small THB notes handy as many Bolt drivers in Phuket prefer cash.",
  },
  {
    id: "app-esim",
    name: "Airalo / Nomad / Holafly (eSIM)",
    category: "Connectivity",
    icon: "📶",
    badge: "AIS / True 5G",
    description:
      "Instant Thai 5G data package without swapping physical SIM cards at the airport.",
    proTip: "Install 24 hours before departure so you can order a Grab and pull up TDAC QR codes on arrival.",
  },
  {
    id: "app-gmaps",
    name: "Google Maps (Offline Areas)",
    category: "Navigation & Transit",
    icon: "🗺️",
    badge: "Offline Maps",
    description:
      "Download offline map regions for 'Bangkok (Central Riverfront / Sukhumvit)' and 'Phuket (West Coast / Thalang)'.",
    proTip: "Star Shangri-La Bangkok, Sathorn Pier, ICONSIAM, The Pavilions Phuket, and Layan Beach ahead of time.",
  },
  {
    id: "app-viabus",
    name: "ViaBus",
    category: "Navigation & Transit",
    icon: "⛴️",
    badge: "River & Transit",
    description:
      "Real-time GPS tracking of Bangkok public buses and Chao Phraya river express boats departing from Sathorn Pier.",
    proTip: "Use it right outside Shangri-La at Sathorn Central Pier to time boats to Wat Arun & Grand Palace.",
  },
  {
    id: "app-line",
    name: "LINE",
    category: "Communication & Translation",
    icon: "💬",
    badge: "Local Concierge",
    description:
      "Thailand's primary messaging platform. Used everywhere to message hotel concierges, CHI / Pavilions spa bookings, private boat captains, and Bang Tao beach clubs.",
    proTip: "Create your account in the UK using your mobile number before activating your travel eSIM.",
  },
  {
    id: "app-translate",
    name: "Google Translate (Offline Thai)",
    category: "Communication & Translation",
    icon: "🈯",
    badge: "Camera + Voice",
    description:
      "Instant camera translation for Thai menus, pharmacy labels, and taxi directions.",
    proTip: "Download the offline Thai language file (~45MB) inside the app settings.",
  },
];

export const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  // Daytime & Temple Wear
  {
    id: "pack-linen-tops",
    category: "Daytime & Temple Wear",
    label: "Ultra-breathable linen, cotton & bamboo daytime tops",
    note: "Bangkok reaches 32–34°C with high urban humidity; avoid thick denim or heavy synthetics",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-temple-cover",
    category: "Daytime & Temple Wear",
    label: "Temple-compliant outfits (shoulders & knees completely covered)",
    note: "Strictly enforced at Grand Palace, Wat Pho & Wat Arun—no sleeveless tops, shorts, crop tops or tight leggings",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-sarong-shirt",
    category: "Daytime & Temple Wear",
    label: "Lightweight linen overshirt / sarong in daypack",
    note: "Easy throw-on layer for spontaneous temple stops and strong air-conditioning",
    forWho: "both",
  },
  {
    id: "pack-slipon-shoes",
    category: "Daytime & Temple Wear",
    label: "Comfortable slip-on shoes or sandals for temple days",
    note: "Shoes must be removed before entering every temple hall",
    forWho: "both",
    essential: true,
  },

  // Evening & Fine Dining
  {
    id: "pack-shaq-rooftop",
    category: "Evening & Fine Dining",
    label: "Collared linen shirts & lightweight chinos/trousers",
    note: "Required for Bangkok rooftop bars (Lebua, Vertigo, Mahanakhon) & hotel fine dining",
    forWho: "shaq",
    essential: true,
  },
  {
    id: "pack-shaq-loafers",
    category: "Evening & Fine Dining",
    label: "Closed-toe loafers or clean smart trainers",
    note: "Bangkok rooftops strictly forbid flip-flops, athletic shorts, and sleeveless vests for men",
    forWho: "shaq",
    essential: true,
  },
  {
    id: "pack-naana-dresses",
    category: "Evening & Fine Dining",
    label: "Romantic maxi/midi dresses, dressy jumpsuits & elegant separates",
    note: "For birthday rooftop cocktails, Shangri-La riverside dining & Firefly Restaurant",
    forWho: "naana",
    essential: true,
  },
  {
    id: "pack-naana-heels",
    category: "Evening & Fine Dining",
    label: "Dressy evening sandals / resort wedges",
    note: "Comfortable for riverfront promenades and hilltop paths at The Pavilions",
    forWho: "naana",
  },

  // Resort & Beach (Phuket)
  {
    id: "pack-swimwear",
    category: "Resort & Beach (Phuket)",
    label: "Multiple sets of swimwear (Layan Beach, Firefly Pool, Shangri-La Pool)",
    note: "5 nights in Phuket + riverfront pool days in Bangkok",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-coverups",
    category: "Resort & Beach (Phuket)",
    label: "Breathable beach cover-ups, resort shirts & kaftans",
    note: "For Layan Beach shuttle, Bang Tao beach clubs & poolside lunches",
    forWho: "both",
  },
  {
    id: "pack-sunglasses-hat",
    category: "Resort & Beach (Phuket)",
    label: "Polarised UV sunglasses & wide-brimmed sunhats",
    note: "Phuket February UV Index is 10–11 (Very High)",
    forWho: "both",
    essential: true,
  },

  // Health & Pharmacy
  {
    id: "pack-electrolytes",
    category: "Health & Pharmacy",
    label: "Rehydration salts (Dioralyte / electrolytes)",
    note: "Essential for 33°C tropical walking days and beach afternoons",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-meds-core",
    category: "Health & Pharmacy",
    label: "Travel Pharmacy: Imodium, Paracetamol, Ibuprofen, Pepto-Bismol & Antihistamines",
    note: "Keep in original packaging in a dedicated pouch",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-stugeron",
    category: "Health & Pharmacy",
    label: "Motion sickness tablets (Stugeron)",
    note: "Essential for Phuket island speedboats and longtail boats",
    forWho: "both",
  },

  // Toiletries & Sun Care
  {
    id: "pack-spf50",
    category: "Toiletries & Sun Care",
    label: "High-SPF Sunscreen (SPF 50+) & Reef-Safe Sunscreen",
    note: "Sunscreen is very expensive in Thai resorts; bring plenty from the UK for ocean swimming",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-deet",
    category: "Toiletries & Sun Care",
    label: "Tropical-strength insect repellent (DEET 20–30% or Oil of Lemon Eucalyptus)",
    note: "For balmy evenings in The Pavilions' lush hilltop gardens and outdoor rain shower",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-tissues-wipes",
    category: "Toiletries & Sun Care",
    label: "Pocket tissues & travel wet wipes",
    note: "Keep in your daypack—some public toilets lack toilet paper",
    forWho: "both",
    essential: true,
  },

  // Electronics & Power
  {
    id: "pack-adapter",
    category: "Electronics & Power",
    label: "Universal travel adapter with USB-C PD fast-charging ports",
    note: "Thailand uses 220V Type A/B/C sockets; UK 3-pin (Type G) plugs require an adapter",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-powerbank",
    category: "Electronics & Power",
    label: "10,000–20,000 mAh airline-approved portable power bank",
    note: "CRITICAL: Must stay in your CARRY-ON hand luggage on all 4 flights—never in checked bags!",
    forWho: "both",
    essential: true,
  },
  {
    id: "pack-drybag",
    category: "Electronics & Power",
    label: "Waterproof phone pouch & 10L dry bag",
    note: "Protects phones, cameras & cash on Phuket boat trips and Banana Beach coves",
    forWho: "both",
  },

  // Carry-On & Documents
  {
    id: "pack-passports-cards",
    category: "Carry-On & Documents",
    label: "Passports (valid past Aug 2027), Zero-FX cards & crisp GBP notes",
    note: "Plus printed backup copies of flight PNRs (6I8SOP, 2GXDQP, 6LDREI) & hotel refs",
    forWho: "both",
    essential: true,
  },
];

export const DEFAULT_PLANNED_EXPENSES: PlannedExpense[] = [
  {
    id: "exp-pavilions-transfer",
    title: "The Pavilions Phuket Airport Transfer Balance",
    category: "Transit & Cash",
    amountThb: 1190,
    city: "Phuket",
    isBooked: true,
  },
  {
    id: "exp-bkk-airport-taxi",
    title: "BKK Airport → Shangri-La Grab/Taxi (+ Sirat Expressway tolls)",
    category: "Transit & Cash",
    amountThb: 500,
    city: "Bangkok",
    isBooked: false,
  },
  {
    id: "exp-birthday-dinner",
    title: "Naana's Birthday Fine Dining Celebration (Funded by £72.65 Hotel Surplus!)",
    category: "Birthday Treat",
    amountThb: 3233,
    city: "Phuket",
    isBooked: false,
  },
];

export const EMERGENCY_CONTACTS = [
  {
    title: "Thailand Tourist Police",
    number: "1155",
    telHref: "tel:1155",
    badge: "24/7 English Support",
    description: "Dedicated English-speaking tourist assistance across Bangkok & Phuket.",
  },
  {
    title: "Medical Emergency / Ambulance",
    number: "1669",
    telHref: "tel:1669",
    badge: "National EMS",
    description: "Immediate medical dispatch and ambulance response anywhere in Thailand.",
  },
  {
    title: "British Embassy Bangkok",
    number: "+66 (0) 2 305 8333",
    telHref: "tel:+6623058333",
    badge: "Consular & Passports",
    description: "AIA Sathorn Tower, 11/1 South Sathorn Road, Yan Nawa, Sathon, Bangkok 10120",
    linkUrl: "https://www.gov.uk/world/organisations/british-embassy-bangkok",
    linkLabel: "GOV.UK Emergency Travel Support",
  },
];

export const INTERNATIONAL_HOSPITALS = [
  {
    city: "Bangkok",
    name: "BNH Hospital (Sathorn)",
    note: "Close to Shangri-La Bangkok / Silom-Sathorn area • JCI-accredited international standard",
    mapUrl: "https://maps.google.com/?q=BNH+Hospital+Bangkok",
  },
  {
    city: "Bangkok",
    name: "Bumrungrad International Hospital",
    note: "Sukhumvit Soi 3 • World-renowned international hospital",
    mapUrl: "https://maps.google.com/?q=Bumrungrad+International+Hospital",
  },
  {
    city: "Phuket",
    name: "Bangkok Hospital Phuket",
    note: "2/1 Hongyok Utis Rd, Phuket Town • Premier 24/7 international medical centre",
    mapUrl: "https://maps.google.com/?q=Bangkok+Hospital+Phuket",
  },
  {
    city: "Phuket",
    name: "Bangkok Hospital Siriroj",
    note: "Chaloem Phrakiat Ror 9 Rd • International standard hospital in Phuket",
    mapUrl: "https://maps.google.com/?q=Bangkok+Hospital+Siriroj+Phuket",
  },
];

export const FOOD_SAFETY_GUIDELINES: FoodSafetyGuideline[] = [
  {
    id: "water-ice",
    badge: "HYDRATION",
    title: "Tap Water & Ice Protocol",
    guidelines: [
      "Do not drink tap water. Bottled water is cheap and available at every 7-Eleven (using tap water to brush your teeth is fine).",
      "Ice is overwhelmingly safe. If it is tubular (a cylinder with a hole) or uniformly cubed, it comes from a purified ice factory.",
      "Avoid shaved or crushed ice from smaller street carts if you are unsure of the source."
    ]
  },
  {
    id: "street-food",
    badge: "HYGIENE",
    title: "Street Food Best Practices",
    guidelines: [
      "The Turnover Rule: Always eat at stalls with a long queue of locals. High turnover means ingredients haven't been sitting in the heat.",
      "Cooked to Order: Opt for dishes cooked fresh in a blazing hot wok rather than pre-cooked curries sitting in trays.",
      "Cutlery Sterilization: Many street food tables have a small container of boiling water to briefly dip and sterilize your fork and spoon.",
      "Look for the green 'Clean Food Good Taste' sign (featuring a smiling chef), indicating Ministry of Public Health certification."
    ]
  },
  {
    id: "pharmacy",
    badge: "MEDICAL",
    title: "Pharmacy Access (Raan Khaay Yaa)",
    guidelines: [
      "Look for the sign ร้านขายยา or a standard green cross.",
      "Thai pharmacists are highly trained, generally speak excellent English, and can easily diagnose minor travel ailments.",
      "Many medications that require a prescription in the UK (like strong stomach aids) can be purchased over the counter."
    ]
  }
];

export const DEFAULT_WARDROBE_OUTFITS: WardrobeOutfit[] = [
  {
    id: "outfit-temple-sanctuary",
    title: "Rattanakosin Temple & River Linen",
    owner: "both",
    dressCode: "temple",
    climateTag: "33°C Sacred Heritage • Covered Shoulders & Knees",
    notes:
      "Strictly compliant for Grand Palace, Wat Pho & Wat Arun: long breathable linen trousers/maxi skirt, covered shoulders, and slip-on loafers/sandals for easy removal at temple halls.",
    isDefault: true,
    garments: [
      {
        id: "g-temple-1",
        label: "Long-Sleeve Unlined Ivory Linen Shirt",
        url: "https://www.asos.com/search/?q=ivory+linen+shirt",
        category: "Top",
      },
      {
        id: "g-temple-2",
        label: "Tailored Relaxed Drawstring Linen Trousers",
        url: "https://www.asos.com/search/?q=linen+trousers",
        category: "Bottom",
      },
      {
        id: "g-temple-3",
        label: "Tiered Woven Cotton Maxi Skirt & Shawl",
        url: "https://www.pinterest.com/search/pins/?q=temple%20outfit%20thailand%20linen",
        category: "One-Piece / Dress",
      },
      {
        id: "g-temple-4",
        label: "Woven Leather Slip-On Mule Loafers",
        url: "https://www.asos.com/search/?q=leather+slip+on+loafers",
        category: "Footwear",
      },
    ],
  },
  {
    id: "outfit-rooftop-glamour",
    title: "Bangkok Sky-Bar & Birthday Candlelight",
    owner: "both",
    dressCode: "rooftop",
    climateTag: "25°C Balmy Evening • Strict Smart Casual",
    notes:
      "Curated for Mahanakhon SkyBeach, Lebua, Vertigo & Firefly birthday dining. Includes Shaq's required collared shirt & closed-toe loafers alongside Naana's silk evening silhouette.",
    isDefault: true,
    garments: [
      {
        id: "g-roof-1",
        label: "Naana: Emerald Silk Bias-Cut Midi Dress",
        url: "https://www.pinterest.com/search/pins/?q=emerald%20silk%20midi%20evening%20dress",
        category: "One-Piece / Dress",
      },
      {
        id: "g-roof-2",
        label: "Shaq: Cuban-Collar Fine Linen Evening Shirt",
        url: "https://www.asos.com/search/?q=cuban+collar+linen+shirt",
        category: "Top",
      },
      {
        id: "g-roof-3",
        label: "Shaq: Pleated Lightweight Chinos & Suede Loafers",
        url: "https://www.asos.com/search/?q=suede+loafers+men",
        category: "Footwear",
      },
      {
        id: "g-roof-4",
        label: "Naana: Sculptural Gold Resort Wedges & Clutch",
        url: "https://www.pinterest.com/search/pins/?q=gold%20evening%20sandals%20resort",
        category: "Accessory",
      },
    ],
  },
  {
    id: "outfit-bkk-daytime-linen",
    title: "Chao Phraya Promenade & Talad Noi",
    owner: "both",
    dressCode: "daytime",
    climateTag: "34°C Tropical Urban • Breathable Natural Fibres",
    notes:
      "Lightweight bamboo and cotton separates for BTS Skytrain hops into Siam, Talad Noi cafés, and ICONSIAM shuttle boats.",
    isDefault: true,
    garments: [
      {
        id: "g-day-1",
        label: "Breathable Open-Weave Cotton Resort Set",
        url: "https://www.pinterest.com/search/pins/?q=linen%20co%20ord%20summer%20tropical",
        category: "Top",
      },
      {
        id: "g-day-2",
        label: "Tailored Linen Shorts & Bamboo Tee",
        url: "https://www.asos.com/search/?q=linen+shorts",
        category: "Bottom",
      },
      {
        id: "g-day-3",
        label: "Polarised Tortoiseshell Acetate Sunglasses",
        url: "https://www.asos.com/search/?q=polarised+tortoiseshell+sunglasses",
        category: "Accessory",
      },
      {
        id: "g-day-4",
        label: "Cushioned Leather City Walking Sandals",
        url: "https://www.asos.com/search/?q=leather+walking+sandals",
        category: "Footwear",
      },
    ],
  },
  {
    id: "outfit-andaman-beach-club",
    title: "Layan Cove & Bang Tao Beach Club",
    owner: "both",
    dressCode: "beach",
    climateTag: "32°C Andaman Coast • UV Index 11 Protection",
    notes:
      "Resort swimwear, sheer linen kaftan/overshirt, wide-brimmed raffia sunhat, and waterproof cove accessories for Layan Beach, Catch Beach Club & Banana Beach.",
    isDefault: true,
    garments: [
      {
        id: "g-beach-1",
        label: "Naana: Terracotta Resort Swimwear & Sheer Kaftan",
        url: "https://www.pinterest.com/search/pins/?q=luxury%20beach%20kaftan%20swimwear",
        category: "One-Piece / Dress",
      },
      {
        id: "g-beach-2",
        label: "Shaq: Tailored Swim Shorts & Oversized Linen Shirt",
        url: "https://www.asos.com/search/?q=tailored+swim+shorts",
        category: "Bottom",
      },
      {
        id: "g-beach-3",
        label: "Wide-Brimmed Woven Raffia Sunhat",
        url: "https://www.asos.com/search/?q=raffia+sun+hat",
        category: "Accessory",
      },
      {
        id: "g-beach-4",
        label: "Waterproof Resort Slides & 10L Dry Bag",
        url: "https://www.asos.com/search/?q=pool+slides",
        category: "Footwear",
      },
    ],
  },
  {
    id: "outfit-transit-lounge",
    title: "Gatwick Lounge & Long-Haul Cabin Knit",
    owner: "both",
    dressCode: "transit",
    climateTag: "18°C Cabin AC → 33°C Bangkok Touchdown",
    notes:
      "Breathable layered loungewear for the LGW → SHJ → BKK & HKT → LGW flights, easy to shed upon stepping into tropical humidity.",
    isDefault: true,
    garments: [
      {
        id: "g-trans-1",
        label: "Soft Merino / Cotton Zip Overshirt Layer",
        url: "https://www.asos.com/search/?q=cotton+knit+overshirt",
        category: "Top",
      },
      {
        id: "g-trans-2",
        label: "Relaxed Travel Joggers / Wide-Leg Knit Trousers",
        url: "https://www.pinterest.com/search/pins/?q=airport%20loungewear%20aesthetic%20neutral",
        category: "Bottom",
      },
      {
        id: "g-trans-3",
        label: "Breathable Bamboo Base Layer Tee",
        url: "https://www.asos.com/search/?q=organic+cotton+t+shirt",
        category: "Top",
      },
      {
        id: "g-trans-4",
        label: "Clean Smart Trainers & Compression Flight Socks",
        url: "https://www.asos.com/search/?q=neutral+smart+trainers",
        category: "Footwear",
      },
    ],
  },
];
