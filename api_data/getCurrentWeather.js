const fetch = require('node-fetch');

async function getCurrentWeather({ latitude, longitude }) {
  if (latitude === undefined || longitude === undefined) {
    throw new Error("Latitude and longitude are required");
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'et0_fao_evapotranspiration',
    'precipitation_sum'
  ].join(','));
  url.searchParams.set('hourly', [
    'soil_moisture_0_to_10cm'
  ].join(','));
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();

  const d = data.daily;
  const h = data.hourly;

  // Average today's soil moisture
  const today = d.time[0];
  const todaySoil = h.soil_moisture_0_to_10cm.filter((_, i) =>
    h.time[i].startsWith(today)
  );
  const soilMoistureAvg = todaySoil.reduce((a, b) => a + b, 0) / todaySoil.length;

  // Compute mean daily temperature
  const tempAvg = (d.temperature_2m_max[0] + d.temperature_2m_min[0]) / 2;

  return {
    temperature: tempAvg,
    evapotranspiration: d.et0_fao_evapotranspiration[0],
    precipitation: d.precipitation_sum[0],
    soilMoisture: soilMoistureAvg
  };
}

module.exports = { getCurrentWeather };