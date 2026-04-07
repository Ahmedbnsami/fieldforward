# Smart Agriculture Decision Support System

## Overview

A full-stack agricultural decision support system designed to optimize crop selection and irrigation through the integration of satellite data, on-ground sensor data, and a structured crop knowledge base.

The system combines environmental intelligence with real-time field conditions to provide actionable insights for crop suitability and water management.

---

## Objectives

* Provide data-driven crop recommendations
* Monitor environmental and soil conditions
* Enable automated irrigation based on real-time soil data
* Bridge satellite-scale data with field-level precision

---

## System Architecture

### Software Layer (MERN Stack)

**Frontend**

* React.js
* User interface for crop selection, data visualization, and recommendations

**Backend**

* Node.js + Express.js
* Handles API communication, data processing, and business logic

**Database**

* MongoDB
* Stores crop requirements and system data

**External Data Source**

* NASA POWER API
* Provides climate data:

  * Temperature
  * Precipitation

---

### Hardware Layer (IoT Integration)

**Sensors**

* Soil moisture sensor
* Temperature sensor
* Humidity sensor

**Actuator**

* Water pump

**Control Logic**

* Continuously reads soil moisture levels
* Activates pump when moisture drops below a defined threshold
* Deactivates pump when optimal moisture is restored

---

## Core Features

### 1. Crop Selection Interface

* Users select crops through a frontend interface
* Initiates data retrieval and evaluation pipeline

---

### 2. Environmental Monitoring Dashboard

* Displays:

  * Temperature
  * Precipitation
  * Soil moisture (sensor-based or estimated)
* Structured for quick interpretation of field conditions

---

### 3. Crop Recommendation Engine

Evaluates suitability by comparing:

**Inputs**

* Climate data (temperature, precipitation)
* Soil data (moisture, basic properties)
* Crop requirements (from database)

**Output**

* Recommended crops for current conditions
* Suitability evaluation for selected crops

---

### 4. Crop Knowledge Base

Stored in JSON / MongoDB.

Includes:

* Temperature range (min / optimal / max)
* Water requirements
* Soil conditions (moisture, type)
* Growth duration

---

### 5. Automated Irrigation System

* Soil moisture sensor continuously monitors field conditions
* Pump activation logic:

  * Below threshold → Pump ON
  * Above threshold → Pump OFF
* Reduces water waste and maintains optimal soil conditions

---

## Data Flow

1. User selects a crop via frontend
2. Request sent to backend API
3. Backend fetches climate data from NASA POWER
4. Data is cleaned and normalized
5. Sensor data (if available) is incorporated
6. Crop requirements retrieved from database
7. Matching algorithm evaluates suitability
8. Results returned to frontend
9. Dashboard and recommendations updated

---

## Project Structure

```
/client        React frontend  
/server        Express backend  
/data          Crop requirement data  
/models        MongoDB schemas  
/routes        API endpoints  
/controllers   Business logic  
/utils         Data processing and helpers  
/hardware      Sensor and actuator integration logic  
```

---

## Installation

### Clone Repository

```
git clone <repository-url>
cd <repository-name>
```

### Backend Setup

```
cd server
npm install
```

### Frontend Setup

```
cd client
npm install
```

---

## Running the System

### Start Backend

```
cd server
npm start
```

### Start Frontend

```
cd client
npm run dev
```

---

## Environment Configuration

Create a `.env.local` file in `/server/config`:

```
API_KEY="Your Google Genai Key For Gemini API"
```

---

## Known Limitations

* External API may return incomplete or inconsistent data
* Soil chemistry data (pH, nutrients) not yet integrated
* Recommendation model uses simplified parameters

---

## Future Work

* Integrate soil property APIs (pH, NPK, salinity)
* Improve recommendation algorithm with multi-factor weighting
* Deploy IoT system for real-time sensor streaming
* Add user authentication and data persistence
* Implement advanced analytics and forecasting

---

## Conclusion

This system integrates satellite data, IoT hardware, and crop science into a unified platform for agricultural decision-making. It is designed to evolve from a rule-based system into a more advanced, data-driven solution capable of improving crop yield and resource efficiency.
