/*
  Handles the received information from the esp32 and draws the
  track on the given canvas element on the page
*/
$(document).ready(function() {

  canvas = document.getElementById("track");
  ctx = canvas.getContext('2d');

  x = canvas.width / 2 + 950;
  y = canvas.height + 500;

  getTrackSectionInfo();

  drawTrack();

  drawTable();

});

/* Global variables */
let canvas;
let ctx;

/* These measurements are in milimeters */
const wheelDiameter = 32; 
const distanceBetweenWheels = 130;

const scaleFactor = 0.30;

let x;
let y;

/* Purely circular track */
// const trackData = [
//   { 
//     leftEncoderCount: 696, 
//     rightEncoderCount: 696, 
//     trackSection: 0 
//   },
//   { 
//     leftEncoderCount: 696, 
//     rightEncoderCount: 696, 
//     trackSection: 1 
//   },
//   { 
//     leftEncoderCount: 809, 
//     rightEncoderCount: 1378, 
//     trackSection: 2 
//   },
//   { 
//     leftEncoderCount: 2785, 
//     rightEncoderCount: 2785, 
//     trackSection: 3 
//   },
//   { 
//     leftEncoderCount: 809, 
//     rightEncoderCount: 1378, 
//     trackSection: 4 
//   },
//   { 
//     leftEncoderCount: 696, 
//     rightEncoderCount: 696, 
//     trackSection: 5 
//   }
// ];

const trackData = [
  { 
    leftEncoderCount: 696, 
    rightEncoderCount: 696, 
    trackSection: 0 
  },
  { 
    leftEncoderCount: 348, 
    rightEncoderCount: 348, 
    trackSection: 1 
  },
  { 
    leftEncoderCount: 77, 
    rightEncoderCount: 361, 
    trackSection: 2 
  },
  { 
    leftEncoderCount: 361, 
    rightEncoderCount: 77, 
    trackSection: 3 
  },
  { 
    leftEncoderCount: 153, 
    rightEncoderCount: 772, 
    trackSection: 4 
  }
];

const trackSectionInformation = [];
/* ------------ */

function getTrackSectionInfo() {
  for(const section of trackData) {

    const leftDistance = (section.leftEncoderCount / 140) * Math.PI * wheelDiameter;
    const rightDistance = (section.rightEncoderCount / 140) * Math.PI * wheelDiameter;
    const sectionLength = (leftDistance + rightDistance) / 2;
    var initialAngle = section.trackSection - 1 > 0 ? trackSectionInformation[section.trackSection - 1].endAngle : 0;
    var curveRadius = 0;
    var isACurve = false;
    var turningDirection = "";

    if(leftDistance != rightDistance) {
      curveRadius = Math.abs((distanceBetweenWheels/2.0)*((rightDistance + leftDistance)/(rightDistance - leftDistance)));
      isACurve = true;
      endAngle = sectionLength / curveRadius;
    }
    else {
      endAngle = initialAngle;
    }

    var initialX = section.trackSection == 0 ? x : trackSectionInformation[section.trackSection - 1].endX; 
    var initialY = section.trackSection == 0 ? y : trackSectionInformation[section.trackSection - 1].endY; 

    if(isACurve) {
      if(endAngle>0 && endAngle<Math.PI*1.1) {
        if(rightDistance > leftDistance) {
          turningDirection = "right";
          endAngle = initialAngle + endAngle;
          if(Math.abs(endAngle - Math.PI/2) < 1) {
            endX = initialX + curveRadius * Math.sin(endAngle);
            endY = endX > endY ? initialY - curveRadius : initialY + curveRadius;
          } 
          else {
            endX = initialX + curveRadius * Math.sin(endAngle);
            endY = initialY + curveRadius * Math.cos(endAngle);
          }
        }
        else {
          turningDirection = "left";
          endAngle = initialAngle - endAngle;
          if(Math.abs(endAngle - Math.PI/2) > 1) {
            endX = initialX + curveRadius;
            endY = initialY - curveRadius*Math.cos(endAngle);
          }
          else {
            endX = initialX + curveRadius*Math.sin(endAngle);
            endY = initialY + curveRadius*Math.cos(endAngle);
          }
        }
      }
      else {

        if(rightDistance > leftDistance) {

        }
        else {

        }
      }
    }
    else {
      var endX = initialX + sectionLength*Math.cos(endAngle);
      var endY = initialY + sectionLength*Math.sin(endAngle);
    }

    const sectionInformation = {
      section: section.trackSection,
      travelledDistance: sectionLength,
      isACurve: isACurve,
      radius: curveRadius,
      initialAngle: initialAngle,
      endAngle: endAngle,
      initialX: initialX,
      initialY: initialY,
      endX: endX,
      endY: endY,
      leftEncoderCount: section.leftEncoderCount, 
      rightEncoderCount: section.rightEncoderCount, 
      leftTravelledDistance: leftDistance,
      rightTravelledDistance: rightDistance,
      turningDirection: turningDirection
    }

    trackSectionInformation.push(sectionInformation);

  }
  console.log("TrackSectionInformation!", trackSectionInformation);
}

