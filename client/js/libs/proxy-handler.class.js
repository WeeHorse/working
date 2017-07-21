class ProxyHandler {

  static update(){

    Gnarly.__redrawWithDelay && $('main, footer').css({opacity:0});

    // needed?
    this.toUpdate.reverse();

    while(this.toUpdate.length){
      let c = this.toUpdate.shift();
      c.updateView();
    }
    Gnarly.__redrawWithDelay && $('main, footer').css({opacity:1});
    Gnarly.__redrawWithDelay = false;

  }

  static get(target, property, reciever) {
    if(property == '__nonproxied__'){
      return target;
    }
    if(target instanceof Component){
      this.currentComp = target;
    }
    let r = Reflect.get(target,property,reciever);
    if(typeof r == 'object'){
      if(r.constructor !== Object && r.constructor !== Array && (r.constructor + '').indexOf('native code')>=0){
        return r;
      }
      return new Proxy(r,ProxyHandler);
    }
    return r;
  }

  static set(target, propertyKey, value, reciever){
    if(Reflect.get(target,propertyKey,reciever) === value){
      // small optimization - doesn't do that much
      // but the thought is we do not need to handle
      // setting something to the same value as it had before
      return true;
    }
    if(target instanceof Component){
      this.currentComp = target;
    }
    this.toUpdate = this.toUpdate || [];
    this.currentComp && this.toUpdate.indexOf(this.currentComp)<0 && this.toUpdate.push(this.currentComp);
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(()=>{this.update()},0);
    return Reflect.set(target, propertyKey, value, reciever);
  }

  // should we implement deleteProperty
  // maybe (then in a similar way as set)

}