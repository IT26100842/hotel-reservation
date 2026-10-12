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
  status?: string;
  totalRooms?: number;
  baseRoomNumber?: number;
  occupiedRooms?: number;
  availableRooms?: number;
  roomNumbers?: string[];
  occupiedRoomNumbers?: string[];
  availableRoomNumbers?: string[];
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
  likes?: number;
  hearts?: number;
}

export type PaymentMethodType = 'payhere' | 'card' | 'paypal' | 'pay_at_hotel';

export interface Booking {
  id: string;
  bookingReference: string;
  roomId: string;
  roomNumber?: string;
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
  status: 'confirmed' | 'checked_in' | 'cancelled' | 'completed';
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
  nicPassport?: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'guest' | string;
  status?: string;
}

export type AppView = 'home' | 'search' | 'room-detail' | 'checkout' | 'dashboard' | 'admin';
export type AuthModalType = 'login' | 'register' | 'forgot-password' | null;
export type ThemeMode = 'light' | 'dark' | 'system';

export type AdminTab = 'overview' | 'rooms' | 'bookings' | 'admins' | 'guests' | 'reviews' | 'promos' | 'profile';

export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRooms: number;
  totalPhysicalRooms?: number;
  occupiedPhysicalRooms?: number;
  availablePhysicalRooms?: number;
  totalUsers: number;
  totalAdmins: number;
  totalReviews: number;
  occupancyRate: number;
}

export interface PromoCodeItem {
  id?: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | string;
  discountValue: number;
  minSpend?: number;
  isActive: boolean;
}
