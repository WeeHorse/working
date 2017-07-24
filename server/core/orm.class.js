var System = require('./system.class'),
    Route = require('./route.class');

module.exports = class Orm extends System{

  constructor(){
    super();
    this.db = this.modules.mysql.createPool(this.config.db);
    this.structure = {tables:{}};
  }

  middleware(req, res, next){
    this.mapDbStructure(next);
  }

  routes(req, res, next){
    var route = new Route(req);
    if(route.valid && this.tableExists(route.table)){
      this[route.method](route, function(response){
        res.json(response);
        res.end();
      });
    }else{
      next();
    }
  }

  GET(route, cb){
    var q = "SELECT * FROM ??";
    var p = {};
    (route.id || route.filter) && (q += " WHERE ?");
    route.id && (p.id = route.id);
    route.filter && (p = route.filter);
    this.db.query(q, [route.table, p], function(err, rows, fields){
      console.log('rows', rows);
      cb(rows);
    });
  }

  POST(route, cb){
    this.replace(route.table, route.request.body, cb);
  }

  PUT(route, cb){
    // add id to the data object if it is not there already
    if(!route.request.body.id && route.id){
      route.request.body.id = route.id;
    }
    this.replace(route.table, route.request.body, cb);
  }

  DELETE(route, cb){
    var q = "DELETE FROM ?? WHERE id = ?";
    this.db.query(q, [route.table, route.id], function(err, rows, fields){
      console.log('DELETE result', err, rows, fields);
      cb(rows);
    });
  }

  // when creating some structure, entitity, concept, table, view
  createSome(cb){ // changing the db structure
    this.structure.mapped = false;
    this.mapDbStructure(cb);
  }

  /**
   * Helper to perform REPLACE (instead of insert or update) from a data object
   * (matching the target table schema)
   * ex: this.replace('users', res.body, callback)
   */
  replace(table, data, cb){
    // Stringify any JSON cols
    for(let key in data){
      if(data[key].constructor == Array || data[key].constructor == Object){
        data[key] = JSON.stringify(data[key]);
      }
    }
    // prefer col id for mysql
    if(data._id){
      if(!data.id){
        data.id = data._id;
      }
      delete(data._id);
    }
    var query = "REPLACE INTO " + table + " SET ?";
    console.log('sqlSet query', query);
    this.db.query(query, data, function(err, rows, fields){
      console.log('insertUpdate result', err, rows, fields);
      cb(rows);
    });
  }

  mapDbStructure(cb){
    if(this.structure.mapped){
      cb();
    }else{
      this.structure.tables = {};
      this.db.query("SHOW FULL TABLES", [], (err, rows, fields)=>{
        let tableKey = rows[0]? Object.keys(rows[0])[0] : null;
        for(let row of rows){
          this.structure.tables[row[tableKey]] = row.Table_type;
        }
        this.structure.mapped = true;
        console.log('this.structure', this.structure);
        cb();
      });
    }
  }

  tableExists(table){
    return (this.structure.tables[table])?true:false;
  }


}
