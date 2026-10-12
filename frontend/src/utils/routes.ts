import { AppView, Room, SearchFilters } from '../types';
import { INITIAL_ROOMS } from '../data/mockData';

export interface RouteResolution {
  view: AppView;
  room?: Room;
  searchFilters?: Partial<SearchFilters>;
}

/**
 * Finds a room matching slug, id, or common user-friendly aliases
 */
export function findRoomBySlugOrId(identifier: string, rooms: Room[] = INITIAL_ROOMS): Room | undefined {
  if (!identifier) return undefined;
  const clean = identifier.toLowerCase().trim().replace(/\/+$/, '');

  // 1. Exact match on slug or id
  const exact = rooms.find((r) => r.slug.toLowerCase() === clean || r.id.toLowerCase() === clean);
  if (exact) return exact;

  // 2. Common aliases & IDs (e.g. 1, 2, 3, 4, deluxe, standard, suite, villa)
  const aliasMap: Record<string, string> = {
    '1': 'room-1',
    '2': 'room-2',
    '3': 'room-3',
    '4': 'room-4',
    'standard': 'standard-room',
    'deluxe': 'deluxe-oceanfront',
    'oceanfront': 'deluxe-oceanfront',
    'suite': 'presidential-ocean-suite',
    'presidential': 'presidential-ocean-suite',
    'villa': 'royal-coconut-grove-villa',
    'coconut': 'royal-coconut-grove-villa'
  };

  if (aliasMap[clean]) {
    const target = aliasMap[clean];
    const found = rooms.find((r) => r.id === target || r.slug === target);
    if (found) return found;
  }

  // 3. Substring match (e.g. 'deluxe-ocean' or 'presidential')
  return rooms.find((r) => r.slug.toLowerCase().includes(clean) || clean.includes(r.slug.toLowerCase()));
}

/**
 * Robustly parses current browser location (pathname, hash, search) into active View & Room
 */
export function parseRoute(
  pathname: string,
  hash: string = '',
  search: string = '',
  rooms: Room[] = INITIAL_ROOMS
): RouteResolution {
  // Normalize pathname and hash
  const cleanHash = hash.replace(/^#\/?/, '').trim();
  const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '').trim();

  // If a hash route is provided (e.g. #/rooms, #rooms, #/dashboard), prefer it
  let raw = '';
  if (cleanHash && cleanHash !== '') {
    raw = cleanHash;
  } else if (cleanPath && cleanPath !== '') {
    raw = cleanPath;
  } else {
    raw = '';
  }

  // Strip query parameters
  const parts = raw.split('?');
  const pathOnly = parts[0].toLowerCase().trim().replace(/\/+$/, '');
  const queryString = parts[1] || search.replace(/^\?/, '');

  // Parse optional search parameters (e.g. ?guests=2&type=deluxe)
  const filters: Partial<SearchFilters> = {};
  if (queryString) {
    try {
      const sp = new URLSearchParams(queryString);
      if (sp.has('guests')) {
        const g = parseInt(sp.get('guests') || '', 10);
        if (!isNaN(g) && g > 0) filters.guests = g;
      }
      if (sp.has('location')) {
        const loc = sp.get('location');
        if (loc) filters.location = loc;
      }
      if (sp.has('type')) {
        const t = sp.get('type');
        if (t === 'standard' || t === 'deluxe' || t === 'suite' || t === 'villa') {
          filters.roomType = t;
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  // Route 0: Admin Management Portal (/admin, /admin/*)
  if (pathOnly === 'admin' || pathOnly.startsWith('admin/')) {
    return { view: 'admin' };
  }

  // Route 1: Home Root
  if (!pathOnly || pathOnly === '' || pathOnly === 'home' || pathOnly === 'index') {
    return { view: 'home', searchFilters: filters };
  }

  // Route 2: Search & Room Catalog (/rooms, /search, /explore, /room)
  if (
    pathOnly === 'rooms' ||
    pathOnly === 'room' ||
    pathOnly === 'search' ||
    pathOnly === 'explore' ||
    pathOnly === 'all-rooms' ||
    pathOnly === 'accommodations'
  ) {
    return { view: 'search', searchFilters: filters };
  }

  // Route 3: Room Detail (/rooms/:slug, /room/:slug, /rooms/deluxe, etc.)
  if (pathOnly.startsWith('rooms/') || pathOnly.startsWith('room/')) {
    const slug = pathOnly.replace(/^rooms?\//, '').trim();
    const room = findRoomBySlugOrId(slug, rooms);
    if (room) {
      return { view: 'room-detail', room, searchFilters: filters };
    }
    // If not found, open rooms search catalog
    return { view: 'search', searchFilters: filters };
  }

  // Route 4: Checkout & Booking Flow (/checkout, /book, /payment)
  if (
    pathOnly === 'checkout' ||
    pathOnly === 'book' ||
    pathOnly === 'booking' ||
    pathOnly === 'payment'
  ) {
    return { view: 'checkout', searchFilters: filters };
  }

  // Route 5: User Dashboard & Reservations (/dashboard, /bookings, /my-bookings, /profile)
  if (
    pathOnly === 'dashboard' ||
    pathOnly === 'bookings' ||
    pathOnly === 'my-bookings' ||
    pathOnly === 'reservations' ||
    pathOnly === 'profile' ||
    pathOnly === 'account'
  ) {
    return { view: 'dashboard', searchFilters: filters };
  }

  // Check if someone entered a room slug directly at root (e.g. '/deluxe-oceanfront')
  const directRoom = findRoomBySlugOrId(pathOnly, rooms);
  if (directRoom) {
    return { view: 'room-detail', room: directRoom, searchFilters: filters };
  }

  // Default fallback to Home
  return { view: 'home', searchFilters: filters };
}

/**
 * Returns canonical clean URL for a given view & room
 */
export function getUrlForView(view: AppView, room?: Room): string {
  switch (view) {
    case 'home':
      return '/';
    case 'search':
      return '/rooms';
    case 'room-detail':
      return room ? `/rooms/${room.slug}` : '/rooms';
    case 'checkout':
      return '/checkout';
    case 'dashboard':
      return '/dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}
