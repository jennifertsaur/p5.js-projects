let historicalData;
let currentData = null;
let slider;
let ticksLayer;
let prevBtn, nextBtn;
let currentIndex = 0;
let mode = 'historical';
let currentLoading = false;
let currentError = null;

const lon=120.312;
const lat=22.6203;

const options = {
  lat: 0,
  lng: 0,
  zoom: 4,
  style: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

const mappa = new Mappa('Leaflet');
let myMap;
let canvas;

const AQI_pallet = {
  1: [0, 170, 0],      // Good   - green
  2: [140, 198, 63],   // Fair   - yellow-green
  3: [255, 215, 0],    // Moderate - yellow
  4: [255, 127, 0],    // Poor   - orange
  5: [153, 50, 204],   // Very Poor - purple
};

function preload() {
  historicalData = loadJSON('kaohsiung_air_last5d.json');
}
  
function setup() {
  canvas = createCanvas(1000, 600);

  options.lat = lat;
  options.lng = lon;
  options.zoom = 11;
  
  //Basemap (Mappa + Leaflet)
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  //Slider 
  slider = createSlider(0, historicalData.list.length-1, 0, 1);
  slider.id('aqiSlider'); 
  slider.input(() => { 
    currentIndex = Number(slider.value());
    redraw(); 
  });
  
   //Tick marks
  ticksLayer = createDiv().id('sliderTicks');   
  createTicks(historicalData); 
  
  prevBtn = select('#prevBtn');
  nextBtn = select('#nextBtn');
  
  prevBtn.mousePressed(() => stepIndex(-1));   
  nextBtn.mousePressed(() => stepIndex(+1));   
  myMap.onChange(redraw);

  noLoop();
  redraw();
  
  //fetchHistoricalData();
  fetchCurrentData();
  
  }

async function fetchCurrentData() {
  if (currentLoading) return;
  currentLoading = true;
  currentError = null;
  
  const apiKey = 'bdf6eeb6e3abbd8875c6da58784debfa';
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  console.log('Fetching:', url);
  currentLoading = true;
  currentError = null;
  
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ${res.status}');
      return res.json();
  })
     .then(data => {
      console.log('Raw data:', data);
      const rec = data?.list?.[0];
      if (!rec) {
        currentError = 'No current data returned';
        currentData = null;
      } else {
        currentData = rec;
      }
      currentLoading = false;
      redraw && redraw();
    })
    .catch(err => {
      console.error('Fetch failed:', err);
      currentError = String(err);
      currentLoading = false;
      redraw && redraw();
    });
}
  
function handleCrrentdata(data) {
if (!data || !data.list || !data.list.length) {
    console.error('No data returned from API');
    return;
  }
  currentData = data.list[0];
  console.log('Current data stored:', currentData);
}  

//slider step
function stepIndex(delta) {
  const max = historicalData.list.length - 1;
  let next = currentIndex + delta;
  
  if (next < 0) next = 0;
  if (next > max) next = max;
  
  currentIndex = next;
  slider.value(next);
  redraw();
}

// Helper: Taiwan-local time detector (UTC+8)
function isStartOfDayTaipei(dtSec) {
  const d = new Date(dtSec * 1000);
  const hhmmss = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(d); 
  return hhmmss === '00:00:00';
}

// Helper: align ticks overlay to the slider
function syncTickToSlider() {
  if (!slider || !ticksLayer) return;
  const elmt = slider.elt;                      
  const left = elmt.offsetLeft;                
  const width = elmt.offsetWidth;               
  const sliderBottom = parseInt(getComputedStyle(elmt).bottom);

  ticksLayer.style('position', 'fixed');
  ticksLayer.style('left', left + 'px');
  ticksLayer.style('width', width + 'px');
  ticksLayer.style('bottom', (sliderBottom +2) + 'px'); 
}

// Ticks built to Taiwan local time
function createTicks(data) {
  ticksLayer.html(''); 
  const list = data?.list || [];
  if (!list.length || !slider) return;

  syncTickToSlider();

  const t0 = list[0].dt;
  const t1 = list[list.length - 1].dt;
  const span = t1 - t0 || 1;

  // Collect tick timestamps by looping through array
  const tickTs = [];
  for (let i = 0; i < list.length; i++) {
    const dt = list[i].dt;
    if (i === 0 || isStartOfDayTaipei(dt)) tickTs.push(dt);
  }

  const trackW = slider.elt.offsetWidth; 
  const thumbW = 8;                    
  const halfThumbPx = thumbW / 2;

  // Create ticks
  tickTs.forEach((dt) => {
    const pct = (dt - t0) / span;             
    const xPx = pct * trackW + halfThumbPx;   

    const tick = createDiv().addClass('tick');
    tick.parent(ticksLayer);
    tick.style('left', xPx + 'px');

    const labelText = new Date(dt * 1000).toLocaleDateString('zh-TW', {
      timeZone: 'Asia/Taipei'
    });
    const label = createDiv(labelText).addClass('tickLabel');
    label.parent(ticksLayer);
    label.style('left', xPx + 'px');
  });
}

