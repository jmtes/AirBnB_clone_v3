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

const validateAddress = async (address) => {
  try {
    // Make sure address contains building number
    const [buildingNumber] = address.split(' ', 1);
    if (Number.isNaN(parseInt(buildingNumber, 10))) throw Error();

    // Validate address with Location IQ
    const { data } = await axios.get(
      'https://us1.locationiq.com/v1/search.php',
      {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          extratags: 1,
          key: process.env.LOCATION_IQ_API_KEY
        }
      }
    );

    const [location] = data;

    // Sometimes, the LocationIQ response will not include a house number.
    // This sets the house number to the previously parsed building number.
    if (!location.address.house_number)
      location.address.house_number = buildingNumber;

    return location;
  } catch {
    throw Error('Invalid street address.');
  }
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
  validateAddress,
  validatePhoto
};
