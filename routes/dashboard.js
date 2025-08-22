const express = require('express')
const router = express.Router()
const fs = require('fs')

const { giveAdviceAI } = require('../ai_models/giveAdvice')
const { getCurrentWeather } = require('../api_data/getCurrentWeather.js')

const readCropData = () => {
    const data = fs.readFileSync('./json_files/crops.json');
    return JSON.parse(data);
};


router.get('/', (req, res) => {
  const Crop = req.query.crop
  res.cookie('crop', Crop)
  res.render('DropDown');
})

router.post('/', async (req, res) => {
  const selectedCrop = req.cookies.crop
  const { lat, lon, irrigation } = req.body
  console.log(selectedCrop, lat, lon, irrigation)
  if (!lat || !lon) {
    return res.status(400).send('Latitude and Longitude are required.');
  }
  
  try {
    const cropsData = readCropData();
    const environmentalData = await getCurrentWeather({latitude: lat, longitude: lon})
    
    
    if (irrigation) {
      environmentalData.irrigation = Number(irrigation)
    }
    const Advice = await giveAdviceAI(selectedCrop, environmentalData.temperature, environmentalData.soilMoisture, environmentalData.precipitation, environmentalData.evapotranspiration, irrigation)
    
    
    res.json({
      Advice
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing your request.');
  }
})


module.exports = router
