const database = require('../utils/database');
const { droneReportSchema, violationQuerySchema } = require('../validations/violationValidations');

class ViolationModel {
  async addReport(reportData) {
    const { error, value } = droneReportSchema.validate(reportData);
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const existingReport = await database.get(
      'SELECT report_id FROM reports WHERE drone_id = ? AND date = ?',
      [value.drone_id, value.date]
    );
    
    if (existingReport) {
      throw new Error(`Report for drone ${value.drone_id} on ${value.date} already exists`);
    }

    const reportId = `${value.drone_id}_${value.date}_${Date.now()}`;

    try {
      await database.run(
        'INSERT INTO reports (report_id, drone_id, date, location) VALUES (?, ?, ?, ?)',
        [reportId, value.drone_id, value.date, value.location]
      );

      for (const violation of value.violations) {
        await database.run(`
          INSERT INTO violations (id, report_id, drone_id, date, location, type, timestamp, latitude, longitude, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          violation.id,
          reportId,
          value.drone_id,
          value.date,
          value.location,
          violation.type,
          violation.timestamp,
          violation.latitude,
          violation.longitude,
          violation.image_url
        ]);
      }

      const report = {
        report_id: reportId,
        drone_id: value.drone_id,
        date: value.date,
        location: value.location,
        violations: value.violations,
        uploaded_at: new Date()
      };

      return report;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getViolations(queryParams = {}) {
    const { error, value } = violationQuerySchema.validate(queryParams);
    if (error) {
      throw new Error(`Query validation error: ${error.details[0].message}`);
    }

    let query = 'SELECT * FROM violations WHERE 1=1';
    const params = [];

    if (value.drone_id && value.drone_id.trim() !== '') {
      query += ' AND drone_id = ?';
      params.push(value.drone_id);
    }
    
    if (value.date_from && value.date_from.trim() !== '') {
      query += ' AND date >= ?';
      params.push(value.date_from);
    }
    
    if (value.date_to && value.date_to.trim() !== '') {
      query += ' AND date <= ?';
      params.push(value.date_to);
    }
    
    if (value.violation_type && value.violation_type.trim() !== '') {
      query += ' AND type = ?';
      params.push(value.violation_type);
    }
    
    if (value.location && value.location.trim() !== '') {
      query += ' AND location LIKE ?';
      params.push(`%${value.location}%`);
    }

    let orderBy = 'date';
    switch (value.sort_by) {
      case 'timestamp':
        orderBy = 'timestamp';
        break;
      case 'type':
        orderBy = 'type';
        break;
      case 'drone_id':
        orderBy = 'drone_id';
        break;
      default:
        orderBy = 'date, timestamp';
    }
    
    query += ` ORDER BY ${orderBy} ${value.sort_order.toUpperCase()}`;

    try {
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split(' ORDER BY')[0];
      const countResult = await database.get(countQuery, params);
      const totalItems = countResult.total;

      const offset = (value.page - 1) * value.limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(value.limit, offset);

      const violations = await database.all(query, params);

      return {
        violations,
        pagination: {
          current_page: value.page,
          total_pages: Math.ceil(totalItems / value.limit),
          total_items: totalItems,
          per_page: value.limit
        }
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getAnalytics() {
    try {
      const totalViolationsResult = await database.get('SELECT COUNT(*) as total FROM violations');
      const totalViolations = totalViolationsResult.total;
      
      const typeDistribution = await database.all(`
        SELECT type as name, COUNT(*) as value 
        FROM violations 
        GROUP BY type
      `);

      const timeSeriesData = await database.all(`
        SELECT date, COUNT(*) as violations 
        FROM violations 
        GROUP BY date 
        ORDER BY date
      `);

      const droneStats = await database.all(`
        SELECT 
          drone_id,
          COUNT(*) as total_violations,
          GROUP_CONCAT(type || ':' || type_count) as violation_breakdown
        FROM (
          SELECT 
            drone_id, 
            type,
            COUNT(*) as type_count
          FROM violations 
          GROUP BY drone_id, type
        ) 
        GROUP BY drone_id
      `);

      const dronePerformance = droneStats.map(stat => {
        const breakdown = {};
        if (stat.violation_breakdown) {
          stat.violation_breakdown.split(',').forEach(item => {
            const [type, count] = item.split(':');
            breakdown[type] = parseInt(count);
          });
        }
        return {
          drone_id: stat.drone_id,
          total_violations: stat.total_violations,
          violation_breakdown: breakdown
        };
      });

      const locationStats = await database.all(`
        SELECT location, COUNT(*) as violations 
        FROM violations 
        GROUP BY location
      `);

      const uniqueDrones = await database.get('SELECT COUNT(DISTINCT drone_id) as count FROM violations');
      const uniqueLocations = await database.get('SELECT COUNT(DISTINCT location) as count FROM violations');
      const uniqueTypes = await database.get('SELECT COUNT(DISTINCT type) as count FROM violations');

      return {
        kpis: {
          total_violations: totalViolations,
          unique_drones: uniqueDrones.count,
          unique_locations: uniqueLocations.count,
          violation_types: uniqueTypes.count
        },
        charts: {
          type_distribution: typeDistribution,
          time_series: timeSeriesData,
          drone_performance: dronePerformance,
          location_breakdown: locationStats
        }
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getFilterOptions() {
    try {
      const droneIds = await database.all('SELECT DISTINCT drone_id FROM violations ORDER BY drone_id');
      const violationTypes = await database.all('SELECT DISTINCT type FROM violations ORDER BY type');
      const locations = await database.all('SELECT DISTINCT location FROM violations ORDER BY location');
      const dates = await database.all('SELECT DISTINCT date FROM violations ORDER BY date');

      return {
        drone_ids: droneIds.map(row => row.drone_id),
        violation_types: violationTypes.map(row => row.type),
        locations: locations.map(row => row.location),
        dates: { 
          min: dates[0]?.date || null, 
          max: dates[dates.length - 1]?.date || null, 
          all: dates.map(row => row.date) 
        }
      };
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getMapData() {
    try {
      const violations = await database.all(`
        SELECT id, type, latitude, longitude, timestamp, date, drone_id, location, image_url
        FROM violations
        ORDER BY date DESC, timestamp DESC
      `);
      
      return violations;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getReportCount() {
    try {
      const result = await database.get('SELECT COUNT(*) as total FROM reports');
      return result.total;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    }
  }
}

module.exports = new ViolationModel(); 