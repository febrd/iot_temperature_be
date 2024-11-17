import { Hono } from 'hono';
import modbusRoutes from './routes/modbusRoutes';
import { startDataUpdate } from './utils/updateDataDb';

import docsRoutes from './routes/docsRoutes';
import sensorRoutes from './routes/sensorRoutes';
import dataRoutes from './routes/dataRoutes';


const app = new Hono();

startDataUpdate();

app.route('/', docsRoutes);
//app.route('/api', modbusRoutes);

app.route('api/data', dataRoutes);
app.route('/api/sensor', sensorRoutes);

export default app;
