const axios = require('axios');



const getSolarRadiationData = async (lat, lon, date) => {
  try {
    const startDate = '20000101';  // Change to the desired start date
    const endDate = '20501231';    // Change to the desired end date

    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
      params: {
        start: startDate,
        end: endDate,
        latitude: lat,
        longitude: lon,
        parameters: 'ALLSKY_SFC_SW_DWN',  // Solar radiation, humidity, temperature, precipitation
        community: 'AG',
        format: 'JSON'
      }
    });

    const data = response.data.properties.parameter;
    const SolarRadiation = data.ALLSKY_SFC_SW_DWN[date]

    // console.log(data.ALLSKY_SFC_SW_DWN[date]);
    return SolarRadiation

    
    // console.log('Solar Radiation:', data.ALLSKY_SFC_SW_DWN);  // Radiation for ET calculation
    // console.log('Humidity:', data.QV2M);  // Humidity for ET calculation
    // console.log('Temperature:', data.T2M);  // Temperature for additional context
    // console.log('Precipitation:', data.PRECTOT);  // Precipitation data
  } catch (error) {
    console.error('Error fetching data from NASA POWER API:', error.response ? error.response.data : error.message);
  }
};

module.exports = getSolarRadiationData