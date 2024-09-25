import { ProductDocument, Product } from "../models";
import { Request, Response } from 'express';

export const list = async(req: Request, res: Response) => {
  const { category = 0, limit, offset } = req.query;
  const query = Number(category) === 0 ? {} : { category: Number(category) };
  const total = await Product.countDocuments(query);
  const list: ProductDocument[] = await Product.find(query)
  .skip(Number(offset)).limit(Number(limit));
  res.json({
    success: true,
    data: {
      list,
      hasMore: total > Number(offset) + Number(limit),
    },
  })
}