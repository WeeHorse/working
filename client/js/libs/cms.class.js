class CMS extends Component{

  constructor(props){
    super(props);
    this.items = [];
    this.editing = {};
  }

  async checkLogin(){
    let [err, data] = await this.find();
    if(!err && data.user!==false && data.status=='logged in'){
      this.loggedIn = true;
    }else{
      this.loggedIn = false;
    }
  }

  async loginAsync(username, password){
    let [err, res] = await this.create({username:username,password:password});
    if(err){
      this.loggedIn = false;
      this.user = {};
    }else if(res.user && res.user.username == username){
      // set the user object
      this.user = res.user;
      this.loggedIn = true;
    }
  }

  async logoutAsync(){
    await this.delete();
    await this.checkLogin();
  }

  async loadCollection(){
    let [err, data] = await this.find();
    err && console.log(this.niceError(err));
    if(!err){
      this.items = data;
      console.log('collection loaded for', this.rest, 'with length', this.items.length);
    }
  }

  async deleteItem(el){
    let id = this.getIdFromDom(el);
    let [err, data] = await this.delete(id);
    err && console.log(this.niceError(err));
    if(!err){
      for(let i=0; i<this.items.length; i++){
        if(this.items[i]._id == id){
          this.items.splice(i,1);
          this.updateView();
        }
      }
    }
  }

  async saveItem(el){
    let err, res;
    let id = el && this.getIdFromDom(el) || null;
    let formSelector = id? '#form_' + id : '#form_new';
    // original data object
    let item = id? this.getItemFromItems(id) : {};
    // add changes
    this.$baseEl.find(formSelector).find('input, textarea, .wysiwyg').each(function(){
      let name = $(this).attr('name');
      if(id && item[name] || !id){
        if($(this).attr('data-arrfromnewline')){
          item[name] = $(this).val().split('\n');
          for(let i = item[name].length; i > -1; i--){
            if(item[name][i]===""){
              item[name].splice(i, 1);
            }
          }
        }else if($(this).attr('data-jsontype')){
          item[name] = JSON.parse($(this).val());
        }else if($(this).hasClass('wysiwyg')){
          item[name] = $(this).summernote('code');
        }else{
          item[name] = $(this).val()
        }
      }
    });
    console.log('saveItem', item);
    if(id){
      [err, res] = await this.update(id, item);
    }else{
      [err, res] = await this.create(item);
    }
    if(err){
      console.log('err', this.niceError(err));
    }else{
      console.log('res', res);
    }
    if(id){
      this.toggleEdit(el);
    }else{
      this.toggleNew();
      this.loadCollection();
    }
  }

  async toggleShowItem(el){
    let id = this.getIdFromDom(el);
    let item = this.getItemFromItems(id);
    item.show = !item.show;
    await this.update(id, {show: item.show});
    this.updateView();
  }

  toggleNew(){
    if(this.editing){
      this.editing = {};
    }
    this.creating = !this.creating;
  }

  toggleEdit(el){
    if(this.creating){
      this.creating = false;
    }
    let id = this.getIdFromDom(el);
    if(id && this.editing && this.editing._id == id){
      id = null;
    }
    var item = this.getItemFromItems(id);
    // force redraw:
    setTimeout(()=>{
      this.editing = {}; // first set editing to nothing (to force redraw cms-item)
      if(item){
        setTimeout(()=>{
            this.editing = item; // then set editing to item (if we are going to one)
        },1);
      }
    },1);
  }

  getIdFromDom(el){
    return el.parent().data('id');
  }

  getItemFromItems(id){
    if(id){
      for(let item of this.items){
        if(item._id == id){
          console.log('got item', item);
          return item;
        }
      }
    }
    return {};
  }

}
