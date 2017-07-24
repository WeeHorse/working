var System = require('./system.class');

module.exports = class Route extends System{

  constructor(req){
    super();
    this.method = req.method;

    var parts = req.url.replace(/^\//,'').split('/');

    var type = parts.shift();
    this.type = (type && this.config.orm.routes.indexOf(type) > -1)? type : null;

    this.table = parts.shift() || null;

    var filter = parts.shift();
    this.id = (filter && Number.isSafeInteger(filter/1))? filter : null;
    this.filter = (filter && !this.id)? filter : null;

    var sort = parts.shift(); // like: -name or name
    this.sort = sort || null;

    this.request = {};
    this.request.body = req.body || null;
    this.request.session = req.session || null;

    this.valid = this.method && this.type && this.table;
  }

}
