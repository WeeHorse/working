class GenericEventHandler {

  constructor(){
    // singleton - only instantiate once
    if(GenericEventHandler.once){
      throw(new Error("GenericEventHandler is a singleton"));
    }
    GenericEventHandler.once = true;

    this.addEventHandler();
  }

  addEventHandler(){
    $(document).on(
      //mousemove
      'click mouseenter mouseleave ' +
      'keydown keyup keypress submit change focusin focusout',
      '*',
      function(e){
        let el = $(this);
        let type = e.type;
        let methodToRun = el.attr('data-' + type);
        let reactOnDataBind = el.attr('data-bind') &&
          ['change','click','keyup'].indexOf(type)>=0;
        if(methodToRun || reactOnDataBind){
          let baseEl = el.closest('[instance-id]');
          if(baseEl.length !== 0){
            let instanceId = baseEl.attr('instance-id');

            let obj = Component.mem[instanceId];
            if(methodToRun && obj[methodToRun] && typeof obj[methodToRun] == 'function'){
              obj[methodToRun]($(e.target), e);
            }
            else {
              // react on data bind
              let propName = el.attr('data-bind');
              let val = el.val();
              if(val !== obj[propName]){
                obj[propName] = val;
                obj.changeFromInput = true;
              }
            }
          }
        }

      }
    );

  }

}