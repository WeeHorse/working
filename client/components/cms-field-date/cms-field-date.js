class CmsFieldDate extends CMS {

  load(){
    let dateInput = this.$baseEl.find('[name="' + this.field.fieldName + '"]');
    this.date = dateInput.flatpickr({
      //altInput: true,
      //minDate: "today", // new Date().fp_incr(1),
      dateFormat: "Y-m-d H:i:S", // 2017-04-24 09:00:00
      defaultDate: this.field.fieldVal? new Date(this.field.fieldVal) : new Date() // new Date().fp_incr(28),
      //,weekNumbers:true
    });
  }

}
