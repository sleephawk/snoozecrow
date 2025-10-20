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
