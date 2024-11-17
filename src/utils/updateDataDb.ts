import axios from 'axios';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { checkHighTemperature, checkHighHumidity } from '../routes/sensorRoutes'; // Pastikan path sesuai dengan file sensorRoutes Anda

dotenv.config({ path: path.join(__dirname, '../../', '.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const insertSensorData = async (temperature: string, humidity: string, timestamp: string) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const checkQuery = 'SELECT COUNT(*) AS count FROM sensor WHERE temperature = ? AND humidity = ? AND timestamp = ?';
    const [rows] = await connection.execute(checkQuery, [temperature, humidity, timestamp]);
    const count = (rows as any)[0].count; 

    let isNewData = false;

    if (count === 0) {
      const query = 'INSERT INTO sensor (temperature, humidity, timestamp) VALUES (?, ?, ?)';
      await connection.execute(query, [temperature, humidity, timestamp]);
    //  console.log('Data inserted into MySQL:', { temperature, humidity, timestamp });
      isNewData = true;
    } else {
    //  console.log('Data already exists, not inserting:', { temperature, humidity, timestamp });
    }
    
    await connection.end();
    return isNewData;
  } catch (error) {
    console.error('Error inserting data into MySQL:', error);
  }
};

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/sensor/all');
    const sensorData = response.data[0];
    const { temperature, humidity, timestamp } = sensorData;      
    const isNewData =  await insertSensorData(temperature, humidity, timestamp);
    if (isNewData) {
      await checkHighTemperature();
      await checkHighHumidity();
    }
  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
};

export const startDataUpdate = () => {
  setInterval(fetchData, 3000);
};
