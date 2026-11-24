import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveWeatherRequest, searchLocations} from './src/server/weatherService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/geocode', async (req, res) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const results = await searchLocations(q);
      res.json({results});
    } catch (error) {
      console.error('Geocode error:', error);
      res.status(500).json({error: '도시 검색 중 오류가 발생했습니다.'});
    }
  });

  app.get('/api/weather', async (req, res) => {
    try {
      const data = await resolveWeatherRequest({
        lat: typeof req.query.lat === 'string' ? req.query.lat : undefined,
        lon: typeof req.query.lon === 'string' ? req.query.lon : undefined,
        city: typeof req.query.city === 'string' ? req.query.city : undefined,
        name: typeof req.query.name === 'string' ? req.query.name : undefined,
        admin1: typeof req.query.admin1 === 'string' ? req.query.admin1 : undefined,
        country: typeof req.query.country === 'string' ? req.query.country : undefined,
      });
      res.json(data);
    } catch (error) {
      console.error('Weather API error:', error);
      const status = (error as Error & {statusCode?: number}).statusCode || 500;
      const message = error instanceof Error ? error.message : '날씨 데이터를 불러오지 못했습니다.';
      res.status(status).json({error: message});
    }
  });

  if (!IS_PROD) {
    const {createServer} = await import('vite');
    const vite = await createServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
