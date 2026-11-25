import * as reportService from '../services/reportService.js';

export async function dailyReport(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD).' });
    }
    const report = await reportService.getDailyReport(req.user.id, date);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function monthToDateReport(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD).' });
    }
    const report = await reportService.getMonthToDateReport(req.user.id, date);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function monthlyReport(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD).' });
    }
    const report = await reportService.getPreviousMonthReport(req.user.id, date);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}
