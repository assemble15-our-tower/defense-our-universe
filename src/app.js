import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // 서버가 시동될때 CDN을 읽어야 하니까 여기쯤에 파일 리딩 구문이 들어가야 한다
  try {
    const assets = await loadGameAssets();
    console.log(assets);
    console.log('Assets loaded successfully');
  } catch (e) {
    console.error('Failed to load game assets: ', e);
  }
});
