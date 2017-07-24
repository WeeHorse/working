var proxy = require('./proxy');

module.exports = function(app, host, port){

  var hostUrl = '//' + host + (port? ':' + port : '') + '/';

  // http://localhost:3000/mbverkstad/kvw_mb/(S(oat0jck5bavd4rjjvxcjsfg4))/Workflow/VehicleSearch.aspx?parent=32b848f4-e8e9-478e-9cec-409d1f12cda8&child=c64b6f7d-d67b-43c9-a687-fa99dee1c980
  // http://localhost:3000/mbverkstad/kvw_mb/(S(0jzrgs3sxwnxlv5ziy2zto4c))/Workflow/VehicleSearch.aspx?parent=32b848f4-e8e9-478e-9cec-409d1f12cda8&child=c64b6f7d-d67b-43c9-a687-fa99dee1c980
  // http://mbverkstad.fordonsdata.se/kvw_mb/(S(4axg1xqq4kregtuez3hdecuw))/Workflow/VehicleSearch.aspx?parent=32b848f4-e8e9-478e-9cec-409d1f12cda8&amp;child=c64b6f7d-d67b-43c9-a687-fa99dee1c980
  // http://mbverkstad.fordonsdata.se/kvw_mb//Workflow/VehicleSearch.aspx?parent=32b848f4-e8e9-478e-9cec-409d1f12cda8&child=c64b6f7d-d67b-43c9-a687-fa99dee1c980
  // http://localhost:3000/mbverkstad/kvw_mb//Workflow/VehicleSearch.aspx?parent=32b848f4-e8e9-478e-9cec-409d1f12cda8&child=c64b6f7d-d67b-43c9-a687-fa99dee1c980

  proxy(app,'/mbverkstad', 'mbverkstad.fordonsdata.se', hostUrl + 'mbverkstad/kvw_mb//Workflow/',
    ($)=>{
      //$('head').remove('base');
      //$('head').prepend('<base href="' + hostUrl + 'mbverkstad/kvw_mb//Workflow/">');
      //let src = $('*').attr('src');
      //$('body').css({'background-color':'fuchsia', 'color':'teal'});
      // $('script').each(function(){
      //   console.log('script', $(this).text());
      //   if($(this).text().indexOf('checkURL')>-1){
      //     // window.scripts = $(this).text();
      //     $(this).remove();
      //   }
      // });

      $('head').append('<link rel="stylesheet" href="/css/mbverkstad.css"/>');
      $('#pnlHeader').remove();
      $('#breadCrumb').remove();
      //$('body').append('<script>$(function(){console.log($("*"));})</script>');
  });

  proxy(app,'/proxies/campaigns/personbil', 'www.kampanj.mercedes-benz.se', hostUrl + 'proxies/campaigns/personbil/',
    ($)=>{
      var sections = $(`section:not(
        #module_hero_widget-48,
        #module_text_widget-4,
        #module_driving_form-11,
        #module_divider_widget-14)`);
      // sections.css({clear:'both',display:'block',width:'100%'})
      $('body').html(sections);
      $('head').append('<link rel="stylesheet" href="/css/campaigns.css"/>');
      $('body').css({width:'100%'});
      $('section.blk-single-half-hero').css({padding:'0 10px 50px'});
      $('div.rich-content a.cta').css({'margin-top':'16px'});
      $('script').remove();
      //$('body').append('<script>$(function(){console.log($("*"));})</script>');
  });

  proxy(app,'/proxies/campaigns/transportbil', 'transportbilar.mercedes-benz.se', hostUrl + 'proxies/campaigns/transportbil/',
    ($)=>{
      $('body').html($('.main'));
      $('head').append('<link rel="stylesheet" href="/proxies/campaigns/transportbil/custom/themes/campaignplatform/style.css"/>');
      $('body').css({width:'100%'});
      $('.modal, script').remove();

      $('img.lazyload').each(function(){
        $(this).attr('src', $(this).attr('data-src'));
      });
  });

  proxy(app,'/proxies/campaigns/lastbil', 'startklar.kampanj.mercedes-benz.se', hostUrl + 'proxies/campaigns/lastbil/',
    ($)=>{
      $('body').html($('.main'));
      $('head').append('<link rel="stylesheet" href="/css/campaigns.css"/>');
      $('body').css({width:'100%'});
      $('.blk-form, ul.indicator, .slide-control, script').remove();
  });

  proxy(app,'/proxies/pa/one', 'configurator.mercedes-benz-accessories.com', hostUrl + 'proxies/pa/one/',
    ($)=>{
      // var sections = $('section:not(#module_hero_widget-48,#module_text_widget-4,#module_driving_form-11,#module_divider_widget-14)');
      // sections.css({clear:'both',display:'block',width:'100%'})
      // $('body').html(sections);
      $('.header').remove();
      $('head').append('<link rel="stylesheet" href="/css/pa.css"/>');
      $('body').css({width:'100%'});
      //$('body').append('<script>$(function(){console.log($("*"));})</script>');
  });

}
