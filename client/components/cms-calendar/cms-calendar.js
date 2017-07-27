class CmsCalendar extends CMS {

  static get route(){
    return [
      '/calendar/:date',
      '/calendar'
    ];
  }

  constructor(props){
    super(props);
  }

  load(){
    this.loadAsync();
  }

  async loadAsync(){
    this.rest = 'rich_schedules';
    let [err, schedules] = await this.find();
    if(err){
      console.log('err', err);
      return;
    }
    let events = {};
    for(let schedule of schedules){
      // handle multiple rows from the db setting data to the same schedule
      if(!events[schedule.id]){
        events[schedule.id] = {
          id: schedule.id,
          title: schedule.label,
          start: schedule.start.split(' ').join('T'),
          end: schedule.stop? schedule.stop.split(' ').join('T') : null,
          project:{
            id: schedule.project,
            name: schedule.name,
            organisation: schedule.organisation
          },
          staff:[]
        };
      }
      // add staff to the event
      if(schedule.userId){
        events[schedule.id].staff.push({
          id: schedule.userId,
          firstName: schedule.firstName,
          lastName: schedule.lastName,
          fullName: schedule.fullName,
          initials: schedule.initials
        });
      }
    }
    this.setupCalendar(Object.values(events));
  }


  setupCalendar(events){
    var me = this;
    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek'
      },
      locale: 'sv',
      weekNumbers: true,
      defaultDate: this.params.date? new Date(this.params.date) : new Date(),
      navLinks: true, // can click day/week names to navigate views
      selectable: true,
      selectHelper: true,
      select: function(start, end, allDay){
        // we do not know if allDay is useful
        //  or if we instead will just get
        //  a plain date in start and no date in end instead
        var projectId = prompt('Projekt (id):');
        var projectName = prompt('Projekt (namn):');
        var title = prompt('Beskrivning:');
        var staff = prompt('Personal (komma-delimiterade idn):');
        var eventData;
        if (projectId) {
          eventData = {
            title: title,
            project: {id: projectId, name: projectName},
            staff: staff,
            start: start,
            end: end
          };
          me.saveEvent(eventData);
          $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
        }
        $('#calendar').fullCalendar('unselect');
      },
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      events: events,
      eventRender: function(event, element) {
        if(event.project){
          element.addClass('project-' + event.project.id);
          element.prepend('<span class="project-name">' + event.project.name + '</span>');
        }
        if(event.staff && event.staff.push){
          let staff = '<span class="initials">';
          for(let s of event.staff){
            staff += '<span class="staff-' + s.id + '">' + s.initials + '</span> ';
          }
          staff += '</span>';
          element.append(staff);
        }
      },
      eventClick: function(event, element) {
        console.log('changes to the event?', event);
      }
    });
  }

  async saveEvent(event){
    this.rest = 'schedules';
    let schedule = {
      label: event.title,
      start: event.start,
      stop: event.end,
      project: event.project.id
    };
    if(event.id){
      schedule.id = event.id;
      await this.update(schedule.id, schedule);
    }else{
      await this.create(schedule);
    }
  }


  /*
    let events = [
      {
        title: 'Newton SYSJM2',
        start: '2017-05-01',
        className: 'Newton-SYSJM2 staff staff-Benjamin',
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
        className: 'Newton-SYSJM2 staff staff-Benjamin staff-Dennis',
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
        className: 'Lernia-SUW17 staff staff-Thomas',
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
        className: 'Lernia-SUW17 staff staff-Benjamin',
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
        className: 'Lernia-SUW16 staff staff-Thomas',
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
        className: 'Medieinstitutet-OLM16 staff staff-Benjamin',
        project:{
          id: '4',
          name: 'OLM16',
          organisation: 'Medieinstitutet'
        }
      },
      {
        title: 'Medieinstitutet OLMM17',
        start: '2017-05-12T12:00:00',
        className: 'Medieinstitutet-OLMM17 staff staff-Benjamin',
        project:{
          id: '5',
          name: 'OLMM17',
          organisation: 'Medieinstitutet'
        }
      },
      {
        title: 'Medieinstitutet OLMM17',
        start: '2017-05-12T14:30:00',
        className: 'Medieinstitutet-OLMM17 staff staff-Dennis',
        project:{
          id: '5',
          name: 'OLMM17',
          organisation: 'Medieinstitutet'
        }
      },
      {
        title: 'Medieinstitutet OLM16',
        start: '2017-05-12T17:30:00',
        className: 'Medieinstitutet-OLM16 staff staff-Benjamin',
        project:{
          id: '4',
          name: 'OLM16',
          organisation: 'Medieinstitutet'
        }
      },
      {
        title: 'Lernia SUW17',
        start: '2017-05-12T20:00:00',
        className: 'Lernia-SUW17 staff staff-Thomas',
        project:{
          id: '2',
          name: 'SUW17',
          organisation: 'Lernia'
        }
      },
      {
        title: 'Lernia SUW16',
        start: '2017-05-13T07:00:00',
        className: 'Lernia-SUW16 staff staff-Thomas',
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
    ];
    */


}
