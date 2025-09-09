/**
 * URL Utilities for Affordmed URL Shortener
 * Handles URL validation, shortcode generation, and redirection logic
 */

import logger from './logger.js';

class URLUtils {
  constructor() {
    this.SHORTCODE_LENGTH = 6;
    this.DEFAULT_VALIDITY_MINUTES = 30;
    this.VALIDITY_MAX_HOURS = 24;
  }

  // URL validation
  isValidURL(string) {
    try {
      const url = new URL(string);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  // Normalize URL (add protocol if missing)
  normalizeURL(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  // Generate unique shortcode
  generateShortCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < this.SHORTCODE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    logger.debug('Generated shortcode', { shortCode: result });
    return result;
  }

  // Validate custom shortcode
  isValidShortCode(shortCode) {
    if (!shortCode || typeof shortCode !== 'string') {
      return false;
    }
    
    // Check length and alphanumeric characters
    const regex = /^[a-zA-Z0-9]+$/;
    return shortCode.length >= 3 && 
           shortCode.length <= 20 && 
           regex.test(shortCode);
  }

  // Check if shortcode is unique
  isShortCodeUnique(shortCode, existingUrls) {
    return !existingUrls.some(url => url.shortCode === shortCode);
  }

  // Validate validity duration
  isValidValidityDuration(minutes) {
    const num = parseInt(minutes);
    return !isNaN(num) && num > 0 && num <= (this.VALIDITY_MAX_HOURS * 60);
  }

  // Calculate expiry timestamp
  calculateExpiryTime(validityMinutes = this.DEFAULT_VALIDITY_MINUTES) {
    const now = Date.now();
    const validityMs = validityMinutes * 60 * 1000;
    return now + validityMs;
  }

  // Check if URL is expired
  isExpired(expiresAt) {
    return Date.now() > expiresAt;
  }

  // Format timestamp for display
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  // Get time remaining until expiry
  getTimeRemaining(expiresAt) {
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  }

  // Get browser location (coarse)
  async getBrowserLocation() {
    try {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: Math.round(position.coords.latitude * 100) / 100,
                longitude: Math.round(position.coords.longitude * 100) / 100,
                accuracy: Math.round(position.coords.accuracy)
              };
              logger.debug('Location obtained', location);
              resolve(location);
            },
            (error) => {
              logger.warn('Location access denied or failed', { error: error.message });
              resolve(null);
            },
            { timeout: 5000, enableHighAccuracy: false }
          );
        });
      }
    } catch (error) {
      logger.error('Geolocation error', { error: error.message });
    }
    
    return null;
  }

  // Get referrer information
  getReferrerInfo() {
    const referrer = document.referrer;
    const userAgent = navigator.userAgent;
    
    return {
      referrer: referrer || 'Direct',
      userAgent: userAgent,
      timestamp: Date.now()
    };
  }
}

// Create singleton instance
const urlUtils = new URLUtils();

export default urlUtils;
