/**
 * Data Persistence Layer for Affordmed URL Shortener
 * Handles localStorage operations with error handling
 */

import logger from './logger.js';

class StorageManager {
  constructor() {
    this.STORAGE_KEYS = {
      SHORTENED_URLS: 'affordmed_shortened_urls',
      ANALYTICS: 'affordmed_analytics',
      SETTINGS: 'affordmed_settings'
    };
  }

  // Generic storage methods
  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      logger.info(`Data stored successfully`, { key, size: serializedValue.length });
      return true;
    } catch (error) {
      logger.error(`Failed to store data`, { key, error: error.message });
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      logger.error(`Failed to retrieve data`, { key, error: error.message });
      return defaultValue;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      logger.info(`Data removed successfully`, { key });
      return true;
    } catch (error) {
      logger.error(`Failed to remove data`, { key, error: error.message });
      return false;
    }
  }

  // URL-specific methods
  saveShortenedUrl(urlData) {
    const urls = this.getShortenedUrls();
    urls.push(urlData);
    return this.setItem(this.STORAGE_KEYS.SHORTENED_URLS, urls);
  }

  getShortenedUrls() {
    return this.getItem(this.STORAGE_KEYS.SHORTENED_URLS, []);
  }

  updateShortenedUrl(shortCode, updates) {
    const urls = this.getShortenedUrls();
    const index = urls.findIndex(url => url.shortCode === shortCode);
    
    if (index !== -1) {
      urls[index] = { ...urls[index], ...updates };
      return this.setItem(this.STORAGE_KEYS.SHORTENED_URLS, urls);
    }
    
    return false;
  }

  // Analytics methods
  saveAnalytics(shortCode, clickData) {
    const analytics = this.getAnalytics();
    if (!analytics[shortCode]) {
      analytics[shortCode] = [];
    }
    analytics[shortCode].push(clickData);
    return this.setItem(this.STORAGE_KEYS.ANALYTICS, analytics);
  }

  getAnalytics() {
    return this.getItem(this.STORAGE_KEYS.ANALYTICS, {});
  }

  // Cleanup expired URLs
  cleanupExpiredUrls() {
    const urls = this.getShortenedUrls();
    const now = Date.now();
    const validUrls = urls.filter(url => url.expiresAt > now);
    
    if (validUrls.length !== urls.length) {
      this.setItem(this.STORAGE_KEYS.SHORTENED_URLS, validUrls);
      logger.info(`Cleaned up expired URLs`, { 
        removed: urls.length - validUrls.length,
        remaining: validUrls.length 
      });
    }
    
    return validUrls;
  }

  // Clear all data
  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
    logger.info('All data cleared');
  }
}

// Create singleton instance
const storage = new StorageManager();

export default storage;
