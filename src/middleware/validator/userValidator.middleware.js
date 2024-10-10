import Joi from 'joi';

const signUpSchema = Joi.object({
  accountId: Joi.string().lowercase().min(2).max(10).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com'] } })
    .required(),
  password: Joi.string().min(6).max(20).required(),
});

const signInSchema = Joi.object({
  accountId: Joi.string().lowercase().min(2).max(10).required(),
  password: Joi.string().min(6).max(20).required(),
});

const userValidatorJoi = {
  signUpValidation: async (req, res, next) => {
    try {
      await signUpSchema.validateAsync(req.body);
      next();
    } catch (error) {
      console.log(req.originalUrl, '회원가입 인증 실패');
      let msg = { message: '회원가입 입력된 값이 잘못되었습니다.' };
      return res.status(400).json(msg);
    }
  },
  signInValidation: async (req, res, next) => {
    try {
      await signInSchema.validateAsync(req.body);
      next();
    } catch (error) {
      console.log(req.originalUrl, '로그인 인증 실패');
      let msg = { message: '입력된 값이 잘못되었습니다.' };
      return res.status(400).json(msg);
    }
  },
};

export default userValidatorJoi;
