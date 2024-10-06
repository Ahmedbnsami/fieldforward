const fs = require('fs');
require('dotenv').config();

// Load crop data from JSON file
const cropDatabase = JSON.parse(fs.readFileSync('./json_files/crops.json', 'utf-8'));


// Determine the best crop based on environmental data
function recommendCrop(environment) {
  const { temperature, soilMoisture, precipitation, evapotranspiration } = environment;

  // Filter crops based on environmental conditions
  const suitableCrops = cropDatabase.filter(crop => {
    const tempMatch = temperature >= crop.tempRange[0] && temperature <= crop.tempRange[1];
    const rainMatch = precipitation >= crop.rainfallRange[0] && precipitation <= crop.rainfallRange[1];
    const soilMatch = soilMoisture >= crop.soilMoistureRange[0] && soilMoisture <= crop.soilMoistureRange[1];
    const etMatch = evapotranspiration >= crop.evapotranspirationRange[0] && evapotranspiration <= crop.evapotranspirationRange[1];
    //   const floodMatch = floodRisk ? crop.floodTolerance : true;

    return tempMatch && soilMatch && rainMatch && etMatch;
  });

  return suitableCrops.length > 0
    ? suitableCrops.map(crop => crop.name)
    : ['No suitable crops found for the current conditions.'];
}


module.exports = recommendCrop