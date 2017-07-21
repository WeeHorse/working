class Footer extends Component {

  load(){
    this.showing = false;
    this.footerResizer();
    if(!Footer.resizerSet){
      $(document).on('resize orientationchange',window,this.footerResizer);
      let docHeight;
      setInterval(()=>{
        let h = Math.max($(document).height(), $(window).height());
        if(h != docHeight){
          docHeight = h;
          this.footerResizer();
        }
      },250);
      Footer.resizerSet = true;
    }
  }

  footerResizer(){
    let h = Math.max($(document).height(), $(window).height());
    let fHeight = $('footer').height();
    $('main').css('margin-bottom', h <= $(window).height() ? 0 : fHeight);
  }



  toggleShowing(el){
    this.showing = !this.showing;
    setTimeout(()=>{
      $('main').css('margin-bottom', $('footer').height());
      if(this.showing){
        $('body').animate({scrollTop: $('body').height()}, 1000);
      }
    },1);
  }

}
