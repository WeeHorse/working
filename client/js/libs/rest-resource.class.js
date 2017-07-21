class RestResource {

  constructor(){
    RestResource.callCount =  0;
    this.rest = this.constructor.name.toLowerCase();
  }

  get baseUrl(){
    return '/rest/' + this.rest + '/';
  }

  create(properties = {}){
    RestResource.callCount++;
    let callCount = RestResource.callCount;
    let url = this._urltrim(this.baseUrl);

    new Timer('REST create POST ' + url + ' ' + callCount);

    return new PromiseWrap($.ajax({
      url: url ,
      type: "POST",
      dataType: "json",
      // don't process the request body
      processData: false,
      // and tell Node that it is raw json
      headers: {"Content-Type": "application/json"},
      // the request body
      data: JSON.stringify(properties),
    }),()=>{ new Timer('REST create POST ' + url + ' ' + callCount,true); });

  }

  find(idOrQuery = ''){
    RestResource.callCount++;
    let callCount = RestResource.callCount;
    typeof idOrQuery == 'object' && (idOrQuery = 'find/' + JSON.stringify(idOrQuery));
    let url = this._urltrim(this.baseUrl + idOrQuery);
    new Timer('REST find GET ' + url + ' ' + callCount);

    return new PromiseWrap($.ajax({
      url: url,
      type: "GET",
      dataType: "json",
    }),()=>{ new Timer('REST find GET ' + url + ' ' + callCount,true); });

  }

  update(idOrQuery = '',properties = {}){
    RestResource.callCount++;
    let callCount = RestResource.callCount;
    typeof idOrQuery == 'object' && (idOrQuery = 'find/' + JSON.stringify(idOrQuery));
    let url = this._urltrim(this.baseUrl + idOrQuery);
    new Timer('REST update PUT ' + url + ' ' + callCount);

    return new PromiseWrap($.ajax({
      url: url,
      type: "PUT",
      dataType: "json",
      // don't process the request body
      processData: false,
      // and tell Node that it is raw json
      headers: {"Content-Type": "application/json"},
      // the request body
      data: JSON.stringify(properties),
    }),()=>{ new Timer('REST update PUT ' + url + ' ' + callCount,true); });

  }

  delete(idOrQuery = ''){
    RestResource.callCount++;
    let callCount = RestResource.callCount;
    typeof idOrQuery == 'object' && (idOrQuery = 'find/' + JSON.stringify(idOrQuery));
    let url = this._urltrim(this.baseUrl + idOrQuery);
    new Timer('REST delete DELETE '  + url + ' ' + callCount);

    return new PromiseWrap($.ajax({
      url: url,
      type: "DELETE",
      dataType: "json",
    }),()=>{ new Timer('REST delete DELETE '  + url + ' ' + callCount,true); });

  }

  _urltrim(x){
    // trim trailing slash
    while(x.length && x[x.length-1] == '/'){
      x = x.substring(0,x.length-1);
    }
    return x;
  }

}
