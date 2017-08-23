const config = require('config');
const Datastore = require('nedb');
const path = require("path");

const databases = {};

const getDatabase = space => {
  return new Promise((resolve, reject) => {
    if (databases[space]) {
      resolve(databases[space]);
      return;
    }

    const databasePath = path.resolve(config.database.directory);
    const filename = `${databasePath}/${space}.nedb`;
    const database = new Datastore({ filename });
    database.loadDatabase(error => {
      if (error) {
        reject(error);
        return;
      }

      databases[space] = database;
      resolve(database);
    });
  });
}

const find = (space, newer) => {
  return new Promise((resolve, reject) => {
    getDatabase(space).then(database => {
      database.find({timestamp: {"$gt": newer}})
              .sort({timestamp: 1}).exec((error, records) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(records);
      });
    }).catch(error => {
      reject(error);
    });
  });
}

const count = space => {
  return new Promise((resolve, reject) => {
    getDatabase(space).then(database => {
      database.count({}, (error, number) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(number);
      });
    }).catch(error => {
      reject(error);
    });
  });
}

const insert = (space, record) => {
  record.timestamp = Date.now();
  return new Promise((resolve, reject) => {
    getDatabase(space).then(database => {
      database.insert(record, error => {
        if (error) {
          reject(error);
          return;
        }

        resolve(record);
      });
    }).catch(error => {
      reject(error);
    });
  });
}

module.exports = { count, find, insert };
