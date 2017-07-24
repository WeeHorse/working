class CmsLogin extends CMS {

  constructor(props){
    super(props);
    this.rest = 'login';
    this.loggedIn = false;
  }

  async login(){
    let username = this.$baseEl.find('#username').val();
    let password = this.$baseEl.find('#password').val();
    await this.loginAsync(username, password);
    await this.parentComponent.loadAsync();
  }

}
