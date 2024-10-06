const axios = require('axios');

// Replace with your Tomorrow.io API key
const API_KEY = 'NX6SX0FqrdI7JTMksaogxZPRjbqUp5tf';

// Function to get air quality data
async function getAirQuality(lat, lon) {
  try {
    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=epaIndex,pm25,pm10,carbonMonoxide,sulfurDioxide,nitrogenDioxide,ozone&timesteps=1h&units=metric&apikey=${API_KEY}`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Process and log air quality data
    console.log('Air Quality Data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching air quality data:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch air quality data.');
  }
}

// Example usage with coordinates (e.g., New York City)
getAirQuality(40.7128, -74.0060);