function drawTrack() {
  for(const section of trackSectionInformation) {
    ctx.beginPath();
    ctx.lineWidth = 3;

    if(section.isACurve) {
      if((Math.abs(section.endAngle - Math.PI / 2) < 1) && section.turningDirection == "right") {
        var centerX = section.initialX;
        var centerY = section.initialY - section.radius;
      } 
      else if((Math.abs(section.endAngle - Math.PI) < 0.5) && section.turningDirection == "right") {
        var centerX = section.initialX;
        var centerY = section.initialY - section.radius;
      }
      else if((Math.abs(endAngle - Math.PI/2) > 1) && section.turningDirection == "left") {
        var centerX = section.initialX + section.radius;
        var centerY = section.initialY;
      }
      else {
        var centerX = (section.initialX + section.endX) / 2;
        var centerY = (section.initialY + section.endY) / 2;
      }
      var angleIncrement = ((section.endAngle - section.initialAngle) / 1000.0);

      if(section.turningDirection == "right") {
        ctx.save();
        ctx.translate(centerX*scaleFactor, centerY*scaleFactor);

        for(let angle = section.initialAngle; angle <= section.endAngle; angle += angleIncrement) {
          x = section.radius * Math.sin(angle);
          y = section.radius * Math.cos(angle);

          if(angle == section.initialAngle) {
            ctx.moveTo(x*scaleFactor, y*scaleFactor);
          } else {
            ctx.lineTo(x*scaleFactor, y*scaleFactor);
          }

          ctx.strokeStyle = `hsl(${(section.section * 60) % 360}, 100%, 50%)`;
          ctx.stroke();
        }
        ctx.restore();
      }
      else {
        ctx.save();
        ctx.translate(centerX*scaleFactor, centerY*scaleFactor);

        for(let angle = section.initialAngle; angle >= section.endAngle; angle += angleIncrement) {
          x = section.radius * Math.sin(angle*-1 - Math.PI/2);
          y = section.radius * Math.cos(angle*-1 - Math.PI/2);

          if(angle == section.initialAngle) {
            ctx.moveTo(x*scaleFactor, y*scaleFactor);
          } else {
            ctx.lineTo(x*scaleFactor, y*scaleFactor);
          }

          ctx.strokeStyle = `hsl(${(section.section * 60) % 360}, 100%, 50%)`;
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    else {
      ctx.restore();
      ctx.moveTo(section.initialX * scaleFactor, section.initialY * scaleFactor);
      ctx.lineTo(section.endX * scaleFactor, section.endY * scaleFactor);
      ctx.strokeStyle = `hsl(${(section.section * 60) % 360}, 100%, 50%)`;
      ctx.stroke();
    }
  }
  // ctx.beginPath();
  // ctx.moveTo(trackSectionInformation[trackSectionInformation.length - 1].endX * scaleFactor, trackSectionInformation[trackSectionInformation.length - 1].endY * scaleFactor);
  // ctx.lineTo(trackSectionInformation[0].initialX * scaleFactor, trackSectionInformation[0].initialY * scaleFactor);
  // ctx.strokeStyle = `hsl(${(trackSectionInformation[0].section * 60) % 360}, 100%, 50%)`;
  // ctx.stroke();
}

function drawTable() {
  for(const section of trackSectionInformation) {
    var newRow = $("<tr>");
    var columns = "";
    columns += `<th scope="row">${section.section}</th>`;
    columns += `<td>${section.isACurve == true ? "curve" : "straight"}</td>`;
    columns += `<td>${section.isACurve == true ? "VL and theta" : "MAX"}</td>`;
    columns += `<td>${section.isACurve == true ? "VL and theta" : "0"}</td>`;
    columns += `<td>${section.rightEncoderCount}</td>`;
    columns += `<td>${section.leftEncoderCount}</td>`;
    columns += `<td>${section.rightTravelledDistance.toFixed(2)}</td>`;
    columns += `<td>${section.leftTravelledDistance.toFixed(2)}</td>`;
    columns += `<td>${section.travelledDistance.toFixed(2)}</td>`;
    newRow.append(columns);
    $("table.table.table-striped.table-dark").append(newRow);
  }
}