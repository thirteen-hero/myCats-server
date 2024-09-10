import mongoose, { Schema, Document, Model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import validator from 'validator';

export interface UserDocument extends Document {
  username: string;
  password: string;
  email: string;
  avater: string;
}

const userScheme: Schema<UserDocument> = new Schema({
  username: {
    type: String,
    required: [true, '用户名不可为空'],
    minlength: [6, '最小长度不可小于6位'],
    maxlength: [12, '最大长度不可大于12位'],
  },
  password: String,
  avater: String,
  email: {
    type: String,
    validate: { // 自定义校验器
      validator: (v) => validator.isEmail(v),
      message: 'this is not a valid email address',
    },
    trim: true,
  }
}, { timestamps: true }); // 使用时间戳 自动添加两个字段 createdAt updatedAt

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

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userScheme);