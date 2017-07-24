class CmsSettings extends CMS {

  static get route(){
    return '/cms-settings';
  }

  constructor(props){
    super(props);
    this.rest = 'cms';
    this.loggedIn = false;
  }

  load(){
    this.loadAsync();
  }

  async loadAsync(){
    this.rest = 'login';
    await this.checkLogin();
    this.rest = 'cms';
    // await this.loadCollection();
    // this.collections = this.items;
  }

}
