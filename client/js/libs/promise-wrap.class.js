// wraps a promise so that it never rejects
// returns a new promise that will resolve to 
// an array with two items
// [err or null,data]
// this gives us the advantage of being able to write
// 
// somewhere 
// let a = new PromiseWrap(anotherPromise);
//
// later
// let [err, data] = await a;
// if(err){ return; }

class PromiseWrap {
  
  constructor(promise,timerFunc){
    return new Promise((res,rej)=>{
      promise.then(
        (data)=>{ 
          typeof timerFunc == 'function' && timerFunc();
          res([null,data]);
        },
        (err)=>{
          typeof timerFunc == 'function' && timerFunc();
          res([err,null]);
        }
      );
    });
  }

}