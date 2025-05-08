import PromptPerformance from '../models/PromptPerformance.js';
import PromptTemplate from '../models/PromptTemplate.js';
// import logger from '../utils/logger.js'; // To be implemented

// Get aggregated performance metrics
export const getPerformanceMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const overallMetrics = await PromptPerformance.aggregate([
      { $match: { createdAt: { $gte: startDate }, success: { $ne: null } } },
      { $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        successfulCalls: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
        failedCalls: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } },
        totalInputTokens: { $sum: '$tokenUsage.inputTokens' },
        totalOutputTokens: { $sum: '$tokenUsage.outputTokens' },
        avgLatency: { $avg: '$latency' }
      } },
      { $project: {
        _id: 0,
        totalCalls: 1,
        successfulCalls: 1,
        failedCalls: 1,
        successRate: {
          $cond: [ { $eq: ['$totalCalls', 0] }, 0, { $divide: ['$successfulCalls', '$totalCalls'] } ]
        },
        totalInputTokens: 1,
        totalOutputTokens: 1,
        totalTokens: { $add: ['$totalInputTokens', '$totalOutputTokens'] },
        avgLatency: 1
      } }
    ]);
    const dailyMetrics = await PromptPerformance.aggregate([
      { $match: { createdAt: { $gte: startDate }, success: { $ne: null } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalCalls: { $sum: 1 },
        successfulCalls: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
        totalInputTokens: { $sum: '$tokenUsage.inputTokens' },
        totalOutputTokens: { $sum: '$tokenUsage.outputTokens' },
        avgLatency: { $avg: '$latency' }
      } },
      { $project: {
        _id: 0,
        date: '$_id',
        totalCalls: 1,
        successRate: {
          $cond: [ { $eq: ['$totalCalls', 0] }, 0, { $divide: ['$successfulCalls', '$totalCalls'] } ]
        },
        totalTokens: { $add: ['$totalInputTokens', '$totalOutputTokens'] },
        avgLatency: 1
      } },
      { $sort: { date: 1 } }
    ]);
    res.status(200).json({
      timeRange: { days: parseInt(days), startDate },
      metrics: {
        overall: overallMetrics[0] || {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          successRate: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
          avgLatency: 0
        },
        daily: dailyMetrics
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance metrics by template
export const getPerformanceByTemplate = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const templateMetrics = await PromptPerformance.aggregate([
      { $match: { createdAt: { $gte: startDate }, success: { $ne: null } } },
      { $group: {
        _id: { templateName: '$templateName', templateVersion: '$templateVersion' },
        totalCalls: { $sum: 1 },
        successfulCalls: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
        totalInputTokens: { $sum: '$tokenUsage.inputTokens' },
        totalOutputTokens: { $sum: '$tokenUsage.outputTokens' },
        avgLatency: { $avg: '$latency' }
      } },
      { $project: {
        _id: 0,
        templateName: '$_id.templateName',
        templateVersion: '$_id.templateVersion',
        totalCalls: 1,
        successRate: {
          $cond: [ { $eq: ['$totalCalls', 0] }, 0, { $divide: ['$successfulCalls', '$totalCalls'] } ]
        },
        totalTokens: { $add: ['$totalInputTokens', '$totalOutputTokens'] },
        avgLatency: 1
      } },
      { $sort: { templateName: 1, templateVersion: -1 } }
    ]);
    const activeTemplates = await PromptTemplate.find({ active: true }).select('name version').lean();
    const activeTemplateMap = {};
    activeTemplates.forEach(template => {
      activeTemplateMap[`${template.name}_${template.version}`] = true;
    });
    const results = templateMetrics.map(metric => ({
      ...metric,
      isActive: activeTemplateMap[`${metric.templateName}_${metric.templateVersion}`] || false
    }));
    const groupedResults = {};
    results.forEach(result => {
      if (!groupedResults[result.templateName]) {
        groupedResults[result.templateName] = [];
      }
      groupedResults[result.templateName].push(result);
    });
    res.status(200).json({
      timeRange: { days: parseInt(days), startDate },
      templates: groupedResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance timeline
export const getPerformanceTimeline = async (req, res) => {
  try {
    const { days = 30, interval = 'day' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    let dateFormat;
    let groupByExpression;
    if (interval === 'hour') {
      dateFormat = '%Y-%m-%d %H:00';
      groupByExpression = { $dateToString: { format: dateFormat, date: '$createdAt' } };
    } else if (interval === 'week') {
      groupByExpression = {
        $dateToString: {
          format: '%Y-%m-%d',
          date: { $subtract: [ '$createdAt', { $multiply: [ { $dayOfWeek: '$createdAt' }, 86400000 ] } ] }
        }
      };
    } else {
      dateFormat = '%Y-%m-%d';
      groupByExpression = { $dateToString: { format: dateFormat, date: '$createdAt' } };
    }
    const timeline = await PromptPerformance.aggregate([
      { $match: { createdAt: { $gte: startDate }, success: { $ne: null } } },
      { $group: {
        _id: groupByExpression,
        totalCalls: { $sum: 1 },
        successfulCalls: { $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] } },
        totalInputTokens: { $sum: '$tokenUsage.inputTokens' },
        totalOutputTokens: { $sum: '$tokenUsage.outputTokens' },
        avgLatency: { $avg: '$latency' }
      } },
      { $project: {
        _id: 0,
        period: '$_id',
        totalCalls: 1,
        successRate: {
          $cond: [ { $eq: ['$totalCalls', 0] }, 0, { $divide: ['$successfulCalls', '$totalCalls'] } ]
        },
        totalInputTokens: 1,
        totalOutputTokens: 1,
        totalTokens: { $add: ['$totalInputTokens', '$totalOutputTokens'] },
        avgLatency: 1
      } },
      { $sort: { period: 1 } }
    ]);
    res.status(200).json({
      timeRange: { days: parseInt(days), startDate, interval },
      timeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};