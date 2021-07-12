const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {

  const canvas = faceapi.createCanvasFromMedia(video)

  document.body.append(canvas)

  const displaySize = { width: video.width, height: video.height }

  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()


    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    console.log(resizedDetections);

    resizedDetections.forEach( result => {

      const {expressions} = result

      let angry     = expressions.angry;
      let disgusted = expressions.disgusted;
      let fearful   = expressions.fearful;
      let neutral   = expressions.neutral;
      let happiness = expressions.happy;
      let sad       = expressions.sad;
      let surprised = expressions.surprised;

      const value = expressions.asSortedArray()[0].expression;

      let color = "white";

      switch (value){
        case "angry" : color  = "red";
          break;
        case "neutral" : color  = "blue";
          break;
        case "happy" : color  = "green";
          break;
        case "surprised" : color = "cyan";
          break
        default : color = "white"
      }

      let myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzN2RmMTk3YjY4ZWM0MDQ5YmExZGNhZmI5NTM1ZWU2MyIsImlhdCI6MTYyMjY0MDEyNSwiZXhwIjoxOTM4MDAwMTI1fQ.63T6DhiEb3zxB6dwThkB_XYKZWRnN96v-HVnBXoGGZw");
      myHeaders.append("Content-Type", "application/json");


      let raw = JSON.stringify({
        "entity_id": ["light.local_bedroom_light", "light.local_table_lamp"],
        "brightness" : 255,
        "color_name" : color
      });

      let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch("http://192.168.1.17:8123/api/services/light/turn_on", requestOptions)
          .then()

    })


    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    faceapi.draw.drawDetections(canvas, resizedDetections)

    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

  }, 500)
})