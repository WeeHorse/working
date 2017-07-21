(()=>{
  return; // Turn off for now
  function unproxy(obj){
    let a = [], mem = [];
    JSON.stringify(obj,(key,val)=>{
      if(mem.indexOf(val) >=0){return;}
      if(val && typeof val == 'object'){
        mem.push(val);
        if(val.__proxyTarget){
          if(a.length === 3){a.push('\n[ --- component children ---')}
          //a.push('\n',key+' ',val.__proxyTarget);
        }
      }
      return val;
    });
    if(a.length > 1){
      a.push('\n --------------------------]')
    }
    return a;
  }

  let c = console.log, log;
  eval ('log = (args)=>{return c.apply(console,args);}');
  console.log = (...args)=> {
    let line;
    try {throw(new Error());}
    catch(e){
      let s = e.stack + ' ';
      s = s.split('at ').join('@').split('@');
      let atBeforeFirst = s[0].indexOf('http') < 0;
      s = s[atBeforeFirst ? 2 : 1];
      s = s.split('\n')[0].split('(').join('').split(')').join('');
      s = s.substr(s.indexOf('http')) + ' ';
      line = s;
    }
    let args2 = [];
    args.forEach((arg)=>{
      if(arg && arg.__proxyTarget){
        args2.push(arg.__proxyTarget);
        //args2 = args2.concat(unproxy(arg));
        return;
      }
      args2.push(arg);
    });
    args2.push('\n'+line);
    log(args2);
  }


})();