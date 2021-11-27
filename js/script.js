const video = document.getElementById('video')
const source = 'js/models'

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(source),
    faceapi.nets.faceLandmark68Net.loadFromUri(source),
    faceapi.nets.faceRecognitionNet.loadFromUri(source),
    faceapi.nets.faceExpressionNet.loadFromUri(source)
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        error => console.log(error)
    )
}

function maxDetection(objExpressions) {
    let key = ''
    let count = 0
    for(expression in objExpressions) {

       if("asSortedArray" != expression) {
        if ( count == 0 || objExpressions[key] < objExpressions[expression] ) {
            key = expression
        }   
        count ++
       }
    }

    return key
}

function showFaceDetectionsAll(objArray = [], ctx) {
    for(let i = 0; i < objArray.length; i++) {
        showFaceDetections(objArray[i], ctx)
    }
}

function showFaceDetections(obj = [], ctx) {

    const canvas = ctx.getContext('2d')
    const type_faces = {
        happy: 'FELICIDADE ' + String.fromCodePoint(0x1F601),
        sad:  'TRISTE' + String.fromCodePoint(0x1F614),
        angry: 'RAIVA' + String.fromCodePoint(0x1F612),
        disgusted:  'NOJO' + String.fromCodePoint(0x1F601),
        fearful: 'MEDO' + String.fromCodePoint(0x1F631),
        neutral: 'NEUTRO' + String.fromCodePoint(0x1F610),
        surprised: 'SUPRESO(A)' + String.fromCodePoint(0x1F632)
    }

    
    if (obj == null || obj == undefined) return;

    expressions = obj.expressions
    
    
    let positionRect = {
        x: obj.alignedRect._box.x || 0,
        y: obj.alignedRect._box.y || 0
    }

    console.log(positionRect)
    
    canvas.font = "20px Arial"
    canvas.fillStyle = "red"
    canvas.fillText(type_faces[maxDetection(expressions)], positionRect.x + 100, positionRect.y)  
}


video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)

    document.querySelector('#face-detection').append(canvas)
    // document.body.append(canvas)

    const displaySize = { width: video.width, height: video.height}

    // Configura a canvas para ficar na mesma dimensão do video
    faceapi.matchDimensions(canvas, displaySize)

    // Parte que detecta o rosto
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

        //if(detections.length > 0 ) console.log(detections) // Mostra um log no console com as possibilidade de detecção do rosto

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        // Desenha na posição x e y o rosto detectado
        faceapi.draw.drawDetections(canvas, resizedDetections)

        // Mostrando o status 
        showFaceDetectionsAll(detections, canvas)

    }, 100)
})
