// load particles-js json config file
particlesJS.load('particles-js', 'particles.json', function() {
  console.log('callback - particles.js config loaded');
});

var welcome = document.getElementById('welcome-screen');
var container = document.getElementById('container');
var content = document.getElementById('content');
var nav = document.getElementById('nav');
var footer = document.getElementById('footer');

// Adjust brightness of background image based on position relative to header and footer elements
function adjustBackgroundBrightness() {

  const headerRect = welcome.getBoundingClientRect();
  const footerRect = footer.getBoundingClientRect();

  const lowestBrightness = 20;
  const highestBrightness = 50;

  let backgroundBrightness;

  // header in view, footer not in view
  if (headerRect.bottom > 0) {
    backgroundBrightness = highestBrightness - (headerRect.bottom / headerRect.height) * (highestBrightness - lowestBrightness);
  }
  // footer in view, header not in view
  else if (footerRect.top < footerRect.height) {
    backgroundBrightness = (footerRect.top / footerRect.height) * (highestBrightness - lowestBrightness) + lowestBrightness;
  }
  // otherwise
  else {
    backgroundBrightness = highestBrightness;
  }

  document.getElementById('body-bg').style.filter = `brightness(${backgroundBrightness}%)`;
  document.getElementById('particles-js').style.background = `rgba(${40 - (1 * backgroundBrightness)}, 0, ${120 - (3 * backgroundBrightness)}, 0.3)`;
}

// Start title screen arrow animation and adjust background brightness on DOM content load
document.addEventListener("DOMContentLoaded", function() {

  // repeating arrow animation
  function animateArrow() {
      var downArrow = document.getElementById("down-arrow");

      // delete prev child before creating a new one
      var animatedArrows = downArrow.querySelectorAll("#animated-arrow");
      animatedArrows.forEach(function(arrow) {
      downArrow.removeChild(arrow);
      });

      // clone arrow with new id and append as child to original arrow
      var animatedArrow = downArrow.cloneNode(true);
      animatedArrow.setAttribute("id", "animated-arrow");
      downArrow.appendChild(animatedArrow);

      animatedArrow.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(25px)' }
      ], {
      duration: 1500,
      fill: 'forwards'
      });
  }

  adjustBackgroundBrightness();
  setInterval(animateArrow, 1500);
});

// Adjust background brightness as needed on scroll events
document.addEventListener("scroll", function() {
  adjustBackgroundBrightness();
})

// TOGGLE BOX
// Ensure only one toggle box can be open at a time on click event
$(".box").click(function() {
  if ($(this).not('open')) {
    $(this).addClass('open');
    $(".box").not(this).removeClass('open')
  } 
});

// MOUSE OVER CARD ROTATION ANIMATION
// Script based off of: https://codepen.io/armandocanals/pen/WWXZMB

let constrain = 50;
let mouseOverContainers = document.getElementsByClassName("project-card");
let layers = document.getElementsByClassName("project-card")

function transforms(x, y, el) {
  let box = el.getBoundingClientRect();
  let calcX = -(y - box.y - (box.height / 2)) / constrain;
  let calcY = (x - box.x - (box.width / 2)) / constrain;
  
  return "perspective(100px) "
    + "   rotateX("+ calcX +"deg) "
    + "   rotateY("+ calcY +"deg) ";
};

function transformElement(el, xyEl) {
  el.style.transform  = transforms.apply(null, xyEl);
}

for (let i = 0; i < layers.length; i++) {
  mouseOverContainers[i].onmousemove = function(e) {
    let xy = [e.clientX, e.clientY];
    let position = xy.concat([layers[i]]);

    window.requestAnimationFrame(function() {
      transformElement(layers[i], position);
    });
  };
}

// RESET CARD ROTATION ON MOUSELEAVE

function resetTransforms(x, y, el) {
  return "perspective(100px) "
    + "   rotateX(0deg) "
    + "   rotateY(0deg) ";
};

function resetElement(el, xyEl) {
  el.style.transform  = resetTransforms.apply(null, xyEl);
}

for (let i = 0; i < layers.length; i++) {
  mouseOverContainers[i].onmouseleave = function(e) {
    let xy = [e.clientX, e.clientY];
    let position = xy.concat([layers[i]]);

    window.requestAnimationFrame(function() {
      resetElement(layers[i], position);
    });
  };
}
