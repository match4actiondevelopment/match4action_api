const mongoose = require('mongoose');
const { User } = require('./dist/models/User.js');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGO_LOCAL || 'mongodb://localhost:27017/match4action').then(async () => {
  const user = await User.findOne({ email: "admin@match4action.com" });
  console.log("User:", user);
  mongoose.disconnect();
});
