var proxy = require('express-http-proxy');
var cheerio = require('cheerio');

var debug = false; // methods below the module

module.exports = function(app, baseUrl, externalSite, baseHref = '/', htmlChangeFunc){

  // let host; //, updir = '';

  app.use(function (req, res, next) {
    // host = "//" + req.headers.host;
    next();
  })

  // if(baseUrl.indexOf('..')===baseUrl.length-2){
  //   baseUrl = baseUrl.split('..')[0];
  //   updir = '../';
  // }

  for(let i of [baseUrl,baseUrl+'/*']){
    app.use(i, proxy(externalSite, {
      //changeOrigin: true,
      //limit: '5mb',
      reqBodyEncoding: null,
      userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {

        debug && debugProxyRes(proxyRes);
        debug && debugUserRes(userRes);

        if(proxyRes.statusCode == 302){
          let redir = baseUrl + proxyRes.headers.location;
          console.log('Gentlemen, we have a 302 redirect to', proxyRes.headers.location, 'setting user redirect to', redir);
          userRes.location(redir);
          redir = redir.split('/');
          redir.pop();
          baseHref = redir.join('/');
          // alternatively: (but then it complains about headers already being sent)
          // userRes.redirect(baseUrl + proxyRes.headers.location);
        }

        let d = proxyResData.toString('utf8');

        if(!d){
          // You are binary data
          return proxyResData;
        }

        // A html file should have </html> close  to the end
        let pos = d.indexOf('</html>');
        let isHTML = d.length - pos < 100;
        if(!isHTML){
          return proxyResData;
        }

        let $ = cheerio.load(d);
        $('a').each(function(){
          $(this).attr('target', '_blank');
        });
        $('link, script, img, form').each(function(){
          let attrName = 'href';
          if($(this).get(0).tagName.toLowerCase() == 'script' || $(this).get(0).tagName.toLowerCase() == 'img'){
            attrName = 'src';
          }
          if($(this).get(0).tagName.toLowerCase() == 'form'){
            attrName = 'action';
          }
          let href = $(this).attr(attrName);
          if(!href){return;}
          if(href.indexOf('/'+externalSite+'/')>=0){
            href = href.split('/'+externalSite+'/')[1];
          }
          if(href.indexOf('http') === 0){return;}
          //href = host + baseUrl + href;
          if(href.indexOf('/') === 0 && href.indexOf('//') !== 0){
            href = href.substr(1);
          }
          $(this).attr(attrName,href);
        });
        $('head').remove('base');
        baseHref = (baseHref + '/').replace(/[\/]{2,}$/,'/');
        $('head').prepend('<base href="' + baseHref + '"/>');
        htmlChangeFunc($);
        return $.html();
      },
      proxyReqPathResolver: function(req) {
        return req.originalUrl.substr(req.originalUrl.indexOf(baseUrl) + baseUrl.length);
      }
    }));
  }
}







// debug methods:

var debugUserRes = function(userRes){
  for(var h in userRes){
    if(typeof userRes[h] == 'object'){
      for(var g in userRes[h]){
        if(typeof userRes[h][g] != 'object'){
          console.log('userRes.' + h + '.' + g + ' : ' + userRes[h][g]);
        }
      }
    }else if(typeof userRes[h] != 'function'){
      console.log('userRes.' + h + ' : ' + userRes[h]);
    }else{
      console.log('userRes.' + h + ' (function)');
    }
    if(['number','string','boolean', 'object'].indexOf(typeof userRes[h])>-1){
      console.log('userRes.' + h, ' (' + typeof userRes[h] + ')', userRes[h]);
    }else{
      console.log('userRes.' + h, ' (' + typeof userRes[h] + ')');
    }
  }
};

var  debugProxyRes = function(proxyRes){

  // userRes.req.url : /kvw_mb//Workflow/VehicleSearch.aspx?parent=32b848f4-e8e9-478e-9cec-409d1f12cda8&child=c64b6f7d-d67b-43c9-a687-fa99dee1c980
  // userRes.req.method : GET

  //console.log('response headers', proxyRes.headers);
  // proxyRes.headers.location = baseUrl + proxyRes.headers.location;
  //userRes.req.url = baseUrl + proxyRes.headers.location;
  // console.log('userRes.location', userRes.location);
  // console.log('userRes.redirect', userRes.redirect);
  //userRes.location(userRes.req.url);

  for(var h in proxyRes){
    if(['number','string','boolean', 'object'].indexOf(typeof proxyRes[h])>-1){
      console.log('proxyRes.' + h, ' (' + typeof proxyRes[h] + ')', proxyRes[h]);
    }else{
      console.log('proxyRes.' + h, ' (' + typeof proxyRes[h] + ')');
    }
  }
  let response = proxyRes.connection;
  for(var i in response){
    console.log('response.' + i, ' (' + typeof response[i] + ')');
    if(i == 'statusCode'){
      console.log(' ## here be statusCode', i);
    }
    for(var j in response[i]){
      console.log('response.' + i + '.' + j, ' (' + typeof response[i][j] + ')');
      if(i == 'statusCode' || j == 'statusCode'){
        console.log(' ## here be statusCode', i + '.' + j, response[i][j]);
      }
      if(i == '_httpMessage' && ['getHeaders'].indexOf(j)>-1){
        for(var k in response[i][j]){
          console.log('  ->  ',k, ':', response[i][j][k]);
        }
      }
      if(i == '_httpMessage' && ['getHeader'].indexOf(j)>-1){
        // pragma,cache-control,upgrade-insecure-requests,user-agent,accept,accept-encoding,accept-language,cookie,connection,content-length,host
        console.log(' ## connection: ' + response[i][j]('connection'));
      }
      if(i == '_httpMessage' && ['_header', 'getHeaderNames', 'statusCode'].indexOf(j)>-1){
        if(typeof response[i][j] == 'function'){
          console.log('  : ' + response[i][j]());
        }else{
          console.log('  : ' + response[i][j]);
        }
      }
    }
  }
};
