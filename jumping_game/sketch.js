var groundY = 170;   // top of the ground
var groundH = 30;    // ground thickness
var speed = -3;      // obstacle speed
var d = 20;          // player size (diameter)
var g = 0.9;         // gravity
var x;               // obstacle x
var y;               // player y (center)
var vy;              // player vertical velocity
var jump = 14;       //height of jump
let gameStarted = false; 
let frozen = false;
let skyOffset = 0;

function resolveCircleRectEdgeContact(cx, cy, r, rx, ry, rw, rh) {
  
  let nearestX = constrain(cx, rx, rx + rw);
  let nearestY = constrain(cy, ry, ry + rh);
  
  let dx = cx - nearestX;
  let dy = cy - nearestY;
  let distSq = dx*dx + dy*dy;    //squared distance found with Pythagoras
  
  //edge-contact resolution
  if (distSq > r*r) return { collided:false, rx, cy };      
  
  let distance = sqrt(distSq);
  
  let overlap = r - distance;
  let nx = dx / distance;         
  let ny = dy / distance;
  
  if(abs(dx) > abs(dy)) {   // checks whether horizontal or vertical collision
    rx -= nx * overlap;    //if horizontal, shift rx along x in the oposite direction of collision
  } else {
    cy += ny * overlap;    //if vertical, shift cy along y in the direction of collision
  }

  return { collided:true, rx, cy };
}

function setup() {
  createCanvas(500, 200);

  // starting positions
  x = width;               // obstacle 
  y = groundY - d/2;       // player
  vy = 0;                  // player on the ground
  frameRate(60);
  resetGame(true)
}

function draw() {
  background(25, 25, 45);
  
  //ground
  noStroke();
  fill(100);
  stroke(0)
  rect(0, groundY, width, groundH);
  
if (gameStarted === false) {
  showStartScreen();
  return;
}
  
  //jumping physics 
if (!frozen) {
  y += vy;
  if (y < groundY - d/2) {
    vy += g;               // gravity pulls down
  } else {
    vy = 0;
    y = groundY - d/2;     // clamp to ground only while NOT frozen
  }
   skyOffset += -speed;  
}
  
    
  //background stars
  fill(255);
  rect(40, 40, 5, 5);
  rect(width-80, 25, 5, 5);
  rect(200, 30, 5, 5);
  rect(100, 50, 5, 5);
  rect(300, 40, 5, 5);
  rect(250, 70, 5, 5);
  rect(350, 50, 5, 5);
  rect(480, 60, 5, 5);
  
  //windows + buildings
function Windows(bx, by, w, h, cols, rows) {
  
  //building objects
  stroke(0);
  strokeWeight(0.3);
  fill(40, 40, 40);
  rect(bx, by, w, h);
  
  //windows
  fill(255, 230, 120, 200);
  noStroke();
  
  let winW = w / (cols * 3);   // window width
  let winH = h / (rows * 3);   // window height 
  let gapX = w / cols;         // horizontal spacing
  let gapY = h / rows;         // vertical spacing

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let wx = bx + gapX * c + (gapX - winW) / 2;
      let wy = by + gapY * r + (gapY - winH) / 2;
      rect(wx, wy, winW, winH);
    }
  }
}

let buildings = [
  [30, 50, 2, 3],
  [35, 70, 2, 4],
  [20, 40, 1, 3]
];
  
function drawSkyline() {
    const cycleW = buildings[0][0] + buildings[1][0] + buildings[2][0];
    let start = ((skyOffset % cycleW) + cycleW) % cycleW;
    let bx = -start; 

  while (bx < width) {
    for (let [bw, bh, cols, rows] of buildings) {
      Windows(bx, groundY - bh, bw, bh, cols, rows);
      bx += bw;
      if (bx >= width) break;
    }
  }
}
  
drawSkyline(); 
  
 // player
  stroke(0);
  strokeWeight(2);
  fill(255);
  ellipse(100, y, d, d);
 
  // obstacle 1
  let rw = 25;
  let rh = 25;
  let rx = x;
  let ry = groundY - rh;
  fill(230, 50, 50);
  rect(rx, ry, rw, rh);

  //obstacle movement
  if (!frozen) {
  x += speed;
  if (x + rw < 0) {
    x = width;
    speed -= 0.5;
  }
}

  // collision check 
let cx = 100;      
let cy = y;   
let r = d/2
let result = resolveCircleRectEdgeContact(cx, cy, r, rx, ry, rw, rh);
  
  if (result.collided) {
    x = result.rx;
    y = result.cy;
    frozen = true;
    speed = 0;            
    vy = 0;                
    gameOver();
}
}

function gameOver() {
  push();
  stroke(200);
  strokeWeight(1);
  fill(32)
  rectMode(CENTER);
  rect(width/2, height/2, 200, 50);
  
  fill(255);
  textAlign(CENTER, CENTER);
  text('GAME OVER', width/2, height/2);
  pop();
}
  
function showStartScreen() {
  push();
  stroke(200);
  strokeWeight(1);
  fill(32)
  rectMode(CENTER);
  rect(width/2, height/2, 200, 50);
  
  fill(255);
  textAlign(CENTER, CENTER);
  text('Click to play.\nUse any key to move. \nPress Space to restart.', width/2, height/2);
  pop();
}

function startGame() { 
  gameStarted = true;
}

function resetGame() {
  x = width;               
  y = groundY - d/2;       
  vy = 0;                  
  speed = -3;  
  frozen = false;
  skyOffset = 0;
}

function keyPressed() {
  if (key === ' ') {
    if (frozen) {
      resetGame();
      gameStarted = true; 
    } 
    return false; 
    }
   if (gameStarted && !frozen) {
     if (y >= groundY - d/2) {
       vy = -jump;
    }
  }
}
function mousePressed() {
  if (!gameStarted) {
    startGame();
}
}