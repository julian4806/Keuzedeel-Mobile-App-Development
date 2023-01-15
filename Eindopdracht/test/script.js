const dot = document.querySelector(".dot");
const p = document.querySelector("p");
const move = 30;

const handleMotion = (e) => {
  const x = Math.round(e.accelerationIncludingGravity.x) * move;
  const y = Math.round(e.accelerationIncludingGravity.y) * move;
  const z = Math.round(e.accelerationIncludingGravity.z) * move;

  dot.style.transform = `translate3d(${-x}px, ${y}px, ${z}px)`;
  if (x < -60) {
    p.innerText = "right";
  } else if (x > 60) {
    p.innerText = "left";
  } else {
    p.innerText = "";
  }
};

window.addEventListener("devicemotion", handleMotion, true);

function direction(direction) {
  p.innerText = direction;
}
