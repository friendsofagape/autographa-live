const PouchDB = require('pouchdb').default;

let _targetDb, _referenceDb, _lookupsDb;

const lookupsDb = () => {
  console.log('init lookupsDB');
  _lookupsDb = _lookupsDb || new PouchDB("db/lookupsDB");
  return _lookupsDb;
};

const targetDb = () => {
  console.log('init targetDB');
  _targetDb = _targetDb || new PouchDB("db/targetDB");
  return _targetDb;
};

const referenceDb = () => {
  console.log('init referenceDB');
  _referenceDb = _referenceDb || new PouchDB.plugin(require('pouchdb-quick-search'))("db/referenceDB");
  return _referenceDb;
};

module.exports = {
  targetDb,
  referenceDb,
  lookupsDb,
}
