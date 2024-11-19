import { Hono, Context, Next } from 'hono';
import { fetchDataFromFirebase } from '../utils/fetchData';
import { hasHighTemperature, hasHighHumidity, sendCombinedAlerts, AlertData } from '../utils/alertData';
import { getTargetGroupId } from '../utils/whatsappGateway';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../', '.env') });

const sensorRoutes = new Hono();

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

sensorRoutes.use(corsMiddleware);

sensorRoutes.get('/all', async (c) => {
  const data = await fetchDataFromFirebase();
  return c.json(data);
});


sensorRoutes.get('/check/high-temperature', async (c) => {
  const result = await checkHighTemperature();
  return c.json(result);
});

sensorRoutes.get('/check/high-humidity', async (c) => {
  const result = await checkHighHumidity();
  return c.json(result);
});

async function checkHighTemperature() {
  const data: AlertData[] = await fetchDataFromFirebase();
  const hasHighTemp = hasHighTemperature(data);

  const targetGroupId = await getTargetGroupId();

  if (hasHighTemp.length > 0 && targetGroupId) {
    await sendCombinedAlerts(data, targetGroupId);
  }

  return { hasHighTemperature: hasHighTemp };
}

async function checkHighHumidity() {
  const data: AlertData[] = await fetchDataFromFirebase();
  const hasHighHum = hasHighHumidity(data);

  const targetGroupId = await getTargetGroupId();

  if (hasHighHum.length > 0 && targetGroupId) {
    await sendCombinedAlerts(data, targetGroupId);
  }

  return { hasHighHumidity: hasHighHum };
}


export { checkHighTemperature, checkHighHumidity };
export default sensorRoutes;
