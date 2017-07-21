(function(){

  var a, u = [], f = {
    proxy:'new Proxy({},{})',
    async:'a = async function(){}',
    promise:'a = new Promise(function(){})'
  };

  for(var i in f){
    try {
      eval(f[i]);
    }
    catch(e){
      f[i] = false;
    }
    !f[i] && u.push(i);
  }

  u.length && console.log('Asking the server for Babelized code because ' +
    'of unsupported language feature' + (u.length > 1 ? 's' : ''),u);
  document.write('<script src="get.js' + (u.length ? '?unsupported=' +
    u.join(',') : '') + '"></script>');

})();