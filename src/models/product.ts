import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProductDocument extends Document {
  order: number;
  title: string; // 标题
  video: string; // 视频地址
  poster: string; // 海报地址
  url: string; // url地址
  price: string; // 价格
  category: string; // 分类
}

const ProductSchema: Schema<ProductDocument> = new Schema({
  order: Number,
  title: String,
  video: String,
  poster: String,
  url: String,
  price: String,
  category: String,
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, result) => {
      result.id = result._id;
      delete result._id;
      delete result.__v;
      return result;
    }
  } 
});

export const Product: Model<ProductDocument> = mongoose.model('Product', ProductSchema);