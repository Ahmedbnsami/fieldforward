const axios = require('axios');

// Replace with your Tomorrow.io API key
const API_KEY = 'NX6SX0FqrdI7JTMksaogxZPRjbqUp5tf'; // Directly include your API key
const BASE_URL = 'https://api.tomorrow.io/v4/timelines';

async function getWeatherData(lat, lon) {
  const queryParams = new URLSearchParams({
    location: `${lat},${lon}`,
    key: API_KEY,
    fields: ['temperature', 'precipitation', 'humidity'], // Adjust fields as needed
    units: 'metric', // or 'imperial'
    timesteps: '1h', // Adjust timestep as needed
    startTime: new Date().toISOString(), // Current time
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours later
  });

  const url = `${BASE_URL}?${queryParams}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch weather data.');
  }
}

(async () => {
  const lat = 35.2; // Example latitude
  const lon = -80.5; // Example longitude

  try {
    const weatherData = await getWeatherData(lat, lon);
    console.log('Weather Data:', weatherData);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
