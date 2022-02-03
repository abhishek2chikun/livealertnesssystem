const serverstatic = require('serve-static');

module.exports = function (app) {
    app.use(serverstatic('models'))
}