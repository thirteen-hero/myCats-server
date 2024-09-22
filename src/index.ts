import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // 跨域
import morgan from 'morgan'; // 输入访问日志
import helmet from 'helmet'; // 安全过滤
import multer from 'multer'; // 上传头像
import 'dotenv/config'; // 读取.env文件 然后写入process.env.xxx
import path from 'path';

import errorMiddleware from './middlewares/errorMiddleware';
import HttpException from './exceptions/HttpException';

import { Slider } from './models';

import * as userController from './controllers/user';
import * as sliderController from './controllers/slider';
// 指定上传文件的存储空间
const storage = multer.diskStorage({
  // 指定上传的目录
  destination: path.join(__dirname, 'public', 'uploads'),
  filename(_req: Request, file: Express.Multer.File, callback) {
    // callback第二个参数是文件名 时间戳.jpg
    callback(null, Date.now() + path.extname(file.originalname));
  }
})
const upload = multer({ storage });
const app: Express = express();
app.use(cors());
app.use(morgan('dev')); 
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public'))); // 作为静态文件根目录
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (_req, res, _next) => {
  res.json({
    success: true,
    data: 'hello'
  })
});
app.post('/user/register', userController.register);
app.post('/user/login', userController.login);
// 客户端将token传给服务器，服务器返回当前用户，如果token不合法或过期了，则返回null
app.get('/user/validate', userController.validate);
// 当服务器端接收到上传文件请求的时候，处理单文件上传。字段名avatar request.file = Express.Multer.File
app.post('/user/uploadAvatar', upload.single('avatar'), userController.uploadAvatar);
app.get('/slider/list', sliderController.list);
// 没有匹配到任何路由 则会创建一个404的错误对象 并传递给错误处理中间件
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error: HttpException = new HttpException(404, 'not found');
  next(error);
});
app.use(errorMiddleware);
(async function() {
  const MONGOOSE_URL = process.env.MONGOOSE_URL || 'mongodb+srv://15931602416:<Ww1406010501>@mycats.gsxhf.mongodb.net/';
  await mongoose.connect(MONGOOSE_URL);
  await createInitialSliders();
  const PORT = process.env.PORT || 8001;
  app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
  })
})();

async function createInitialSliders() {
  const sliders = await Slider.find();
  if(sliders.length === 0) {
    const sliders = [
      { url: 'https://vod.xyx234.com/uploads/allimg/190725/7-1ZH5145T30-L.jpg' },
      { url: 'https://gimg3.baidu.com/search/src=https%3A%2F%2Fimg.chongso.com%2Fimgs%2F78.jpg&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w931&n=0&g=0n&er=404&q=75&fmt=auto&maxorilen2heic=2000000?sec=1726851600&t=a647fb5bf8a4b4061e12666b3a25710e' },
      { url: 'https://gimg3.baidu.com/search/src=https%3A%2F%2Fimg.chongso.com%2Fimgs%2F43.jpg&refer=http%3A%2F%2Fwww.baidu.com&app=2021&size=w931&n=0&g=0n&er=404&q=75&fmt=auto&maxorilen2heic=2000000?sec=1726851600&t=988790721d827522c3126754c8fda2b5' },
    ];
    await Slider.create(sliders);
  }
}