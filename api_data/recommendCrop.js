const fs = require('fs');

const cropDatabase = JSON.parse(fs.readFileSync('./json_files/crops.json', 'utf-8'));

function recommendCrop(environment) {
  const { temperature, soilMoisture, precipitation, evapotranspiration, irrigation } = environment;

  const suitableCrops = cropDatabase.filter(crop => {
    const tempMatch = temperature >= crop.tempRange[0] && temperature <= crop.tempRange[1];
    const soilMatch = soilMoisture >= crop.soilMoistureRange[0] && soilMoisture <= crop.soilMoistureRange[1];
    const etMatch = evapotranspiration >= crop.evapotranspirationRange[0] && evapotranspiration <= crop.evapotranspirationRange[1];

    let rainMatch = true;

    // if irrigation is given, check effective water
    if (typeof irrigation === "number") {
      const effectiveWater = (precipitation || 0) + irrigation;
      rainMatch = effectiveWater >= crop.rainfallRange[0] && effectiveWater <= crop.rainfallRange[1];
    } 
    // if no irrigation but rainfall is extremely low, ignore rainfall constraint
    else if ((precipitation || 0) > 20) { 
      rainMatch = precipitation >= crop.rainfallRange[0] && precipitation <= crop.rainfallRange[1];
    }

    return tempMatch && soilMatch && etMatch && rainMatch;
  });

  return suitableCrops.length > 0 ?
    suitableCrops.map(crop => crop.name) :
    ['No suitable crops found for the current conditions.'];
}

module.exports = recommendCrop;
