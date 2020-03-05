const Airtable = require("airtable");

module.exports = async function(req, res) {
  const { userId } = req.params;
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  base("Table 1").destroy(userId, function(err, deletedRecord) {
    if (err) {
      console.error(err);
      res.json({ error: "Something went wrong." });
      return;
    }
    res.json({ success: true });
  });
};
