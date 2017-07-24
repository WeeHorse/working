var config = require('../config.json'),
    os = require("os"),
    osPlatform = os.platform(),
    packageJson = require('../package.json'),
    Format = require('./format'),
    envType = osPlatform == 'win32' || osPlatform == 'darwin' ? 'dev' : 'live';

// replace config params starting with live or dev
// with unprefixed params depending on envType
for(let i in config){
  if(i.indexOf('dev') == 0 || i.indexOf('live') == 0){
    let unprefixed = i.split('dev').join('').split('live').join('');
    let val = config[envType + unprefixed];
    if(val === undefined){continue;}
    delete config[i];
    config[unprefixed] = val;
  }
}

global.SystemSingleton = null;

class System{

  constructor(){
    if(SystemSingleton){
      for(let prop in SystemSingleton){
        this[prop] = SystemSingleton[prop];
      }
      return this;
    }
    this.Format = Format;
    this.config = config;
    this.modules = {};
    global.passwordSalt = this.config.passwordSalt;
    this.registerModules();
    var path = this.modules.path;
    this.basePath = path.normalize(path.join(__dirname,'../'.split('/').join(path.sep)));
    this.clientPath = path.normalize(path.join(this.basePath, this.config.clientPath));
    //this.imageCachePath = path.normalize(path.join(this.basePath, this.config.imageCachePath));
    this.modelPath = path.normalize(path.join(this.basePath, this.config.modelPath));
    this.models = {};
    this.registerModels();
    global.SystemSingleton = this;
  }

  /**
   *
   * @return array of modules as strings, from package json and config.modules
   */
  listModules(){
    return [...this.config.modules, ...Object.keys(packageJson.dependencies)];
  }

  registerModules(){
    this.listModules().forEach((module)=>{
      let modulePath = module.indexOf('/') > -1 ? this.modules.path.normalize(module) : module;
      let moduleName = module.substring(module.lastIndexOf('/') + 1);
      moduleName = this.Format.convertToCamelCase(this.Format.trimNonWordChars(moduleName));
      moduleName = moduleName.replace(/.class/, '');
      this.modules[moduleName] = require(modulePath);
    });
    this.promisifyModuleMethods();
  }

  /**
   * Node 8 offers a util.promisify function.
   * Read: http://2ality.com/2017/05/util-promisify.html
   * Methods listed in config.promisify will be promisified here
   * and added to the module namespace with Async appended.
   * Example: fs.readdir has an asyncronous sibling at fs.readdirAsync
   */
  promisifyModuleMethods(){
    for(var module in this.config.promisify){
      let methods = this.config.promisify[module];
      if(!methods){
        this.modules[module + 'Async'] = this.modules.util.promisify(this.modules[module]);
      }else{
        for(let method of methods){
          this.modules[module][method + 'Async'] = this.modules.util.promisify(this.modules[module][method]);
        }
      }
    }
  }

  registerModels(){
    var path = this.modules.path;
    this.config.models.forEach((model)=>{  // or I could just use fs..
      let modelPath = path.normalize(path.join(this.modelPath, model + '.class'));
      let modelName = this.Format.convertToCamelCase(model);
      this.models[modelName] = require(modelPath);
    });
  }

  sleep(ms){
    return new Promise(function(res,rej){
      setTimeout(()=>{res()},ms);
    });
  }

}

module.exports = System;
