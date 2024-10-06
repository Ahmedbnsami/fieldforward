const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;

// Getting data from exported functions
const getEnvironmentalData = require('./js_files/getEnvironmentalData');
const recommendCrop = require('./js_files/recommendCrop');



// Middleware to parse JSON request bodies
app.use(express.json());


// Function to read JSON file
const readCropData = () => {
    const data = fs.readFileSync(path.join(__dirname, './json_files/crops.json'));
    return JSON.parse(data);
};

// Home route
app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/views/Main.html');
  app.use(express.static(__dirname + '/public'));
});

// app.get('/Dashboard', async (req, res) => {
//   res.sendFile(__dirname + '/views/DropDown.html');
//   app.use(express.static(__dirname + '/public'));

// });
// Route for Dashboard
app.get('/Dashboard', (req, res) => {
  const selectedCrop = req.query.crop || "rice"; // Get selected crop from query
  const cropsData = readCropData();

  const currentTemperature = 30;

  const cropAdvice = cropsData.find(crop => crop.name.toLowerCase() === selectedCrop.toLowerCase());

  if (cropAdvice) {
    const advice = [];

    // Compare temperature
    if (currentTemperature < cropAdvice.tempRange[0]) {
      advice.push(`Current temperature (${currentTemperature}°C) is too low for ${cropAdvice.name}.`);
    } else if (currentTemperature > cropAdvice.tempRange[1]) {
      advice.push(`Current temperature (${currentTemperature}°C) is too high for ${cropAdvice.name}.`);
    } else {
      advice.push(`Current temperature (${currentTemperature}°C) is suitable for ${cropAdvice.name}.`);
    }

    // Add more comparisons for soil moisture, rainfall, etc. as needed
    
    res.render('DropDown', { advice }); // Pass the advice to the template
    app.use(express.static(__dirname + '/public'));
  } else {
    res.send('Crop not found.');
  }
});

// Set view engine to ejs
app.set('view engine', 'ejs');

// Render the RecommendCrop page
app.get('/recommend-crop', (req, res) => {
  res.render('RecommendCrop');  // Renders the EJS file when the user visits this route
  app.use(express.static(__dirname + '/public'));
});

// Handle POST request from the client with lat/lon
app.post('/recommend-crop', async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).send('Latitude and Longitude are required.');
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth()).padStart(2, '0'); // Month is 0-indexed
  const day = String(currentDate.getDate()).padStart(2, '0'); // Add leading zero if needed
  const date = `${year}${month}${day}`;
  const hour = '12'; // Example: fixed hour value for now
  const hourKey = `${date}${hour.padStart(2, '0')}`;

  try {
    // Fetch environmental data based on user's lat/lon
    const environmentalData = await getEnvironmentalData(lat, lon, date, hourKey);

    // Get recommended crops based on the environmental data
    const recommendedCrops = recommendCrop(environmentalData);

    // Send the data back to the client as JSON
    res.json({
      environmentalData,
      recommendedCrops
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing your request.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
