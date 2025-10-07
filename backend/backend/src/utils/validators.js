// backend/src/utils/validators.js

/**
 * Additional validation utilities
 * These complement the middleware validators
 */

/**
 * Validate South African ID Number
 * @param {string} idNumber - 13 digit SA ID
 * @returns {boolean}
 */
export const validateSAIDNumber = (idNumber) => {
    if (!/^\d{13}$/.test(idNumber)) {
      return false;
    }
  
    // Extract date components
    const year = parseInt(idNumber.substring(0, 2));
    const month = parseInt(idNumber.substring(2, 4));
    const day = parseInt(idNumber.substring(4, 6));
  
    // Validate month and day
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
  
    // Validate using Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
  
    for (let i = idNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(idNumber.charAt(i));
  
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
  
      sum += digit;
      shouldDouble = !shouldDouble;
    }
  
    return sum % 10 === 0;
  };
  
  /**
   * Validate SWIFT/BIC code format
   * @param {string} swiftCode
   * @returns {boolean}
   */
  export const validateSWIFTCode = (swiftCode) => {
    // SWIFT code format: AAAA BB CC DDD
    // AAAA = Bank code (4 letters)
    // BB = Country code (2 letters)
    // CC = Location code (2 letters or digits)
    // DDD = Branch code (3 letters or digits) - optional
  
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(swiftCode);
  };
  
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate currency code (ISO 4217)
   * @param {string} currency
   * @returns {boolean}
   */
  export const validateCurrency = (currency) => {
    const validCurrencies = [
      'USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'CHF', 'AUD', 'CAD',
      'CNY', 'INR', 'BRL', 'MXN', 'KRW', 'SGD', 'HKD', 'NOK',
      'SEK', 'DKK', 'PLN', 'THB', 'MYR', 'PHP', 'IDR', 'CZK'
    ];
    return validCurrencies.includes(currency.toUpperCase());
  };
  
  /**
   * Validate amount
   * @param {number|string} amount
   * @returns {boolean}
   */
  export const validateAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 1000000000;
  };
  
  /**
   * Sanitize filename (prevent path traversal)
   * @param {string} filename
   * @returns {string}
   */
  export const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  };
  
  /**
   * Check if IP is in whitelist
   * @param {string} ip
   * @param {Array} whitelist
   * @returns {boolean}
   */
  export const isIPWhitelisted = (ip, whitelist) => {
    if (!whitelist || whitelist.length === 0) return true;
    return whitelist.includes(ip);
  };