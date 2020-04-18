let
  W = window.innerWidth,
  H = window.innerHeight,
  Wi = W,
  _Data,
  Data,
  Dlng = 0,
  log = true,
  Prop = [
    // {
    //   v: 'total',
    //   l: 'Total',
    //   c: [128, 128, 128]
    // },
    // {
    //   v: 'negative',
    //   l: 'Negative',
    //   c: [255, 255, 255]
    // },
    {
      v: 'positive',
      l: 'Positive',
      c: [255, 255, 0]
    },
    {
      v: 'hospitalized',
      l: 'Hospitalized',
      c: [0, 200, 255]
    },
    {
      v: 'death',
      l: 'Deaths',
      c: [255, 0, 128]
    },
    {
      v: 'recovered',
      l: 'Recovered',
      c: [0, 255, 128]
    },
  ],
  mmax = 0,
  mmin = Infinity,
  mxlog = 0,
  mxr = 0,
  Proj = [{}, {}, {}];

function preload() {
  let url = 'https://covidtracking.com/api/us/daily';
  _Data = loadJSON(url);
}

function setup() {
  Data = Object.values(_Data).reverse();
  noLoop();
  createCanvas(W, H);
  strokeJoin(MITER);
  noFill();
  Dlng = Data.length - 1;
  Data.map((D, i) => {
    Prop.map((P, j) => {
      minmax(D, P.v);
      P.finNum = Data[Dlng][P.v];
      P.finDif = (Data[Dlng][P.v] / Data[Dlng - 1][P.v] - 1) * 100;
      P.finDif_2 = (Data[Dlng - 1][P.v] / Data[Dlng - 2][P.v] - 1) * 100;
      P.finDif2 = P.finDif - P.finDif_2;
      // projection init
      Proj[0]['_' + P.v] = P.finNum;
      Proj[0]['_' + P.v + 'dif'] = Proj[0]['_' + P.v] / Data[Dlng - 1][P.v];
      Proj[0]['_' + P.v + 'dif2'] = Data[Dlng - 1][P.v] / Data[Dlng - 2][P.v];
      Proj[0]['_' + P.v + 'dif3'] = Proj[0]['_' + P.v + 'dif'] / Proj[0]['_' + P.v + 'dif2'];
      Proj[0]['_' + P.v + 'dif4'] = Proj[0]['_' + P.v + 'dif'] * Proj[0]['_' + P.v + 'dif3'];
      Proj[0][P.v] = Math.ceil(Proj[0]['_' + P.v] * Proj[0]['_' + P.v + 'dif4']);

      Proj[1]['_' + P.v] = Proj[0][P.v];
      Proj[1]['_' + P.v + 'dif'] = Proj[1]['_' + P.v] / Proj[0]['_' + P.v];
      Proj[1]['_' + P.v + 'dif2'] = Proj[0]['_' + P.v] / Data[Dlng - 1][P.v];
      Proj[1]['_' + P.v + 'dif3'] = Proj[1]['_' + P.v + 'dif'] / Proj[1]['_' + P.v + 'dif2'];
      Proj[1]['_' + P.v + 'dif4'] = Proj[1]['_' + P.v + 'dif'] * Proj[1]['_' + P.v + 'dif3'];
      Proj[1][P.v] = Math.ceil(Proj[1]['_' + P.v] * Proj[1]['_' + P.v + 'dif4']);

      Proj[2]['_' + P.v] = Proj[1][P.v];
      Proj[2]['_' + P.v + 'dif'] = Proj[2]['_' + P.v] / Proj[1]['_' + P.v];
      Proj[2]['_' + P.v + 'dif2'] = Proj[1]['_' + P.v] / Proj[0]['_' + P.v];
      Proj[2]['_' + P.v + 'dif3'] = Proj[2]['_' + P.v + 'dif'] / Proj[2]['_' + P.v + 'dif2'];
      Proj[2]['_' + P.v + 'dif4'] = Proj[2]['_' + P.v + 'dif'] * Proj[2]['_' + P.v + 'dif3'];
      Proj[2][P.v] = Math.ceil(Proj[2]['_' + P.v] * Proj[2]['_' + P.v + 'dif4']);
    });
  });

  // projection
  for (let i = 3; i <= 7 * 6 - 1; i++) {
    Proj.push({});
    Prop.map((P, j) => {
      Proj[i]['_' + P.v] = Proj[i - 1][P.v];
      Proj[i]['_' + P.v + 'dif'] = Proj[i]['_' + P.v] / Proj[i - 1]['_' + P.v];
      Proj[i]['_' + P.v + 'dif2'] = Proj[i - 1]['_' + P.v] / Proj[i - 2]['_' + P.v];
      // Proj[i]['_' + P.v + 'dif3'] = Proj[i]['_' + P.v + 'dif'] - Proj[i]['_' + P.v + 'dif2'];
      // Proj[i]['_' + P.v + 'dif4'] = Proj[i]['_' + P.v + 'dif'] + Proj[i]['_' + P.v + 'dif3'];
      Proj[i]['_' + P.v + 'dif3'] = Proj[i]['_' + P.v + 'dif'] / Proj[i]['_' + P.v + 'dif2'];
      Proj[i]['_' + P.v + 'dif4'] = Proj[i]['_' + P.v + 'dif'] * Proj[i]['_' + P.v + 'dif3'];
      Proj[i][P.v] = Math.ceil(Proj[i]['_' + P.v] * Proj[i]['_' + P.v + 'dif4']);
    });
  }
  console.log(Proj)
  // scales
  Wi = W / (Data.length + Proj.length);
  mxlog = Math.ceil(Math.log10(mmax)) + 1;
  mxr = Math.pow(10, mxlog);
}

