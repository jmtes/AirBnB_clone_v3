import validator from 'validator';
import xss from 'xss';
import axios from 'axios';

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

const validateDesc = (desc) => {
  // Trim extra whitespace and escape HTML entities
  const sanitizedDesc = xss(validator.trim(desc));

  // Make sure description is not empty
  if (sanitizedDesc.length < 1) throw Error('Description may not be empty.');

  // Make sure word count does not exceed 250
  const wordCount = desc.split(/\s/).length;
  if (wordCount > 250) throw Error('Description may not exceed 250 words.');

  return sanitizedDesc;
};

const validatePhoto = (photo) => {
  // Make sure photo is a URL
  if (!validator.isURL(photo)) throw Error('Photos must be valid image URLs.');

  // Make sure it is a PNG or JPG
  const re = /.(png|jpe?g)$/i;
  if (!photo.match(re)) throw Error('Photos must be either PNGs or JP(E)Gs.');
};

export default {
  validateEmail,
  validateName,
  validateAvatar,
  validateBio,
  validateDesc,
  validatePhoto
};
