import express from 'express';
import { prisma } from '../lib/utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uv from '../middleware/validator/userValidator.middleware.js';
import au from '../middleware/auths/user-auth.middleware.js';

const router = express.Router();

// 회원가입
router.post('/signup', uv.signUpValidation, async (req, res, next) => {
  try {
    const { accountId, email, password } = req.body;

    const isExistUser = await prisma.users.findFirst({
      where: {
        OR: [{ accountId }, { email }],
      },
    });

    if (isExistUser) {
      if (isExistUser.accountId === accountId) {
        return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
      }
      if (isExistUser.email === email) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        accountId,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    next(error);
  }
});

// 로그인
router.post('/login', uv.signInValidation, async (req, res, next) => {
  try {
    const { accountId, password } = req.body;

    const user = await prisma.users.findFirst({
      where: { accountId },
    });

    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 유저입니다.' });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        accountId: user.accountId,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      },
    );

    res.header('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
  } catch (error) {
    next(error);
  }
});

export default router;
