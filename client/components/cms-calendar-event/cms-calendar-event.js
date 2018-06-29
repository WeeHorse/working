class CmsCalendarEvent extends CMS {

  constructor(props){
    super(props);
  }


  async saveEvent(){
    await this.parentComponent.saveEvent();
  }

}
