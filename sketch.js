let Data, infected, deaths, curesR, cures, Population, population, epoch, day, projection, W, H, W2, H2, EV, M, HI, sinfected, sdeaths, scures, spopulation,
  imax = 0,
  dmax = 0,
  cmax = 0,
  pmax = 0,
  imin = Infinity,
  dmin = Infinity,
  cmin = Infinity,
  pmin = Infinity;

function preload() {
  let url = '/sketches/8FR4O6KDP/assets/corona.json';
  Data = loadJSON(url);
}

function setup() {
  infected = Data.infected;
  deaths = Data.deaths;
  curesR = Data.curesR;
  cures = [];
  Population = Data.Population;
  population = [];
  epoch = 1579564800000;
  day = 1579651200000 - epoch;
  projection = 365 * 3;
  W = window.innerWidth;
  H = window.innerHeight;
  W2 = W / 2;
  H2 = H / 2;
  H13 = H * 0.25;
  H23 = H * 0.75;
  EV = {};
  M = {};
  HI;
  sinfected = [];
  sdeaths = [];
  scures = [];
  spopulation = [];

  noLoop();
  createCanvas(W, H);
  strokeJoin(MITER);
  fill(240);
  stroke(255);
  dataSetup(infected, deaths, cures, population);
  infected.map((j, i) => {
    imax = Math.max(imax, infected[i]);
    imin = Math.min(imin, infected[i]);
  });
  deaths.map((j, i) => {
    dmax = Math.max(dmax, deaths[i]);
    dmin = Math.min(dmin, deaths[i]);
  });
  cures.map((j, i) => {
    cmax = Math.max(cmax, cures[i]);
    cmin = Math.min(cmin, cures[i]);
  });
  population.map((j, i) => {
    pmax = Math.max(pmax, population[i]);
    pmin = Math.min(pmin, population[i]);
  });
}

let EVI, EVD, EVR, POS, evr, acc;

function dataSetup(infected, deaths, cures, population) {
  let jfill = infected.length - deaths.length;
  for (let j = 0; j < jfill; j++) {
    deaths.unshift(0);
  }
  curesR.map((c) => {
    cures.push(c);
  })
  let kfill = infected.length - cures.length;
  for (let k = 0; k < kfill; k++) {
    cures.unshift(0);
  }

  // Simulation
  sinfected.push(infected[infected.length - 1]);
  sdeaths.push(deaths[deaths.length - 1]);
  scures.push(cures[cures.length - 1]);

  EVI = 1 - avgDelta(infected);
  EVD = 1 - avgDelta(deaths);
  EVR = 1 - avgDelta(cures);
  // effectiveness of viral infection (OR inverse human immunability).
  evr = deaths[deaths.length - 1] / deaths[deaths.length - 2] - 1;
  // access to hosts
  acc = infected[infected.length - 1] / infected[infected.length - 2] - 1;
  // incubation period, insufficient testing equip., unreported / misdiagnosed cases -- unknown factor 
  acc = acc * 5;
  console.log(evr, acc)
  for (let i = 1; i < projection; i++) {
    let S1 = sinfected.length - 1;
    // rates of decay
    // current population with growth rate (assuming cured cannot be reinfected)
    let ps = (Population * 1.05 * evr * acc) - (sinfected[S1]);
    // inverse probability of infection of current population
    let posi = 1 - sinfected[S1] / (ps);
    // inverse probability of death of current population
    let posd = 1 - sdeaths[S1] / (ps);
    // inverse probability of recovery of current population
    let posr = 1 - scures[S1] / (ps);
    // previous_inf * growth_rate * rate_decay
    sinfected.push(sinfected[i - 1] * (1 + EVI) * posi);
    sdeaths.push(sdeaths[i - 1] * (1 + EVD) * posd);
    scures.push(scures[i - 1] * (1 + EVR) * posr);

    if (scures[i] + sdeaths[i] >= sinfected[i]) {
      projection = i;
      break;
    }
    infected.push(sinfected[i]);
    deaths.push(sdeaths[i]);
    cures.push(scures[i]);
  }

  deaths.map((d) => {
    population.push(Population - d);
  });
}

function avgDelta(ary) {
  let s = 7;
  let r = 0;
  for (let i = 1; i <= s; i++) {
    r += ary[infected.length - i - 1] / ary[infected.length - i];
  }
  return r / s;
}

let actual = 0;

