const DepSnapshot = require("./model");

module.exports = {
  createDepSnapshot: async data => {
    const withoutNpm = { ...data };
    delete withoutNpm.npm;

    // // mongdb rejects keys with dots
    // const buff = Buffer.from(JSON.stringify(data.npm));
    // const base64data = buff.toString("base64");

    return await DepSnapshot.create({
      name: data.name,
      data: withoutNpm,
      npm: JSON.stringify(data.npm)
    });
  },
  findRecentSnapshot: async name => {
    const hours = 24;
    const snapshot = await DepSnapshot.findOne(
      {
        name,
        created_at: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
      },
      {},
      { sort: { created_at: -1 } }
    );

    return parseAndPrep(snapshot);
  }
};

function parseAndPrep(snapshot) {
  if (!snapshot) return snapshot;
  // const buff = Buffer.from(snapshot.npm, "base64");
  // console.log("SNAP", buff.toString("ascii"));
  // const json = JSON.parse(buff.toString("ascii"));
  return {
    created_at: snapshot.created_at,
    ...snapshot.data,
    ...{ npm: JSON.parse(snapshot.npm) }
  };
}
