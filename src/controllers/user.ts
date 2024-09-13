import { Request, Response, NextFunction } from "express";
import StatusCode from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { User, UserDocument } from "../models";
import { validateRegisterInput } from "../utils/validator";
import HttpException from "../exceptions/HttpException";
import { UserPayload } from '../typings/payload';

export const register = async(req: Request, res: Response,next: NextFunction) => {
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
    next(error);
  }
}

export const login = async(req: Request, res: Response,next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const user: UserDocument | null = await User.login(username, password);
    if (user) {
      const access_token = user.getAccessToken();
      res.json({
        success: true,
        data: access_token,
      })
    } else {
      throw new HttpException(StatusCode.UNAUTHORIZED, '登录失败');
    }
  } catch(error) {
    next(error);
  }
}

// 客户端会将token放在请求头里发送给服务器
export const validate = async(req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const access_token = authorization.split(' ')[1];
    if (access_token) {
      try {
        const userPayload: UserPayload = jwt.verify(access_token, process.env.JWT_SECRET_KEY || 'myCats') as UserPayload ;
        const user: UserDocument | null = await User.findById(userPayload.id);
        if (user) {
          res.json({
            success: true,
            data: user.toJSON(),
          })
        } else {
          next(new HttpException(StatusCode.UNAUTHORIZED, '用户未找到'));
        }
      } catch(error) {
        next(new HttpException(StatusCode.UNAUTHORIZED, 'access_token不正确'));
      }
    } else {
      next(new HttpException(StatusCode.UNAUTHORIZED, 'access_token未提供'));
    }
  } else {
    next(new HttpException(StatusCode.UNAUTHORIZED, 'authorization未提供'));
  }
}