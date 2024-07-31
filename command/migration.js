require('dotenv').config();
const mongodb = require('mongodb');
const client = new mongodb.MongoClient(process.env.MONGO_URI);
const fs = require('fs');
var db;

const runner = async (instance, instanceName) => {
  try {
    await instance.run();
    let migrateCollection = db.collection('migrate');
    await migrateCollection.insertOne({
      jobName: instanceName,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const migration = async () => {
  let migrateCollection = db.collection('migrate');
  let migratedItems = await migrateCollection.find({}).toArray();

  let items = fs
    .readdirSync(__dirname)
    .filter((o) => o.endsWith('Migration.js'))
    .sort((a, b) => {
      const aDate = fs.statSync(`${__dirname}/${a}`);
      const bDate = fs.statSync(`${__dirname}/${b}`);
      return aDate.birthtime - bDate.birthtime;
    });
  for (let i = 0; i < items.length; i++) {
    const [instanceName] = items[i].split('.');
    const cls = require(`${__dirname}/${items[i]}`);
    if (!cls && typeof cls !== 'function') continue;
    const instance = new cls(db);
    if (migratedItems.find(({ jobName }) => jobName === instanceName)) {
      continue;
    }
    await runner(instance, instanceName);
    console.log(`Migrated ${instanceName}`);
  }
};

module.exports = (async () => {
  console.log('Migrating ....');
  await client.connect();
  db = client.db();
  await migration();
  console.log('Migrate completed!');
  process.exit();
})();
