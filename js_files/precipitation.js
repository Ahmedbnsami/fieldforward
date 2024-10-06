// const axios = require('axios')

// const getPrecipitationData = async () => {
//     try {
//       const lat = 
//       const response = await axios.get('https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=PRECTOTCORR&community=AG&longitude=${lon}&latitude=${lat}&format=JSON&start=${startDate}&end=${endDate}')

//       const data = response.data.properties.parameter;

//       console.log('Precipitation:', data.PRECTOT)
//       // if (data.PRECTOT) {
//       //   const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6)}`; // Format the date to 'YYYY-MM-DD'
//       //   console.log(`Precipitation on ${formattedDate}:`, data.PRECTOT[formattedDate]);
//       // } else {
//       //   console.log('Precipitation data is not available.');
//       // }
//       // console.log('Precipitation:', data.PRECTOT);
//       // const exampleDate = '2023-01-01';
//       // console.log(`Precipitation on ${exampleDate}:`, data.PRECTOT[exampleDate]);
//       // console.log(`Precipitation on ${date}:`, data.PRECTOT[date]);

//       // console.log(response.data);


//     } catch (error) {
//       console.error(error);
//     }
//   };
  
// // module.exports = getPrecipitationData

// getPrecipitationData(26.820553, 30.802498, 20220101, 20221231)



const axios = require('axios');

const getPrecipitationData = async (lat, lon, date) => {
  try {

    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
      params: {
        start: 20000101,
        end: 20500101,
        latitude: lat,
        longitude: lon,
        parameters: 'PRECTOTCORR',  // Precipitation Total
        community: 'AG',
        format: 'JSON'
      }
    });

    const data = response.data.properties.parameter;

    if (data && data.PRECTOTCORR) {
    //   console.log('Precipitation Data:', data.PRECTOTCORR);

      // Example: Access specific date
      const exampleDate = date;  // Format must match YYYY-MM-DD in response
      // console.log(data.PRECTOTCORR[exampleDate]);
      const Precipitation = data.PRECTOTCORR[exampleDate]
      return Precipitation
    } else {
      console.log('Precipitation data is not available.');
    }

  } catch (error) {
    console.error('Error fetching precipitation:', error.response ? error.response.data : error.message);
  }
};

// Example usage for a location (latitude, longitude)
// getPrecipitationData(35.2, -80.5, 20231227);  // Replace with desired latitude and longitude


module.exports = getPrecipitationData