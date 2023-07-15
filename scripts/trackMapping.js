/*
  Handles the received information from the esp32 and draws the
  track on the given canvas element on the page
*/
document.addEventListener("DOMContentLoaded", function(e) {
  const canvas = document.getElementById("track");
  const ctx = canvas.getContext('2d');

  // ctx.moveTo(0, 0);
  // ctx.lineTo(200, 100);
  // ctx.stroke();

  const wheelDiameter = 32;
  const distanceBetweenWheels = 130;
  const scaleFactor = 0.30;

  // let x = canvas.width / 2;
  // let y = canvas.height - wheelDiameter*2;
  let x = canvas.width / 2 + 950;
  let y = canvas.height + 500;

  const trackData = [
    { 
      leftEncoderCount: 696, 
      rightEncoderCount: 696, 
      trackSection: 0 
    },
    { 
      leftEncoderCount: 696, 
      rightEncoderCount: 696, 
      trackSection: 1 
    },
    { 
      leftEncoderCount: 809, 
      rightEncoderCount: 1378, 
      trackSection: 2 
    },
    { 
      leftEncoderCount: 2785, 
      rightEncoderCount: 2785, 
      trackSection: 3 
    },
    { 
      leftEncoderCount: 809, 
      rightEncoderCount: 1378, 
      trackSection: 4 
    },
    { 
      leftEncoderCount: 696, 
      rightEncoderCount: 696, 
      trackSection: 5 
    }
  ];

  const calculatedPositions = [];

  for(const section of trackData) {
    const leftDistance = (section.leftEncoderCount / 140) * Math.PI * wheelDiameter;
    const rightDistance = (section.rightEncoderCount / 140) * Math.PI * wheelDiameter;
    const sectionLength = (leftDistance + rightDistance) / 2;
    var angle = section.trackSection - 1 > 0 ? calculatedPositions[section.trackSection - 1].angle : 0;
    var curveRadius = 0;
    var isACurve = false;
    var turning = "";

    //Checking if the section is a straight line or a curve
    if(leftDistance != rightDistance) {
      curveRadius = Math.abs((distanceBetweenWheels/2.0)*((rightDistance + leftDistance)/(rightDistance - leftDistance)));
      isACurve = true;
      console.log("curveRadius: ", curveRadius);
      /*
        Considering that we have a curve radius and the section length we can determine
        how much of the circuference was travelled and thus retrieve an angle
      */
      angle = sectionLength / curveRadius;
      console.log("angle: ", angle);
    }

    console.log("leftDistance ", leftDistance);
    console.log("rightDistance ", rightDistance);
    console.log("sectionLength ", sectionLength);

    var initialX = section.trackSection == 0 ? x : calculatedPositions[section.trackSection - 1].endX; 
    var initialY = section.trackSection == 0 ? y : calculatedPositions[section.trackSection - 1].endY; 

    if(isACurve) {
      if(rightDistance > leftDistance) {
        console.log("This curve is turning right");
        // var endX = initialX + (2*curveRadius)*Math.sin(angle);
        // var endY = initialY + (2*curveRadius)*Math.cos(angle);
        turning = "right";
      }
      else {
        console.log("This curve is turning left");
        // var endX = initialX + (2*curveRadius)*Math.sin(angle);
        // var endY = initialY + (2*curveRadius)*Math.cos(angle);
        turning = "left";
      }
    }
    else {
      var endX = initialX + sectionLength*Math.cos(angle);
      var endY = initialY + sectionLength*Math.sin(angle);
    }

    if(turning == "right") {
      if(angle>0 && angle<Math.PI*1.0002) {
        console.log("theta = theta + alpha");
      }
      else {
        console.log("theta = theta - alpha");
      }
    }
    else if(turning == "left") {

    }

    const sectionInformation = {
      section: section.trackSection,
      travelledDistance: sectionLength,
      isACurve: isACurve,
      radius: curveRadius,
      angle: angle,
      initialX: initialX,
      initialY: initialY,
      endX: endX,
      endY: endY,
      leftEncoderCount: section.leftEncoderCount, 
      rightEncoderCount: section.rightEncoderCount, 
      leftTravelledDistance: leftDistance,
      rightTravelledDistance: rightDistance,
      turning: turning
    }

    calculatedPositions.push(sectionInformation);
    console.log("---")

    // x += sectionLength * scaleFactor;
    // y = section.trackSection * 50;

    // ctx.lineTo(x, y);
    // ctx.stroke();
  }

  for(const positions of calculatedPositions) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    // ctx.moveTo(x, y);
    if(positions.isACurve) {
      console.log("CURVA!!");
      var centerX = (positions.initialX + positions.endX) / 2;
      var centerY = (positions.initialY + positions.endY) / 2;
      if(positions.turning = "right") {
        ctx.arc(centerX * scaleFactor, centerY * scaleFactor, positions.radius * scaleFactor, Math.PI / 2, 1.5*Math.PI, true);
      }
      else {
        ctx.arc(centerX * scaleFactor, centerY * scaleFactor, positions.radius * scaleFactor, Math.PI / 2, 1.5*Math.PI, false);
      }
    
      ctx.strokeStyle = `hsl(${(positions.section * 60) % 360}, 100%, 50%)`;
      ctx.stroke();
      console.log("Center: ", centerX, centerY);
    }
    else {
      console.log("RETA!");
      ctx.moveTo(positions.initialX * scaleFactor, positions.initialY * scaleFactor);
      ctx.lineTo(positions.endX * scaleFactor, positions.endY * scaleFactor);
      ctx.strokeStyle = `hsl(${(positions.section * 60) % 360}, 100%, 50%)`;
      ctx.stroke();
    }

  }

  console.log("calculatedPositions: ", calculatedPositions);

  for(const positions of calculatedPositions) {
    var newRow = $("<tr>");
    var columns = "";

    columns += `<th scope="row">${positions.section}</th>`;
    columns += `<td>${positions.isACurve == true ? "curve" : "straight"}</td>`;
    columns += `<td>${positions.isACurve == true ? "VL and theta" : "MAX"}</td>`;
    columns += `<td>${positions.isACurve == true ? "VL and theta" : "0"}</td>`;
    columns += `<td>${positions.rightEncoderCount}</td>`;
    columns += `<td>${positions.leftEncoderCount}</td>`;
    columns += `<td>${positions.rightTravelledDistance.toFixed(2)}</td>`;
    columns += `<td>${positions.leftTravelledDistance.toFixed(2)}</td>`;
    columns += `<td>${positions.travelledDistance.toFixed(2)}</td>`;

    newRow.append(columns);
    $("table.table.table-striped.table-dark").append(newRow);
  }

  // ctx.stroke();
});
