const express = require('express')
const router = express.Router()

const { getCurrentWeather } = require('../api_data/getCurrentWeather.js')
const recommendCrop = require('../api_data/recommendCrop');

router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

router.post('/', async (req, res) => {
  const { lat, lon, irrigation } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required.' });
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
    res.status(500).json({ error: 'Error processing your request.' });
  }
});

module.exports = router