function renderRecordText(x, y, rec) {
  const c = rec.components;
  const dateTW = new Date(rec.dt * 1000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

  const pollutants =
    `- CO:      ${fmt(c.co)}\n` +
    `- NO:      ${fmt(c.no)}\n` +
    `- NO₂:     ${fmt(c.no2)}\n` +
    `- O₃:        ${fmt(c.o3)}\n` +
    `- SO₂:      ${fmt(c.so2)}\n` +
    `- PM2.5: ${fmt(c.pm2_5)}\n` +
    `- PM10:   ${fmt(c.pm10)}\n` +
    `- NH₃:      ${fmt(c.nh3)}`;

  push();
  textFont('Inter');
  textSize(14);
  textLeading(18);
  noStroke();
  fill(0);

  // Date and time
  textStyle(BOLD);
  text('Date/Time (Taipei):', x, y);
  textStyle(NORMAL);
  text(dateTW, x, y + 18);

  // AQI
  textStyle(BOLD);
  text('AQI:', x, y + 45);
  textStyle(NORMAL);
  text(rec.main.aqi, x + 45, y + 45);
  push();
  drawAqiChip(x + 40, y + 45, rec.main.aqi, String(rec.main.aqi));
  pop();

  // Particle components 
  textStyle(BOLD);
  text('Particle components (µg/m³):', x, y + 75);
  textStyle(NORMAL);
  text(pollutants, x, y + 95, 280, 300);

  pop();
}


function fmt(v) {
  return (v == null || Number.isNaN(v)) ? '—' : Number(v).toFixed(1);
}
  
function draw() {
  clear();
  if (!myMap || !historicalData?.list?.length) return;
  const pt  = myMap.latLngToPixel(lat, lon);
  
  textbox();
  
  if (mode ==='historical') {
    const rec = historicalData.list[currentIndex];
    renderRecordText(60, 60, rec);
    drawAqiCloud(pt.x, pt.y, rec.main.aqi);
  }
  else {
    push();
    textFont('Inter');
    fill(0);
    textSize(14);

    if (currentLoading) {
      text('Loading current air quality…', 60, 60);
    } else if (currentError) {
      text(`Error: ${currentError}`, 60, 60, 280, 200);
    } else if (currentData) {
    renderRecordText(60, 60, currentData);
    if (currentData.main?.aqi) drawAqiCloud(pt.x, pt.y, currentData.main.aqi);
}

pop();
  }
  
  toggleButton1();
  toggleButton2();
  
  //Marker for Kaohsiung
  noStroke();
  fill(255, 0, 0);         
  ellipse(pt.x, pt.y, 16);  

  fill(0);
  textSize(16);
  textFont('Inter');  
  text('Kaohsiung', pt.x + 10, pt.y -5);
}

function textbox() {
  fill(255);
  stroke(150);
  strokeWeight(3);
  rect(50, 40, 240, 270);
}

function aqiColor(aqi, alpha = 170) {
  const [r, g, b] = AQI_pallet[aqi];
  return color(r, g, b, alpha);
}

function drawAqiCloud(cx, cy, aqiIndex) {
  push();
  noStroke();
  
  for (let r = 400; r >= 40; r -= 25) {
    const a = map(r, 30, 200, 10, 50, true);
    fill(aqiColor(aqiIndex, a));
    circle(cx, cy, r);
  }
  pop();
}

function toggleButton1() {
  stroke(190);
  strokeWeight(5);
  fill(mode === 'historical' ? color(90): color(140));
  ellipse(60, 400, 15)
  
  noStroke();
  fill(0);
  textSize(12);
  textFont('Inter'); 
  push();
  textAlign(LEFT, CENTER);
  text('Historical Air Quality Data', 80, 400); 
  pop();
}
  
function toggleButton2() {
  stroke(190);
  strokeWeight(5);
  fill(mode === 'current' ? color(90) : color(140));
  ellipse(60, 450, 15)
  
  noStroke();
  fill(0);
  textSize(12);
  textFont('Inter'); 
  push();
  textAlign(LEFT, CENTER);
  text('Current Air Quality Data', 80, 450); 
  pop();
}
  
function mouseClicked() {
  const clicked1 = dist(mouseX, mouseY, 60, 400);
  const clicked2 = dist(mouseX, mouseY, 60, 450);
  
  if (clicked1 < 7) {
    mode = 'historical'
    redraw && redraw();
    return;
  } 
  if (clicked2 < 7) {
    mode = 'current';
    if (!currentData && !currentLoading) fetchCurrentData();
    else redraw && redraw();
    return;
  }
}
function drawAqiChip(x, y, aqiIndex, textStr) {
  const [r, g, b] = AQI_pallet[aqiIndex] || [128, 128, 128];

  push();
  textFont('Inter');
  textSize(14);
  
  const chipX = 8;
  const chipY = 2; 
  const textW = textWidth(textStr);
  const textH = textAscent() + textDescent();
  const boxW = textW + chipX * 2;
  const boxH = textH + chipY * 2;
  const boxY = y - textAscent() - chipY;

  // Color chip
  noStroke();
  fill(r, g, b);
  rect(x, boxY, boxW, boxH, 4); 

  // Draw the AQI number on top
  fill(255); 
  text(textStr, x + chipX, y);

  pop();
}