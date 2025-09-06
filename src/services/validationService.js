const validatePassword = (password) => {
  const minLength = password.length >= 10;
  const maxLength = password.length <= 64;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[@#$%^&*+\-_=;:<>?|~]/.test(password);

  return {
    isValid: minLength && maxLength && hasUppercase && hasLowercase && hasDigit && hasSymbol,
    requirements: {
      minLength,
      maxLength,
      hasUppercase,
      hasLowercase,
      hasDigit,
      hasSymbol,
    },
  };
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validatePassword,
  validateEmail,
};
