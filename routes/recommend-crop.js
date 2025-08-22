const express = require('express')
const router = express.Router()

const { getCurrentWeather } = require('../api_data/getCurrentWeather.js')
const recommendCrop = require('../api_data/recommendCrop');

router.get('/', (req, res) => {
  res.render('RecommendCrop'); 
});

router.post('/', async (req, res) => {
  const { lat, lon, irrigation } = req.body;

  if (!lat || !lon) {
    return res.status(400).send('Latitude and Longitude are required.');
  }
  
  try {
    const environmentalData = await getCurrentWeather({latitude: lat, longitude: lon})
    
    if (irrigation) {
      environmentalData.irrigation = Number(irrigation)
    }
    
    const recommendedCrops = recommendCrop(environmentalData);
    res.json({
      environmentalData,
      recommendedCrops
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing your request.');
  }
});

module.exports = router
