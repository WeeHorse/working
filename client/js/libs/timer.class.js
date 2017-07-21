class Timer {

  constructor(eventName, end = false, timestamp = false){
    Timer.events = Timer.events || {};
    Timer.logRaw = Timer.logRaw || [];
    timestamp = timestamp || new Date().getTime();
    Timer.events[eventName] = timestamp -  (Timer.events[eventName] || 0);
    if(end){
      Timer.logRaw.push(eventName,Timer.events[eventName],'\n');
      Timer.events[eventName] = null;
    }
  }

  static log(){
    let sum = 0;
    for(let i of Timer.logRaw){
      if(!isNaN(i/1)){sum += i/1;}
    }
    console.log.apply(
      console,
      [' TIMER','\n'].concat(Timer.logRaw).concat(["SUM",sum])
    );
    Timer.clear();
  }

  static clear(){
    Timer.events = {};
    Timer.logRaw = [];
  }


}

new Timer('load scripts and css',false,Loader.loadStart);
new Timer('load scripts and css',true,Loader.loadEnd);