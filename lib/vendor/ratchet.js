/**
 * ==================================
 * Ratchet v1.0.0
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 * ==================================
 */

/* ----------------------------------
 * POPOVER v1.0.0
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 * ---------------------------------- */

// !function () {

//   var popover;

//   var findPopovers = function (target) {
//     var i, popovers = document.querySelectorAll('a');
//     for (; target && target !== document; target = target.parentNode) {
//       for (i = popovers.length; i--;) { if (popovers[i] === target) return target; }
//     }
//   };

//   var onPopoverHidden = function () {
//     document.body.removeChild(backdrop);
//     popover.style.display = 'none';
//     popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
//   }

//   var backdrop = function () {
//     var element = document.createElement('div');

//     element.classList.add('backdrop');

//     element.addEventListener('touchend', function () {
//       popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
//       popover.classList.remove('visible');
//     });

//     return element;
//   }();

//   var getPopover = function (e) {
//     var anchor = findPopovers(e.target);

//     if (!anchor || !anchor.hash) return;

//     popover = document.querySelector(anchor.hash);

//     if (!popover || !popover.classList.contains('popover')) return;

//     return popover;
//   }

//   window.addEventListener('touchend', function (e) {
//     var popover = getPopover(e);

//     if (!popover) return;

//     popover.style.display = 'block';
//     popover.offsetHeight;
//     popover.classList.add('visible');

//     popover.parentNode.appendChild(backdrop);
//   });

//   window.addEventListener('click', function (e) { if (getPopover(e)) e.preventDefault(); });

// }();
/* ----------------------------------
 * TABS v1.0.0
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 * ---------------------------------- */

!function () {
  var getTarget = function (target) {
    var i, popovers = document.querySelectorAll('.segmented-controller li a');
    for (; target && target !== document; target = target.parentNode) {
      for (i = popovers.length; i--;) { if (popovers[i] === target) return target; }
    }
  };

  window.addEventListener("touchend", function (e) {
    var activeTab;
    var activeBody;
    var targetBody;
    var targetTab;
    var className     = 'active';
    var classSelector = '.' + className;
    var targetAnchor  = getTarget(e.target);

    if (!targetAnchor) return;

    targetTab = targetAnchor.parentNode;
    activeTab = targetTab.parentNode.querySelector(classSelector);

    if (activeTab) activeTab.classList.remove(className);

    targetTab.classList.add(className);

    if (!targetAnchor.hash) return;

    targetBody = document.querySelector(targetAnchor.hash);

    if (!targetBody) return;

    activeBody = targetBody.parentNode.querySelector(classSelector);

    if (activeBody) activeBody.classList.remove(className);

    targetBody.classList.add(className)
  });

  window.addEventListener('click', function (e) { if (getTarget(e.target)) e.preventDefault(); });
}();/* ----------------------------------
 * SLIDER v1.0.0
 * Licensed under The MIT License
 * Adapted from Brad Birdsall's swipe
 * http://opensource.org/licenses/MIT
 * ---------------------------------- */

