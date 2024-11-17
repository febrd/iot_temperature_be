const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/sensor'; 

async function testApi() {
  try {
    console.log('Testing /all');
    const allDataResponse = await axios.get(`${BASE_URL}/all`);
    console.log('All Data:', allDataResponse.data);

    const ranges = ['realtime', '3m', '5m', '1d', '3d', '30d'];
    for (const range of ranges) {
      console.log(`Testing /filter/range/${range}`);
      const rangeResponse = await axios.get(`${BASE_URL}/filter/range/${range}`);
      console.log(`Data for range ${range}:`, rangeResponse.data);
    }

    const temperatures = [29, 40, 41]; 
    for (const temp of temperatures) {
      console.log(`Testing /filter/temp/${temp}`);
      const tempResponse = await axios.get(`${BASE_URL}/filter/temp/${temp}`);
      console.log(`Data for temperature ${temp}:`, tempResponse.data);
    }

    const humidities = [47, 49, 50, 60];
    for (const humidity of humidities) {
      console.log(`Testing /filter/humid/${humidity}`);
      const humidityResponse = await axios.get(`${BASE_URL}/filter/humid/${humidity}`);
      console.log(`Data for humidity ${humidity}:`, humidityResponse.data);
    }

    console.log('Testing /check/high-temperature');
    const highTempResponse = await axios.get(`${BASE_URL}/check/high-temperature`);
    console.log('High Temperature Check:', highTempResponse.data);

    console.log('Testing /check/high-humidity');
    const highHumidityResponse = await axios.get(`${BASE_URL}/check/high-humidity`);
    console.log('High Humidity Check:', highHumidityResponse.data);
    
  } catch (error) {
    console.error('Error during API test:', error.response?.data || error.message);
  }
}

testApi();
