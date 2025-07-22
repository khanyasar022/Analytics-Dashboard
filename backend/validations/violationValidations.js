const Joi = require('joi');

const violationSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  timestamp: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  image_url: Joi.string().uri().required()
});

const droneReportSchema = Joi.object({
  drone_id: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  location: Joi.string().required(),
  violations: Joi.array().items(violationSchema).required()
});

const violationQuerySchema = Joi.object({
  drone_id: Joi.string().allow('').optional(),
  date_from: Joi.string().allow('').pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: Joi.string().allow('').pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  violation_type: Joi.string().allow('').optional(),
  location: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('date', 'timestamp', 'type', 'drone_id').default('date'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  violationSchema,
  droneReportSchema,
  violationQuerySchema
}; 