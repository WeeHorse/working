class CmsHeader extends CMS {

  constructor(props){
    super(props);
    this.rest = 'login';
  }

  async logout(){
    await this.logoutAsync();
    await this.parentComponent.loadAsync();
  }

}
