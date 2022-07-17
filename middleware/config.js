const configJson = require('../config.json');

class Config {
  constructor () {
    this.storage = configJson.storage;
    this.lang = configJson.language;
    this.firebase = configJson.firebase;
    if (process.env.NODE_ENV === 'development') {
      this.sql = configJson.sql.development;
      this.s3 = configJson.s3.development;
    } else {
      this.sql = configJson.sql.production;
      this.s3 = configJson.s3.production;
    }
  }
  getStorage () {
    if (this.storage === 'local') {
      return `/storage`;
    } else {
      return this.s3.host;
    }
  }
  getS3 () {
    return this.s3;
  }
  getDatabase () {
    return this.sql;
  }
  getLang () {
    return this.lang;
  }
  getFirebase () {
    return this.firebase;
  }
}

const config = new Config();

module.exports = config;