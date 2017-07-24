var config = require('../config.json'),
    packageJson = require('../package.json');

global.SystemSingleton = null;

class System{

  constructor(){
    if(SystemSingleton){
      for(let prop in SystemSingleton){
        this[prop] = SystemSingleton[prop];
      }
      return this;
    }
    this.config = config;
    this.mapEnv();
    this.modules = {};
    this.registerModules();
    var path = this.modules.path;
    this.basePath = path.normalize(path.join(__dirname,'../'.split('/').join(path.sep)));
    this.clientPath = path.normalize(path.join(this.basePath, this.config.clientPath));
    global.SystemSingleton = this;
  }

  mapEnv(){
    for(var key in this.config[this.config.env]){
      this.config[key] = this.config[this.config.env][key];
    }
  }

  listModules(){
    return [...Object.keys(packageJson.dependencies), ...this.config.modules];
  }

  registerModules(){
    this.listModules().forEach((module)=>{
      this.modules[module.replace(/(\-)(\w)/g, function(r){return r[1].toUpperCase();})] = require(module);
    });
  }

}

module.exports = System;
