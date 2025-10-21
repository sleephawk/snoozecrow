const packagesBottom = document.getElementById("packages");
const aboutTop = document.getElementById("about");
const projectsLeft = document.getElementById("projects");
const contactRight = document.getElementById("contact");

const crow = document.getElementById("container");
const canvas = document.getElementById("canvas");

const panels = document.getElementById("panels");

let debouncingAnimation = null;

const throttle = (mainFunction, delay) => {
  let timerFlag = null; // Variable to keep track of the timer

  // Returning a throttled version
  return (...args) => {
    if (timerFlag === null) { // If there is no timer currently running
      mainFunction(...args); // Execute the main function
      timerFlag = setTimeout(() => { // Set a timer to clear the timerFlag after the specified delay
        timerFlag = null; // Clear the timerFlag to allow the main function to be executed again
      }, delay);
    }
  };
}

const mouseOver = ({type, clientY, clientX, target}) => {
  const { body } = document;
  const { clientWidth, clientHeight } = body;

  let x, y;

  const { offsetWidth, offsetHeight} = target;

  const { left, top, width, height } = target.getBoundingClientRect();

  const reverse = -1;
  const settings = {
    max: 40,
  }

  x = clientX / clientWidth;
  y = clientY / clientHeight;

  x = Math.min(Math.max(x, 0), 1);
  y = Math.min(Math.max(y, 0), 1);

  let tiltX = (reverse * (settings.max - x * settings.max * 2)).toFixed(2);
  let tiltY = (reverse * (y * settings.max * 2 - settings.max)).toFixed(2);
  let angle = Math.atan2(clientX - (left + offsetWidth / 2), -(clientY - (top + offsetHeight / 2))) * (180 / Math.PI);

  body.style.setProperty( '--magnet-x', `${ (x * -100)}px` );
  body.style.setProperty( '--magnet-y', `${ (y * -100) }px` );
  body.style.setProperty( '--magnet-x-half', `${ (x * 20)}px` );
  body.style.setProperty( '--magnet-y-half', `${ (y * 20) }px` );
  body.style.setProperty( '--tilt-z', `${ (parseFloat(tiltX) + parseFloat(tiltY)) * 0.2 }deg` );
  //body.style.setProperty( '--tilt-x', `${ tiltX }deg` );
  //body.style.setProperty( '--tilt-y', `${ tiltY }deg` );
  body.style.setProperty( '--angle', `${ angle }px` );
}

const throttledMouseOver = throttle(mouseOver, 12);

const setPanel = (el, url, settings = {}) => {

  let defaultSettings = {
    bottom: 'auto',
    left: 'auto',
    top: 'auto',
    right: 'auto',
    position: 'fixed',
    width: '100vw'
  }

  el.addEventListener("click", (event) => {

    if(document.getElementById("feature")) {
      panels.removeChild(document.getElementById("feature"));
    }

    throttledMouseOver({type: 'init', clientY: event.clientY, clientX: event.clientX, target: panels});

    if(!panels.dataset.perspective) {
      window.addEventListener('mousemove', throttledMouseOver);
      panels.dataset.perspective = 'active';
    }

    const {top, left, right, bottom, width, position} = Object.assign(defaultSettings, settings);

    const img = document.createElement("img");
    img.addEventListener('load', () => {
      img.classList.add('active');
    });
    img.setAttribute("id", "feature");
    img.setAttribute("src", url);
    img.setAttribute("draggable", "false");
    img.style.bottom = bottom;
    img.style.right = right;
    img.style.top = top;
    img.style.left = left;
    img.style.width = width;
    img.style.position = position;
    crow.style.opacity = 0;
    canvas.style.opacity = 0;
    panels.appendChild(img);
    console.log("we got there");
  });
};

const unsetPanel = () => {
  panels.innerHTML = '';
  window.removeEventListener('mouseenter', throttledMouseOver);
  window.removeEventListener('mousemove', throttledMouseOver);
  window.removeEventListener('mouseleave', throttledMouseOver);
  delete panels.dataset.perspective;
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('braindbird-loaded')
  setPanel(packagesBottom, "assets/images/panels/3D/lighthouse.png", {
    bottom: '-100px',
    width: '110vw'
  });
  setPanel(aboutTop, "assets/images/panels/3D/cave-render.png", {
    bottom: 0
  });
  setPanel(projectsLeft, "assets/images/panels/3D/cave-left-render.png", );
  setPanel(contactRight, "assets/images/panels/3D/mountain-render.png", {
    bottom: '-6vw',
    right: '-3vw',
    width: '110vw'
  });
});
