var System = require('./system.class');

module.exports = class App extends System{

  constructor(){
    super();

    // set up mongoose
    global.mongoose = this.modules.mongoose;
    require('mongoosefromclass')(mongoose);

    // set up express
    var app = this.modules.express();
    global.expressApp = app;
    app.set('env', this.config.env);
    app.set('trust proxy', (app.get('env') === 'production')? 1: 0); // trust first proxy
    app.use(this.modules.responseTime());
    app.use(this.modules.compression());
    app.use(this.modules.bodyParser.json({limit: this.config.requestBodyLimit}));
    app.use(this.modules.bodyParser.urlencoded({ extended: false }));

    // load models, Mongoose,
    // store (optional) default data,
    // add Rest
    for(let name in this.models){
      let m = this.models[name];
      if(m.mongooseModel){
        this.models[name] = mongoose.fromClass(m);
      }
      if(process.argv.indexOf('--reset-default-data')>-1 && m.defaultDataFile){
        this.resetDefaultData(name, m.defaultDataFile);
      }
      if(m.restRoute){
        new this.modules.restrouter(app, this.models[name]);
      }
    }
    global.models = this.models;

    // change x-powered-by
    app.use(function (req, res, next) {
      res.header('X-Powered-By','Nodebite');
      next();
    });

    // apply session (this late because the Session class is a mongoose model, just made ready)
    app.use(this.modules.cookieParser());
    app.use(new this.modules.sessionhandler(this.models.session).middleware());

    new this.modules.loginhandler(app);

    // serve frontend files
    app.use(this.modules.express.static(this.clientPath));
    app.use('/image-cache', this.modules.express.static(this.imageCachePath));

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

    // Send e-mails
    let mail = new this.modules.mail();
    app.post('/send-mail/:template',(req,res)=>{
      mail.send(req.params.template, req, res);
    });

    // Text search
    let carAnalyzer = new this.modules.carAnalyzer(this.models.car);
    app.post('/search-car',(req,res)=>{
      carAnalyzer.searchRequest(req, res);
    });
    global.rerunCarAnalyzer = ()=>{
      carAnalyzer = new this.modules.carAnalyzer(this.models.car);
    }

    // Setup proxies
    this.modules.proxies(app, this.config.host, this.config.port);

    // Start the truck scraper
    let LbScraper = require('./lb-scraper.class');
    new LbScraper();

    // Service Phantom - will start importing dates at once, then once an hour
    let ServicePhantom = require('../phantomime/service.js');

    // Handle missing routes
    app.get('*',(req,res)=>{
      // Serve empty component on missing js component
      let p = this.modules.path.parse(req.url);
      if(p.ext == '.js' && p.dir.indexOf('/components') == 0){
        res.end('class ' + this.filenameToClassname(p.name) + ' extends Component {}');
      }
      // Serve 404 on non-existing rest routes
      else if(p.dir.indexOf('/rest') === 0){
        res.set("Cache-Control", "no-store, must-revalidate");
        res.status(404);
        res.end();
      }
      // If no other route rule fulfilled then return index.html
      else {
        res.sendFile(this.modules.path.join(this.clientPath,'index.html'));
      }
    });

    // Mongoose
    //  Stop mongoose from using an old promise library
    //  (takes away the warning "mpromise is deprecated")
    mongoose.Promise = Promise;
    // Connect to mongoDB
    mongoose.connect('mongodb://' + this.config.mongoDb.host + '/' + this.config.mongoDb.database);
    var port = this.config.port;
    mongoose.connection.on('connected', function () {
      // start express
      app.listen(port, function () {
        console.log('Express app listening on port:', port);
      });
    });
    mongoose.connection.on('error',function (err) {
      console.log('Mongoose connection error: ' + err);
    });
    mongoose.connection.on('disconnected', function () {
      console.log('Mongoose disconnected');
    });
    // node shutdown handler
    process.on('SIGINT', function() {
      mongoose.connection.close(function () {
        console.log('Mongoose connection closed');
        process.exit(0);
      });
    });

    // recurring bytbil xml import task
    if(this.config.runTasks){
      new this.modules.bytbilTask();
      //new BytbilImagesTask();
    }

    // testSearch outputs using console.log
    // carAnalyzer.testSearch("Automatväxlad vit biljävel");
  }

  filenameToClassname(s){
    s = s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
    return s[0].toUpperCase() + s.substr(1);
  }

  async resetDefaultData(name, file){
    await this.models[name].collection.drop();
    let defaultDataFile = this.modules.path.normalize(__dirname + '/' + this.config.defaultDataDir + '/' + file);
    let data = JSON.parse(await this.modules.fs.readFileAsync(defaultDataFile));
    console.log('resetDefaultData', name, data.length);
    let res = await this.models[name].insertMany(data);
  }
}