function draw() {
  background(32);
  push();
  textSize(18);
  textAlign(LEFT);
  noStroke();
  pop();
  push();
  textSize(24);
  textAlign(LEFT);
  noStroke();
  text("Coronavirus Projection Model", 10, 33);
  textSize(12);
  fill(200)
  actual = infected.length - projection;
  text(infected.length + " days (" + actual + " actual " + projection + " projected)", 10, 52)
  fill(0, 180, 255);
  text("Population Curve ", 10, 71);
  fill(255, 255, 0);
  text("Infection Curve (" + (EVI * 100).toFixed(2) + "% growth rate)", 10, 90);
  fill(0, 255, 128);
  text("Recovery Curve (" + (EVR * 100).toFixed(2) + "% growth rate)", 10, 109);
  fill(255, 0, 128);
  text("Mortality Curve (" + (EVD * 100).toFixed(2) + "% growth rate)", 10, 128);
  fill(180);
  textAlign(RIGHT);
  text("estimated efficiency: " + (evr * 100).toFixed(2) + "%", W - 10, 25)
  text("estimated transmissibility: " + (acc * 100).toFixed(2) + "%", W - 10, 40)
  pop();

  push();
  let os = 50;
  let _W = W / cures.length;
  let _H = (H - 100) / Math.ceil(Math.log10(Population * 2));
  noFill();
  stroke(255, 255, 255, 64);
  for (let i = 0; i < Math.ceil(Math.log10(Population * 2)); i++) {
    let _i = Math.pow(10, i);
    push();
    line(0, H - i * _H, W, H - i * _H);
    textSize(12);
    textAlign(RIGHT);
    noStroke();
    fill(255, 255, 255, 64);
    text(formatCommas(_i), W - 5, H - i * _H - 5);
    pop();
  }
  let _M = Math.ceil((infected.length) / 12);
  for (let i = 0; i < infected.length + 10; i++) {
    if (i % _M == 0) {
      push();
      line(i * _W, 140, i * _W, H);
      textSize(12);
      textAlign(RIGHT);
      noStroke();
      fill(255, 255, 255, 64);
      text(formatDate(epoch + i * day), i * _W - 2, 150);
      pop();
    }
    if (i === actual) {
      push();
      stroke(255, 255, 255, 180);
      line(i * _W, 174, i * _W, H);
      textSize(12);
      textAlign(RIGHT);
      noStroke();
      fill(255, 255, 255, 180);
      text("now\n" + formatDate(epoch + i * day), i * _W - 2, H - 20);
      pop();
    }
  }
  beginShape();
  population.map((m, i) => {
    // pop
    stroke(0, 180, 255);
    let _ho = H - Math.log10(m) * _H;
    vertex(i * _W, _ho);
    if (m == pmin) {
      push();
      stroke(0, 180, 255, 128);
      line(0, _ho, W, _ho);
      textSize(12);
      noStroke();
      fill(0, 180, 255, 128);
      text(formatCommas(m), 5, _ho - 4);
      pop();
    }
    if (i == actual) {
      push();
      stroke(0, 180, 255);
      strokeWeight(5);
      point(i * _W, _ho);
      textSize(12);
      textAlign(RIGHT);
      noStroke();
      fill(0, 180, 255);
      text(formatCommas(m), i * _W - 4, _ho + 14);
      pop();
    }
  });
  endShape();
  beginShape();
  infected.map((m, i) => {
    // inf
    stroke(255, 255, 0);
    let _ho = H - Math.log10(m) * _H;
    vertex(i * _W, _ho);
    if (m == imax) {
      push();
      stroke(255, 255, 0, 128);
      line(0, _ho, W, _ho);
      textSize(12);
      noStroke();
      fill(255, 255, 0, 128);
      if (imax / dmax < 1.1 && dmax > imax) {
        text(formatCommas(m), 5, _ho + 14);
      } else {
        text(formatCommas(m), 5, _ho - 4);
      }
      pop();
    }
    if (i == actual) {
      push();
      stroke(255, 255, 0);
      strokeWeight(5);
      point(i * _W, _ho);
      textSize(12);
      textAlign(RIGHT);
      noStroke();
      fill(255, 255, 0);
      text(formatCommas(m), i * _W - 4, _ho + 14);
      pop();
    }
  });
  endShape();
  beginShape();
  deaths.map((m, i) => {
    // dth
    stroke(255, 0, 128);
    let _ho = H - Math.log10(m) * _H;
    vertex(i * _W, _ho);
    if (m == dmax) {
      push();
      stroke(255, 0, 128, 128);
      line(0, _ho, W, _ho);
      textSize(12);
      noStroke();
      fill(255, 0, 128, 128);
      if (dmax / imax < 1.1 && imax > dmax) {
        text(formatCommas(m), 5, _ho + 14);
      } else {
        text(formatCommas(m), 5, _ho - 4);
      }
      pop();
    }
    if (i == actual) {
      push();
      stroke(255, 0, 128);
      strokeWeight(5);
      point(i * _W, _ho);
      textSize(12);
      textAlign(RIGHT);
      noStroke();
      fill(255, 0, 128);
      text(formatCommas(m), i * _W - 4, _ho + 14);
      pop();
    }
  });
  endShape();
  beginShape();
  cures.map((m, i) => {
    // rec
    stroke(0, 255, 128);
    let _ho = H - Math.log10(m) * _H;
    vertex(i * _W, _ho);
    if (m == cmax) {
      push();
      stroke(0, 255, 128, 128);
      line(0, _ho, W, _ho);
      textSize(12);
      noStroke();
      fill(0, 255, 128, 128);
      if (dmax / imax < 1.1 && imax > dmax) {
        text(formatCommas(m), 5, _ho + 14);
      } else {
        text(formatCommas(m), 5, _ho - 4);
      }
      pop();
    }
    if (i == actual) {
      push();
      stroke(0, 255, 128);
      strokeWeight(5);
      point(i * _W, _ho);
      textSize(12);
      textAlign(RIGHT);
      noStroke();
      fill(0, 255, 128);
      text(formatCommas(m), i * _W - 4, _ho + 14);
      pop();
    }
  });
  endShape();
}

function formatCommas(x) {
  return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(t) {
  let date = new Date(t);
  let M = "0" + (date.getMonth() + 1);
  let D = "0" + date.getDate();
  let Y = date.getFullYear();
  return M.substr(-2) + '/' + D.substr(-2) + '/' + Y;
}
