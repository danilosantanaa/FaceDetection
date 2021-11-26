const video = document.getElementById('video')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('js/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('js/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/js/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('js/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {
            facingMode: "environment"
        } },
        stream => video.srcObject = stream,
        error => console.log(error)
    )
}

/**
 * 
 * expressions: 
    angry: 0.000005803345175081631
    disgusted: 7.148163660986029e-8
    fearful: 0.000023560833142255433
    happy: 0.8961021900177002
    neutral: 0.1027340367436409
    sad: 0.0011258510639891028
    surprised: 0.000008611932571511716
 */

function showFaceDetections(obj = []) {
    const neutral = document.querySelector('#neutral')

    let expressions = null
    if (obj.length > 0) expressions = obj[0].expressions

    const PERCENTAGE = 0.8

    const happy = document.querySelector("#happy")
    const sad = document.querySelector("#sad")
    const angry = document.querySelector('#angry')
    const disgusted = document.querySelector('#disgusted')
    const fearful = document.querySelector('#fearful')
    
    
    neutral.innerHTML = expressions != null && expressions.neutral >= PERCENTAGE ? "SIM" : "NÃO"
    neutral.innerHTML = expressions == null ? "SIM" : neutral.innerHTML

    happy.innerHTML = expressions != null && expressions.happy >= PERCENTAGE ? "Foi dectetado felicidade" : ""
    sad.innerHTML = expressions != null && expressions.sad >= PERCENTAGE ? "Foi detectado tristeza": ""
    angry.innerHTML = expressions != null && expressions.angry >= PERCENTAGE ? "Foi detectado raiva" : ""
    disgusted.innerHTML = expressions != null && expressions.disgusted >= PERCENTAGE ? "Foi detectado nojo" : ""
    fearful.innerHTML = expressions != null && expressions.fearful >= PERCENTAGE ? "Foi detectado medo" : ""

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

        console.log(detections) // Mostra um log no console com as possibilidade de detecção do rosto

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        // Desenha na posição x e y o rosto detectado
        faceapi.draw.drawDetections(canvas, resizedDetections)

        // Mostrando o status 
        showFaceDetections(detections)

    }, 100)
})
