import { Room, Booking, Review, UserProfile, SearchFilters, PaymentMethodType } from '../types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_REVIEWS, INITIAL_USER } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with JSON handling and graceful error recovery
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ----------------------------------------------------
// Room API
// ----------------------------------------------------
export const roomApi = {
  async getAll(filters?: Partial<SearchFilters>): Promise<Room[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.roomType && filters.roomType !== 'all') params.append('type', filters.roomType);
      if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
      if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters?.guests) params.append('guests', String(filters.guests));

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiFetch<any[]>(`/rooms${query}`);

      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeRoom);
      }
      return INITIAL_ROOMS;
    } catch (err) {
      console.warn('API /rooms fetch failed, using fallback data:', err);
      return INITIAL_ROOMS;
    }
  },

  async getByIdOrSlug(idOrSlug: string): Promise<Room> {
    try {
      const data = await apiFetch<any>(`/rooms/${encodeURIComponent(idOrSlug)}`);
      return normalizeRoom(data);
    } catch (err) {
      console.warn(`API /rooms/${idOrSlug} failed, searching in fallback:`, err);
      const found = INITIAL_ROOMS.find((r) => r.id === idOrSlug || r.slug === idOrSlug);
      if (found) return found;
      throw err;
    }
  },

  async create(room: Partial<Room>): Promise<Room> {
    const payload = {
      name: room.name,
      slug: room.slug || room.name?.toLowerCase().replace(/\s+/g, '-'),
      type: room.type || 'standard',
      pricePerNight: room.pricePerNight,
      currency: room.currency || 'LKR',
      rating: room.rating || 5.0,
      reviewCount: room.reviewCount || 0,
      location: room.location || 'Bentota Beach, Sri Lanka',
      maxGuests: room.maxGuests || 2,
      beds: room.beds || '1 King Bed',
      baths: room.baths || 1,
      sizeSqFt: room.sizeSqFt || 400,
      tag: room.tag || '',
      description: room.description || '',
      detailedDescription: room.detailedDescription || '',
      amenities: room.amenities || [],
      images: room.images || [],
      featured: Boolean(room.featured),
      popular: Boolean(room.popular),
      cancellationPolicy: room.cancellationPolicy || 'Free cancellation up to 48 hours before check-in',
      bedType: room.bedType || 'King Bed',
      view: room.view || 'Ocean View',
      status: room.status || 'available',
      totalRooms: room.totalRooms && room.totalRooms > 0 ? Number(room.totalRooms) : 5,
      baseRoomNumber: room.baseRoomNumber && room.baseRoomNumber > 0 ? Number(room.baseRoomNumber) : 101
    };
    const created = await apiFetch<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return normalizeRoom(created);
  },

  async update(id: string, room: Partial<Room>): Promise<Room> {
    const numericId = id.replace('room-', '');
    const updated = await apiFetch<any>(`/rooms/${numericId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...room,
        totalRooms: room.totalRooms ? Number(room.totalRooms) : undefined,
        baseRoomNumber: room.baseRoomNumber ? Number(room.baseRoomNumber) : undefined
      })
    });
    return normalizeRoom(updated);
  },

  async delete(id: string): Promise<void> {
    const numericId = id.replace('room-', '');
    await apiFetch(`/rooms/${numericId}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Booking API
// ----------------------------------------------------
export interface CreateBookingPayload {
  roomId: string;
  roomNumber?: string;
  userId?: string | number;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    nicPassport?: string;
    specialRequests?: string;
  };
  paymentMethod: PaymentMethodType;
  subtotal: number;
  serviceCharge: number;
  taxes: number;
  discountAmount: number;
  promoCodeApplied?: string;
  totalAmount: number;
  currency: string;
}

export const bookingApi = {
  async create(payload: CreateBookingPayload): Promise<Booking> {
    const created = await apiFetch<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        roomId: payload.roomId.replace('room-', ''),
        roomNumber: payload.roomNumber,
        userId: payload.userId ? Number(String(payload.userId).replace('usr-', '')) : null,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        nights: payload.nights,
        adults: payload.adults,
        children: payload.children,
        guestInfo: payload.guestInfo,
        paymentMethod: payload.paymentMethod,
        subtotal: payload.subtotal,
        serviceCharge: payload.serviceCharge,
        taxes: payload.taxes,
        discountAmount: payload.discountAmount,
        promoCodeApplied: payload.promoCodeApplied,
        totalAmount: payload.totalAmount,
        currency: payload.currency
      })
    });
    return normalizeBooking(created);
  },

  async getUserBookings(email?: string, userId?: string | number): Promise<Booking[]> {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (userId) params.append('userId', String(userId).replace('usr-', ''));

      const data = await apiFetch<any[]>(`/bookings?${params.toString()}`);
      if (Array.isArray(data)) {
        return data.map(normalizeBooking);
      }
      return [];
    } catch (err) {
      console.warn('API /bookings GET failed:', err);
      return [];
    }
  },

  async cancel(bookingId: string, reason: string): Promise<void> {
    try {
      const numericId = bookingId.replace('bk-', '');
      await apiFetch(`/bookings/${numericId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
      });
    } catch (err) {
      console.warn(`API /bookings/${bookingId}/cancel failed:`, err);
    }
  },

  async rate(bookingId: string, rating: number, comment?: string): Promise<void> {
    try {
      const numericId = bookingId.replace('bk-', '');
      await apiFetch(`/bookings/${numericId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
    } catch (err) {
      console.warn(`API /bookings/${bookingId}/rate failed:`, err);
    }
  },

  async getAll(): Promise<Booking[]> {
    try {
      const data = await apiFetch<any[]>('/bookings');
      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeBooking);
      }
      return INITIAL_BOOKINGS;
    } catch (err) {
      console.warn('API /bookings getAll failed:', err);
      return INITIAL_BOOKINGS;
    }
  },

  async updateStatus(bookingId: string, status: string): Promise<Booking> {
    const numericId = bookingId.replace('bk-', '');
    const updated = await apiFetch<any>(`/bookings/${numericId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return normalizeBooking(updated);
  },

  async delete(bookingId: string): Promise<void> {
    const numericId = bookingId.replace('bk-', '');
    await apiFetch(`/bookings/${numericId}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Authentication & User Profile API (Real Backend Auth)
// ----------------------------------------------------
export const authApi = {
  async login(email: string, password?: string): Promise<UserProfile> {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }
    const user = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });
    return normalizeUser(user);
  },

  async register(data: {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    city?: string;
    country?: string;
  }): Promise<UserProfile> {
    if (!data.fullName || !data.fullName.trim()) {
      throw new Error('Please enter your full name.');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    const user = await apiFetch<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone?.trim() || '',
        city: data.city?.trim() || '',
        country: data.country?.trim() || 'Sri Lanka'
      })
    });
    return normalizeUser(user);
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Backend logout call notification:', err);
    }
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const numericId = String(userId).replace(/\D/g, '') || '1';
    const user = await apiFetch<any>(`/auth/profile/${numericId}`, {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
    return normalizeUser(user);
  },

  async uploadAvatar(userId: string, base64Image: string | { base64DataUrl?: string }): Promise<UserProfile> {
    const numericId = String(userId).replace(/\D/g, '') || '1';
    const imageStr = typeof base64Image === 'string' ? base64Image : (base64Image?.base64DataUrl || '');
    const user = await apiFetch<any>(`/auth/profile/${numericId}/avatar`, {
      method: 'POST',
      body: JSON.stringify({ image: imageStr })
    });
    return normalizeUser(user);
  },

  async removeAvatar(userId: string): Promise<UserProfile> {
    const numericId = String(userId).replace(/\D/g, '') || '1';
    const user = await apiFetch<any>(`/auth/profile/${numericId}/avatar`, {
      method: 'DELETE'
    });
    return normalizeUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const numericId = String(userId).replace(/\D/g, '') || '1';
    await apiFetch<any>(`/auth/profile/${numericId}/password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async toggleSavedRoom(userId: string, roomId: string): Promise<UserProfile> {
    try {
      const numericUserId = String(userId).replace(/\D/g, '') || '1';
      const user = await apiFetch<any>(`/auth/profile/${numericUserId}/save-room/${encodeURIComponent(roomId)}`, {
        method: 'POST'
      });
      return normalizeUser(user);
    } catch (err) {
      console.warn('API toggleSavedRoom failed:', err);
      throw err;
    }
  }
};

// ----------------------------------------------------
// Reviews API
// ----------------------------------------------------
export const reviewApi = {
  async getAll(): Promise<Review[]> {
    try {
      const data = await apiFetch<any[]>('/reviews');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((r) => ({
          id: String(r.id),
          guestName: r.guestName,
          location: r.location || '',
          avatar: r.avatar || '',
          rating: r.rating || 5,
          comment: r.comment,
          date: r.date || 'Recently',
          roomBooked: r.roomBooked || 'Deluxe Oceanfront',
          likes: typeof r.likes === 'number' ? r.likes : 0,
          hearts: typeof r.hearts === 'number' ? r.hearts : 0
        }));
      }
      return INITIAL_REVIEWS;
    } catch (err) {
      console.warn('API /reviews failed, using fallback:', err);
      return INITIAL_REVIEWS;
    }
  },

  async submit(review: {
    guestName: string;
    location?: string;
    avatar?: string;
    rating: number;
    comment: string;
    roomBooked?: string;
  }): Promise<Review> {
    try {
      const created = await apiFetch<any>('/reviews', {
        method: 'POST',
        body: JSON.stringify(review)
      });
      return {
        id: String(created.id),
        guestName: created.guestName,
        location: created.location || '',
        avatar: created.avatar || '',
        rating: created.rating,
        comment: created.comment,
        date: created.date || 'Just now',
        roomBooked: created.roomBooked || 'Deluxe Oceanfront',
        likes: typeof created.likes === 'number' ? created.likes : 0,
        hearts: typeof created.hearts === 'number' ? created.hearts : 0
      };
    } catch (err) {
      console.warn('API submit review failed, creating locally:', err);
      return {
        id: 'rev-' + Date.now(),
        guestName: review.guestName,
        location: review.location || '',
        avatar: review.avatar || '',
        rating: review.rating,
        comment: `“${review.comment.trim()}”`,
        date: 'Just now',
        roomBooked: review.roomBooked || 'Deluxe Oceanfront',
        likes: 0,
        hearts: 0
      };
    }
  },

  async toggleLike(reviewId: string, increment: boolean = true): Promise<Review | null> {
    try {
      const numId = reviewId.replace('rev-', '');
      const updated = await apiFetch<any>(`/reviews/${numId}/like?increment=${increment}`, {
        method: 'POST',
        body: JSON.stringify({ increment })
      });
      if (updated && updated.id !== undefined) {
        return {
          id: String(updated.id),
          guestName: updated.guestName,
          location: updated.location || '',
          avatar: updated.avatar || '',
          rating: updated.rating || 5,
          comment: updated.comment,
          date: updated.date || 'Recently',
          roomBooked: updated.roomBooked || 'Deluxe Oceanfront',
          likes: typeof updated.likes === 'number' ? updated.likes : 0,
          hearts: typeof updated.hearts === 'number' ? updated.hearts : 0
        };
      }
      return null;
    } catch (err) {
      console.warn('API toggleLike failed:', err);
      return null;
    }
  },

  async toggleHeart(reviewId: string, increment: boolean = true): Promise<Review | null> {
    try {
      const numId = reviewId.replace('rev-', '');
      const updated = await apiFetch<any>(`/reviews/${numId}/heart?increment=${increment}`, {
        method: 'POST',
        body: JSON.stringify({ increment })
      });
      if (updated && updated.id !== undefined) {
        return {
          id: String(updated.id),
          guestName: updated.guestName,
          location: updated.location || '',
          avatar: updated.avatar || '',
          rating: updated.rating || 5,
          comment: updated.comment,
          date: updated.date || 'Recently',
          roomBooked: updated.roomBooked || 'Deluxe Oceanfront',
          likes: typeof updated.likes === 'number' ? updated.likes : 0,
          hearts: typeof updated.hearts === 'number' ? updated.hearts : 0
        };
      }
      return null;
    } catch (err) {
      console.warn('API toggleHeart failed:', err);
      return null;
    }
  },

  async delete(reviewId: string): Promise<void> {
    const numId = reviewId.replace('rev-', '');
    await apiFetch(`/reviews/${numId}`, { method: 'DELETE' });
  }
};

// ----------------------------------------------------
// Promo API
// ----------------------------------------------------
export const promoApi = {
  async getAll(): Promise<any[]> {
    try {
      return await apiFetch<any[]>('/promos');
    } catch (err) {
      console.warn('API /promos failed, returning mock promos:', err);
      return [
        { id: 1, code: 'SERENE10', description: '10% Discount on any coastal room booking', discountType: 'percentage', discountValue: 10, minSpend: 10000, isActive: true },
        { id: 2, code: 'WELCOME15', description: '15% Special Welcome Discount', discountType: 'percentage', discountValue: 15, minSpend: 15000, isActive: true },
        { id: 3, code: 'CEYLON20', description: '20% Exclusive Villa & Suite Discount', discountType: 'percentage', discountValue: 20, minSpend: 25000, isActive: true }
      ];
    }
  },

  async create(promo: any): Promise<any> {
    return await apiFetch<any>('/promos', {
      method: 'POST',
      body: JSON.stringify(promo)
    });
  },

  async delete(id: number | string): Promise<void> {
    await apiFetch(`/promos/${id}`, { method: 'DELETE' });
  },

  async validate(code: string, subtotal: number): Promise<{
    valid: boolean;
    discountRate: number;
    discountAmount: number;
    message?: string;
  }> {
    try {
      const res = await apiFetch<any>('/promos/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal })
      });
      return {
        valid: Boolean(res.valid),
        discountRate: res.discountRate || 0,
        discountAmount: res.discountAmount || 0,
        message: res.message
      };
    } catch (err) {
      // Local fallback
      const clean = code.trim().toUpperCase();
      if (clean === 'SERENE10') return { valid: true, discountRate: 0.10, discountAmount: Math.round(subtotal * 0.10) };
      if (clean === 'WELCOME15') return { valid: true, discountRate: 0.15, discountAmount: Math.round(subtotal * 0.15) };
      if (clean === 'CEYLON20') return { valid: true, discountRate: 0.20, discountAmount: Math.round(subtotal * 0.20) };
      return { valid: false, discountRate: 0, discountAmount: 0, message: 'Invalid promo code.' };
    }
  }
};

// ----------------------------------------------------
// Admin API (Management, Stats, Staff & Users)
// ----------------------------------------------------
export const adminApi = {
  async getStats(): Promise<any> {
    try {
      return await apiFetch<any>('/admin/stats');
    } catch (err) {
      console.warn('API /admin/stats failed, computing local stats:', err);
      return {
        totalRevenue: 284500,
        totalBookings: 6,
        confirmedBookings: 5,
        cancelledBookings: 1,
        totalRooms: 6,
        totalUsers: 8,
        totalAdmins: 2,
        totalReviews: 4,
        occupancyRate: 85
      };
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const data = await apiFetch<any[]>('/admin/users');
      return data.map(normalizeUser);
    } catch (err) {
      console.warn('API /admin/users failed:', err);
      return [
        {
          id: 'usr-1',
          fullName: 'Serene Stay Head Admin',
          email: 'admin@serenestay.com',
          phone: '+94 77 999 8888',
          city: 'Bentota',
          country: 'Sri Lanka',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          preferredCurrency: 'LKR',
          memberSince: 'January 2024',
          savedRoomIds: [],
          role: 'super_admin',
          status: 'active'
        },
        {
          id: 'usr-2',
          fullName: 'Thilina Kavishan',
          email: 'thilinakavishan42@gmail.com',
          phone: '+94 77 123 4567',
          city: 'Colombo',
          country: 'Sri Lanka',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          preferredCurrency: 'LKR',
          memberSince: 'January 2025',
          savedRoomIds: ['room-2', 'room-3'],
          role: 'guest',
          status: 'active'
        }
      ];
    }
  },

  async getAdmins(): Promise<UserProfile[]> {
    try {
      const data = await apiFetch<any[]>('/admin/admins');
      return data.map(normalizeUser);
    } catch (err) {
      console.warn('API /admin/admins failed:', err);
      return [
        {
          id: 'usr-1',
          fullName: 'Serene Stay Head Admin',
          email: 'admin@serenestay.com',
          phone: '+94 77 999 8888',
          city: 'Bentota',
          country: 'Sri Lanka',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          preferredCurrency: 'LKR',
          memberSince: 'January 2024',
          savedRoomIds: [],
          role: 'super_admin',
          status: 'active'
        }
      ];
    }
  },

  async createAdmin(data: {
    fullName: string;
    email: string;
    password?: string;
    role?: string;
    phone?: string;
  }): Promise<UserProfile> {
    const created = await apiFetch<any>('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return normalizeUser(created);
  },

  async updateAdmin(id: string, data: Partial<UserProfile> & { password?: string }): Promise<UserProfile> {
    const numericId = id.replace('usr-', '');
    const updated = await apiFetch<any>(`/admin/admins/${numericId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return normalizeUser(updated);
  },

  async deleteAdmin(id: string): Promise<void> {
    const numericId = id.replace('usr-', '');
    await apiFetch(`/admin/admins/${numericId}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Normalization helpers
// ----------------------------------------------------
function normalizeRoom(r: any): Room {
  const totalRooms = typeof r.totalRooms === 'number' && r.totalRooms > 0 ? r.totalRooms : 5;
  const baseRoomNumber = typeof r.baseRoomNumber === 'number' && r.baseRoomNumber > 0 ? r.baseRoomNumber : ((Number(r.id) || 1) * 100 + 1);
  const occupiedRooms = typeof r.occupiedRooms === 'number' ? r.occupiedRooms : 0;
  const availableRooms = typeof r.availableRooms === 'number' ? r.availableRooms : Math.max(0, totalRooms - occupiedRooms);
  const defaultNumbers = Array.from({ length: totalRooms }, (_, i) => String(baseRoomNumber + i));

  return {
    id: `room-${r.id}`,
    name: r.name,
    slug: r.slug,
    type: r.type,
    pricePerNight: r.pricePerNight,
    currency: r.currency || 'LKR',
    rating: r.rating || 5.0,
    reviewCount: r.reviewCount || 0,
    location: r.location || 'Bentota Beach, Sri Lanka',
    maxGuests: r.maxGuests || 2,
    beds: r.beds || '1 King Bed',
    baths: r.baths || 1,
    sizeSqFt: r.sizeSqFt || 400,
    tag: r.tag,
    description: r.description || '',
    detailedDescription: r.detailedDescription || '',
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    images: Array.isArray(r.images) && r.images.length > 0 ? r.images : [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    featured: Boolean(r.featured),
    popular: Boolean(r.popular),
    cancellationPolicy: r.cancellationPolicy || 'Free cancellation up to 48 hours before check-in',
    bedType: r.bedType || 'King Bed',
    view: r.view || 'Ocean View',
    status: r.status || 'available',
    totalRooms,
    baseRoomNumber,
    occupiedRooms,
    availableRooms,
    roomNumbers: Array.isArray(r.roomNumbers) && r.roomNumbers.length > 0 ? r.roomNumbers : defaultNumbers,
    occupiedRoomNumbers: Array.isArray(r.occupiedRoomNumbers) ? r.occupiedRoomNumbers : [],
    availableRoomNumbers: Array.isArray(r.availableRoomNumbers) ? r.availableRoomNumbers : defaultNumbers
  };
}

function normalizeBooking(b: any): Booking {
  const roomObj = b.room ? normalizeRoom(b.room) : (
    INITIAL_ROOMS.find((r) => r.id === `room-${b.roomId}`) || INITIAL_ROOMS[0]
  );

  return {
    id: `bk-${b.id}`,
    bookingReference: b.bookingReference,
    roomId: `room-${b.roomId || (b.room ? b.room.id : 1)}`,
    roomNumber: b.roomNumber || (roomObj.baseRoomNumber ? String(roomObj.baseRoomNumber) : '101'),
    room: roomObj,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    adults: b.adults,
    children: b.children,
    totalGuests: b.totalGuests,
    guestInfo: {
      fullName: b.guestInfo?.fullName || b.guestFullName || '',
      email: b.guestInfo?.email || b.guestEmail || '',
      phone: b.guestInfo?.phone || b.guestPhone || '',
      nicPassport: b.guestInfo?.nicPassport || b.guestNicPassport,
      specialRequests: b.guestInfo?.specialRequests || b.specialRequests
    },
    paymentMethod: b.paymentMethod,
    subtotal: b.subtotal,
    serviceCharge: b.serviceCharge,
    taxes: b.taxes,
    discountAmount: b.discountAmount,
    promoCodeApplied: b.promoCodeApplied,
    totalAmount: b.totalAmount,
    currency: b.currency || 'LKR',
    status: b.status,
    bookedAt: b.bookedAt || '',
    cancellationReason: b.cancellationReason,
    userRating: b.userRating,
    userReviewComment: b.userReviewComment
  };
}

function normalizeUser(u: any): UserProfile {
  return {
    id: `usr-${u.id}`,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone || '+94 77 123 4567',
    city: u.city || 'Colombo',
    country: u.country || 'Sri Lanka',
    avatar: u.avatarUrl || '',
    preferredCurrency: u.preferredCurrency || 'LKR',
    memberSince: 'January 2025',
    savedRoomIds: Array.isArray(u.savedRoomIds) ? u.savedRoomIds : ['room-2', 'room-3'],
    role: u.role || 'guest',
    status: u.status || 'active'
  };
}
