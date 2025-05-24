/**
 * Performance Optimization Utilities
 * 
 * This module provides utilities and configurations for optimizing the performance
 * of the Logware Security Platform when dealing with large datasets and concurrent users.
 */

// --- Virtualization Helpers ---

/**
 * Creates a virtualized window configuration for large datasets
 * @param {Object} options Configuration options
 * @returns {Object} Virtualization configuration
 */
export const createVirtualizedConfig = (options = {}) => {
  const defaults = {
    itemHeight: 50,
    overscan: 5,
    windowHeight: 500,
    estimatedItemSize: 50,
    threshold: 15
  };
  
  const config = { ...defaults, ...options };
  
  return {
    itemHeight: config.itemHeight,
    overscan: config.overscan,
    windowHeight: config.windowHeight,
    estimatedItemSize: config.estimatedItemSize,
    threshold: config.threshold
  };
};

// --- Data Chunking ---

/**
 * Splits large datasets into manageable chunks for more efficient rendering and processing
 * @param {Array} data The full dataset
 * @param {number} chunkSize Size of each chunk
 * @returns {Array} Array of data chunks
 */
export const chunkData = (data, chunkSize = 100) => {
  if (!Array.isArray(data)) return [];
  
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  
  return chunks;
};

/**
 * Process data in chunks to avoid blocking the main thread
 * @param {Array} data Data to process
 * @param {Function} processFn Processing function for each item
 * @param {number} chunkSize Size of each processing chunk
 * @returns {Promise<Array>} Processed data
 */
export const processInChunks = async (data, processFn, chunkSize = 100) => {
  const chunks = chunkData(data, chunkSize);
  const results = [];
  
  for (const chunk of chunks) {
    const processedChunk = await new Promise(resolve => {
      setTimeout(() => {
        resolve(chunk.map(processFn));
      }, 0);
    });
    
    results.push(...processedChunk);
  }
  
  return results;
};

// --- Memoization ---

/**
 * Creates a memoized version of a function to cache results
 * @param {Function} fn Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// --- Debounce and Throttle ---

/**
 * Creates a debounced function that delays invoking the provided function
 * @param {Function} fn Function to debounce
 * @param {number} wait Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Creates a throttled function that only invokes the provided function at most once per specified period
 * @param {Function} fn Function to throttle
 * @param {number} limit Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// --- Worker Thread Management ---

/**
 * Creates a worker thread for CPU-intensive operations
 * @param {Function} workerFn Function to run in worker
 * @returns {Worker} Worker instance
 */
export const createWorker = (workerFn) => {
  const fnString = workerFn.toString();
  const blob = new Blob([`(${fnString})()`], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
};

// --- Data Caching ---

/**
 * LRU Cache implementation for frontend data caching
 */
export class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = 1000 * 60 * 5; // 5 minutes
  }
  
  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Check if entry has expired
    const expiry = this.ttl.get(key);
    if (expiry && expiry < Date.now()) {
      this.remove(key);
      return null;
    }
    
    // Move to the end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  put(key, value, ttl = this.defaultTTL) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove the first item (least recently used)
      const firstKey = this.cache.keys().next().value;
      this.remove(firstKey);
    }
    
    this.cache.set(key, value);
    if (ttl > 0) {
      this.ttl.set(key, Date.now() + ttl);
    }
    return true;
  }
  
  remove(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }
  
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }
}

// Cache instance for application-wide use
export const dataCache = new LRUCache(200);
