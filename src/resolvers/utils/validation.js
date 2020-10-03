import validator from 'validator';
import xss from 'xss';

const validateEmail = (email) => {
  const emailIsValid = validator.isEmail(email);
  if (!emailIsValid) throw Error('Invalid email provided.');

  return validator.normalizeEmail(email);
};

const validateName = (name) => {
  // Trim extra whitespace and escape HTML entities
  const sanitizedName = xss(validator.trim(name));

  // Check name length
  if (sanitizedName.length < 2 || sanitizedName.length > 32)
    throw Error('Name must contain 2-32 characters.');

  return sanitizedName;
};

const validateAvatar = (avatar) => {
  // Make sure avatar is a URL
  if (!validator.isURL(avatar))
    throw Error('Avatar must be a valid image URL.');

  // Make sure it is a PNG or JPG
  const re = /.(png|jpe?g)$/i;
  if (!avatar.match(re)) throw Error('Avatar must be either a PNG or JP(E)G.');

  return avatar;
};

const validateBio = (bio) => {
  // Trim extra whitespace and escape HTML entities
  const sanitizedBio = xss(validator.trim(bio));

  // Check bio length
  if (sanitizedBio.length > 320)
    throw Error('Bio may not exceed 320 characters.');

  return sanitizedBio;
};

export default {
  validateEmail,
  validateName,
  validateAvatar,
  validateBio
};
