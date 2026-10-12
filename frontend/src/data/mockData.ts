import { Room, Review, Booking, UserProfile } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Standard Room',
    slug: 'standard-room',
    type: 'standard',
    pricePerNight: 12500,
    currency: 'LKR',
    rating: 4.8,
    reviewCount: 64,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 2,
    beds: '1 King Bed or 2 Twins',
    baths: 1,
    sizeSqFt: 380,
    description: 'Bright and minimalist tropical retreat with artisanal teak accents and garden breeze.',
    detailedDescription: 'Step into a serene private haven crafted from native teak timber and handwoven rattan. Featuring floor-to-ceiling glass doors opening onto a private verandah framed by tropical greenery, luxurious rain shower, plush king bed, and artisanal Ceylon tea station.',
    amenities: [
      'High-Speed Wi-Fi',
      'Air Conditioning',
      'Rain Shower',
      'Private Balcony',
      'Artisanal Ceylon Tea & Coffee',
      'Smart TV 55"',
      'In-room Safe',
      'Organic Bath Toiletries'
    ],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    popular: true,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    bedType: '1 King or 2 Single Beds',
    view: 'Lush Garden & Coconut Palm View'
  },
  {
    id: 'room-2',
    name: 'Deluxe Oceanfront',
    slug: 'deluxe-oceanfront',
    type: 'deluxe',
    pricePerNight: 18000,
    currency: 'LKR',
    rating: 4.95,
    reviewCount: 98,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 3,
    beds: '1 Handcrafted Four-Poster King Bed',
    baths: 1,
    sizeSqFt: 540,
    description: 'Bespoke four-poster canopy bed overlooking azure waves with private sunset terrace.',
    detailedDescription: 'Perched directly above the shoreline, our Deluxe Oceanfront sanctuary blends timeless tropical architecture with understated contemporary luxury. Wake up to the rhythmic sound of the Indian Ocean, rest under sheer canopy drapery, and soak in an oversized terrazzo tub overlooking the horizon.',
    amenities: [
      'Panoramic Ocean View',
      'Four-Poster Canopy Bed',
      'Free High-Speed Wi-Fi',
      'Deep Soaking Terrazzo Tub',
      'Espresso Machine',
      'Private Sunset Terrace',
      'Air Conditioning & Ceiling Fan',
      'Evening Turndown Service',
      'Complimentary Gourmet Breakfast'
    ],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    popular: true,
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in',
    bedType: 'Handcrafted Four-Poster King Bed',
    view: 'Unobstructed Indian Ocean View'
  },
  {
    id: 'room-3',
    name: 'Presidential Ocean Suite',
    slug: 'presidential-ocean-suite',
    type: 'suite',
    pricePerNight: 28000,
    currency: 'LKR',
    rating: 4.98,
    reviewCount: 52,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 4,
    beds: '1 King Master + 1 Queen Daybed',
    baths: 2,
    sizeSqFt: 860,
    description: 'Expansive open-concept suite with bespoke teak lounge, dual vanity, and ocean panorama.',
    detailedDescription: 'An ultra-exclusive coastal residence crafted for travelers who value space, privacy, and architectural elegance. Includes a grand teak living salon, custom dining area, dual-basin marble en-suite bathroom with walk-in rainwater shower, and expansive private terrace with sun loungers.',
    amenities: [
      'Full Oceanfront Living Room',
      'Dedicated Butler On-Call',
      'Double Marble Vanity',
      'Complimentary Airport Transfer',
      'In-Suite Breakfast Service',
      'Wine & Champagne Fridge',
      'Sonos Sound System',
      'Pillow Menu',
      'Superfast Fiber Wi-Fi'
    ],
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: true,
    popular: true,
    cancellationPolicy: 'Free cancellation up to 5 days before check-in',
    bedType: '1 King Bed & 1 Queen Daybed',
    view: '180° Panoramic Ocean & Coastal Reef'
  },
  {
    id: 'room-4',
    name: 'Royal Coconut Grove Villa',
    slug: 'royal-coconut-grove-villa',
    type: 'villa',
    pricePerNight: 45000,
    currency: 'LKR',
    rating: 5.0,
    reviewCount: 37,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 5,
    beds: '2 King Beds + 1 Daybed',
    baths: 2,
    sizeSqFt: 1250,
    description: 'Private standalone villa with private plunge pool, secluded tropical garden, and chef kitchen.',
    detailedDescription: 'Tucked into a private grove of towering king coconut palms, this standalone sanctuary delivers total seclusion. Features a private freshwater plunge pool, outdoor open-air garden shower, customized private dining pavilion, and dedicated resort host.',
    amenities: [
      'Private Plunge Pool',
      'Secluded Tropical Garden',
      'Open-Air Rain Shower',
      'Private Dining Pavilion',
      'Dedicated Villa Host',
      'Free Daily Afternoon Tea',
      'Complimentary Mini Bar',
      'Luxury Spa Bathrobes',
      'Yoga Mats & Beach Gear'
    ],
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    popular: true,
    cancellationPolicy: 'Free cancellation up to 7 days before check-in',
    bedType: '2 King Master Beds',
    view: 'Private Pool & Secluded Botanical Garden'
  },
  {
    id: 'room-5',
    name: 'Garden Pavilion Room',
    slug: 'garden-pavilion-room',
    type: 'standard',
    pricePerNight: 14000,
    currency: 'LKR',
    rating: 4.75,
    reviewCount: 43,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 2,
    beds: '1 Queen Bed',
    baths: 1,
    sizeSqFt: 420,
    description: 'Peaceful garden suite nestled amidst frangipani blossoms and shaded stone walkways.',
    detailedDescription: 'A haven of peace scented by jasmine and frangipani flowers. Ideal for nature lovers seeking quietude, restorative sleep, and breezy afternoon reading under shaded palm fronds.',
    amenities: [
      'Garden View Verandah',
      'Organic Herbal Tea Bar',
      'Air Conditioning & Fan',
      'High-Speed Wi-Fi',
      'Walk-In Shower',
      'Daily Housekeeping',
      'Digital Safe'
    ],
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    popular: false,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    bedType: '1 Queen Bed',
    view: 'Fragrant Frangipani Garden'
  },
  {
    id: 'room-6',
    name: 'Horizon Penthouse Suite',
    slug: 'horizon-penthouse-suite',
    type: 'suite',
    pricePerNight: 35000,
    currency: 'LKR',
    rating: 4.92,
    reviewCount: 31,
    location: 'Bentota Beach, Sri Lanka',
    maxGuests: 3,
    beds: '1 Super King Bed',
    baths: 2,
    sizeSqFt: 920,
    description: 'Top-floor penthouse with vaulted ceilings, wrap-around timber balcony, and sunset jacuzzi.',
    detailedDescription: 'Occupying the uppermost tier of the main pavilion, this penthouse offers 270-degree vistas across the Bentota coastline. Relax in your private open-air whirlpool jacuzzi under the evening stars.',
    amenities: [
      'Private Balcony Whirlpool Jacuzzi',
      '270° Panoramic Ocean Horizon',
      'Complimentary Sunset Cocktails',
      'Super King Featherbed',
      'Nespresso Vertuo System',
      'Bluetooth Hi-Fi Sound',
      'Daily Fresh Fruit & Flowers'
    ],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: false,
    popular: true,
    cancellationPolicy: 'Free cancellation up to 5 days before check-in',
    bedType: '1 Super King Bed',
    view: '270° Panoramic Sea & Horizon'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    guestName: 'Nisansala P.',
    location: 'Colombo, Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: '“A peaceful and beautiful place. The rooms were spotless and the staff were wonderful!”',
    date: '2 weeks ago',
    roomBooked: 'Standard Room'
  },
  {
    id: 'rev-2',
    guestName: 'Dulaj M.',
    location: 'Kandy, Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: '“Stunning views, great location and an unforgettable stay. Highly recommended!”',
    date: '1 month ago',
    roomBooked: 'Deluxe Oceanfront'
  },
  {
    id: 'rev-3',
    guestName: 'Amaya S.',
    location: 'Galle, Sri Lanka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: '“The perfect mix of comfort and nature. We can’t wait to come back!”',
    date: '3 weeks ago',
    roomBooked: 'Presidential Ocean Suite'
  },
  {
    id: 'rev-4',
    guestName: 'David & Sarah K.',
    location: 'Melbourne, Australia',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: '“The four-poster bed looking out into the Indian Ocean was pure magic. PayHere checkout was seamless.”',
    date: 'Just now',
    roomBooked: 'Royal Coconut Grove Villa'
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-8921',
  fullName: 'Thilina Kavishan',
  email: 'thilinakavishan42@gmail.com',
  phone: '+94 77 123 4567',
  city: 'Colombo',
  country: 'Sri Lanka',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  preferredCurrency: 'LKR',
  memberSince: 'January 2025',
  savedRoomIds: ['room-2', 'room-3']
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-10492',
    bookingReference: 'SS-LK-94821',
    roomId: 'room-2',
    roomNumber: '201',
    room: INITIAL_ROOMS[1],
    checkIn: '2026-10-18',
    checkOut: '2026-10-21',
    nights: 3,
    adults: 2,
    children: 0,
    totalGuests: 2,
    guestInfo: {
      fullName: 'Thilina Kavishan',
      email: 'thilinakavishan42@gmail.com',
      phone: '+94 77 123 4567',
      specialRequests: 'Upper floor room with sunset view preferred. Anniversary celebration.',
      nicPassport: '200021394812'
    },
    paymentMethod: 'payhere',
    subtotal: 54000,
    serviceCharge: 5400,
    taxes: 1350,
    discountAmount: 5400,
    promoCodeApplied: 'SERENE10',
    totalAmount: 55350,
    currency: 'LKR',
    status: 'confirmed',
    bookedAt: '2026-10-02'
  },
  {
    id: 'bk-10210',
    bookingReference: 'SS-LK-81204',
    roomId: 'room-1',
    roomNumber: '101',
    room: INITIAL_ROOMS[0],
    checkIn: '2026-08-10',
    checkOut: '2026-08-12',
    nights: 2,
    adults: 2,
    children: 1,
    totalGuests: 3,
    guestInfo: {
      fullName: 'Thilina Kavishan',
      email: 'thilinakavishan42@gmail.com',
      phone: '+94 77 123 4567',
      specialRequests: 'Early check-in around 1:00 PM if available.',
      nicPassport: '200021394812'
    },
    paymentMethod: 'card',
    subtotal: 25000,
    serviceCharge: 2500,
    taxes: 625,
    discountAmount: 0,
    totalAmount: 28125,
    currency: 'LKR',
    status: 'completed',
    bookedAt: '2026-07-28'
  }
];

export const ALL_AMENITIES = [
  'High-Speed Wi-Fi',
  'Air Conditioning',
  'Panoramic Ocean View',
  'Private Plunge Pool',
  'Free Gourmet Breakfast',
  'Deep Soaking Terrazzo Tub',
  'Private Balcony',
  'Dedicated Butler On-Call',
  'Rain Shower',
  'Espresso Machine'
];
