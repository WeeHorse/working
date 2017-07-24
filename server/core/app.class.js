var System = require('./system.class'),
    Orm = require('./orm.class');

module.exports = class App extends System{

  constructor(){
    super();

    // set up express
    var app = this.modules.express();
    app.set('env', this.config.env);
    app.set('trust proxy', (app.get('env') === 'production')? 1: 0); // trust first proxy
    app.use(this.modules.responseTime());
    app.use(this.modules.expressSession({
      secret: this.config.secret,
      cookie: {
        secure: (app.get('env') === 'production') // serve secure cookies
      },
    }));
    app.use(this.modules.compression());
    app.use(this.modules.bodyParser.json({limit: this.config.requestBodyLimit}));
    app.use(this.modules.bodyParser.urlencoded({ extended: false }));

    // setup orm
    var orm = new Orm();
    app.use(function(req, res, next){orm.middleware(req, res, next)});

    // all traffic to/from db
    app.all(['/rest/*', '/concepts/*', '/entities/*', '/views/*'], function(req, res, next){
      orm.routes(req, res, next);
    });

    // serve frontend files
    app.use(this.modules.express.static(this.clientPath));
    //app.use('/image-cache', this.modules.express.static(this.imageCachePath));

    // serve js
    app.get('/get.js',(req,res)=>{
      let unsupported = (req.url.split('?unsupported=')[1] || '');
      if(unsupported.indexOf('proxy')>=0){
        res.end('document.write("UNSUPPORTED ES6/ES7 TO BE BABELIFIED: ' +unsupported + '")');
      }
      if(this.config.useCombinedJs){
        if(!unsupported){
          res.sendFile(this.modules.path.join(this.clientPath,'js','all.js'));
        }
        else {
          res.sendFile(this.modules.path.join(this.clientPath,'js','b-all.js'));
        }

      }
      else {
        res.sendFile(this.modules.path.join(this.clientPath,'js','libs','loader.js'));
      }
    });

    // All other routes
    app.get('*',(req,res)=>{
      // Serve empty component on missing js component
      let p = this.modules.path.parse(req.url);
      if(p.ext == '.js' && p.dir.indexOf('/components') == 0){
        res.end('class ' + this.filenameToClassname(p.name) + ' extends Component {}');
      }
      // Serve 404 on non-existing rest routes
      // else if(p.dir.indexOf('/rest') === 0){
      //   res.set("Cache-Control", "no-store, must-revalidate");
      //   res.status(404);
      //   res.end();
      // }
      // If no other route rule fulfilled then return index.html
      else {
        res.sendFile(this.modules.path.join(this.clientPath,'index.html'));
      }
    });

    // // serve frontend files
    // app.use(this.modules.express.static(this.clientPath));

    // // not found
    // app.all('*',function(req, res, next){
    //   res.status(404);
    //   res.end();
    // });

    app.listen(this.config.port);
    console.log("Express listening on port " + this.config.port);
  }

  filenameToClassname(s){
    s = s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
    return s[0].toUpperCase() + s.substr(1);
  }

}
