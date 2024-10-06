const axios = require('axios');

const getTemperatureData = require('./temp')
const getPrecipitationData = require('./precipitation')
const getSolarRadiationData = require('./SolarRadiation')
const getHumidityData = require('./humidity')

const getEvapotranspirationData = async (lat, lon, date) => {
  try {
    const startDate = '20000101';  // Change to the desired start date
    const endDate = '20501231';    // Change to the desired end date

    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
      params: {
        start: startDate,
        end: endDate,
        latitude: lat,
        longitude: lon,
        parameters: 'ALLSKY_SFC_SW_DWN,QV2M',  // Solar radiation, humidity, temperature, precipitation
        community: 'AG',
        format: 'JSON'
      }
    });

    const data = response.data.properties.parameter;

    // console.log(`Solar Radiation on ${date}:`, data.ALLSKY_SFC_SW_DWN[date]);
    // console.log(`Humidity on ${date}:`, data.QV2M[date]);
    const hour = '12'
    const hourKey = `${date}${hour.padStart(2, '0')}`
    const temperature = await getTemperatureData(lat, lon, date, hourKey);  // Use await here
    // const precipitation = await getPrecipitationData(lat, lon, date);  // Use await here
    const solarRadiation = await getSolarRadiationData(lat, lon, date);  // Use await here
    // const humidity = await getHumidityData(lat, lon, date);  // Use await here
    // Assuming T_max and T_min are not available, we'll just use T_avg (T2M)
    const T_avg = temperature;
    // console.log(temperature)

    // Hargreaves equation: ET = 0.0023 * (T_avg + 17.8) * sqrt(T_max - T_min) * Ra
    // For simplicity, we're assuming sqrt(T_max - T_min) ~ sqrt(T_avg) for now.
    const ET = 0.0023 * (T_avg + 17.8) * Math.sqrt(T_avg) * solarRadiation;

    const Evapotranspiration_string = ET.toFixed(2)
    const Evapotranspiration = Number(Evapotranspiration_string)

    return Evapotranspiration

    // console.log(`Evapotranspiration on ${date}: ${ET.toFixed(2)} mm/day`);

  } catch (error) {
    console.error('Error fetching ET:', error.response ? error.response.data : error.message);
  }
};

// Example coordinates for a location
// getEvapotranspirationData(35.2, -80.5, 20230101);  // Replace with your desired latitude and longitude

// getTemperatureData(35.2, -80.5, 20230101)
// getPrecipitationData(26.820553, 30.802498, 20230101)

module.exports = getEvapotranspirationData
