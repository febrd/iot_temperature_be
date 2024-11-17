import { Hono } from 'hono';
import { Prisma } from '@prisma/client';
import { cors } from 'hono/cors';
import prisma from '../../prisma/client';

const modbusRoutes = new Hono();

modbusRoutes.use(cors())

// Menampilkan semua data
modbusRoutes.get('/', async (c) => {
  const modbus = await prisma.modbus.findMany();
  return c.json(modbus);
});

// Menampilkan data dengan batasan yang kita tentukan
modbusRoutes.get('/limit/:count', async (c) => {
  const limit = parseInt(c.req.param('count'));
  
  const data = await prisma.modbus.findMany({
    take: limit,
    orderBy: {
      timestamp: 'desc',
    }
  });

  return c.json(data);
});

// Menampilkan data dari beberapa menit ke belakang
modbusRoutes.get('/minute/:minute', async(c) => {
  const minute = parseInt(c.req.param('minute'));

  const data = await prisma.$queryRaw<Prisma.JsonArray>`SELECT * FROM modbus_data WHERE timestamp >= NOW() - INTERVAL ${minute} MINUTE;`

  return c.json(data);
})

// Menampilkan data dari range tanggal tertentu
modbusRoutes.get('/range', async (c) => {
  const startDateParam = c.req.query('start');
  const endDateParam = c.req.query('end');

  if (!startDateParam || !endDateParam) {
    return c.json({ error: 'Start date and end date are required' }, 400);
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);
  endDate.setHours(23, 59, 59, 999);

  const data = await prisma.modbus.findMany({
    where: {
      timestamp: {
        gte: startDate, //lebih dari sama dengan
        lte: endDate, // kursng dari sama dengan 
      },
    },
  });

  return c.json(data);
});

export default modbusRoutes;
