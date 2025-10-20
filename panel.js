const packagesBottom = document.getElementById("packages");
const aboutTop = document.getElementById("about");
const projectsLeft = document.getElementById("projects");
const contactRight = document.getElementById("contact");

const crow = document.getElementById("container");
const canvas = document.getElementById("canvas");

const panels = document.getElementById("panels");

const setPanel = (el, url, pos) => {
  el.addEventListener("click", () => {
    if (document.getElementById("feature")) {
      panels.removeChild(document.getElementById("feature"));
    }
    const img = document.createElement("img");
    img.setAttribute("id", "feature");
    img.setAttribute("src", url);
    img.setAttribute("draggable", "false");
    img.style.bottom = pos;
    img.style.width = "100vw";
    img.style.position = "fixed";
    crow.style.opacity = 0;
    canvas.style.opacity = 0;
    panels.appendChild(img);
    console.log("we got there");
  });
};

setPanel(packagesBottom, "assets/images/panels/3D/lighthouse.png", 0);
setPanel(aboutTop, "assets/images/panels/3D/cave-render.png", "inherit");
setPanel(projectsLeft, "assets/images/panels/3D/cave-left-render.png", 0);
setPanel(contactRight, "assets/images/panels/3D/mountain-render.png", 0);

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

const mouseOver = ({clientY, clientX, target}) => {
  const { body } = document;
  const { clientWidth, clientHeight } = body;

  let x, y;

  const { offsetWidth, offsetHeight} = target;
  const { left, top, width, height } = target.getBoundingClientRect();

  const reverse = -1;
  const settings = {
    max: 50,
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
  //document.body.style.setProperty( '--tilt-x', `${ tiltX }deg` );
  //document.body.style.setProperty( '--tilt-y', `${ tiltY }deg` );
  //document.body.style.setProperty( '--angle', `${ angle }px` );
}

const throttledMouseOver = throttle(mouseOver, 12);

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('mousemove', throttledMouseOver);
});
