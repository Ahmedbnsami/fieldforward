const express = require('express');
const router = express.Router();
const fs = require('fs');

const { giveAdviceAI } = require('../ai_models/giveAdvice');
const { getCurrentWeather } = require('../api_data/getCurrentWeather.js');

const readCropData = () => {
  const data = fs.readFileSync('./json_files/crops.json');
  return JSON.parse(data);
};

router.get('/', (req, res) => {
  const Crop = req.query.crop;

  if (Crop) {
    res.cookie('crop', Crop);

    // Send soil moisture limits to ESP32 via WebSocket
    const cropsData = readCropData();
    const cropObj = cropsData.find(c => c.name === Crop);

    if (cropObj) {
      const [soilMoistureMin, soilMoistureMax] = cropObj.soilMoistureRange;

      const wss = req.app.get("wss");
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              soilMoistureMin,
              soilMoistureMax
            }));
          }
        });
      }
    }
  }

  res.json({ status: 'ok' });
});

router.post('/', async (req, res) => {
  const selectedCrop = req.cookies.crop;
  const { lat, lon, irrigation } = req.body;
  console.log(selectedCrop, lat, lon, irrigation);

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required.' });
  }

  try {
    const cropsData = readCropData();
    const environmentalData = await getCurrentWeather({ latitude: lat, longitude: lon });

    if (irrigation) {
      environmentalData.irrigation = Number(irrigation);
    }

    const Advice = await giveAdviceAI(
      selectedCrop,
      environmentalData.temperature,
      environmentalData.soilMoisture,
      environmentalData.precipitation,
      environmentalData.evapotranspiration,
      irrigation
    );

    res.json({ Advice });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing your request.' });
  }
});

module.exports = router;