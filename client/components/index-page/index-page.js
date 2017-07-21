class IndexPage extends Component {

  static get route(){
    return [
      '/'
    ];
  }

  static get subtitle(){
    return [
      'Startsida'
    ];
  }

  constructor(props){
    super(props);

    Ani.baseChoiceFromClick = false;
    Ani.currentExpresselyDecidedBaseChoice = false;
    Ani.mainChoiceFromClickBlocked = false;

    // personbilsklasser
    let pbk = 'a,b,c,cla,cls,e,g,gla,glc,gle,gls,s,sl,slc,amg gt'.split(',');

    this.classes = {
      vito: 'Vito',
      vklass: 'V-klass',
      viano: 'Viano',
      sprinter: 'Sprinter',
      citan: 'Citan',
      actros: 'Actros',
      antos: 'Antos',
      atego: 'Atego',
      arocs: 'Arocs',
      econic: 'Econic'
    };

    for(let pk of pbk){
      this.classes[pk+'klass'] = pk.toUpperCase()+'-klass';
    }

    this.cutBeforeSendingToFind = [
     'person','personbil','personb','personbi','personbila','personbilar',
     'transport','transportbil','transportbi','transportb','transportbila','transportbilar',
     'last','lastbil','lastbi','lastb','lastbila','lastbilar'
    ]

    this.synonyms = {
      personbilar: [
        'aklass','bklass','cklass','dklass','eklass',
        'person','personbil','personb','personbi','personbila',
        'sedan','cab','van','coupe','kupé','kupe','coupé',
        'kombi','herrgårdsvagn','halvkombi',
        'other-cars','suv','stadsjeep','jeep',
        'sports-tourer','tourer','sports tourer','sportkupé','sportkupe'
      ],
      transportbilar: [
        'transport','transportbil','transportbi','transportb','transportbila',
        'vito','vklass','viano','sprinter','citan'
      ],
      lastbilar: [
        'last','lastbil','lastbi','lastb','lastbila',
        'actros', 'antos', 'atego', 'arocs', 'econic'
      ],
      service: ['service','serva','serve','reperation','fixa','laga','underhåll','underhålla'],
      lease: ['privatleasing','leasing','leasa', 'lease','långtidshyra'],
      rent: ['hyra','hyr','hyres','hyresbil'],
      parts: ['reservdelar','del','delar','byta ut','byt ut','dela'],
      business: [
        'tjänstebilar','företag','företagsbil','tjänst','tjänste','tjänsteb','tjänstebi','tjänstebil',
        'tjänstebila','fleet','fleet leasing'
      ],
      campaign: ['kampanjer','kampanj','erbjudande','rea'],
      find: ['hitta','köp','köpa'],
      'lb-campaign': ['kampanjer','kampanj','erbjudande','rea'],
      'lb-find': ['hitta','köp','köpa'],
      'lb-parts': ['reservdelar','delar','del','byta ut','byt ut','dela'],
      'lb-service': ['service','serva','serve','reperation','fixa','laga','underhåll','underhålla'],
      'tb-campaign': ['kampanjer','kampanj','erbjudande','rea'],
      'tb-find': ['hitta','köp','köpa'],
      'tb-lease': ['leasing','leasa', 'lease','långtidshyra'],
      'tb-service': ['service','serva','serve','reperation','fixa','laga','underhåll','underhålla'],
      'tb-parts': ['reservdelar','del','delar','byta ut','byt ut','dela']
    };

    for (let p of pbk){
      this.synonyms.personbilar.push(p + 'klass');
    }

    this.others = [
      "land rover", "saturn", "pontiac",
      "mitsubishi", "lincoln", "volvo",
      "mercury", "harley-davidson", "harley",
      "buick", "cadillac", "infiniti",
      "audi", "kia", "mazda",
      //"chrysler",
      "acura", "gmc", "subaru",
      "volkswagen", "lexus", "dodge",
      "bmw", "mercedes-benz", "hyundai",
      "chevrolet", "nissan", "ford",
      "toyota", "honda", "saab", "opel"
    ];

    this.halsningar = ['hej','hejs','hejsa','hejsan','hallå','tjena','tjäna','tjenare','tjänare','goddag'];

    this.words = Object.keys(this.synonyms).concat(this.others,this.halsningar);
    this.baseChoices = ['personbilar','transportbilar','lastbilar'];
    window.indexPageSearchLitByText = {};
  }

  get title(){
    return 'Välkommen till Mercedes-Benz Malmö! <br>Hur kan vi hjälpa dig idag?';
  }

  load(){
    this.ani.introduceMe = true;
  }

  fieldFocus(el){
    el.scrollTo(500,10,-15);
  }

  fieldBlur(el){
    this.go(el,{});
  }

  doIt(){
    this.go($('.index-page-search-field'),{});
    if(IndexPage.doIt){
      IndexPage.doIt();
      delete IndexPage.doIt;
    }
    else {
      this.ani.speak('Jag kunde tyvärr inte förstå vad du menar. Pröva något enkelt, som att skriva "A-klass" eller "hyra bil". |:D|');
    }
  }

  mainChoiceFromClick(choice,addOrDel){
    if(Ani.mainChoiceFromClickBlocked){return;}
    let f = $('.index-page-search-field');
    let a = Ani.currentExpresselyDecidedBaseChoice;
    if(addOrDel == 'added'){
      if(Ani.baseChoiceFromClick){
        f.val(f.val().split(Ani.baseChoiceFromClick).join(''));
      }
      if(a != choice){
        f.val(choice + ' '  + f.val());
      }
      Ani.baseChoiceFromClick = choice;
      this.go(f,{},false);
    }
    if(addOrDel == 'removed'){
      if(Ani.baseChoiceFromClick){
        f.val(f.val().split(choice + ' ').join('').split(choice).join(''));
      }
      // this.ani.cancel();
    }
  }

  async navigateTo(main,sub){
    Ani.mainChoiceFromClickBlocked = true;
    if(sub.indexOf('find')>=0){
      let v = $('.index-page-search-field').val().split(' ');
      v = v.map((x)=>{
        for(let c of this.cutBeforeSendingToFind){
          if(x.toLowerCase() == c){return '';}
        }
        return x;
      }).join(' ');
      window.fillFindFieldWith = v;
    }
    await this.sleep(500);
    if(!$('#'+main).hasClass('selected')){
      Ani.mainChoiceFromClickBlocked = true;
      $('#'+main).click();
    }
    await this.sleep(200);
    $('#'+main+' .content').addClass('hovered box-bordered');
    window.vcatHoverDisabled = true;
    await this.sleep(1000);
    let correctSub, subHeight = 0;
    $('.content.' + sub).each(function(){
      let me = $(this);
      if(this.clientHeight){
        correctSub = me;
        subHeight = this.clientHeight;
      }
    });
    correctSub.addClass('hovered box-bordered');
    correctSub.scrollTo(500,10,subHeight);
    await this.sleep(1000);
    correctSub.closest('a').click();
    await this.sleep(5000);
    window.vcatHoverDisabled = false;
    Ani.mainChoiceFromClickBlocked = false;
  }

  go(el,e,showAni = true){
    if(e && e.keyCode == 13){this.doIt();return;}
    if(this.ani.lastMess().indexOf('heter Kim')>=0){this.ani.close();}
    let v = el.val();
    v = v.toLowerCase().replace(/[^\w\såäöüé]|_/g, "").replace(/\s+/g, " ").split(' ');

    let s = [];
    for(let i in this.synonyms){
      for(let w of v){
        if(this.synonyms[i].indexOf(w)>=0){
          s.push(i);
        }
      }
    }
    v = v.concat(s);

    // new things to add or delete
    let toDelete = [];
    let toAdd = [];
    for(let word of this.words){
      if(window.indexPageSearchLitByText[word] && v.indexOf(word)<0){
        toDelete.push(word);
      }
      if(!window.indexPageSearchLitByText[word] && v.indexOf(word)>=0){
        toAdd.push(word);
      }
    }
    let baseChoiceClick;
    for(let del of toDelete){
      delete window.indexPageSearchLitByText[del];
      if(this.baseChoices.indexOf(del)>=0 && $('#' + del).hasClass('selected')){
        baseChoiceClick = '#' + del;
      }
    }
    for(let add of toAdd){
      window.indexPageSearchLitByText[add] = 1;
      if(this.baseChoices.indexOf(add)>=0 && !$('#' + add).hasClass('selected')){
        baseChoiceClick = '#' + add;
      }
    }

    // figure out current base choice
    let currentBaseChoice = '', currentBaseChoicePrefix = '', moreThanBaseChoice;
    for(let i in window.indexPageSearchLitByText){
      if(this.baseChoices.indexOf(i)>=0){
        currentBaseChoice = i;
        if(i == 'transportbilar'){currentBaseChoicePrefix = 'tb-';}
        if(i == 'lastbilar'){currentBaseChoicePrefix = 'lb-';}
      }
      else if(this.others.indexOf(i)<0 && this.halsningar.indexOf(i)<0) {
        moreThanBaseChoice = true;
      }
    }

    Ani.currentExpresselyDecidedBaseChoice = currentBaseChoice;
    if(moreThanBaseChoice && !currentBaseChoice){
      currentBaseChoice = 'personbilar';
    }

    // remove sub-choices not in line with the base choice
    let delSubs = [];
    for(let i in window.indexPageSearchLitByText){
      if(this.baseChoices.indexOf(i)>=0){ continue; }
      if(!currentBaseChoicePrefix && (i.indexOf('tb-')===0 || i.indexOf('lb-') === 0)){
        delSubs.push(i);
      }
      if(currentBaseChoicePrefix && i.indexOf(currentBaseChoicePrefix) !== 0){
        delSubs.push(i);
      }
    }
    for(let delSub of delSubs){
      delete window.indexPageSearchLitByText[delSub];
    }

    // figure sub-choice to "click"/high-light
    let selectedSubChoice;
    for(let i in window.indexPageSearchLitByText){
      if(this.baseChoices.indexOf(i)>=0 || this.others.indexOf(i)>=0 || this.halsningar.indexOf(i)>=0){ continue; }
      selectedSubChoice = i;
    }

    // check if the subchoice is being done now
    let subChoiceNow = false;
    if(selectedSubChoice && toAdd.indexOf(selectedSubChoice)>=0){
      subChoiceNow = selectedSubChoice
    }
    if(baseChoiceClick && !selectedSubChoice){
      subChoiceNow = 'find';
    }

    if(currentBaseChoice && subChoiceNow){
      let subNice = this.synonyms[subChoiceNow][0];
      let phrase = 'Ska vi titta på ' + subNice + ' bland våra ' + currentBaseChoice + '?\nVill du att jag tar dig dit?';
      if(['lease','service'].indexOf(('-'+subChoiceNow).split('-').pop())>=0){
        phrase = phrase.split('bland').join('av');
      }
      if(phrase.indexOf('titta på service av våra')>=0){
        phrase = phrase.split('titta på service av våra').join('boka service för din');
        phrase = phrase.split('ar?').join('?');
      }
      if(phrase.indexOf('hyra bland våra')>=0){
        phrase = phrase.split('hyra bland våra').join('att hyra');
        phrase = phrase.split('ar?').join('?');
      }
      phrase = phrase.split('kampanjer bland').join('kampanjer för');
      phrase = phrase.split('titta på hitta').join('titta');
      phrase = phrase.split('reservdelar bland').join('reservdelar till');
      if(phrase.indexOf('hyra bland')>=0){
        phrase = phrase.split('hyra bland').join('att hyra');
        phrase = phrase.split('ar?').join('?');
      }
      if(subChoiceNow == 'find'){
        let v2 = v.slice().reverse();
        for(let vv of v2){
          if(this.classes[vv]){
            phrase = phrase.split('bland').join('efter ' + this.classes[vv] + ' bland');
            phrase = 'Bra val! |:D| ' + phrase;
          }
        }
      }
      phrase = phrase.split('service').join('service |<3|');
      if(Math.random()<.3){
        phrase = phrase.split('Ska vi titta').join('Vi kollar');
      }
      if(Math.random()<.3){
        phrase = phrase.split('Ska vi titta på').join('Du vill veta mer om');
      }
      if(Math.random()<.3){
        phrase = phrase.split('Vill du att jag tar dig dit?').join('Får jag ta dig med mig dit? |:D|');
      }
      if(Math.random()<.3){
        phrase = phrase.split('\nVill du att jag tar dig dit?').join(' |:)|\nLåt oss gå dit?');
      }
      //phrase = phrase.split('\n').join(' ');
      if(currentBaseChoice === 'transportbilar' && subChoiceNow.indexOf('tb-')!=0){
        subChoiceNow = 'tb-' + subChoiceNow;
      }
      if(currentBaseChoice === 'lastbilar' && subChoiceNow.indexOf('lb-')!=0){
        subChoiceNow = 'lb-' + subChoiceNow;
      }
      IndexPage.doIt = ()=>{
        this.navigateTo(currentBaseChoice,subChoiceNow);
      };

      // less talkative
      phrase = phrase.split('\n')[0];

      let short = {personbilar:'pb',transportbilar:'tb',lastbilar:'lb'};
      showAni && this.ani.speak(phrase,IndexPage.doIt,'mb-' + short[currentBaseChoice],subChoiceNow);
    }

    let nada = true;

    // others
    let others = [];
    for(let i in window.indexPageSearchLitByText){
      if(this.others.indexOf(i)>=0){
        others.push(i[0].toUpperCase() + i.substring(1));
      }
    }
    if(others.length && toAdd.length){
      let ot = others.join(', ');
      if(others.length > 1){
        ot = ot.substring(0,ot.lastIndexOf(',')) + ' och ' + ot.substring(ot.lastIndexOf(',')+2);
      }
      showAni && this.ani.speak(
        'Du bad mig hitta ' + ot +' - men vi erbjuder endast högkvalitativa Mercedes-bilar. |;)||:D|'
      );
      nada = false;
    }


    // halsningar
    let halsningar = [];
    for(let i in window.indexPageSearchLitByText){
      if(this.halsningar.indexOf(i)>=0){
        halsningar.push(i[0].toUpperCase() + i.substring(1));
      }
    }
    if(halsningar.length && toAdd.length){
      let ot = halsningar.join(', ');
      if(halsningar.length > 1){
        ot = ot.substring(0,ot.lastIndexOf(',')) + ' och ' + ot.substring(ot.lastIndexOf(',')+2);
      }
      showAni && this.ani.speak(
        ot[0] + ot.substring(1).toLowerCase() +' - kul att ses! |:D|'
      );
      nada = false;
    }

    if(nada) {
      if(toDelete.length){this.ani.cancel();IndexPage.doIt = false;};
    }


  }

}
