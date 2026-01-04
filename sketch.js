let lastLoggedMinute = null;
let currentHourSlice = null;

let pepperoniMin = [];
let pepperSec = [];

function setup() {
  createCanvas(720, 720);
  angleMode(RADIANS);

  currentHourSlice = getHourSlice();
  rebuildToppings(currentHourSlice);
}

function draw() {
  background(15, 15, 20);

  const m = minute();
  const s = second();

  if (lastLoggedMinute === null) lastLoggedMinute = m;
  if (m !== lastLoggedMinute) {
    console.log(m);
    lastLoggedMinute = m;
  }

  const hourSlice = getHourSlice();
  if (hourSlice !== currentHourSlice) {
    currentHourSlice = hourSlice;
    rebuildToppings(currentHourSlice);
  }

  translate(width / 2, height / 2);

  const R = min(width, height) * 0.36;
  const crustR = R * 1.09;
  const plateR = R * 1.34;

  noStroke();
  fill(0, 0, 0, 90);
  ellipse(10, 16, plateR * 2);

  fill(240, 240, 245, 30);
  ellipse(0, 0, plateR * 2);

  fill(196, 140, 70);
  ellipse(0, 0, crustR * 2);

  fill(245, 214, 120);
  ellipse(0, 0, R * 2);

  fill(210, 85, 70, 35);
  ellipse(0, 0, R * 1.75);

  fill(210, 85, 70, 20);
  ellipse(0, 0, R * 1.45);

  cutMissingSlice(currentHourSlice, plateR);
  drawSliceLines(R, currentHourSlice);

  drawPepperoni(m, R);
  drawGreenPeppers(s, R);
}

function getHourSlice() {
  const h24 = hour();
  const h12 = (h24 % 12 === 0) ? 12 : (h24 % 12);
  return h12 - 1;
}

function rebuildToppings(hourSlice) {
  pepperoniMin = generateValidSpots(60, 0.18, 0.86, 2026, hourSlice, 0.11);
  pepperSec = generateValidSpots(60, 0.22, 0.90, 7071, hourSlice, 0.075)
    .map(p => ({
      x: p.x,
      y: p.y,
      rot: random(-PI, PI),
      size: random(10, 16)
    }));
}

function cutMissingSlice(hourSlice, r) {
  const a0 = -HALF_PI + hourSlice * TWO_PI / 12;
  const a1 = a0 + TWO_PI / 12;
  noStroke();
  fill(15, 15, 20);
  drawWedge(0, 0, r, a0, a1);
}

function drawSliceLines(R, hourSlice) {
  stroke(120, 80, 40, 140);
  strokeWeight(3);

  for (let i = 0; i < 12; i++) {
    if (i === hourSlice || i === (hourSlice + 1) % 12) continue;
    const a = -HALF_PI + i * TWO_PI / 12;
    line(cos(a) * R * 0.1, sin(a) * R * 0.1, cos(a) * R, sin(a) * R);
  }

  noStroke();
}

function drawPepperoni(minVal, R) {
  fill(190, 40, 35);
  noStroke();
  for (let i = 0; i < min(minVal, pepperoniMin.length); i++) {
    const p = pepperoniMin[i];
    ellipse(p.x * R, p.y * R, 26);
  }
}

function drawGreenPeppers(secVal, R) {
  noFill();
  stroke(70, 190, 110);
  strokeWeight(3);
  strokeCap(ROUND);

  for (let i = 0; i < min(secVal, pepperSec.length); i++) {
    const p = pepperSec[i];
    push();
    translate(p.x * R, p.y * R);
    rotate(p.rot);
    drawPepper(p.size);
    pop();
  }

  noStroke();
}

function drawPepper(sz) {
  beginShape();
  curveVertex(-sz * 0.55, 0);
  curveVertex(-sz * 0.55, 0);
  curveVertex(-sz * 0.25, -sz * 0.45);
  curveVertex(0, 0);
  curveVertex(sz * 0.25, sz * 0.45);
  curveVertex(sz * 0.55, 0);
  curveVertex(sz * 0.55, 0);
  endShape();
}

function drawWedge(cx, cy, r, a0, a1) {
  beginShape();
  vertex(cx, cy);
  for (let i = 0; i <= 60; i++) {
    const a = lerp(a0, a1, i / 60);
    vertex(cx + cos(a) * r, cy + sin(a) * r);
  }
  endShape(CLOSE);
}

function generateValidSpots(n, rMin, rMax, seed, hourSlice, minDist) {
  randomSeed(seed + hourSlice * 99991);
  const spots = [];

  while (spots.length < n) {
    const a = random(TWO_PI);
    const rr = sqrt(random(rMin * rMin, rMax * rMax));
    const x = cos(a) * rr;
    const y = sin(a) * rr;

    if (isInMissingSlice(x, y, hourSlice)) continue;

    let ok = true;
    for (let s of spots) {
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy < minDist * minDist) {
        ok = false;
        break;
      }
    }

    if (ok) spots.push({ x, y });
  }

  return spots;
}

function isInMissingSlice(nx, ny, hourSlice) {
  const angle = normalizeAngle(atan2(ny, nx));
  const a0 = normalizeAngle(-HALF_PI + hourSlice * TWO_PI / 12);
  const a1 = normalizeAngle(a0 + TWO_PI / 12);
  return a0 <= a1 ? angle >= a0 && angle <= a1 : angle >= a0 || angle <= a1;
}

function normalizeAngle(a) {
  let x = a % TWO_PI;
  if (x < 0) x += TWO_PI;
  return x;
}