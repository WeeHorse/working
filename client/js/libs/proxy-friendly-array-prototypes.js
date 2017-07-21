(()=>{

  for(let i of Object.getOwnPropertyNames(Array.prototype)){
    if(typeof Array.prototype[i] != 'function' || i == 'constructor'){
      continue;
    }
    (()=>{
      let org = Array.prototype[i];
      Array.prototype[i] = function(...args){
        let arr = this;
        while(arr && arr.__nonproxied__){
          arr = arr.__nonproxied__;
        }
        for(let i = 0; i < args.length; i++){
          while(args[i] && args[i].__nonproxied__){
            args[i] = args[i].__nonproxied__;
          }
        }
        return org.apply(arr,args);
      }
    })();
  }

})();