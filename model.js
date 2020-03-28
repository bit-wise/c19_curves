let w = {
  _11: window.innerWidth
};
let h = {
  _11: window.innerHeight
};
let mw = 700;
let d = 10; // density
let ir = 5; // infection radius
let im = mw/d/d; // init mobility
let mr = im; // mobility rate
let mo = ir * mr; // population mobility
let tr = 531865 / 596362; //transmission rate
let rr = 27 / 607; // mortality rate (% of infected)
let ip = 14; // infectious period
let pt = [
  [mw * d, 1, 0, 0]
];
let Pop = [];
let Data;

function populate(size) {
  let inf = Math.round(Math.random() * size);
  console.log(inf);
  for (let i = 0; i < size; i++) {
    Pop.push({
      x: Math.random() * mw,
      y: Math.random() * mw,
      s: 1,
      i: i == inf ? 1 : 0,
      rc: 0,
      rd: 0,
      d: 0, // infection duration
    });
  }
}

// function preload() {
//   let url = '/sketches/8FR4O6KDP/assets/corona.json';
//   Data = loadJSON(url);
// }

function setup() {
  _dimensions();
  populate(mw * d);
  createCanvas(w._11, h._11);
  frameRate(10);
  stroke(0);
  strokeWeight(2);
}

let _I = 0;

function draw() {
  ++_I;
  if (
    // _I > 0 ||
    _I > mw * 2 * d
  ) {
    noLoop();
  }
  background(20);
  push();
  translate(200 + mw, 100);
  let S = 0;
  let I = 0;
  let Rc = 0;
  let Rd = 0;
  let tPop = [];
  Pop.map((p, i) => {
    tPop[i] = JSON.parse(JSON.stringify(p));
    if (tPop[i].rd == 0) {
      tPop[i].x = p.x + random(-mo, mo);
      tPop[i].y = p.y + random(-mo, mo);
      if (tPop[i].rc == 1) {
        tPop[i].x = p.x + random(-mo, mo) * d;
        tPop[i].y = p.y + random(-mo, mo) * d;
      }
      if (tPop[i].i == 1) {
        tPop[i].x = p.x + random(-mo, mo) / d;
        tPop[i].y = p.y + random(-mo, mo) / d;
      }
      if (tPop[i].x < 0) {
        tPop[i].x = mw + (tPop[i].x % mw)
      }
      if (tPop[i].x > mw) {
        tPop[i].x = tPop[i].x % mw;
      }
      if (tPop[i].y < 0) {
        tPop[i].y = mw + (tPop[i].y % mw)
      }
      if (tPop[i].y > mw) {
        tPop[i].y = tPop[i].y % mw;
      }
      if (p.i == 1 || p.rc == 1) {
        tPop[i].d = p.d + 1;
      }
    } else {
      tPop[i].x = p.x;
      tPop[i].y = p.y;
    }
    // // re-sus
    // if (random() < 0.01 && p.rc == 1) {
    //   tPop[i].s = 1;
    //   tPop[i].rc = 0;
    // }
    // removed
    if (p.i == 1 && p.d > random(ip, ip * 2)) {
      // - deceased
      if (random() <= rr) {
        tPop[i].rd = 1;
        tPop[i].i = 0;
      }
      // - cured
      else {
        tPop[i].rc = 1;
        tPop[i].i = 0;
      }
    }
    // infected
    if (i > 0 && disti(p.x, p.y) && random() < tr && p.s == 1) {
      tPop[i].i = 1;
      tPop[i].s = 0;
    }
    S += tPop[i].s;
    I += tPop[i].i;
    Rc += tPop[i].rc;
    Rd += tPop[i].rd;
    if (p.s == 1) {
      stroke(0, 128, 255);
    }
    if (p.i == 1) {
      stroke(255, 128, 0);
    }
    if (p.rc == 1) {
      if (p.d < 28) {
        stroke(255, 0, 255);
      } else {
        stroke(0, 255, 128);
      }
    }
    if (p.rd == 1) {
      stroke(255, 0, 128);
    }
    point(p.x, p.y);
  });
  pt.push([S, I, Rc, Rd]);
  // console.log(pt[pt.length -1][1]);
  if (_I > ip) {
    mr = im / (pt[pt.length - 1][1] * 2);
    mo = ir * (mr / (1/_I));
  }
  pop();
  push();
  strokeWeight(1);
  translate(100, 100 + mw);
  pt.map((p, i) => {
    // console.log(p)
    let x = i * (mw / pt.length);
    stroke(0, 128, 255);
    point(x, -p[0] / d);
    stroke(255, 128, 0);
    point(x, -p[1] / d);
    stroke(0, 255, 128);
    point(x, -p[2] / d);
    stroke(255, 0, 128);
    point(x, -p[3] / d);

    if (p[1] == 0 && pt.length > 10) {
      noLoop();
    }
  });
  noStroke();
  fill(128);
  textAlign(RIGHT);
  text('Day ' + pt.length, mw, 20);
  fill(0, 128, 255);
  text('Susceptible ' + pt[pt.length - 1][0], mw, 50);
  fill(255, 128, 0);
  text('Infected ' + pt[pt.length - 1][1], mw, 70);
  fill(0, 255, 128);
  text('Recoverd ' + pt[pt.length - 1][2], mw, 90);
  fill(255, 0, 128);
  text('Deceased ' + pt[pt.length - 1][3], mw, 110);
  pop();
  Pop = JSON.parse(JSON.stringify(tPop));
}

function disti(x, y) {
  for (let j = 0; j < Pop.length - 1; j++) {
    let x2 = Math.abs(Pop[j].x - x);
    let y2 = Math.abs(Pop[j].y - y);
    if (
      x2 < ir && y2 < ir &&
      (Pop[j].i == 1 ||
        (Pop[j].rc == 1 && Pop[j].d < ip * 2 && random() > tr)
      )
    ) {
      return true;
    }
  }
  return false;
}

function _dimensions() {
  for (let i = 1; i < 9; i++) {
    for (let j = 1; j < 9; j++) {
      if (i < j) {
        w['_' + i + '' + j] = w._11 * i / j;
        h['_' + i + '' + j] = h._11 * i / j;
      }
    }
  }
}
