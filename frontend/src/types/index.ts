export type RoomType = 'all' | 'standard' | 'deluxe' | 'suite' | 'villa';

export interface Room {
  id: string;
  name: string;
  slug: string;
  type: RoomType;
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  location: string;
  maxGuests: number;
  beds: string;
  baths: number;
  sizeSqFt: number;
  tag?: string;
  description: string;
  detailedDescription: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  popular: boolean;
  cancellationPolicy: string;
  bedType: string;
  view: string;
}

export interface Review {
  id: string;
  guestName: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  roomBooked: string;
}

export type PaymentMethodType = 'payhere' | 'card' | 'paypal' | 'pay_at_hotel';

export interface Booking {
  id: string;
  bookingReference: string;
  roomId: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalGuests: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
    nicPassport?: string;
  };
  paymentMethod: PaymentMethodType;
  subtotal: number;
  serviceCharge: number;
  taxes: number;
  discountAmount: number;
  promoCodeApplied?: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookedAt: string;
  cancellationReason?: string;
  userRating?: number;
  userReviewComment?: string;
}

export interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: RoomType;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  minRating: number;
  sortBy: 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  avatar: string;
  preferredCurrency: string;
  memberSince: string;
  savedRoomIds: string[];
}

export type AppView = 'home' | 'search' | 'room-detail' | 'checkout' | 'dashboard';
export type AuthModalType = 'login' | 'register' | 'forgot-password' | null;
export type ThemeMode = 'light' | 'dark' | 'system';
