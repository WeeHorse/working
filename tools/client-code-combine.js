var config = require('../config.json'),
    clientDir = '../' + config.clientDir;

require(clientDir + 'js/libs/gnarly-template-replacements.js');

module.exports = class ClientCodeCombine {

  constructor(){
    this.babel = require("babel-core");
    this.jsmin = require('jsmin').jsmin;
    this.fs = require('fs');
    let path = require('path');
    this.babelPolyFillCode = this.fs.readFileSync(
      path.join(__dirname,'../node_modules/babel-polyfill/dist/polyfill.min.js'),'utf-8'
    );
    this.filesToWatch = [];
    this.startLoad();
  }

  startLoad(){
    this.startTime = new Date().getTime();
    global.gnarly = {};
    this.purgeRequireCache(clientDir + "load-list.js");
    require(this.watch(clientDir + "load-list.js"));
    this.loadList = gnarly.load;
    delete global.gnarly;
    this.toLoad();
  }

  toLoad(){
    // Build the html for link and script tags
    // and write directly...
    let lastFolder = '';
    let cssToLoad = [];
    let jsToLoad = [];
    let templatesToLoad = [];
    this.loadList.split('\n').map((file)=>{
      let of = file;
      file = file.replace(/#/g,'');
      let nobabel = of!=file;
      file = file.replace(/\s*/g,'');
      if(file.indexOf('.')<0){ lastFolder = file; return; }
      if(file.indexOf('.') < 0){ lastFolder = ''; }
      let isCss = file.substr(file.lastIndexOf('.') + 1) == 'css';
      let isEmpty = file == '';
      if(isEmpty){ return ''; }
      file = lastFolder + file;
      if(isCss){
        cssToLoad.push(file);
        return;
      }
      if(file.indexOf('components/')>=0 && file.indexOf('.js')){
        file = file.split('.*')[0] + '/' + file.split('/')[1].split('.*')[0] + '.js';
        templatesToLoad.push(file.replace(/\.js/,'.html'));
      }
      jsToLoad.push({file:file,nobabel:nobabel});
    }).join('\n');

    this.build(cssToLoad,jsToLoad,templatesToLoad);

  }

  build(cssToLoad,jsToLoad,templatesToLoad){
    let fs = this.fs;
    let nobabelfiles = [], nobab;
    let all = '';
    for(let js of jsToLoad){
      try {
        let c = fs.readFileSync(this.watch(config.clientDir + js.file,'utf-8')) + '\n\n';
        if(js.nobabel){
          nobabelfiles.push(c);
          all += '/*!nobabelfile' + (nobabelfiles.length-1) + '*/\n';
        }
        else {
          all += c;
        }
      }
      catch(e){
        if(js.file.indexOf('components/') == 0){
          all += 'class ' + this.filenameToClassname(js.file.split('/').pop().split('.')[0]) + ' extends Component {}\n\n';
        }
      }
    }
    let allT = {};
    for(let t of templatesToLoad){
      try {
        allT[t.split('/').pop().split('.')[0]] = ___gnarly_template_replacements___(
          t,
          fs.readFileSync(this.watch(config.clientDir + t,'utf-8')) + '\n\n'
        ).replace(/\n\s*</g,'<');
      }
      catch(e){}
    }
    let l = '';
    for(let css of cssToLoad){
      l+='document.write(\'<link rel="stylesheet" href="' + css + '">\');\n\n';
    }
    l += 'class Loader {}\n';
    l += 'Loader.loadStart = ___s.getTime();\n';
    l += 'Loader.loadEnd = new Date().getTime();\n';
    l += 'Loader.templatesToLoad =' + JSON.stringify(allT,'','  ') + ';';
    l += '\n\n';
    if(all.indexOf('/*!') == 0){
      all = all.replace(/\*\//,'*/\n' + l);
    }
    else {
      all = l + all;
    }

    let babeled,
        bB = config.js.buildBabelifiedJsToo;
    try{
      if(bB){
        babeled = this.babel.transform(all,{presets: ["es2015"],plugins: ["fast-async"]}).code;
        nobab = nobabelfiles.slice();
        babeled = babeled.replace(/\/\*\!nobabelfile\d*\*\//g,()=>{
          return nobab.shift();
        });
      }
      nobab = nobabelfiles.slice();
      all = all.replace(/\/\*\!nobabelfile\d*\*\//g,()=>{
        return nobab.shift();
      });
      if(bB){
        babeled = babeled.split('"use strict";').join('');
        babeled = this.jsmin(babeled);
        babeled = this.babelPolyFillCode + babeled;
        let firstComment = babeled.match(/\/\*\![^\*]*\*\//);
        if(firstComment){
          firstComment = firstComment[0];
          babeled = babeled.replace(/\/\*\![^\*]*\*\//,'');
          babeled = firstComment + babeled;
        }
      }
      all = all.replace(/\/\*\!nobabelfile\d*\*\//g,'');
      all = this.jsmin(all);
      fs.writeFileSync(config.clientDir + 'js/all.js',all);
      bB && (fs.writeFileSync(config.clientDir + 'js/b-all.js',babeled));
      console.log("REBUILDING COMBINED JS",new Date().getTime()-this.startTime + 'ms');
    }catch(e){
      console.log(e.stack);
    }
  }

  filenameToClassname(s){
    s = s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
    return s[0].toUpperCase() + s.substr(1);
  }

  watch(filename){
    if(this.filesToWatch.indexOf(filename) < 0){
      this.filesToWatch.push(filename);
    }
    else {
      return filename;
    }
    (()=>{
      let f = filename.split(clientDir).join('./client/');
      try {
        this.fs.watch(f, {encoding: 'buffer'}, (e) => {
          clearTimeout(this.watchTimeouter);
          this.watchTimeouter = setTimeout(()=>{this.startLoad();},100);
        });
      }
      catch(e){}
    })();

    return filename;
  }

  purgeRequireCache(moduleName) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    this.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
  }

  searchCache(moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function (child) {
                traverse(child);
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
  }

}
