function getCollections(req, res, next) {
  res.render('index', { title: 'getCollections' });
}

module.exports = {
  getCollections: getCollections
};