class Component extends RestResource {

  constructor(props){
    super();
    Component.mem = Component.mem || [];
    let p = new Proxy(this,ProxyHandler);
    Component.pushToEmptyMemSlot(p);
    Object.assign(p,props);
    Component.unloader();
    Gnarly.gnarlyDebuggerUpdate && setTimeout(()=>{Gnarly.gnarlyDebuggerUpdate()},0);
    setTimeout(()=>{p.___templateConstructorHasRun___ = true;},0);
    return p;
  }

  static pushToEmptyPScopeSlot(p){
    this.pscopeMem = this.pscopeMem || [];
    let i = 0;
    while(this.pscopeMem[i]){i++;}
    this.pscopeMem[i] = p;
    return i;
  }

  static pushToEmptyMemSlot(p){
    let i = 0;
    while(this.mem[i]){i++;}
    this.mem[i] = p;
    p.__instanceId = i;
  }

  static snakeToCamel(s){
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
  }

  static unloader(){
    // Unload and destroy component instances
    // no longer in DOM
    for(let i = 0; i < this.mem.length; i++){
      let comp = this.mem[i];
      if(comp === undefined){continue;}
      if(!comp.$baseEl){continue;}
      let inDom = !!comp.$baseEl.closest(document.documentElement).length;
      if(!inDom){
        comp.unload();
        this.mem[i] = undefined;

        let compName = comp.constructor.name[0].toLowerCase() + comp.constructor.name.slice(1);

        // Remove component from the parent
        let parentComp = comp.parentComponent[compName];
        if (!parentComp) { continue; }

        // If parent[name] == this component, delete
        if (!(parentComp instanceof Array) && parentComp.__instanceId == comp.__instanceId){
          delete comp.parentComponent[compName];
          Gnarly.gnarlyDebuggerUpdate();
        }

        // If parent[name] as array has "this component", splice
        if(!(parentComp instanceof Array)) { continue; }
        let indexInParent = parentComp.findIndex((c) => {
          return c.__instanceId == comp.__instanceId;
        });
        if (indexInParent != -1) {
          parentComp.splice(indexInParent, 1);
          Gnarly.gnarlyDebuggerUpdate();
        }

      }
    }
  }

  nextTick(func){
    setTimeout(func,0);
  }

  sleep(ms){
    return new Promise(function(res,rej){
      setTimeout(()=>{res()},ms);
    });
  }

  updateView(){

    if(!this.$baseEl){ return; }

    // Pscopes transfered early...
    let pScopeObj = this.$baseEl.attr('p-scope-obj');
    if(pScopeObj){
      this.$baseEl.removeAttr('p-scope-obj');
      let obj = Component.pscopeMem[pScopeObj/1];
      Component.pscopeMem[pScopeObj/1] = undefined;
      Object.assign(this,obj);
    }

    // No need to DOM diff etc if not loaded
    if(!this.__loaded){return;}

    let templateName = this.$baseEl.attr('template-name');
    let vdom = $('<div/>');
    vdom.template(templateName,this,true);

    if(this.$baseEl.find('main').length){
      vdom.find('main').append($('main').clone().children());
      // could this be done with filterOuterDom?
    }

    let vv = vdom.children().first();
    let bb = this.$baseEl;

    if(bb.html() == vv.html()){
      return;
    }

    vdom = vdom.children().get(0);
    let el = this.$baseEl.get(0);

    let vve = Array.from(vv.find('*')).sort((a,b)=>{return $(a).parents().length > $(b).parents().length ? 1 : -1});
    let bbe = Array.from(bb.find('*')).sort((a,b)=>{return $(a).parents().length > $(b).parents().length ? 1 : -1});
    for(let i = 0; i < Math.min(vve.length,bbe.length); i++){
      if(bbe[i] && vve[i] && bbe[i].tagName == vve[i].tagName && $(bbe[i]).attr('template-name') == $(vve[i]).attr('template-name')){
        if($(bbe[i]).attr('instance-id')){
          let cl = $(bbe[i]).clone();
          let rep =  $(vve[i]);
          if(rep.attr('p-scope-obj')){
            cl.attr('p-scope-obj',rep.attr('p-scope-obj'));
          }
          rep.replaceWith(cl);

        }
      }
    }

    let dd = new diffDOM({
      valueDiffing: !this.changeFromInput,
      filterOuterDiff: function(t1, t2, diffs) {
        if (t1.attributes && typeof t1.attributes["ignore-dom-changes"] == 'string' && t2.nodeName == t1.nodeName) {
          // will not diff childNodes
          t1.innerDone = true;
        }
      }
    });

    new Timer('dom diff '  + templateName);
    let diff = dd.diff(el,vdom);
    new Timer('dom diff ' + templateName,true);

    // do not remove the instance-id
    for(let i = diff.length - 1; i >= 0; i--){
      if(diff[i].na == 'instance-id'){
        diff.splice(i,1);
      }
    }

    new Timer('dom diff apply '  + templateName + ':' + this.__instanceId);
    dd.apply(el,diff);
    new Timer('dom diff apply '  + templateName + ':' + this.__instanceId,true);
    this.changeFromInput = false;

    this.$baseEl.find('[instance-id]').each(function(){
      // Reupdate existing child components
      let id = $(this).attr('instance-id')/1;
      // Dennis: Added !!Component.mem[id] since
      // it is undefined in http://localhost:3000/leasa/bil
      // To reproduce: toggle back n fourth between the 'Style' and 'SE' buttons.
      // To-do: fix so that this doesn't happen :D
      !!Component.mem[id] && Component.mem[id].updateView();
    });

    let that = this;
    this.$baseEl.find('[template-name]').each(function(){
      // create new instances if needed
      let me = $(this);
      let tname = me.attr('template-name');
      let id = me.attr('instance-id')/1;
      if(!isNaN(id)){return;}
      let iName = Component.snakeToCamel(tname);
      let cName = iName[0].toUpperCase() + iName.substr(1);
      let c = eval(cName);
      let url = location.href;
      url = url.substring(url.indexOf('//')+2);
      url = url.substring(url.indexOf('/'));
      let props = {url:url,params:Gnarly.params,$baseEl:me,parentComponent:that};
      let instance = new c(props);
      setTimeout(()=>{instance.__load();},1);
      setTimeout(()=>{instance.onViewUpdate();},10);
      me.attr('instance-id',instance.__instanceId);
      if(!that[iName]){that[iName] = instance}
      else {
        if(!(that[iName] instanceof Array)){
          that[iName] = [that[iName]];
        }
        that[iName].push(instance);
      }
      Gnarly.gnarlyDebuggerUpdate();
    });

    if(this.onViewUpdate){this.onViewUpdate();}
    // if(window.daFooter){
    //   window.daFooter.sticky();
    // }
    Component.unloader();
  }

  __load(){
    if(!this.__loaded){setTimeout(()=>{this.load();},10) }
    this.__loaded = true;
  }

  // pretty error formatter
  niceError(err){
    return err.status + ' ' + err.statusText, err.responseJSON;
  }

  // Feel free to overwrite these in your own class

  // Called after view load
  load(){
    // console.log('I am ' + this.constructor.name + ' loading!',this);
  }

  // Called after view unload
  unload(){
    // console.log('I am ' + this.constructor.name + ' unloading!');
  }

  // Called on view updates and initial loads
  onViewUpdate(){
    // console.log('I am ' + this.constructor.name + ' view updating!');
  }

}
