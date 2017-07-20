var  App = require('./server/core/app.class'),
	config = require('./config.json'),
    Sass = require('./modules/sass.class');

if(config.js.combineClientCodeAtDevStartup){
  var ClientCodeCombine = require('./tools/client-code-combine');
  new ClientCodeCombine();
}

for(let conf of config.sass){
    new Sass(conf);
}

new App();


