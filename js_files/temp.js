// Temp
const axios = require('axios');

const getTemperatureData = async (lat, lon, date, hour) => {
  try {
    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/hourly/point', {
      params: {
        parameters: 'T2M', // Near-surface temperature
        community: 'AG',
        longitude: lon,
        latitude: lat,
        start: date,
        end: date,
        format: 'JSON'
      }
    });

    const data = response.data.properties.parameter.T2M;
    // console.log(hour)
    // Construct the correct key for the specific hour (YYYYMMDDHH)
    ;
    
    // console.log(hourKey)
    // Get the temperature for the specific hour
    const temperature = data[hour];

    return temperature;

  } catch (error) {
    console.error('Error fetching temperature data: ', error.message);
    return null;
  }
};

// const main = async () => {
//   // Fetch temperature for Jan 1, 2023, 12:00 PM (hour = '12')
//   const temperature = await getTemperatureData(35.2, -80.5, '20240902', '12');
  
//   console.log('Temperature:', temperature);
// };

// main();


module.exports = getTemperatureData




