class Loader {

  constructor(){

    this.loadList = Loader.load;

    if(this.loadList){
      this.loadThings();
    }
    else {
     this.getLoadList();
     Loader.loadStart = new Date().getTime();
    }
  }

  getLoadList(){
    // Get the load-list.js script
    // that defines Loader.toLoad
    // then create another instance of Loader
    // - write this as script tags directly...
    document.write(`
      <script src="load-list.js"></script>
      <script>new Loader();</script>
    `);
  }

  loadThings(){
    // Build the html for link and script tags
    // and write directly...
    var lastFolder = '';
    Loader.templatesToLoad = [];
    var loadHtml = this.loadList.split('\n').map((file)=>{
      file = file.replace(/#/g,'');
      file = file.replace(/\s*/g,'');
      if(file.indexOf('.')<0){ lastFolder = file; return; }
      if(file.indexOf('.') < 0){ lastFolder = ''; }
      var isCss = file.substr(file.lastIndexOf('.') + 1) == 'css';
      var isEmpty = file == '';
      if(isEmpty){ return ''; }
      file = lastFolder + file;
      if(isCss){
        return '<link rel="stylesheet" href="' + file + '">';
      }
      if(file.indexOf('components/')>=0 && file.indexOf('.js')){
        file = file.split('.*')[0] + '/' + file.split('/')[1].split('.*')[0] + '.js';
        Loader.templatesToLoad.push(file.replace(/\.js/,''));
      }
      return '<script src="' + file + '"></script>';
    }).join('\n');
    loadHtml += '<script>Loader.loadEnd = new Date().getTime()</script>';
    document.write(loadHtml);
  }

}

// create an instance of Loader
new Loader();

// alias loader as gnarly
gnarly = Loader;
