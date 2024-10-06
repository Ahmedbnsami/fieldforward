// Getting data from exported functions

const getTemperatureData = require('./temp');
const getSoilMoistureData = require('./SoilMoisture');
const getPrecipitationData = require('./precipitation');
const getEvapotranspirationData = require('./evapotranspiration');
const getCloudsData = require('./clouds');
const getHumidityData = require('./humidity');

// Fetch environmental data from NASA POWER API
async function getEnvironmentalData(lat, lon, date, hour) {
  try {
    const latitude = lat
    const longitude = lon
    const wantedDate = date


    // Getting data from exported functions
    const temperature = await getTemperatureData(lat, lon, date, hour)
    const precipitation = await getPrecipitationData(latitude, longitude, wantedDate)
    const Humidity = await getHumidityData(latitude, longitude, wantedDate)
    const soilMoisture = await getSoilMoistureData(latitude, longitude, wantedDate)
    const evapotranspiration = await getEvapotranspirationData(latitude, longitude, wantedDate)
    const clouds = await getCloudsData(latitude, longitude, wantedDate, hour)

    return {
      temperature,
      soilMoisture,
      precipitation,
      evapotranspiration,
      Humidity,
      // airQuality: 'Not available',
      // clouds,
      // floodRisk: 'Not available',
      // vegetationIndex: 'Not available',
    };
  } catch (error) {
    console.error('Error fetching NASA data:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch environmental data.');
  }
}

module.exports = getEnvironmentalData