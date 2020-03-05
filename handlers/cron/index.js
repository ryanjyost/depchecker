const CronJob = require("cron").CronJob;

const sendEmails = require("./sendEmails");

const job = new CronJob("0 0 2 * * 0", sendEmails, null, true);

const runCronJobs = () => {
  job.start();
};

module.exports = runCronJobs;
