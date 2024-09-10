import { Request, Response, NextFunction } from "express";
import StatusCode from 'http-status-codes';

import { User, UserDocument } from "../models";
import { validateRegisterInput } from "../utils/validator";
import HttpException from "../exceptions/HttpException";

export const register = async(req: Request, res: Response,_next: NextFunction) => {
  const { username, password, confirmPassword, email } = req.body;
  try {
    const { valid, errors } = validateRegisterInput(username, password, confirmPassword, email);
    if (!valid) {
      throw new HttpException(StatusCode.UNPROCESSABLE_ENTITY, '用户提交信息校验失败', errors);
    }
    const oldUser: (UserDocument | null) = await User.findOne({ username });
    if (oldUser) {
      throw new HttpException(StatusCode.UNPROCESSABLE_ENTITY, '用户名重复', errors);
    }
    const user: UserDocument = new User({
      username,
      password,
      confirmPassword,
      email,
    });
    await user.save();
    res.json({
      success: true,
      data: user,
    })
  } catch(error) {
    _next(error);
  }
}