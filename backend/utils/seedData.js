const ViolationModel = require('../models/Violation');
const database = require('./database');

const sampleReports = [
  {
    "drone_id": "DRONE_ZONE_1",
    "date": "2025-01-10",
    "location": "Zone A",
    "violations": [
      {
        "id": "v1",
        "type": "Fire Detected",
        "timestamp": "10:32:14",
        "latitude": 23.74891,
        "longitude": 85.98523,
        "image_url": "https://picsum.photos/id/23/150/150"
      },
      {
        "id": "v2",
        "type": "Unauthorized Person",
        "timestamp": "10:45:51",
        "latitude": 23.74901,
        "longitude": 85.98621,
        "image_url": "https://picsum.photos/id/91/150/150"
      },
      {
        "id": "v3",
        "type": "No PPE Kit",
        "timestamp": "10:58:42",
        "latitude": 23.74921,
        "longitude": 85.98472,
        "image_url": "https://picsum.photos/id/42/150/150"
      }
    ]
  },
  {
    "drone_id": "DRONE_ZONE_2", 
    "date": "2025-01-11",
    "location": "Zone B",
    "violations": [
      {
        "id": "v4",
        "type": "Equipment Malfunction",
        "timestamp": "09:15:33",
        "latitude": 23.74855,
        "longitude": 85.98675,
        "image_url": "https://picsum.photos/id/62/150/150"
      },
      {
        "id": "v5",
        "type": "Unauthorized Person",
        "timestamp": "14:22:18",
        "latitude": 23.74933,
        "longitude": 85.98432,
        "image_url": "https://picsum.photos/id/181/150/150"
      }
    ]
  },
  {
    "drone_id": "DRONE_ZONE_3",
    "date": "2025-01-11",
    "location": "Zone C", 
    "violations": [
      {
        "id": "v6",
        "type": "Fire Detected",
        "timestamp": "16:45:12",
        "latitude": 23.74887,
        "longitude": 85.98578,
        "image_url": "https://picsum.photos/id/73/150/150"
      },
      {
        "id": "v7",
        "type": "No PPE Kit",
        "timestamp": "16:52:07",
        "latitude": 23.74912,
        "longitude": 85.98665,
        "image_url": "https://picsum.photos/id/122/150/150"
      },
      {
        "id": "v8",
        "type": "Hazardous Material Spill",
        "timestamp": "17:10:45",
        "latitude": 23.74876,
        "longitude": 85.98543,
        "image_url": "https://picsum.photos/id/155/150/150"
      }
    ]
  },
  {
    "drone_id": "DRONE_ZONE_1",
    "date": "2025-01-12", 
    "location": "Zone A",
    "violations": [
      {
        "id": "v9",
        "type": "Unauthorized Vehicle",
        "timestamp": "08:30:25",
        "latitude": 23.74845,
        "longitude": 85.98612,
        "image_url": "https://picsum.photos/id/312/150/150"
      },
      {
        "id": "v10",
        "type": "No PPE Kit",
        "timestamp": "11:15:44",
        "latitude": 23.74903,
        "longitude": 85.98489,
        "image_url": "https://picsum.photos/id/218/150/150"
      }
    ]
  },
  {
    "drone_id": "DRONE_ZONE_2",
    "date": "2025-01-12",
    "location": "Zone B",
    "violations": [
      {
        "id": "v11", 
        "type": "Fire Detected",
        "timestamp": "13:45:22",
        "latitude": 23.74869,
        "longitude": 85.98634,
        "image_url": "https://picsum.photos/id/89/150/150"
      },
      {
        "id": "v12",
        "type": "Structural Damage",
        "timestamp": "15:28:16",
        "latitude": 23.74895,
        "longitude": 85.98598,
        "image_url": "https://picsum.photos/id/264/150/150"
      }
    ]
  }
];

async function clearDatabase() {
  try {
    await database.run('DELETE FROM violations');
    await database.run('DELETE FROM reports');
    console.log('Cleared existing data');
  } catch (error) {
    console.error('Failed to clear database:', error.message);
  }
}

async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');
    
    await clearDatabase();
    
    for (const [index, report] of sampleReports.entries()) {
      try {
        await ViolationModel.addReport(report);
        console.log(`Added sample report ${index + 1}: ${report.drone_id} - ${report.date}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Skipping existing report: ${report.drone_id} - ${report.date}`);
        } else {
          console.error(`Failed to add sample report ${index + 1}:`, error.message);
        }
      }
    }
    
    const analytics = await ViolationModel.getAnalytics();
    const reportCount = await ViolationModel.getReportCount();
    
    console.log('Database seeded successfully!');
    console.log(`   - Total reports: ${reportCount}`);
    console.log(`   - Total violations: ${analytics.kpis.total_violations}`);
    console.log(`   - Unique drones: ${analytics.kpis.unique_drones}`);
    console.log(`   - Unique locations: ${analytics.kpis.unique_locations}`);
    
    return true;
  } catch (error) {
    console.error('Failed to seed database:', error);
    return false;
  }
}

module.exports = { seedDatabase }; 