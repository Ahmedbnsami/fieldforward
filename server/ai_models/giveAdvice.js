const dotenv = require('dotenv')
const { GoogleGenerativeAI } = require('@google/generative-ai')

dotenv.config({ path: __dirname + '/../config/.env.local' })

const genAI = new GoogleGenerativeAI(process.env.API_KEY)

async function giveAdviceAI(crop, temp, soilmoisture, precipitation, evapotranspiration, irrigation) {
  const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"})
  
  const prompt = `You are an agricultural decision support system. 
  You are an agriculture advisory system. Output only valid JSON, with no explanations, no markdown, and no code blocks.
  Don't add any text except the json code.
Your job is to take in environmental inputs and return structured JSON advice for farmers. 
Always use the given environmental values when relevant, and do not invent new numbers. 
Do not add explanations or extra text outside of the JSON. 
Return only valid JSON in the exact format below.

Environmental Data:
Crop: ${crop}
Temperature (°C): ${temp}
Soil Moisture (%): ${soilmoisture}
Precipitation (mm): ${precipitation}
Evapotranspiration (mm): ${evapotranspiration}
Irrigation Availability (mm): ${irrigation}

JSON Response Format:
{
  "summary": "Short sentence about crop suitability under current conditions.",
  "cropRotation": { 
    "droughtForecast": "Recommend | Not Recommended", 
    "vegetationGrowth": "Stable | Weak | Strong", 
    "tip": "1 short actionable tip"
  },
  "fertilization": { 
    "soilMoisture": "number or %", 
    "rainfallForecast": "Low | Medium | High", 
    "tip": "1 short actionable tip"
  },
  "harvest": { 
    "precipitationRisk": "Low | Medium | High", 
    "etLevel": "Low | Medium | High", 
    "tip": "1 short actionable tip"
  },
  "pests": { 
    "pestRisk": "Low | Medium | High", 
    "fungalRisk": "Low | Medium | High", 
    "tip": "1 short actionable tip"
  },
  "soilHealth": { 
    "floodRisk": "Low | Medium | High", 
    "erosionControl": "Yes | No", 
    "tip": "1 short actionable tip"
  },
  "water": { 
    "droughtRisk": "Low | Medium | High", 
    "waterStorage": "Yes | No", 
    "tip": "1 short actionable tip"
  },
  "livestock": { 
    "heatStress": "Low | Medium | High", 
    "airQuality": "Good | Moderate | Poor", 
    "tip": "1 short actionable tip"
  },
  "postHarvest": { 
    "humidityRisk": "Low | Medium | High", 
    "moldRisk": "Low | Medium | High", 
    "tip": "1 short actionable tip"
  },
  "pump": { 
    "state": "ON | OFF", 
    "tip": "1 short actionable tip"
  }
}
`
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  let text = response.text()
  
  try {
    text = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(text)
    return parsed
  } catch (err) {
    console.error(err, text)
    throw new Error('invailed ai response format')
  }
}

module.exports = { giveAdviceAI }
