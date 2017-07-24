class App extends Component {

  static get title(){ return 'Working'; }
  static get subtitleDivider(){ return ': '; }

  constructor(props){
    super(props);
    $('body').addClass(navigator.platform.toLowerCase() + '-platform');
    flatpickr.localize(flatpickr.l10ns.sv);
  }

}
