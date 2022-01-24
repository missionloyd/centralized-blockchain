const mongoose = require("mongoose");
const BlockChainModel = require("./model");
import chalk from 'chalk';
const dotenv = require('dotenv');
dotenv.config();

// connect to db
mongoose.connect(process.env.API_URL,{ useNewUrlParser: true, useUnifiedTopology: true }, (err: any) => {
  if(err) {
    return console.log(chalk.red("Cannot connect to database...", err));
  }
  console.log(chalk.green("Connected to database!"));
  connectionCallback();
});

let connectionCallback = () => {};

module.exports.onConnect = (callback: any) => {
  connectionCallback = callback;
}