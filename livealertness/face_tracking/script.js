class State {
  static p_state = [];
  static extreme_flag = false;
  static extreme_status = NaN;
  static previous_landmark = NaN
  static Emotion_change=NaN;
}

let video = document.getElementById("video");
let model;
// declare a canvas variable and get its context
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: 600, height: 400 },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    });
};

const detectFaces = async () => {
  const returnTensors = false;
  const flipHorizontal = true;
  const annotateBoxes = true;
  const predictions = await model.estimateFaces(
    video,
    returnTensors,
    flipHorizontal,
    annotateBoxes
  );
  //console.log(predictions)
  if (predictions.length > 1)
    // alert("More then 1 faces detected")
    document.getElementById("faces").innerText = predictions.length;
  
  if (predictions.length > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("faces").innerText = predictions.length;
    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }

      // const start = predictions[i].topLeft;
      // const end = predictions[i].bottomRight;
      // const size = [end[0] - start[0], end[1] - start[1]];
      // ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      // ctx.fillRect(start[0], start[1], size[0], size[1]);

      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;

        if (landmarks  == State.previous_landmark)
          alert("Image Found")
        
        // console.log("present",landmarks)
        // console.log("Previous",State.previous_landmark)
        State.previous_landmark = landmarks
        // ctx.fillStyle = "blue";
        // for (let j = 0; j < landmarks.length; j++) {
        //   const x = landmarks[j][0];
        //   const y = landmarks[j][1];
        //   ctx.fillRect(x, y, 5, 5);
        // }
        
        var Status = [];

        var extreme_threshold = 0.1;

        // Down
        if (
          landmarks[4][1] < landmarks[0][1] &&
          landmarks[5][1] < landmarks[1][1]
        ) {
          if (!State.p_state.includes(Status))
            if (
              landmarks[0][1] - landmarks[4][1] > 35 ||
              landmarks[1][1] - landmarks[5][1] > 35
            ) {
              Status.push("Extreme Down");
            } else {
              Status.push("Down");
            }

          // Down-Right
          if (landmarks[4][0] < landmarks[0][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[0][0] - landmarks[4][0] > 30) {
                Status.push("Extreme Right");
              } else {
                Status.push("Right");
              }
          }

          // Down-Left
          else if (landmarks[1][0] < landmarks[5][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[5][0] - landmarks[1][0] > 30) {
                Status.push("Extreme Left");
              } else {
                Status.push("Left");
              }
          }
        }
        // Up
        else if (
          landmarks[4][1] > landmarks[0][1] &&
          landmarks[5][1] > landmarks[1][1]
        ) {
          if (!State.p_state.includes(Status))
            if (
              landmarks[4][1] - landmarks[0][1] > 45 ||
              landmarks[5][1] - landmarks[1][1] > 45
            ) {
              Status.push("Extreme Up");
            } else if (
              landmarks[4][1] - landmarks[0][1] > 30 ||
              landmarks[5][1] - landmarks[1][1] > 30
            ) {
              Status.push("Up");
            } else {
              Status.push("Normal");
            }

          // Up-Right
          if (landmarks[4][0] < landmarks[0][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[0][0] - landmarks[4][0] > 30) {
                Status.push("Extreme Right");
              } else {
                Status.push("Right");
              }
          }

          // Up-Left
          else if (landmarks[1][0] < landmarks[5][0]) {
            if (!State.p_state.includes(Status))
              if (landmarks[5][0] - landmarks[1][0] > 30) {
                Status.push("Extreme Left");
              } else {
                Status.push("Left");
              }
          }
        }

        if (Status.length != 0) {
          //If there is a change in position
          if (!State.p_state.includes(Status)) {
            // console.log("Position Changed")
            // console.log(State.p_state,Status)
            State.p_state = Status;
            document.getElementById("status").innerText = State.p_state;

            
            console.log("Done");
          }
          if (
            Status.includes("Extreme Right") ||
            Status.includes("Extreme Left") ||
            Status.includes("Extreme Up") ||
            Status.includes("Extreme Down")
          ) {


            // console.log("Extreme",State.extreme_flag,State.extreme_status)
            if (State.extreme_flag == false) {
              var d = new Date();
              var minutes = 1000 * 60;
              var n = d.getTime();
              State.extreme_status = n / minutes;
              State.extreme_flag = true;
            } else {
              var d = new Date();
              var minutes = 1000 * 60;
              var n = d.getTime();
              if (n / minutes - State.extreme_status >= extreme_threshold)
                {
                  threshold = true
                  alert("Unattentive for more then 10 seconds");
                }
              else
                threshold = false
                
            }
            const res = await fetch("http://localhost:5000/position", {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                SID: "1",
                Position: State.p_state.toString(),
                // Cordinates: landmarks.toString(),
                Threshold: threshold.toString(),
                Faces: predictions.length.toString(),
              }),
            });
          } else State.extreme_flag = false;
        }
      }
    }
  }
};

setupCamera();
video.addEventListener("loadeddata", async () => {
  model = await blazeface.load();
  // call detect faces every 100 milliseconds or 10 times every second
  setInterval(detectFaces, 100);
});
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
            if (State.Emotion_change == NaN)
              State.Emotion_change = Exp
            if (State.Emotion_change == Exp)
              // document.getElementById("exp").innerText = "No Change -"+Exp;
              {}
            else
              {
                document.getElementById("exp").innerText = "Emotion Changed from "+State.Emotion_change+" to "+Exp;
                const res = await fetch("http://localhost:5000/emotion", {
              method: "POST",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                SID: "1",
                Expression: Exp.toString(),
              }),
            });
              }
            State.Emotion_change = Exp
            
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
