import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
  if (password.length < 8)
    throw Error('Password must contain at least 8 characters.');

  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export default hashPassword;
