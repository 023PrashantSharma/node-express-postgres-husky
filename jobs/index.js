const cron = require('node-cron');

let dailyScheduler = cron.schedule('* * * * *', () => { 
  try {
    //Do something here
  } catch (error) {
    throw error;        
  }
});   

dailyScheduler.start();
