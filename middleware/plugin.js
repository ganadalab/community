const doAsync = require('./doAsync');

exports.plugin = doAsync(async (req, res, next, hash) => {
  console.log(hash);
  next();
});