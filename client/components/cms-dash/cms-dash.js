class CmsDash extends CMS {

  static get route(){
    return '/';
  }

  constructor(props){
    super(props);
    this.rest = 'cms';
    this.loggedIn = true; // false
    this.collections = [];
  }

  load(){
    this.loadAsync();
  }

  async loadAsync(){
    this.rest = 'login';
    //await this.checkLogin();
    this.rest = 'cms';
    await this.loadCollection();
    this.collections = this.items;
  }

}
