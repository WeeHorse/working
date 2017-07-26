class CmsCalendar extends CMS {

  static get route(){
    return '/calendar';
  }

  constructor(props){
    super(props);
    this.rest = 'cms';
  }

  load(){
    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek'
      },
      locale: 'sv',
      weekNumbers: true,
      defaultDate: new Date(),
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      events: [
        {
          title: 'Newton SYSJM2',
          start: '2017-05-01',
          className: 'Newton-SYSJM2 staff-Benjamin',
          project:{
            id: '1',
            name: 'SYSJM2',
            organisation: 'Newton'
          },
          staff:[{name: 'Benjamin'}]
        },
        {
          title: 'Newton SYSJM2',
          start: '2017-05-07',
          end: '2017-05-10',
          className: 'Newton-SYSJM2 staff-Benjamin staff-Dennis',
          project:{
            id: '1',
            name: 'SYSJM2',
            organisation: 'Newton'
          },
          staff:[{name: 'Benjamin'},{name: 'Dennis'}]
        },
        {
          id: 999,
          title: 'Lernia SUW17 Repeating Event',
          start: '2017-05-09T16:00:00',
          className: 'Lernia-SUW17 staff-Thomas',
          project:{
            id: '2',
            name: 'SUW17',
            organisation: 'Lernia'
          }
        },
        {
          id: 999,
          title: 'Lernia SUW17 Repeating Event',
          start: '2017-05-16T16:00:00',
          className: 'Lernia-SUW17 staff-Benjamin',
          project:{
            id: '2',
            name: 'SUW17',
            organisation: 'Lernia'
          }
        },
        {
          title: 'Lernia SUW16',
          start: '2017-05-11',
          end: '2017-05-13',
          className: 'Lernia-SUW16 staff-Thomas',
          project:{
            id: '3',
            name: 'SUW16',
            organisation: 'Lernia'
          }
        },
        {
          title: 'Medieinstitutet OLM16',
          start: '2017-05-12T10:30:00',
          end: '2017-05-12T12:30:00',
          className: 'Medieinstitutet-OLM16 staff-Benjamin',
          project:{
            id: '4',
            name: 'OLM16',
            organisation: 'Medieinstitutet'
          }
        },
        {
          title: 'Medieinstitutet OLMM17',
          start: '2017-05-12T12:00:00',
          className: 'Medieinstitutet-OLMM17 staff-Benjamin',
          project:{
            id: '5',
            name: 'OLMM17',
            organisation: 'Medieinstitutet'
          }
        },
        {
          title: 'Medieinstitutet OLMM17',
          start: '2017-05-12T14:30:00',
          className: 'Medieinstitutet-OLMM17 staff-Dennis',
          project:{
            id: '5',
            name: 'OLMM17',
            organisation: 'Medieinstitutet'
          }
        },
        {
          title: 'Medieinstitutet OLM16',
          start: '2017-05-12T17:30:00',
          className: 'Medieinstitutet-OLM16 staff-Benjamin',
          project:{
            id: '4',
            name: 'OLM16',
            organisation: 'Medieinstitutet'
          }
        },
        {
          title: 'Lernia SUW17',
          start: '2017-05-12T20:00:00',
          className: 'Lernia-SUW17 staff-Thomas',
          project:{
            id: '2',
            name: 'SUW17',
            organisation: 'Lernia'
          }
        },
        {
          title: 'Lernia SUW16',
          start: '2017-05-13T07:00:00',
          className: 'Lernia-SUW16 staff-Thomas',
          project:{
            id: '3',
            name: 'SUW16',
            organisation: 'Lernia'
          }
        },
        {
          title: 'Click for Google',
          url: 'http://google.com/',
          start: '2017-05-28'
        }
      ]
    });
  }

}
