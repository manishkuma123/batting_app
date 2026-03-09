const express = require("express");
const connectDB = require('./db');
require('dotenv').config();
const cors = require('cors');
const user = require("./routes/User");
require("./modules/monthlyReward");
const category = require("./routes/category")
const app = express();
const routerdata = require("./routes/pooldata")
app.use(express.json());
app.use(cors());
connectDB();

app.get('/', (req, res) => {
    res.send("Welcome to Porralia Batting App");
});

app.use('/', user);

app.use('/api',routerdata)
app.use('/',category)
const PORT = process.env.PORT  ;
console.log("Mongo URI:", process.env.MONGODB_URI);
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
