console.log("script started");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  // faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  // faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  console.log("LOading models");
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      const video = document.getElementById("video");
      video.addEventListener("playing", () => {
        console.log("PLaying");
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
          // const resizedDetections = faceapi.resizeResults(
          //   detections,
          //   displaySize
          // );
          // document.getElementById("exp").innerText = detections['expressions'];
          if (detections.length >0)
          {
            var obj =  detections[0].expressions
            // var arr = Object.keys( obj ).map(function ( key ) { return obj[key]; });
            // console.log()
            Exp = Object.keys(obj).reduce(function(a, b){ return obj[a] > obj[b] ? a : b })
            document.getElementById("exp").innerText = Exp;
          }
            
          // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
          // faceapi.draw.drawDetections(canvas, resizedDetections);
          
          // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);
      });
      console.log("STarting play");
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => console.error(err));
}
