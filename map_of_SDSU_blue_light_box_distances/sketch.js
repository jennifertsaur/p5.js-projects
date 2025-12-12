let blueLightImg;
let img;
let imgW;
let imgH;
let dW;
let dH;
let scaleFactor = 0.5;
let panFromX = 0;
let panFromY = 0;
let imgX = 0;
let imgY = 0;

let scaleLevel = 1;
let maxScale = 10;
let zoomFactor = 0.4;

let panToX = 0; 
let panToY = 0;

let matchLoc = [-100, -100];

let blueLightPoints = [];

let clickX;
let clickY;

let font;

function preload() {
  img = loadImage('Campus200dpi.png');
  blueLightImg = loadImage('PhonePoints.png');
  font = loadFont('font/NotoSerifTelugu-SemiBold.ttf');

}
  
function setup() {
  createCanvas(800, 450);
  imgW = img.width;
  imgH = img.height;
  updateDisplayDimensions();
}

function updateDisplayDimensions() {
  dW = imgW * scaleFactor;
  dH = imgH * scaleFactor;
}


function applyConstraints() {
  let mainW = 600;
  let mainH = height;
  if (dW > mainW) {
    imgX = constrain(imgX, mainW - dW, 0);
  }
  if (dH > mainH) {
    imgY = constrain(imgY, mainH - dH, 0);
  }
}

function draw() {
  background(255);
  
  //main image
  image(img, imgX, imgY, dW, dH);
  
  //phone location image
  //image(blueLightImg, imgX, imgY, dW, dH);
  
  //black rectangle
  fill(0);
  noStroke();
  rect(600, 200*imgH/imgW, 200, height-200*imgH/imgW);
  
  //overview image
  let overviewScale = 0.2;
  noFill();
  stroke(255); 
  strokeWeight(4); 
  image(img, 600, 0, 200, 200*imgH/imgW);

  //text for distance
  let boxX = 600;
  let boxY = 200 * imgH / imgW;
  let boxW = 200;
  let boxH = height - boxY;
  let margin = 20

  let boxCenterX = boxX + boxW / 2;
  let boxCenterY = boxY + boxH / 2;
  
  // mouse point
  let validClick = (
  clickX >= imgX &&
  clickX <= imgX + dW &&
  clickY >= imgY &&
  clickY <= imgY + dH
  ) 

  if (validClick) {

    //line connecting points
    stroke( 0, 0, 225); 
    strokeWeight(4);
    line(clickX, clickY, matchLoc[0], matchLoc[1]);

    fill(0);
    noStroke();
    ellipse(clickX, clickY, 20);
  
    // phone point
    fill(0, 0, 225);
    noStroke();
    ellipse(matchLoc[0], matchLoc[1], 20);
    fill(225);
    ellipse(matchLoc[0], matchLoc[1], 10);
    
    //distance formula
    let ratioW = 4185 / imgW;
    let ratioH = 3138.75 / imgH;

    let dx = (clickX - matchLoc[0]) * ratioW;
    let dy = (clickY - matchLoc[1]) * ratioH;
    let actualDistance = Math.sqrt(dx * dx + dy * dy);
    
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textFont(font);
    text("Distance: " + actualDistance.toFixed(2) + " ft", boxX + margin, boxY + 40);
    
  } else {
    // Display default text when no valid click
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    text("Distance: --", boxX + margin, boxY + 40);
  }
  let textMaxWidth = 200 - 2 * margin;
    fill(133, 134, 250);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(14);
    textFont(font);
    text("Police/Non-Emergency:", boxX + margin, 250, textMaxWidth);
    fill(255);
    text("619-594-1991, select option '1'", boxX + margin, 270, textMaxWidth);
    fill(133, 134, 250);
    text("Email: ", boxX + margin, 340, textMaxWidth);     
    fill(255);
    text("police@sdsu.edu", boxX + margin, 360, textMaxWidth);
}

function getClosestPhone(xInput, yInput) {
let minDistance = 10000;
let matchX = 10000;
let matchY = 10000;
  
  for (let x = 0; x < blueLightImg.width; x += 4) {
    for (let y = 0; y < blueLightImg.height; y += 4) {
      let colorExtract = red(blueLightImg.get(x, y));
      if (colorExtract == 0) {
        let currentDist = dist(xInput, yInput, x, y)
        if (currentDist < minDistance) {
          minDistance = currentDist;
          matchX = x;
          matchY = y;
       }
      }
    }
  }
  matchLoc[0] = matchX;
  matchLoc[1] = matchY;
return matchLoc;
}

function mousePressed() {
  let mapX = (mouseX - imgX) / scaleFactor;
  let mapY = (mouseY - imgY) / scaleFactor;
  matchLoc = getClosestPhone(mapX, mapY);

  panFromX = mouseX;
  panFromY = mouseY;
  
  //matchLoc = getClosestPhone(mouseX, mouseY);
  console.log(matchLoc);
  ellipse(matchLoc[0], matchLoc[1], 20);
}

function mouseDragged() {
  if (scaleLevel === 1) {
    return;
  }
  panToX = mouseX;
  panToY = mouseY;
  let xShift = panToX - panFromX;
  let yShift = panToY - panFromY;
  imgX = imgX + xShift;
  imgY = imgY + yShift
  panFromX = panToX;
  panFromY = panToY;
  applyConstraints();
  
}

function mouseWheel(event) {
  let d = event.delta; 
  let mx = mouseX - imgX;
  let my = mouseY - imgY;
  
  if (d < 0 && scaleLevel < maxScale) {
  scaleLevel ++;
  imgX -= zoomFactor * mx;
  imgY -= zoomFactor * my;
  scaleFactor *= (1 + zoomFactor);      
  updateDisplayDimensions();
  applyConstraints();
    
}
  else if (d > 0 && scaleLevel > 1) {
  scaleLevel --;
  imgX += (zoomFactor / (zoomFactor + 1)) * mx;
  imgY += (zoomFactor / (zoomFactor + 1)) * my;
  scaleFactor /= (1 + zoomFactor);
  updateDisplayDimensions();
  applyConstraints();

  if (scaleLevel == 1) {
    imgX = 0;
    imgY = 0;
  }
  }
  
  return false;
}

function mouseClicked() {
  if (
    mouseX >= imgX &&
    mouseX <= imgX + dW &&
    mouseY >= imgY &&
    mouseY <= imgY + dH
  ) {
    
    clickX = mouseX;
    clickY = mouseY;
   matchLoc = getClosestPhone(mouseX, mouseY);
  } else {
    clickX = -100;
    clickY = -100;
    matchLoc = [-100, -100]; 
  }
}