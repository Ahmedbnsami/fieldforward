const express = require('express');
const fs = require('fs')
const cookieParser = require('cookie-parser')
const app = express();
const port = 3000;

const dashboardRouter = require('./routes/dashboard.js')
const recommendCropsRouter = require('./routes/recommend-crop.js')

app.use(express.json());
app.use(cookieParser())
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/', async (req, res) => {
  const crops = JSON.parse(fs.readFileSync('./json_files/crops.json', 'utf-8'));
  res.render('Main', { crops });
})

app.use('/Dashboard', dashboardRouter)
app.use('/recommend-crop', recommendCropsRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