!function () {

   var pageX;
   var pageY;
   var slider;
   var deltaX;
   var deltaY;
   var offsetX;
   var lastSlide;
   var startTime;
   var resistance;
   var sliderWidth;
   var slideNumber;
   var isScrolling;
   var scrollableArea;

   var getSlider = function (target) {
     var i, sliders = document.querySelectorAll('.slider ul');
     for (; target && target !== document; target = target.parentNode) {
       for (i = sliders.length; i--;) { if (sliders[i] === target) return target; }
     }
   }

   var getScroll = function () {
     var translate3d = slider.style.webkitTransform.match(/translate3d\(([^,]*)/);
     return parseInt(translate3d ? translate3d[1] : 0)
   };

   var setSlideNumber = function (offset) {
     var round = offset ? (deltaX < 0 ? 'ceil' : 'floor') : 'round';
     slideNumber = Math[round](getScroll() / ( scrollableArea / slider.children.length) );
     slideNumber += offset;
     slideNumber = Math.min(slideNumber, 0);
     slideNumber = Math.max(-(slider.children.length - 1), slideNumber);
   }

   var onTouchStart = function (e) {
     slider = getSlider(e.target);

     if (!slider) return;

     var firstItem  = slider.querySelector('li');

     scrollableArea = firstItem.offsetWidth * slider.children.length;
     isScrolling    = undefined;
     sliderWidth    = slider.offsetWidth;
     resistance     = 1;
     lastSlide      = -(slider.children.length - 1);
     startTime      = +new Date;
     pageX          = e.touches[0].pageX;
     pageY          = e.touches[0].pageY;

     setSlideNumber(0);

     slider.style['-webkit-transition-duration'] = 0;
   };

   var onTouchMove = function (e) {
     if (e.touches.length > 1 || !slider) return; // Exit if a pinch || no slider

     deltaX = e.touches[0].pageX - pageX;
     deltaY = e.touches[0].pageY - pageY;
     pageX  = e.touches[0].pageX;
     pageY  = e.touches[0].pageY;

     if (typeof isScrolling == 'undefined') {
       isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
     }

     if (isScrolling) return;

     offsetX = (deltaX / resistance) + getScroll();

     e.preventDefault();

     resistance = slideNumber == 0         && deltaX > 0 ? (pageX / sliderWidth) + 1.25 :
                  slideNumber == lastSlide && deltaX < 0 ? (Math.abs(pageX) / sliderWidth) + 1.25 : 1;

     slider.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';
   };

   var onTouchEnd = function (e) {
     if (!slider || isScrolling) return;

     setSlideNumber(
       (+new Date) - startTime < 1000 && Math.abs(deltaX) > 15 ? (deltaX < 0 ? -1 : 1) : 0
     );

     offsetX = slideNumber * sliderWidth;

     slider.style['-webkit-transition-duration'] = '.2s';
     slider.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';

     e = new CustomEvent('slide', {
       detail: { slideNumber: Math.abs(slideNumber) },
       bubbles: true,
       cancelable: true
     });

     slider.parentNode.dispatchEvent(e);
   };

   window.addEventListener('touchstart', onTouchStart);
   window.addEventListener('touchmove', onTouchMove);
   window.addEventListener('touchend', onTouchEnd);

}();
/* ----------------------------------
 * TOGGLE v1.0.0
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 * ---------------------------------- */

!function () {

  var start     = {};
  var touchMove = false;
  var distanceX = false;
  var toggle    = false;

  var findToggle = function (target) {
    var i, toggles = document.querySelectorAll('.toggle');
    for (; target && target !== document; target = target.parentNode) {
      for (i = toggles.length; i--;) { if (toggles[i] === target) return target; }
    }
  }

  window.addEventListener('touchstart', function (e) {
    e = e.originalEvent || e;

    toggle = findToggle(e.target);

    if (!toggle) return;

    var handle      = toggle.querySelector('.toggle-handle');
    var toggleWidth = toggle.offsetWidth;
    var handleWidth = handle.offsetWidth;
    var offset      = toggle.classList.contains('active') ? toggleWidth - handleWidth : 0;

    start     = { pageX : e.touches[0].pageX - offset, pageY : e.touches[0].pageY };
    touchMove = false;

    // todo: probably should be moved to the css
    toggle.style['-webkit-transition-duration'] = 0;
  });

  window.addEventListener('touchmove', function (e) {
    e = e.originalEvent || e;

    if (e.touches.length > 1) return; // Exit if a pinch

    if (!toggle) return;

    var handle      = toggle.querySelector('.toggle-handle');
    var current     = e.touches[0];
    var toggleWidth = toggle.offsetWidth;
    var handleWidth = handle.offsetWidth;
    var offset      = toggleWidth - handleWidth;

    touchMove = true;
    distanceX = current.pageX - start.pageX;

    if (Math.abs(distanceX) < Math.abs(current.pageY - start.pageY)) return;

    e.preventDefault();

    if (distanceX < 0)      return handle.style.webkitTransform = 'translate3d(0,0,0)';
    if (distanceX > offset) return handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';

    handle.style.webkitTransform = 'translate3d(' + distanceX + 'px,0,0)';

    toggle.classList[(distanceX > (toggleWidth/2 - handleWidth/2)) ? 'add' : 'remove']('active');
  });

  window.addEventListener('touchend', function (e) {
    if (!toggle) return;

    var handle      = toggle.querySelector('.toggle-handle');
    var toggleWidth = toggle.offsetWidth;
    var handleWidth = handle.offsetWidth;
    var offset      = toggleWidth - handleWidth;
    var slideOn     = (!touchMove && !toggle.classList.contains('active')) || (touchMove && (distanceX > (toggleWidth/2 - handleWidth/2)));

    if (slideOn) handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';
    else handle.style.webkitTransform = 'translate3d(0,0,0)';

    toggle.classList[slideOn ? 'add' : 'remove']('active');

    e = new CustomEvent('toggle', {
      detail: { isActive: slideOn },
      bubbles: true,
      cancelable: true
    });

    toggle.dispatchEvent(e);

    touchMove = false;
    toggle    = false;
  });

}();