function minmax(D, T) {
  if (T != '') {
    mmax = Math.max(mmax, D[T]);
    if (D[T]) {
      mmin = Math.min(mmin, D[T]);
    }
  }
}

function draw() {
  background(10);
  push();
  noStroke();
  fill(255, 255, 255, 96);
  textAlign(RIGHT);
  textSize(36);
  text('CoVid-19 USA', W - 32, H - 50)
  textSize(18);
  text('Projection Model', W - 32, H - 32)
  pop();

  push();
  Prop.map((P, j) => {
    beginShape();
    noFill();
    stroke(round(P.c[0] / 2), round(P.c[1] / 2), round(P.c[2] / 2));
    vertex((Dlng) * Wi, HM(Data[Dlng][P.v]));
    Proj.map((m, i) => {
      vertex((i + Data.length) * Wi, HM(m[P.v]));
    });
    endShape();
  });
  pop();

  push();
  Prop.map((P, j) => {
    beginShape();
    noFill();
    stroke(P.c[0], P.c[1], P.c[2]);
    Data.map((m, i) => {
      vertex(i * Wi, HM(m[P.v]));
    });
    endShape();
  });
  pop();

  push();
  Prop.map((P, j) => {
    let vs = 20;
    let vm = 25;
    let hm = 10;
    noStroke();
    fill(P.c[0], P.c[1], P.c[2]);
    textAlign(RIGHT);
    text(P.l, 65 + hm, j * vs + vm);
    let dir = P.finDif > 0 ? '▲' : '▼';
    let _w = 128;
    text(formatCommas(P.finNum), _w + hm, j * vs + vm);
    textAlign(LEFT);
    _w = _w + 10
    text(dir + ' ' + abs(P.finDif.toFixed(2)) + '%', _w + hm, j * vs + vm);
    _w = _w + 57
    text('(' + P.finDif2.toFixed(3) + ')', _w + hm, j * vs + vm);
  });
  pop();

  Data.map((m, i) => {
    stroke(255, 255, 255, 16);
    line(i * Wi, 0, i * Wi, H);
    if (i % 7 == 0) {
      stroke(255, 255, 255, 64);
      line(i * Wi, 0, i * Wi, H);
      push();
      noStroke();
      fill(255, 255, 255, 32);
      textAlign(RIGHT)
      text(formatDate(m.date), i * Wi - 5, H - 10);
      pop();
    }
    if (i == Dlng) {
      stroke(255, 255, 255, 128);
      line(i * Wi, 0, i * Wi, H);
      push();
      noStroke();
      fill(255, 255, 255, 128);
      textAlign(RIGHT)
      text(formatDate(m.date), i * Wi - 5, H - 10);
      pop();
    }
  });

  Proj.map((m, i) => {
    let _i = i + Data.length;
    stroke(255, 255, 255, 16);
    line(_i * Wi, 0, _i * Wi, H);
    if (_i % 7 == 0) {
      stroke(255, 255, 255, 64);
      line(_i * Wi, 0, _i * Wi, H);
    }
  });

  for (let i = 0; i <= mxlog; i++) {
    let _i = Math.pow(10, i);
    let im;
    if (log) {
      im = map(i, 0, mxlog, H, 0);
    } else {
      im = map(_i, 0, mxr, H, 0);
    }
    push();
    noFill();
    stroke(255, 255, 255, 64);
    line(0, im, W, im);
    noStroke();
    fill(255, 255, 255, 64);
    textAlign(RIGHT)
    text(_i, W - 2, im + 11);
    pop();
  }
}

function HM(h) {
  let hl = h,
    ml = mxr;
  // hl = hl - mmin;
  // ml = ml - mmin;
  if (log) {
    hl = Math.log10(hl);
    ml = Math.log10(ml);
  }
  return H - (hl / ml) * H;
}

function formatCommas(x) {
  return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(t) {
  // let date = new Date(t);
  // let M = "0" + (date.getMonth() + 1);
  // let D = "0" + date.getDate();
  // let Y = date.getFullYear();
  // return M.substr(-2) + '/' + D.substr(-2) + '/' + Y;
  t = t.toString();
  return t.substring(4, 6) + '.' + t.substring(6, 8) + '.' + t.substring(0, 4);
}
