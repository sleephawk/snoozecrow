document.addEventListener('DOMContentLoaded', () => {

  const menuLinks = document.querySelectorAll('#menu-list a');
  const contentBox = document.getElementById('content-box');
  const panelsContent = contentBox && contentBox.querySelectorAll('section');

  const crow = document.getElementById("container");
  const canvas = document.querySelector("canvas");

  const main = document.querySelector("main");

  const panels = document.getElementById("panels");

  const intro = document.querySelector('header h1 span.by');
  let currentColor = 'white';
  let byAnimation = true;
  const stopRender = new CustomEvent("stopRender");

  const dataSources = document.querySelectorAll('[data-src]');

  if(dataSources.length) {
    function createObserver() {
      const options = {
        root: null,
        rootMargin: "0px",
      };

      return new IntersectionObserver(intersectionCallback, options);
    }
    const observer = createObserver();
    const intersectionCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let elem = entry.target;

          elem.src = elem.dataset.src;
          observer.unobserve(elem);
        }
      });
    };
    dataSources.forEach((dataSource) => {
      dataSource.classList.add('observed');
      observer.observe(dataSource);
    });
  }

  const sliderNav = document.querySelectorAll('.slider__nav a');

  if(sliderNav.length) {
    sliderNav.forEach((sliderNavItem) => {
      sliderNavItem.addEventListener('click', (e) => {
        e.preventDefault();
        const {href} = e.target;
        if(href) {
          let linkHash = href.substring(href.indexOf("#"));
          const targetScroll = document.querySelector(linkHash);
          targetScroll && targetScroll.scrollIntoView({behavior: "smooth", container: "nearest", block: "nearest", inline: "nearest"});
        }
      });
    });
  }

  const colors = [
    'white',
    '#03ffff',
    '#033535',
    '#62c6c6',
    '#709393'
  ]

  const animationColours = (init = false) => {
    if (byAnimation || init) {
      let index;
      index = colors.indexOf(currentColor);

      if (colors.length === (index + 1)) {
        currentColor = colors[0];
      } else {
        if (index >= 0 && index < colors.length - 1) currentColor = colors[index + 1];
      }

      intro.style.setProperty('--next-color', currentColor);

      byAnimation = setInterval(animationColours, 4000);
    }
  }

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
    const {body} = document;
    const {clientWidth, clientHeight} = body;

    let x, y;

    const {offsetWidth, offsetHeight} = target;

    const {left, top, width, height} = target.getBoundingClientRect();

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

    body.style.setProperty('--magnet-x', `${(x * -100)}px`);
    body.style.setProperty('--magnet-y', `${(y * -100)}px`);
    body.style.setProperty('--magnet-x-half', `${(x * 3)}px`);
    body.style.setProperty('--magnet-y-half', `${(y * 3)}px`);
    body.style.setProperty('--shadow-x', `${(x * -20)}px`);
    body.style.setProperty('--shadow-y', `${(y * -20)}px`);
    body.style.setProperty('--tilt-z', `${(parseFloat(tiltX) + parseFloat(tiltY)) * 0.2}deg`);
    //body.style.setProperty( '--tilt-x', `${ tiltX }deg` );
    //body.style.setProperty( '--tilt-y', `${ tiltY }deg` );
    body.style.setProperty('--angle', `${angle}px`);
  }

  const throttledMouseOver = throttle(mouseOver, 9);

  const setPanel = (el, settings = {}, hash) => {

    let defaultSettings = {
      image: null,
      bottom: 'auto',
      left: 'auto',
      top: 'auto',
      right: 'auto',
      position: 'fixed',
      width: '100vw'
    };

    el.addEventListener("click", (event) => {
      event.preventDefault();
      menuLinks.forEach((menuLink) => {
        menuLink.classList.remove('active');
      })

      el.classList.add('active');


      const activeContent = document.querySelector(hash);
      const {documentElement} = document;
      let initTimeout = 1500;

      if (!documentElement.classList.contains('panels-active')) {
        initTimeout = 2500;
        documentElement.classList.add('panels-active');
        window.dispatchEvent(stopRender);
      }


      if (!document.body.classList.contains('panels-activating')) {
        document.body.classList.add('panels-activating');
        setTimeout(() => {
          document.body.classList.remove('panels-activating');
        }, 500);
      }

      byAnimation = null;

      if (document.getElementById("feature")) {
        panels.removeChild(document.getElementById("feature"));
      }

      throttledMouseOver({type: 'init', clientY: event.clientY, clientX: event.clientX, target: panels});

      if (!panels.dataset.perspective) {
        window.addEventListener('mousemove', throttledMouseOver);
        panels.dataset.perspective = 'active';

      }

      if (settings.image) {
        const {top, left, right, bottom, width, position} = Object.assign(defaultSettings, settings);

        const img = document.createElement("img");
        img.addEventListener('load', () => {
          img.classList.add('active');
        });
        img.setAttribute("id", "feature");
        img.setAttribute("src", settings.image);
        img.setAttribute("draggable", "false");
        img.style.bottom = bottom;
        img.style.right = right;
        img.style.top = top;
        img.style.left = left;
        img.style.width = width;
        img.style.position = position;
        panels.appendChild(img);
      }

      panelsContent.forEach((item) => {
        item.setAttribute('hidden', 'true');
      });

      setTimeout(() => {
        activeContent.removeAttribute('hidden');
      }, initTimeout);

      contentBox.click();
    });
  };

  const unsetPanel = () => {
    panels.innerHTML = '';
    window.removeEventListener('mouseenter', throttledMouseOver);
    window.removeEventListener('mousemove', throttledMouseOver);
    window.removeEventListener('mouseleave', throttledMouseOver);
    delete panels.dataset.perspective;
  }


  document.documentElement.classList.add('braindbird-loaded');


  const panelsSettings = {
    '#packages': {
      image: "assets/images/panels/3D/lighthouse-better-angle.png",
      bottom: '-100px',
      left: '-5vw',
      right: '-5vw',
      width: '110vw'
    },
    '#about': {
      image: "assets/images/panels/3D/cave-render.png",
      top: 0,
      right: '-10vw',
      width: '102vw'
    },
    '#projects': {
      image: "assets/images/panels/3D/cave-left-render.png",
      bottom: '-6vh',
      left: '-2vw'
    },
    '#faqs': {
      image: "assets/images/panels/3D/mountain-render.png",
      bottom: '-10vh',
      right: '-3vw',
      width: '110vw'
    }
  }

  menuLinks.forEach((ele) => {
    let panelHash = ele.href.substring(ele.href.indexOf("#"));
    const panelSetting = panelsSettings[panelHash];
    setPanel(ele, panelSetting, panelHash);
  });

  animationColours(true);

});
