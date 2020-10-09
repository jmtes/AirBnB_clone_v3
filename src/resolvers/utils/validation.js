import validator from 'validator';
import xss from 'xss';

const validateEmail = (email) => {
  const emailIsValid = validator.isEmail(email);
  if (!emailIsValid) throw Error('Invalid email provided.');

  return validator.normalizeEmail(email);
};

const validateName = (name, maxLength) => {
  // Trim extra whitespace and escape HTML entities
  const sanitizedName = xss(validator.trim(name));

  // Check name length
  if (sanitizedName.length < 2 || sanitizedName.length > maxLength)
    throw Error(`Name must contain 2-${maxLength} characters.`);

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

const validateDates = (checkin, checkout) => {
  // Make sure both are valid ISO strings
  const validatorOptions = { strict: true };

  const checkinIsISO = validator.isISO8601(checkin, validatorOptions);
  const checkoutIsISO = validator.isISO8601(checkout, validatorOptions);

  if (!checkinIsISO || !checkoutIsISO)
    throw Error('Checkin and checkout must be valid ISO strings.');

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDate = new Date().getDate();

  // Make sure checkin is not before today's date
  if (
    new Date(
      checkinDate.getFullYear(),
      checkinDate.getMonth(),
      checkinDate.getDate()
    ) < new Date(currentYear, currentMonth, currentDate)
  )
    throw Error("Checkin cannot be before today's date.");

  // Make sure checkout is after checkin date
  if (
    new Date(
      checkoutDate.getFullYear(),
      checkoutDate.getMonth(),
      checkoutDate.getDate()
    ) <
    new Date(
      checkinDate.getFullYear(),
      checkinDate.getMonth(),
      checkinDate.getDate()
    )
  )
    throw Error('Checkout cannot be before checkin date.');
};

const validateTitle = (title) => {
  // Trim extra whitespace and escape HTML entities
  const sanitizedTitle = xss(validator.trim(title));

  // Check name length
  if (sanitizedTitle.length > 50)
    throw Error(`Title may not exceed 50 characters.`);

  return sanitizedTitle;
};

const validateBody = (body) => {
  // Trim extra whitespace and escape HTML entities
  const sanitizedBody = xss(validator.trim(body));

  // Make sure word count does not exceed 250
  const wordCount = sanitizedBody.split(/\s/).length;
  if (wordCount > 250) throw Error('Body may not exceed 250 words.');

  return sanitizedBody;
};

export default {
  validateEmail,
  validateName,
  validateAvatar,
  validateBio,
  validateDesc,
  validatePhoto,
  validateDates,
  validateTitle,
  validateBody
};
