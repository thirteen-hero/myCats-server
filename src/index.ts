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

import * as userController from './controllers/user';
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
// 没有匹配到任何路由 则会创建一个404的错误对象 并传递给错误处理中间件
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error: HttpException = new HttpException(404, 'not found');
  next(error);
});
app.use(errorMiddleware);
(async function() {
  const MONGOOSE_URL = process.env.MONGOOSE_URL || 'mongodb+srv://15931602416:<Ww1406010501>@mycats.gsxhf.mongodb.net/';
  await mongoose.connect(MONGOOSE_URL);
  const PORT = process.env.PORT || 8001;
  app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
  })
})();