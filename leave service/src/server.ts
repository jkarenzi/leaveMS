import app from './app'
import { AppDataSource } from './dbConfig'
import dotenv from "dotenv";
import cron from 'node-cron'
import { processYearlyCarryOver } from './utils/processYearlyCarryOver';
import processMonthlyAccrual from './utils/processMonthlyAccrual';
import checkForUpcomingLeaves from './utils/checkForUpcomingLeaves';
import expireExcessLeaveDays from './utils/expireExcessLeaveDays';
dotenv.config();


const { PORT = 3000 } = process.env;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is running on " + PORT);
      cron.schedule('1 0 1 1 *', processYearlyCarryOver)
      cron.schedule('0 1 1 * *', processMonthlyAccrual)
      cron.schedule('0 8 * * *', async() => {
        await checkForUpcomingLeaves()
      })
      cron.schedule('1 0 31 1 *', expireExcessLeaveDays)
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));