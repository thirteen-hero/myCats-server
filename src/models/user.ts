import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';

import { UserPayload } from '../typings/payload';
export interface UserDocument extends Document {
  username: string;
  password: string;
  email: string;
  avatar: string;
  getAccessToken: () => string;
  _doc: UserDocument;
}

const userScheme: Schema<UserDocument> = new Schema({
  username: {
    type: String,
    required: [true, '用户名不可为空'],
    minlength: [6, '最小长度不可小于6位'],
    maxlength: [12, '最大长度不可大于12位'],
  },
  password: String,
  avatar: String,
  email: {
    type: String,
    validate: { // 自定义校验器
      validator: (v) => validator.isEmail(v),
      message: 'this is not a valid email address',
    },
    trim: true,
  }
}, 
{ 
  // 使用时间戳 自动添加两个字段 createdAt updatedAt
  timestamps: true, 
  toJSON: {
    transform: (_doc, result) => {
      result.id = result._id;
      delete result._id;
      delete result.__v;
      delete result.password;
      delete result.createdAt;
      delete result.updatedAt;
      return result;
    }
  } 
}); 

// 在每次保存文档之前执行的操作
userScheme.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcryptjs.hash(this.password, 10);
    next();
  } catch(error) {
    next(error);
  }
})

// 给user模型扩展了一个login方法
userScheme.static('login', async function(this: any, username: string, password: string): Promise<UserDocument | null> {
  const user: UserDocument | null = await this.model('User').findOne({ username });
  if (user) {
    // 判断用户输入的密码和库内存的密码是否匹配
    const matched = await bcryptjs.compare(password, user.password);
    if (matched) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
})

// 给user模型的实例扩展方法
userScheme.methods.getAccessToken = function(this: UserDocument): string {
  // payload是放在jwt token里存放的数据
  const payload: UserPayload = { id: this.id };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY || 'myCats', { expiresIn: '1h' });
}

interface userModel<T extends Document> extends Model<T> {
  login: (username: string, password: string) => UserDocument | null
}

export const User: userModel<UserDocument> = mongoose.model<UserDocument, userModel<UserDocument>>('User', userScheme);