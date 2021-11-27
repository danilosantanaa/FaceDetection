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


// Obtem qual foi a maior chave da expresão que foi detectado
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

// Mostra as faces da quantidade N de pessoas que aparecer na camara
function showFaceDetectionsAll(objArray = [], ctx) {
    for(let i = 0; i < objArray.length; i++) {
        showFaceDetections(objArray[i], ctx)
    }
}

// Para montar personalizado de acordo com a pessoa
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
        x: obj.landmarks._shift.x,
        y: obj.landmarks._shift.y
    }

    console.log(positionRect)
    
    canvas.font = "15px Arial"
    canvas.fillStyle = "red"
    canvas.fillRect( positionRect.x - 30, positionRect.y - 30, 150, 50);
    canvas.fillStyle = "white"
    canvas.fillText(type_faces[maxDetection(expressions)], positionRect.x, positionRect.y)  
}


video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)

    // document.querySelector('#face-detection').append(canvas)
    document.body.append(canvas)

    const displaySize = { width: video.clientWidth, height: video.clientHeight }

    // Configura a canvas para ficar na mesma dimensão do video
    faceapi.matchDimensions(canvas, displaySize)

    // Parte que detecta o rosto
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

        if(detections.length > 0 ) console.log(detections) // Mostra um log no console com as possibilidade de detecção do rosto

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        // Desenha na posição x e y o rosto detectado
        faceapi.draw.drawDetections(canvas, resizedDetections)

        // Mostrando o status 
        showFaceDetectionsAll(detections, canvas)

    }, 100)
})


video.addEventListener('load', () => {
    console.log('Ainda está carregando....')
})