const axios = require('axios');



// Define the Agromonitoring API key

// Define the Agromonitoring endpoint for soil moisture

// Fetch soil moisture data from Agromonitoring API
const getSoilMoistureData = async (lat, lon) => {
  try {
    const apiKey = 'b0ac1adae858a80a9853b15314867b4b';  // Replace with your API key
    const url = `http://api.agromonitoring.com/agro/1.0/soil?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await axios.get(url);

    // Handle the response data
    const data = response.data;
    // console.log('Soil moisture data fetched successfully:', data);

    const x = data.moisture
    const moisture = x * 100


    // console.log(moisture)
    return moisture

    // You can process or store the data as needed
  } catch (error) {
    console.error('Error fetching soil moisture data:', error.response ? error.response.data : error.message);
  }
};

// Call the function to fetch soil moisture data
// fetchSoilMoistureData(); 

module.exports = getSoilMoistureData
