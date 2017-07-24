var System = require('../core/system.class');

module.exports = class MailTemplates extends System{
  constructor(){
    super();
    this.url = this.config.hostPrefix + this.config.host;

    this.mailRequirements = {
      ALL: [
        'to',
        'firstName',
        'lastName',
        'mail',
        'phone',
        'newsletter'
      ],
      lease: [ 'buttonValues', 'checkboxValues', 'miles', 'approxCost' ],
      rent:  [ 'button', 'fromDate', 'toDate' ],
      fleet: [ 'model' ],
      buy:   [ 'carId' ],
      drive: [ 'carId', 'when' ]
    };
  }

  defaultSubject(suffix){
    return 'Kundkontakt - ' + suffix;
  }

  defaultFields(reqBody){
    return `
      Förnamn: ${reqBody.firstName}
      Efternamn: ${reqBody.lastName}
      E-postadress: ${reqBody.mail}
      Telefon: ${reqBody.phone}
      Nyhetsbrev: ${reqBody.newsletter}
      Övrigt: ${reqBody.misc}`
  }

  lease(reqBody){
    return {
      subject: `${this.defaultSubject('Privatleasing')}`,
      text: `En besökare har fyllt i formuläret för att privatleasa.
        ${this.defaultFields(reqBody)}

        Valda knappar: ${reqBody.buttonValues.join(', ')}
        Vald Utrustning: ${reqBody.checkboxValues.join(', ')}
        Antal mil/år: ${reqBody.miles}
        Cirkapris/månad: ${reqBody.approxCost}`
    }
  }

  rent(reqBody){
    return {
      subject: `${this.defaultSubject('Hyra bil')}`,
      text: `En besökare har fyllt i formuläret för att hyra en bil.
        ${this.defaultFields(reqBody)}

        Vald storlek: ${reqBody.button}
        Från: ${reqBody.fromDate}
        Till: ${reqBody.toDate}`
    }
  }

  fleet(reqBody){
    return {
      subject: `${this.defaultSubject('Tjänstebil')}`,
      text: `En besökare har fyllt i formuläret för tjänstebilar.
        ${this.defaultFields(reqBody)}

        Vald bil: ${reqBody.model}`
    }
  }

  buy(reqBody){
    return {
      subject: `${this.defaultSubject('Reservera bil')}`,
      text: `En besökare har fyllt i formuläret för att reservera en bil.
        ${this.defaultFields(reqBody)}

        Vald bil: ${this.getCarName(reqBody)}
        Länk: ${this.url}/personbilar/${reqBody.carId}
        Bytbil: ${this.getBytBilLink(reqBody)}`
    }
  }

  drive(reqBody){
    return {
      subject: `${this.defaultSubject('Provköra bil')}`,
      text: `En besökare har fyllt i formuläret för att provköra en bil.
        ${this.defaultFields(reqBody)}

        Önskat datum: ${reqBody.when}

        Vald bil: ${this.getCarName(reqBody)}
        Länk: ${this.url}/personbilar/${reqBody.carId}
        Bytbil: ${this.getBytBilLink(reqBody)}`
    }
  }

  getCarName(reqBody){
    return `(${reqBody.car.properties.regno}) `
      + reqBody.car.model + ' '
      + reqBody.car.modeldescription;
  }

  getBytBilLink(reqBody){
    let carType = reqBody.car.type;
    if (carType == 'personbil') { carType = 'bil'; }
    let link = `http://www.bytbil.com/${carType}?&FreeText=` + reqBody.car.properties.regno;
    return `(ID: ${reqBody.car.id}) ` + link;
  }

  async getTemplate(templateName, reqBody){
    if (!this[templateName]){
      console.log('Error', templateName, '- did not match any mail-template.');
      return false;
    }

    if (!this.isValid(templateName, reqBody)) {
      console.log('Error, did not meet mail-template requirements of:', templateName);
      return false;
    }

    if (reqBody.carId){
      reqBody.car = await this.models['car'].findOne({ id: reqBody.carId });
      if (reqBody.car == null){
        console.log('Error, could not lookup the car with id:', reqBody.carId);
        return false;
      }
    }

    let result = this[templateName](reqBody);
    result.text = result.text.replace(/ {2,}/g, ''); // Remove spaced indentation
    result.to = reqBody.to;

    // Don't clutter the reqBody
    delete reqBody.car;

    return result;
  }

  isValid(templateName, reqBody){
    let keys = this.mailRequirements['ALL'].concat(this.mailRequirements[templateName]);

    let invalid = false;
    for (let key of keys){
      invalid = invalid || !reqBody[key];
    }
    return !invalid;
  }
}
