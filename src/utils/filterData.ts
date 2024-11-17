interface SensorData {
  temperature: string;
  humidity: string;
  timestamp: string;
}

export function getFilteredData(
  data: SensorData[],
  range: string = 'realtime',
  temp?: string,
  humidity?: string
): SensorData[] {
  const now = new Date();
  let filteredData = data;

  switch (range) {
    case 'realtime':
      filteredData = data.slice(-1); 
      break;
    case '3m':
      filteredData = filterByTime(data, now, 3);
      break;
    case '5m':
      filteredData = filterByTime(data, now, 5);
      break;
    case '1d':
      filteredData = filterByTime(data, now, 1440); 
      break;
    case '3d':
      filteredData = filterByTime(data, now, 4320); 
      break;
    case '30d':
      filteredData = filterByTime(data, now, 43200); 
      break;
    default:
      const minutes = parseInt(range, 10);
      filteredData = filterByTime(data, now, minutes);
  }

  if (temp) {
    filteredData = filteredData.filter((item) => item.temperature === temp);
  }

  if (humidity) {
    filteredData = filteredData.filter((item) => item.humidity === humidity);
  }

  return filteredData;
}

function filterByTime(data: SensorData[], now: Date, minutes: number): SensorData[] {
  const cutoffTime = new Date(now.getTime() - minutes * 60000);
  return data.filter((item) => new Date(item.timestamp) >= cutoffTime);
}
