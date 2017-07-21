// Ironboy, 2017

// load and use templates written as ES6 template literals,
// provide simple repeat and if functionality
// as well of includes of templates in templates

// see https://developer.mozilla.org/sv-SE/docs/
// Web/JavaScript/Reference/Template_literals
// for a basic explanation of template literals

// USAGE

// Load all templates
// $.loadTemplates(fileNames[Array], callback);

// Apply a template
// $('.selector').template(templateName[String],object);

// Repeats inside templates (for arrays)
// [repeat varName,iteratorVarName] ... html ... [endrepeat]

// Repeats inside templates (for object)
// [repeat varName,keyProp,valProp] ... html ... [endrepeat]

// Ifs inside templates
// [if condition]
//    ... html ...
// [else if condition]
//    ...html...
// [else]
//   ...html...
// [endif]

// Include a template in a template
// [template templateName]

// Include a template in a template, give it a new scope
// [template templateName, scopeObject]

// Note: repeat, if and template directives
// are converted into pure  template literal syntax
// using a few basic regular expressions


// apply a template (as a jQuery module)
(function ($) {

  function createMissingVarRegExp(){
    let aVarName = '_unlikely' + (Math.random() + '').split('.')[1];
    let err;
    try {
      eval(aVarName);
    }
    catch(e){
      err = e + ' ';
    }
    return new RegExp(err.split(aVarName).join('(.*?)'),'g');
  }
  let missingVarRegExp = createMissingVarRegExp();

  function createMissingFuncRegExp(){
    let something = 1;
    let err;
    try {
      eval('something()');
    }
    catch(e){
      err = e + ' ';
    }
    return new RegExp(err.split('something').join('(.*?)'),'g');
  }
  let missingFuncRegExp = createMissingFuncRegExp();

  var templates = {};

  var replacements = window.___gnarly_template_replacements___;
  delete window.___gnarly_template_replacements___;

  $.loadTemplates = (
    fileNames,
    callback,
    folderPath = "",
    extension = "html"
  ) => {
    var co = 0;
    if(fileNames.constructor === Array){
      fileNames.forEach((tname)=>{
        $.get(folderPath + '/' + tname + '.' + extension,(data)=>{
          co++;
          templates[tname.split('/').pop()] = replacements(tname,data);
          if(co == fileNames.length){
            callback();
          }
        });
      });
    }
    else if(fileNames.constructor === Object){
      // load from bundle
      for(let i in fileNames){
        templates[i] = fileNames[i];
      }
      callback();
    }
  };

  var ifscopes = [];

  function _repeat(arr,func){
    if (!(arr instanceof Array)){return '';}
    return arr.map(func).join('');
  }

  function _repeat_obj(obj,func){
    if (!(obj instanceof Object)){return '';}
    var arr = [];
    for(var key in obj){
      arr.push(func(key,obj[key]));
    }
    return arr.join('');
  }

  function _if(condition,func){
    ifscopes.push(condition);
    return condition ? func() : '';
  }

  function _else_if(condition,func){
    if(ifscopes[ifscopes.length-1]){ return ''; }
    ifscopes[ifscopes.length-1] = condition;
    return condition ? func() : '';
  }

  function _else(func){
    if(ifscopes[ifscopes.length-1]){ return ''; }
    return func();
  }

  function _endif(){
    ifscopes.pop();
    return '';
  }

  function rootWrapper(html,templateName){
    // make sure we have ONE root element
    // if not wrap
    var $el = $(html);
    if($el.length > 1){
      let $newEl = $('<div/>');
      $newEl.append($el);
      $el = $newEl;
    }
    $el.attr('template-name',templateName);
    return $el;
  }

  function snakeToCamel(s){
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
  }

  function componentInstantiate(root){
    root.find('[template-name]').reverse().each(function(){
      let me = $(this);
      let tName = me.attr('template-name');
      let iName = snakeToCamel(tName);
      let cName = iName[0].toUpperCase() + iName.substr(1);
      let _class = '';
      try {_class = eval(cName);}
      catch(e){}
      if(_class){
        let url = location.href;
        url = url.substring(url.indexOf('//')+2);
        url = url.substring(url.indexOf('/'));

        let props = {url:url,params:Gnarly.params};
        // get instances inside and add to props
        me.find('[instance-id]').each(function(){
          let me = $(this);
          let id = $(this).attr('instance-id')/1;
          let tName = me.attr('template-name');
          let iname = snakeToCamel(tName);
          let instance = Component.mem[id];
          if(props[iname]){
            // create an array if several components
            // of same class
            props[iname] = [props[iname]];
            props[iname].push(instance);
          }
          else {
            // otherwise create an object
            props[iname] = instance;
          }
        });
        // create instance
        props.$baseEl = me;
        let instance = new _class(props);
        me.attr('instance-id',instance.__instanceId);
        // This short delay give a major speed bump
        // since things fall in place with fewer diffs
        // in vidw update because of it
        setTimeout(()=>{instance.__load(); instance.onViewUpdate();},10);
      }
    });
    // finding the parent components
    root.find('[template-name]').reverse().each(function(){
      // Finding parentComponent can only be done after
      // instantiation...
      // But we can wait to trigger load until afterwards
      let me = $(this);
      let id = me.attr('instance-id')/1;
      let instance = Component.mem[id];
      if(!instance){return;}
      // find parent component and add to props
      let dad = me.parent().closest('[instance-id]');
      if(dad.length){
        let id = dad.attr('instance-id')/1;
        instance.parentComponent  = Component.mem[id];
      }
      // This short delay give a major speed bump
      // since things fall in place with fewer diffs
      // in view update because of it
      // will this be to early for props?
      setTimeout(()=>{instance.__load();instance.onViewUpdate();},10);
    });
  }

  function _template(html,parentScopeObj){
    let h = html();
    let templateName = h[0];
    h = h[1];
    let $outerEl = $('<div/>');
    $outerEl.append(rootWrapper(h,templateName));
    parentScopeObj && $outerEl.children().attr(
      'p-scope-obj',Component.pushToEmptyPScopeSlot(parentScopeObj)
    );
    return $outerEl.html();
  }

  $.fn.template = function(__templateName,__t,__noInstantiate) {
    new Timer('template ' + __templateName);
    // evaluating a template as a template literal
    // var scope = t;
    __t = __t || {};
    for(var i in __t){
      eval("var " + i + '=__t[i]');
    }
    var tliteral;
    let error = true;
    // if a var is not defined then define it
    let errors = [];
    while(error){
      if(errors.length > 1000){
        throw("Something wrong!",errors);
        break;
      }
      try {
        eval('tliteral = `' + templates[__templateName] + '`');
        error = false;
      }
      catch(e){
        let a = Math.random(), er = e + ' ';
        let varName = (missingVarRegExp.exec(er) || [])[1];
        errors.push(e);
        while(missingVarRegExp.exec(er) != null){}
        if(varName){
          eval('var ' + varName + '= __t[varName] === undefined ? "" : __t[varName]');
          eval('if (typeof ' + varName + ' == "function"){(()=>{let org='+varName+';'+varName+'=()=>{return org.apply(__t,arguments)}})()}');
        }
        else {
          let funcName = (missingFuncRegExp.exec(er) || [])[1];
          while(missingFuncRegExp.exec(er) != null){}
          if(funcName){
            eval('var ' + funcName + '= typeof __t[varName] == "function" ? __t[varName] : ()=>{return ""};');
            eval('if (typeof ' + funcName + ' == "function"){(()=>{let org='+funcName+';'+funcName+'=()=>{return org.apply(__t,arguments)}})()}');
          }
        }
      }
    }

    let $el = rootWrapper(tliteral,__templateName);
    $(this).append($el);

    if(!__noInstantiate){ componentInstantiate(this); }
    new Timer('template ' + __templateName,true);
    return this;
  };

}(jQuery));
