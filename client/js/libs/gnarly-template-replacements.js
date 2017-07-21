(()=>{

  let g = typeof window === 'undefined' ? global : window;
  g.___gnarly_template_replacements___ = function(tname,x){

    /* BUG introduced:
       When clicking/changing one button in http://localhost:3000/personbilar
       The entire template is re-drawn (it flickers noticably)
    */
    // Never draw template (apart from root element) before constructor has run
    if(typeof $ !== "undefined" && $(x).length !== 1){
      x = '<div>' + x + '</div>';
    }
    x = x.split('</');
    x[x.length-2] += '[endif]';
    x = x.join('</');
    x = x.replace(/>/,'>[if __templateName == "' + tname.split('/').pop().split('.')[0] + '" && ___templateConstructorHasRun___]');

    // Template include with data to add to new component properties
    x = x.replace(
      /\[template\s*([a-zA-Z0-9-_\.\$]*)\s*,\s*([^\]]*)\]/g,
      '${_template(()=>{var n="$1";if(!templates[n]){try{n=$1}catch(e){}};return [n,eval("`" + templates[n] + "`")]},$2)}'
    );

    // Template include
    x = x.replace(
      /\[template\s*([a-zA-Z0-9_\-\.\$]*)\s*\]/g,
      '${_template(()=>{var n="$1";if(!templates[n]){try{n=$1}catch(e){}};return [n,eval("`" + templates[n] + "`")]},false)}'
    );

    // Object repeat
    x = x.replace(
      /\[repeat\s{1,}([a-zA-Z0-9_\.\$]*)\s*,\s*([a-zA-Z0-9_\.\$]*)\s*,\s*([a-zA-Z0-9_\.\$]*)\s*\]/g,
      '${_repeat_obj($1,($2,$3)=>{if($2===`__papa`){return;};return `'
    );

    // Array repeat
    x = x.replace(
      /\[repeat\s{1,}([a-zA-Z0-9_\.\$]*)\s*,\s*([a-zA-Z0-9_\.\$]*)\s*\]/g,
      '${_repeat($1,($2)=>{return `'
    );
    x = x.replace(/\[endrepeat\]/g,'`})}');

    // Ifs
    x = x.replace(/\[if([^\]]*)\]/g,'${_if($1,()=>{return `');
    x = x.replace(/\[else\s*if([^\]]*)\]/g,'`})}${_else_if($1,()=>{return `');
    x = x.replace(/\[else\]/g,'`})}${_else(()=>{return `');
    x = x.replace(/\[endif\]/g,'`})}${_endif()}');

    return x;
  }

})();


