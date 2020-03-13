const Airtable = require("airtable");
const handleSingleUser = require("../../lib/stars/getSingleEmailData");

module.exports = async function sendEmails() {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const users = [];

  base("Table 1")
    .select({
      view: "Grid view",
      maxRecords: 1000
    })
    .eachPage(
      async function page(records, fetchNextPage) {
        records.forEach(function(record) {
          users.push(record);
        });

        fetchNextPage();
      },
      async function done(err) {
        if (err) {
          console.error(err);
          return;
        }

        let $userStarredRepoMap = {};

        for (let user of users) {
          $userStarredRepoMap = await handleSingleUser(
            user,
            $userStarredRepoMap
          );
        }
      }
    );
};
