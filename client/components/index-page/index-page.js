class IndexPage extends Component {

  static get route(){
    return [
      '/index-page'
    ];
  }

  static get subtitle(){
    return [
      'Startsida'
    ];
  }

  constructor(props){
    super(props);
  }

  get title(){
    return 'Working works';
  }

}
