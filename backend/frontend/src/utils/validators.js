// Client-side validation (mirrors backend patterns)

export const validators = {
    fullName: (value) => {
      return /^[a-zA-Z\s'-]{2,100}$/.test(value);
    },
  
    username: (value) => {
      return /^[a-zA-Z0-9_-]{3,30}$/.test(value);
    },
  
    idNumber: (value) => {
      if (!/^\d{13}$/.test(value)) return false;
      
      // Basic date validation
      const month = parseInt(value.substring(2, 4));
      const day = parseInt(value.substring(4, 6));
      
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      
      return true;
    },
  
    accountNumber: (value) => {
      return /^[0-9]{8,16}$/.test(value);
    },
  
    amount: (value) => {
      if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) return false;
      const num = parseFloat(value);
      return num > 0 && num < 1000000000;
    },
  
    currency: (value) => {
      return /^[A-Z]{3}$/.test(value);
    },
  
    swiftCode: (value) => {
      return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value);
    },
  
    password: (value) => {
      if (value.length < 8) return false;
      if (!/[A-Z]/.test(value)) return false;
      if (!/[a-z]/.test(value)) return false;
      if (!/\d/.test(value)) return false;
      if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)) return false;
      return true;
    },
  };
  
  export const getPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', color: 'red' };
    if (strength <= 4) return { level: 'medium', color: 'yellow' };
    return { level: 'strong', color: 'green' };
  };
  
  export const validateForm = (formData, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = formData[field];
      const validator = validators[rules[field]];
      
      if (!value) {
        errors[field] = `${field} is required`;
      } else if (validator && !validator(value)) {
        errors[field] = `Invalid ${field} format`;
      }
    });
    
    return errors;
  };