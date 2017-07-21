(()=>{

  function animatedScrollTo(yPos, ms = 500, stepSize = 1){
    yPos = Math.round(yPos);
    stepSize = Math.max(1, stepSize);
    let currentY = window.pageYOffset;
    if (currentY - yPos == 0){
      window.scrollTo(window.scrollX, yPos);
      return;
    }
    let steps = Math.max(1, Math.abs((yPos - currentY))/stepSize);
    let expectedY = currentY;
    if(yPos < currentY){stepSize = -stepSize;}
    let interval = setInterval(()=>{
      window.scrollBy(0,stepSize);
      expectedY += stepSize;
      if(--steps < 1) {
        // Last step should set scroll to the exact goal
        window.scrollTo(window.scrollX, yPos);
        clearInterval(interval);
      } else if(expectedY != window.pageYOffset){
        // user scrolls
        clearInterval(interval);
      }
    },ms/steps);
  }

  $.fn.scrollTo = function(ms = 500, stepSize = 10, offset = 0){
    let me = $(this);
    if (me.length) { animatedScrollTo(me.offset().top + offset, ms, stepSize); }
  };
})();