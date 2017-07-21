(()=>{
  new Timer('load template html');
  $.loadTemplates(Loader.templatesToLoad,function(){
    new Timer('load template html',true);
    $(()=>{
      new GenericEventHandler();
      $('body').template('app');
      setTimeout(()=>{new Router()},0);
    });
  });
})();