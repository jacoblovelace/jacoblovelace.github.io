
// TITLE SCREEN
var welcome = document.getElementById('welcome-screen');
var container = document.getElementById('container');
var content = document.getElementById('content');
var nav = document.getElementById('nav');
var footer = document.getElementById('footer');

function adjustBackgroundBrightness() {

  const headerRect = welcome.getBoundingClientRect();
  const footerRect = footer.getBoundingClientRect();

  const lowestBrightness = 10;
  const highestBrightness = 40;

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
}

// Arrow animation on title screen
document.addEventListener("DOMContentLoaded", function() {


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
  setInterval(animateArrow, 1500); // new arrow every 1.5 seconds
});

// darken screen effect
document.addEventListener("scroll", function() {

  adjustBackgroundBrightness();
})


// TOGGLE CARDS
// ensure only one box can be open at a time
$(".box").click(function() {
  if ($(this).not('open')) {
    $(this).addClass('open');
    $(".box").not(this).removeClass('open')
  } 
});

// MOUSE OVER CARD ROTATION ANIMATION
// Script outline from: https://codepen.io/armandocanals/pen/WWXZMB

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


// RESET CARD ROTATION

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
