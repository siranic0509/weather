import type {Request, Response} from 'express';
import {resolveWeatherRequest} from '../src/server/weatherService.ts';

export default async function handler(req: Request, res: Response) {
  try {
    const data = await resolveWeatherRequest({
      lat: typeof req.query.lat === 'string' ? req.query.lat : undefined,
      lon: typeof req.query.lon === 'string' ? req.query.lon : undefined,
      city: typeof req.query.city === 'string' ? req.query.city : undefined,
      name: typeof req.query.name === 'string' ? req.query.name : undefined,
      admin1: typeof req.query.admin1 === 'string' ? req.query.admin1 : undefined,
      country: typeof req.query.country === 'string' ? req.query.country : undefined,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Vercel Weather API error:', error);
    const status = (error as Error & {statusCode?: number}).statusCode || 500;
    const message = error instanceof Error ? error.message : '날씨 데이터를 불러오지 못했습니다.';
    res.status(status).json({error: message});
  }
}
