// in navbar, select all other items besides hovered item and decrease opacity

const items = document.querySelectorAll('.nav-item');

items.forEach(item => {
  item.addEventListener('mouseenter', (event) => {
    items.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.add('not-hovered');
      }
    });
  });

  item.addEventListener('mouseleave', (event) => {
    items.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('not-hovered');
      }
    });
  });
});

// add class sticky to navbar when it touches top of screen

var navbar = document.getElementById("navbar");
var sticky = navbar.offsetTop;

window.onscroll = function() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
};

// fade in animation when item is in viewport

function isElementInViewport(element) {
  var rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

var fadeElements = document.querySelectorAll('.skills-container p');

function handleFadeElements() {
  for (var i = 0; i < fadeElements.length; i++) {
    if (isElementInViewport(fadeElements[i])) {
      console.log('in view!')
      fadeElements[i].classList.add('fade-in');
    }
    
  }
}

window.addEventListener('scroll', handleFadeElements);
window.addEventListener('resize', handleFadeElements);

handleFadeElements();
