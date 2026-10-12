/**
 * Cookie and Session Management Utilities for SereneStay
 */

import { UserProfile } from '../types';

export function setCookie(name: string, value: string, days = 14): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to set cookie:', err);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (err) {
    console.warn('Failed to read cookie:', err);
  }
  return null;
}

export function deleteCookie(name: string): void {
  try {
    document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  } catch (err) {
    console.warn('Failed to delete cookie:', err);
  }
}

const USER_SESSION_KEY = 'serene_stay_user';
const ADMIN_SESSION_KEY = 'serene_stay_admin';

/**
 * Save user profile to both persistent Cookie and LocalStorage
 */
export function saveUserSession(user: UserProfile): void {
  try {
    const serialized = JSON.stringify(user);
    setCookie(USER_SESSION_KEY, serialized, 14);
    localStorage.setItem(USER_SESSION_KEY, serialized);
  } catch (err) {
    console.error('Failed to save user session:', err);
  }
}

/**
 * Load user session: checks cookie first, falls back to localStorage
 */
export function loadUserSession(): UserProfile | null {
  try {
    const cookieData = getCookie(USER_SESSION_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      if (parsed && parsed.id) return parsed;
    }
    const localData = localStorage.getItem(USER_SESSION_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed && parsed.id) {
        setCookie(USER_SESSION_KEY, localData, 14); // sync back to cookie
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user session:', err);
  }
  return null;
}

/**
 * Clear user session cookies and localStorage
 */
export function clearUserSession(): void {
  deleteCookie(USER_SESSION_KEY);
  deleteCookie('serene_session');
  deleteCookie('serene_role');
  localStorage.removeItem(USER_SESSION_KEY);
}

/**
 * Save administrator session
 */
export function saveAdminSession(admin: UserProfile): void {
  try {
    const serialized = JSON.stringify(admin);
    setCookie(ADMIN_SESSION_KEY, serialized, 7);
    localStorage.setItem(ADMIN_SESSION_KEY, serialized);
  } catch (err) {
    console.error('Failed to save admin session:', err);
  }
}

/**
 * Load administrator session
 */
export function loadAdminSession(): UserProfile | null {
  try {
    const cookieData = getCookie(ADMIN_SESSION_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      if (parsed && parsed.id) return parsed;
    }
    const localData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed && parsed.id) {
        setCookie(ADMIN_SESSION_KEY, localData, 7);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load admin session:', err);
  }
  return null;
}

/**
 * Clear administrator session
 */
export function clearAdminSession(): void {
  deleteCookie(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem('serene_admin_user');
}

const MY_REVIEWS_COOKIE_KEY = 'serene_my_reviews';
const LIKED_REVIEWS_COOKIE_KEY = 'serene_liked_reviews';
const HEARTED_REVIEWS_COOKIE_KEY = 'serene_hearted_reviews';

function readStringArrayCookie(key: string): string[] {
  try {
    const rawCookie = getCookie(key);
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
    const rawLocal = localStorage.getItem(key);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        setCookie(key, rawLocal, 365);
        return parsed.map(String);
      }
    }
  } catch (err) {
    console.warn(`Failed to read cookie array ${key}:`, err);
  }
  return [];
}

function writeStringArrayCookie(key: string, values: string[]): void {
  try {
    const unique = Array.from(new Set(values.map(String)));
    const serialized = JSON.stringify(unique);
    setCookie(key, serialized, 365);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`Failed to write cookie array ${key}:`, err);
  }
}

export function getMyReviewIdsFromCookie(): string[] {
  return readStringArrayCookie(MY_REVIEWS_COOKIE_KEY);
}

export function addMyReviewIdToCookie(reviewId: string | number): string[] {
  const current = getMyReviewIdsFromCookie();
  const idStr = String(reviewId);
  if (!current.includes(idStr)) {
    current.push(idStr);
    writeStringArrayCookie(MY_REVIEWS_COOKIE_KEY, current);
  }
  return current;
}

export function getLikedReviewIdsFromCookie(): string[] {
  return readStringArrayCookie(LIKED_REVIEWS_COOKIE_KEY);
}

export function saveLikedReviewIdsToCookie(ids: string[]): void {
  writeStringArrayCookie(LIKED_REVIEWS_COOKIE_KEY, ids);
}

export function getHeartedReviewIdsFromCookie(): string[] {
  return readStringArrayCookie(HEARTED_REVIEWS_COOKIE_KEY);
}

export function saveHeartedReviewIdsToCookie(ids: string[]): void {
  writeStringArrayCookie(HEARTED_REVIEWS_COOKIE_KEY, ids);
}

