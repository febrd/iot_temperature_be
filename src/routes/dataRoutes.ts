import { Hono, Context, Next } from 'hono';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../', '.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const dataRoutes = new Hono();

const corsMiddleware = async (c: Context, next: Next) => {
  const allowOrigin = process.env.ALLOW_ORIGIN || 'http://localhost:3001';
  c.res.headers.append('Access-Control-Allow-Origin', allowOrigin);
  c.res.headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
  c.res.headers.append('Access-Control-Allow-Headers', 'Content-Type');

  if (c.req.method === 'OPTIONS') {
    return c.text('OK', 204);
  }

  await next();
};

dataRoutes.use(corsMiddleware);

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return date.toLocaleString('sv-SE', options).replace(' ', 'T');
};

dataRoutes.get('/chart/:apiKey', async (c) => {
  const { apiKey } = c.req.param();
  if (apiKey !== process.env.LOCAL_API_KEY) {
    console.warn('Unauthorized access attempt detected');
    return c.text('Unauthorized', 401);
  }

  // Accept limit and offset as query parameters
  const { start, end, minute, date, mode, limit = '10000', offset = '0' } = c.req.query();
  const currentTimestamp = new Date();
  console.log("Received Query Parameters:", { start, end, minute, date, mode, limit, offset });

  let query = 'SELECT * FROM sensor';
  const queryParams: any[] = [];

  if (mode === 'single' && date) {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
    query += ' WHERE timestamp BETWEEN ? AND ?';
    queryParams.push(startOfDay, endOfDay);
  } else if (start && end) {
    query += ' WHERE timestamp BETWEEN ? AND ?';
    queryParams.push(new Date(start), new Date(end));
  } else if (minute) {
    const startMinutes = new Date(currentTimestamp.getTime() - Number(minute) * 60 * 1000);
    query += ' WHERE timestamp BETWEEN ? AND ?';
    queryParams.push(startMinutes, currentTimestamp);
  } else {
    const startLatest = new Date(currentTimestamp.getTime() - 60 * 60 * 1000);
    query += ' WHERE timestamp BETWEEN ? AND ?';
    queryParams.push(startLatest, currentTimestamp);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), parseInt(offset));

  console.log(`Executing Query: ${query} with params:`, queryParams);

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute<any[]>(query, queryParams);
    await connection.end();

    const formattedData = rows.map((row) => ({
      temperature: row.temperature.toString(),
      humidity: row.humidity.toString(),
      timestamp: row.timestamp, // Adjust as needed if timestamp needs formatting
    }));

    return c.json(formattedData);
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    return c.text('Internal Server Error', 500);
  }
});

dataRoutes.get('/gauge/:apiKey', async (c) => {
  const { apiKey } = c.req.param();
  if (apiKey !== process.env.LOCAL_API_KEY) {
    console.warn('Unauthorized access attempt detected');
    return c.text('Unauthorized', 401);
  }

  const query = 'SELECT * FROM sensor ORDER BY timestamp DESC LIMIT 1';

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute<any[]>(query);
    await connection.end();

    if (rows.length === 0) {
      return c.text('No data found', 404);
    }

    const latestData = {
      temperature: rows[0].temperature.toString(),
      humidity: rows[0].humidity.toString(),
      timestamp: formatTimestamp(rows[0].timestamp),
    };

    return c.json(latestData);
  } catch (error) {
    console.error('Error fetching latest data from MySQL:', error);
    return c.text('Internal Server Error', 500);
  }
});

export default dataRoutes;
