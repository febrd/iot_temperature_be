import { Hono } from 'hono';

const docsRoutes = new Hono();

docsRoutes.get('/', (c) => {
  return c.json({
    message: 'API Documentation',
    routes: {
      'GET /api/sensor/all': 'Tampilkan semua data sensor.',
      'GET /api/sensor/filter/range/:range': 'Ambil data sensor berdasarkan rentang waktu tertentu (misalnya, 3m, 5m, 1d).',
      'GET /api/sensor/filter/temp/:temp': 'Ambil data sensor dengan suhu tertentu.',
      'GET /api/sensor/filter/humid/:humidity': 'Ambil data sensor dengan kelembapan tertentu.',
      'GET /api/sensor/check/high-temperature': 'Periksa apakah ada suhu di atas 40 derajat.',
      'GET /api/sensor/check/high-humidity': 'Periksa apakah ada kelembapan di atas 45 persen.',
      'GET /api/data/chart': ':apiKey [:params] Ambil Data Chart',
      'GET /api/data/gauge': ':apiKey [:params] Ambil Data Gauge'

    }
  });
});

export default docsRoutes;
