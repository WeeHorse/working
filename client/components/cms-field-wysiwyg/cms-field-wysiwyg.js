class CmsFieldWysiwyg extends CMS {

  constructor(props){
    super(props);
    // this.options = {
    //   fontNames: ['CorpoA-Reg', 'CorpoS-Reg', 'CorpoS-Lt', 'CorpoS-Dem', 'mercedes-benz-icons']
    // }
    // this.options.fontNamesIgnoreCheck = this.options.fontNames;
  }

  load(){
    // overload this.options
    // for(let key in this.field.options){
    //   this.options[key] = this.field.options[key];
    // }
    setTimeout(()=>{
      this.$baseEl.find('.wysiwyg').summernote(this.field.options);
    },1);
  }

}
