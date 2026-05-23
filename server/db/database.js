const Datastore = require('nedb-promises');
const path = require('path');

const db = Datastore.create({
  filename: path.join(__dirname, 'resumai.db'),
  autoload: true,
  timestampData: false,
});

// Index on created_at for sorted queries
db.ensureIndex({ fieldName: 'created_at' });

module.exports = db;
