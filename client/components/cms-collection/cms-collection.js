class CmsCollection extends CMS {

  constructor(props){
    super(props);
    this.fieldList = [];
    this.padListView = [1,2,3]; // 3 columns of list view, to be filled with fields or padded
  }

  load(){
    this.rest = this.collection.rest;
    this.processFields();
    this.loadCollection();
  }

  processFields(){
    // Important change: fields shall be an Array of Objects
    if(this.collection.fields.constructor == Array){
      for(let f of this.collection.fields){
        let fieldName = Object.keys(f)[0];
        let field = f[fieldName]; // wierd proxy thing..
        if(field.cmsField){
          field.fieldName = fieldName;
          field.componentName = 'cms-field-' + field.cmsField;
          if(field.inListView){ // what to be shown as columns in the list
            if(this.padListView.length > 0){ // room left for fields in list view
              this.padListView.shift(); // decrease padding
            }else{ // sorry, no room left in list view
              field.inListView = false;
            }
          }
          this.fieldList.push(field);
        }
      }
    }
    // Deprecated, to be deleted when change is carried out in older CMS (mb kim) too
    else if(this.collection.fields.constructor == Object){
      for(let fieldName in this.collection.fields){
        let field = this.collection.fields[fieldName];
        if(field.cmsField){
          field.fieldName = fieldName;
          field.componentName = 'cms-field-' + field.cmsField;
          if(field.inListView){ // what to be shown as columns in the list
            if(this.padListView.length > 0){ // room left for fields in list view
              this.padListView.shift(); // decrease padding
            }else{ // sorry, no room left in list view
              field.inListView = false;
            }
          }
          this.fieldList.push(field);
        }
      }
    }
  }

  toggleShowRows(){
    this.showing = !this.showing;
  }

}
