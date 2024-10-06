// Temp
const axios = require('axios');

const getCloudsData = async (lat, lon, date, hour) => {
  try {
    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/hourly/point', {
      params: {
        parameters: 'CLOUD_AMT', // Near-surface temperature
        community: 'AG',
        longitude: lon,
        latitude: lat,
        start: date,
        end: date,
        format: 'JSON'
      }
    });
    // console.log(response.data);

    const data = response.data.properties.parameter;
    // console.log(data.T2M[date]);
    const Clouds = data.CLOUD_AMT[hour]
    return Clouds

    // console.log('Clouds:', Clouds);


  } catch (error) {
    console.error('Error fetching clouds data: ', error);
  }
};

// getCloudsData(35.2, -80.5, 20230101)



module.exports = getCloudsData




