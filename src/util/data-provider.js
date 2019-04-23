const PouchDB = require('pouchdb').default;
const path = require('path');

let _targetDb, _referenceDb, _lookupsDb;

const lookupsDb = () => {
  console.log('init lookupsDB');
  _lookupsDb = _lookupsDb || new PouchDB("db/lookupsDB");
  return _lookupsDb;
};

const targetDb = () => {
  console.log('init targetD');
  _targetDb = _targetDb || new PouchDB(path.resolve(__dirname, "../db/targetDB"));
  return _targetDb;
};

const referenceDb = () => {
  console.log('init referenceDB');
  _referenceDb = _referenceDb || new PouchDB.plugin(require('pouchdb-quick-search'))(path.resolve(__dirname, "../db/referenceDB"));
  return _referenceDb;
};

module.exports = {
  targetDb,
  referenceDb,
  lookupsDb,
}
