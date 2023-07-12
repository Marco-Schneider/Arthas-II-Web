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
  const scaleFactor = 2;

  // let x = canvas.width / 2;
  // let y = canvas.height - wheelDiameter*2;
  let x = 0;
  let y = canvas.height / 2;

  const trackData = [
    { leftEncoderCount: 263, rightEncoderCount: 365, trackSection: 0 },
    { leftEncoderCount: 612, rightEncoderCount: 459, trackSection: 1 },
    { leftEncoderCount: 890, rightEncoderCount: 737, trackSection: 2 },
    { leftEncoderCount: 1083, rightEncoderCount: 948, trackSection: 3 },
    { leftEncoderCount: 1221, rightEncoderCount: 1081, trackSection: 4 },
  ];
  
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (const section of trackData) {
    const leftDistance = (section.leftEncoderCount / 140) * Math.PI * wheelDiameter;
    const rightDistance = (section.rightEncoderCount / 140) * Math.PI * wheelDiameter;

    //Checking if the section is a straight line or a curve
    if(leftDistance != rightDistance) {
      const curveRadius = Math.abs((distanceBetweenWheels/2.0)*((rightDistance + leftDistance)/(rightDistance - leftDistance)));
      console.log("curveRadius: ", curveRadius);
    }

    const sectionLength = (leftDistance + rightDistance) / 2;
    console.log("leftDistance ", leftDistance);
    console.log("rightDistance ", rightDistance);
    console.log("sectionLength ", sectionLength);

    // x += sectionLength * scaleFactor;
    // y = section.trackSection * 50;

    // ctx.lineTo(x, y);
    // ctx.stroke();
  }

  // ctx.stroke();
});
