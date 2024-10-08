import { Request, Response } from "express";
import { Slider, SliderDocument } from "../models"

export const list = async(_req: Request, res: Response) => {
  const sliders: SliderDocument[] = await Slider.find();
  res.json({
    success: true,
    data: sliders.slice(0, 2),
  })
}