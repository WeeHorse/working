class App extends Component {

  static get title(){ return 'Mercedes Malmö'; }
  static get subtitleDivider(){ return ': '; }

  constructor(props){
    super(props);
    $('body').addClass(navigator.platform.toLowerCase() + '-platform');
    flatpickr.localize(flatpickr.l10ns.sv);
    this.loadGoogleAnalytics();
  }

  loadGoogleAnalytics(){
    (function(i,s,o,g,r,a,m){
      i['GoogleAnalyticsObject']=r;
      i[r]=i[r] || function(){
        (i[r].q=i[r].q||[]).push(arguments)
      }, i[r].l=1*new Date();
      a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];
      a.async=1;
      a.src=g;
      m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-102825311-1', 'auto');
    ga('send', 'pageview');
  }

}
