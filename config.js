
var config = {
  db: process.env.MONGO_URL || 'mongodb://localhost/zoltura',
  port:  process.env.PORT || 8080
};
module.exports = config;