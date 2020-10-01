import bcrypt from 'bcryptjs';

import getUserId from './utils/getUserId';
import generateToken from './utils/generateToken';
import hashPassword from './utils/hashPassword';

const Mutation = {
  async createUser(_parent, { data }, { prisma }) {
    const hashedPassword = await hashPassword(data.password);

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
  async updateUser(_parent, { data }, { req, prisma }, info) {
    const id = getUserId(req);

    if (data.password) data.password = await hashPassword(data.password);

    return prisma.mutation.updateUser({ where: { id }, data }, info);
  },
  deleteUser(_parent, _args, { req, prisma }, info) {
    const id = getUserId(req);

    return prisma.mutation.deleteUser({ where: { id } }, info);
  }
};

export default Mutation;
