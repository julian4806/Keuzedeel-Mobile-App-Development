for (i = 0; i <= 100; i += 10) {
  console.log(color(i / 100));
}

function color(quality) {
  var h = 355 + 125 * quality;
  var s = 130 - 60 * quality;
  var l = 45 + Math.abs(0.5 - quality) * 30;
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}
