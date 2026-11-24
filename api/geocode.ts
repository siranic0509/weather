import type {Request, Response} from 'express';
import {searchLocations} from '../src/server/weatherService.ts';

export default async function handler(req: Request, res: Response) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const results = await searchLocations(q);
    res.status(200).json({results});
  } catch (error) {
    console.error('Vercel Geocode API error:', error);
    res.status(500).json({error: '도시 검색 중 오류가 발생했습니다.'});
  }
}
