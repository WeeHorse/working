class Gnarly {

  constructor(){
    console.log('gnarly.debug() shows loaded components etc.');
    console.log('gnarly.timer() shows load and rendering time.')
    Gnarly.gnarlyDebuggerUpdate = ()=>{this.update();}
    Gnarly._debugMarkComponent = (x)=>{
      if(Component.mem[x] && Component.mem[x].$baseEl){
        Component.mem[x].$baseEl.css({opacity:.5});
      }
    }
    Gnarly._debugUnmarkComponent = (x)=>{
      if(Component.mem[x] && Component.mem[x].$baseEl){
        Component.mem[x].$baseEl.css({opacity:''});
      }
    }
  }

  timer(){
    Timer.log();
  }

  debug(){
    this.debugWin = window.open('about:blank', '_blank', 'toolbar=0,location=0,menubar=0,height=700,width=500');
    this.debugWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Gnarly Debug</title>
        <script>
          setInterval(()=>{
            window.opener.Gnarly.gnarlyDebugWin = window;
          },100);
          function mark(x){
            window.opener.Gnarly._debugMarkComponent(x);
          }
          function unmark(x){
            window.opener.Gnarly._debugUnmarkComponent(x);
          }
        </script>
        </head><body><pre></pre></body>
      </html>
    `);
    this.update();
  }

  log(...x){
    return x.join(' ') + '<br>';
  }

  update(){
    this.debugWin = Gnarly.gnarlyDebugWin || this.debugWin;
    try {
      let html = '';
      for(let i of Component.mem){
        if(!i){continue;}
        if(html){html += '<br>';}

        html += '<div style="cursor:pointer" onmouseover="mark('+i.__instanceId+')" ' +
          'onmouseout="unmark('+i.__instanceId+')">' +
          this.log(i.__instanceId,i.constructor.name);
        for(let j in i){
          if(i[j] instanceof Component){
            html += this.log('&nbsp;&nbsp;',j,':',i[j].constructor.name);
          }
          if(i[j] instanceof Array && i[j][0] instanceof Component){
            html += this.log('&nbsp;&nbsp;',j,
              ': [',i[j][0].constructor.name,'x',i[j].length,']');
          }
        }
        html += '</div>';
      }
      $(this.debugWin.document.body).find('pre').html(html);
    }
    catch(e){}
  }

}
window.Gnarly = Gnarly;
window.gnarly = new Gnarly();