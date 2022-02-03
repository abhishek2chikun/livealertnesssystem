/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
// import { nonMaxSuppressionV3Impl } from '@tensorflow/tfjs-core/dist/backends/non_max_suppression_impl';

import * as faceapi from 'face-api.js';

class State 
      {
          static p_state = []
          static extreme_flag = false
          static extreme_status = NaN
      }
tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);

const stats = new Stats();
stats.showPanel(0);
document.body.prepend(stats.domElement);

let model, ctx, videoWidth, videoHeight, video, canvas;

const state = {
  backend: 'wasm'
};

const gui = new dat.GUI();
gui.add(state, 'backend', ['wasm', 'webgl', 'cpu']).onChange(async backend => {
  await tf.setBackend(backend);
});

async function setupCamera() {
  video = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': { facingMode: 'user' },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}


const renderPrediction = async () => {

  stats.begin();

  const returnTensors = false;
  const flipHorizontal = true;
  const annotateBoxes = true;
  const predictions = await model.estimateFaces(
    video, returnTensors, flipHorizontal, annotateBoxes);
  //console.log(predictions)
  if (predictions.length>1)
        // alert("More then 1 faces detected")
  document.getElementById("num_faces").innerText = predictions.length;
  var num_faces = predictions.length
  if (predictions.length > 0) 
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < predictions.length; i++) 
    {
      
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) 
        {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }
      
      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(start[0], start[1], size[0], size[1]);
      
      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;

        ctx.fillStyle = "blue";
        for (let j = 0; j < landmarks.length; j++) 
        {
          const x = landmarks[j][0];
          const y = landmarks[j][1];
          ctx.fillRect(x, y, 5, 5);
        }
      


        var Status = [];
        
        
        var extreme_threshold = 0.1

        // Down
        if (landmarks[4][1] < landmarks[0][1] && landmarks[5][1] < landmarks[1][1])
        {
          
            if (!(State.p_state.includes(Status)))
   

              if (landmarks[0][1] - landmarks[4][1]>35 || landmarks[1][1] - landmarks[5][1]>35)
              {
                
                Status.push("Extreme Down")
              }
              else
              {
                
                Status.push("Down");
              }

            // Down-Right
            if (landmarks[4][0] < landmarks[0][0] )
             
              {
              
              if (!(State.p_state.includes(Status)))
                if (landmarks[0][0] - landmarks[4][0]>30)
                {
                  
                  Status.push("Extreme Right")
                }
                else
                {
                  Status.push("Right");
                  
                }
                  
              }
              
            // Down-Left
            else if (landmarks[1][0] < landmarks[5][0])
             
            {
     
              if (!(State.p_state.includes(Status)))
                if (landmarks[5][0] - landmarks[1][0]>30)
                {
                  
                  Status.push("Extreme Left")
                }
                else
                {
                  Status.push("Left")
                }
              
            }

        }
        // Up
        else if (landmarks[4][1] > landmarks[0][1] && landmarks[5][1] > landmarks[1][1])
        {
         
          
          if (!(State.p_state.includes(Status)))
    

            if (landmarks[4][1] - landmarks[0][1] > 40 || landmarks[5][1] - landmarks[1][1] > 40)
              
              {

                Status.push("Extreme Up")

              }
            else if (landmarks[4][1] - landmarks[0][1] > 30 || landmarks[5][1] - landmarks[1][1] > 30)
              
              {

                Status.push("Up")
              }
            else
              {
                Status.push("Normal")
              }


          // Up-Right
          if (landmarks[4][0] < landmarks[0][0] )
           
          {
        
            if (!(State.p_state.includes(Status)))
              if (landmarks[0][0] - landmarks[4][0]>30)
              {
                
                Status.push("Extreme Right")
              }
              else
              {
                Status.push("Right");
                
              }
                
          }

          // Up-Left
          else if (landmarks[1][0] < landmarks[5][0])
           
          {
          
            if (!(State.p_state.includes(Status)))
              if (landmarks[5][0] - landmarks[1][0]>30)
              {
                
                Status.push("Extreme Left")
              }
              else
              {
                Status.push("Left")
              }
            
          }
        }

        if (Status.length!=0)
        {
          //If there is a change in position
          if (!(State.p_state.includes(Status)))
          {
            // console.log("Position Changed")
            // console.log(State.p_state,Status)
            State.p_state = Status
            document.getElementById("status").innerText = State.p_state;

            const res = await fetch('http://localhost:5000/position', {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json'
              },
            body:  JSON.stringify({
            SID: "1",
            Position: (State.p_state).toString(),
            Cordinates: landmarks.toString()}), 
          });
           console.log("Done")
          }
          if (Status.includes('Extreme Right')|| Status.includes('Extreme Left') || Status.includes('Extreme Up')|| Status.includes('Extreme Down'))
          {
            // console.log("Extreme",State.extreme_flag,State.extreme_status)
            if (State.extreme_flag == false)
            {
              var d = new Date();
              var minutes = 1000 * 60;
              var n = d.getTime();
              State.extreme_status = n/minutes
              State.extreme_flag = true
            }
            else
            {
              var d = new Date();
              var minutes = 1000 * 60;
              var n = d.getTime();
              if (((n/minutes) - State.extreme_status) >= extreme_threshold )
                alert("Unattentive for more then 10 seconds")
                

            }
          }
          else
            State.extreme_flag = false
            
        }
      
      }
    }
  }
  stats.end();

  requestAnimationFrame(renderPrediction);
};

const setupPage = async () => {
  await tf.setBackend(state.backend);
  await setupCamera();
  video.play();

  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  canvas = document.getElementById('output');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

  model = await blazeface.load();

  renderPrediction();
};



console.log("script started");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./"),
  // faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  // faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./"),
]).then(startVideo);

function startVideo() {
  console.log("LOading models");
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
            console.log(Exp)
          }
            
          // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
          // faceapi.draw.drawDetections(canvas, resizedDetections);
          
          // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        });
      });
    }

setupPage();