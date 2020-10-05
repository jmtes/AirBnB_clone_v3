import bcrypt from 'bcryptjs';

import getUserId from './utils/getUserId';
import generateToken from './utils/generateToken';
import hashPassword from './utils/hashPassword';
import validation from './utils/validation';

const { validateEmail, validateName, validateAvatar, validateBio } = validation;

const Mutation = {
  async createUser(_parent, { data }, { prisma }) {
    data.email = validateEmail(data.email);

    const emailTaken = await prisma.exists.User({ email: data.email });
    if (emailTaken) throw Error('Email is already in use.');

    const hashedPassword = await hashPassword(data.password);

    data.name = validateName(data.name);

    const user = await prisma.mutation.createUser({
      data: { ...data, password: hashedPassword }
    });

    const token = generateToken(user.id);

    return { user, token };
  },
  async loginUser(_parent, { data }, { prisma }) {
    const user = await prisma.query.user({ where: { email: data.email } });
    if (!user) throw Error('Account does not exist.');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw Error('Incorrect password.');

    const token = generateToken(user.id);

    return { token, user };
  },
  async updateUserProfile(_parent, { data }, { req, prisma }, info) {
    const id = getUserId(req);

    const userExists = await prisma.exists.User({ id });
    if (!userExists) throw Error('Account does not exist.');

    if (data.name) data.name = validateName(data.name);
    if (data.avatar) data.avatar = validateAvatar(data.avatar);
    if (data.bio !== undefined) data.bio = validateBio(data.bio);

    return prisma.mutation.updateUser({ where: { id }, data }, info);
  },
  updateUserEmail: async (_parent, { data }, { req, prisma }, info) => {
    const id = getUserId(req);

    const user = await prisma.query.user({ where: { id } });
    if (!user) throw Error('Account does not exist.');

    data.email = validateEmail(data.email);

    const emailTaken = await prisma.exists.User({ email: data.email });
    if (emailTaken) throw Error('Email is already in use.');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw Error('Incorrect password.');

    return prisma.mutation.updateUser(
      { where: { id }, data: { email: data.email } },
      info
    );
  },
  updateUserPassword: async (_parent, { data }, { req, prisma }, info) => {
    const id = getUserId(req);

    // Check that user exists
    const user = await prisma.query.user({ where: { id } });
    if (!user) throw Error('Account does not exist.');

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) throw Error('Incorrect password.');

    const hashedPassword = await hashPassword(data.newPassword);

    return prisma.mutation.updateUser(
      { where: { id }, data: { password: hashedPassword } },
      info
    );
  },
  deleteUser(_parent, _args, { req, prisma }, info) {
    const id = getUserId(req);

    return prisma.mutation.deleteUser({ where: { id } }, info);
  }
};

export default Mutation;
