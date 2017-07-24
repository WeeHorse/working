class CmsItem extends CMS {

  constructor(props){
    super(props);
  }

  load(){
    console.log('this.item', this.item);
    for(let field of this.fields){
      let defaultVal = this.fields.isArray? [] : '';
      field.fieldVal = this.item && this.item[field.fieldName]? this.item[field.fieldName] : defaultVal;
      field.cmsFieldComponent = 'cms-field-' + field.cmsField;
    }
    console.log('this.fields', this.fields);
  }

  unload(){
    // due to some bootstrap 4 alpha 6 bug we need to manually hide this:
    $('.note-popover').hide();
  }

}
