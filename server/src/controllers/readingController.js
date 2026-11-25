import * as readingService from '../services/readingService.js';

export async function create(req, res, next) {
  try {
    const reading = await readingService.createReading(req.user.id, req.body);
    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const { page, limit, date, slot } = req.query;
    const result = await readingService.getReadings(req.user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      date,
      slot,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const reading = await readingService.getReadingById(req.user.id, req.params.id);
    res.json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const reading = await readingService.updateReading(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await readingService.deleteReading(req.user.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
