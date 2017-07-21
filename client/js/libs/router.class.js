class Router {

  constructor(routes){

    var self = this;

    this.routes = this.convertToFuncRoutes(Loader.templatesToLoad);

    // when clicking a link run the click handler
    $(document).on('click','a',function(e){
      var aTag = $(this);
      self.clickHandler(aTag,e);
    });

    // when using back/forward buttons call actOnRoute
    window.onpopstate = function(){
      self.actOnRoute(location.pathname);
    }

    // on initial load
    // (small timeout gives faster rendering)
    setTimeout(()=>{self.actOnRoute(location.pathname);},10);

  }

  convertToFuncRoutes(templatePaths){
    if(!(templatePaths instanceof Array)){
      templatePaths = Object.keys(templatePaths);
    }
    let routesFromComps = [];
    templatePaths.map((x)=>{
      return {snake:x,camel:this.snakeToCamel(x.split('/').pop())};
    }).map((x)=>{
      return {
        snake:x.snake,
        camel:x.camel[0].toUpperCase() + x.camel.substr(1)
      };
    }).forEach((x)=>{
      try {
        let templateName = x.snake.split('/').pop();
        let obj = {};
        let _class = eval(x.camel);
        if(!_class.route){throw('no');}
        let routes = _class.route;
        if(!(routes instanceof Array)){routes = [routes];}
        for(let route of routes){
          let routeNo = routes.indexOf(route);
          let subtitle = _class.subtitle;
          if(subtitle instanceof Array){
            subtitle = subtitle[routeNo];
          }
          obj[route] = (params) => {
            let t = App.title || '';
            let st = subtitle || '';
            if(st){t += (App.subtitleDivider || ' ') + st;}
            if(t){document.title = t;}

            Gnarly.params = params;
            $(()=>{
              Gnarly.__redrawWithDelay = true;
              window.scrollTo(0,0);

              $('main').html('').template(templateName);
            });
          };
          routesFromComps.push(obj);
        }
      }
      catch(e){}
      return false;
    });

    routesFromComps = routesFromComps.filter((x)=>{ return x; });
    let routes = {};
    for(let r of routesFromComps){
      Object.assign(routes,r);
    }
    return routes;
  }

  snakeToCamel(s){
    return s.replace(/(\-\w)/g, function(m){return m[1].toUpperCase();});
  }

  clickHandler(aTag,eventObj){

    var href = aTag.attr('href');
    if(!href){return;}


    var handleThisRoute = this.actOnRoute(href);

    if(!handleThisRoute){
      // All external links should have target="_blank"
      // We want to track them as well.
      if (aTag.attr('target')){
        ga('send', 'event', 'Outbound Link', 'click', href);
      }
      return;
    }

    Router.pushState(href);

    // prevent the browser default behaviour
    // (the reload of the page)
    eventObj.preventDefault();

    // Send a pageview to google analytics
    ga('set', 'page', href);
    ga('send', 'pageview');
  }

  actOnRoute(href){
    var func, params, routeWithParams;

    // check if the href is among
    // the routes this router should handle
    for(var route in this.routes){
      // complete match
      if(route == href){
        func = this.routes[route];
        break;
      }
      // handle params
      if(route.indexOf(':') >= 0 || route.indexOf('*') >= 0){
        // match up until first param
        var routeWithoutParams =
          route.substring(0,route.indexOf(':'));
        var hrefWithoutParams =
          href.substring(0,route.indexOf(':'));
        if(routeWithoutParams == hrefWithoutParams){
          params = {};
          // calculate params and check that the route
          // really matches
          var hrefParts = href.split('/');
          var routeParts = route.split('/');
          var allNonParamsPartsMatch = true;
          // check arrays against each other
          for(var i = 0; i < routeParts.length; i++){
            if(routeParts[i][0] == ':'){
              // is a param
              params[routeParts[i].substr(1)] = hrefParts[i];
            }
            else if (routeParts[i] == '*'){
              // is wildcard at end
              params['*'] = hrefParts.slice(i).join('/');
              break;
            }
            else {
              // is not a param
              if(routeParts[i] != hrefParts[i]){
                allNonParamsPartsMatch = false;
              }
            }
          }
          if(allNonParamsPartsMatch){
            // it did match!!!
            func = this.routes[route];
            break;
          }
        }
      }
    }

    // we should not handle this route
    if(!func){ return false; }

    // handle a route without params
    if(!params){
      func({});
    }
    else {
      func(params);
    }

    return true;
  }

  static pushState(href, sendPageView=true){
    // use pushState (change url + add to history)
    // (the two first arguments are meaningless but required)
    history.pushState(null,'',href);

    if(sendPageView){
      ga('set', 'page', href);
      ga('send', 'pageview');
    }
  }
}
