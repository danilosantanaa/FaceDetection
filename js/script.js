const video = document.getElementById('video')
const loadingContent =  document.querySelector('#loading-content')
const source = 'js/models'

let errorMsg = ''

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
        error => {
            errorMsg = error.message
        }
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
function showFaceDetectionsAll(objArray, ctx) {
    for(let i = 0; i < objArray.length; i++) {
        showFaceDetections(objArray[i], ctx)
    }
}

// Para montar personalizado de acordo com a pessoa
function showFaceDetections(obj, ctx) {
    
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
    
    // Mostrando a cara da pessoa
    canvas.font = "15px Arial"
    canvas.fillStyle = "red"
    canvas.fillRect( positionRect.x - 30, positionRect.y - 30, 150, 50);
    canvas.fillStyle = "white"
    canvas.fillText(type_faces[maxDetection(expressions)], positionRect.x, positionRect.y)  
}

// Mostrando a quantidade pessoais que ta em cena
function showTotalPeople(objArray, ctx) {
    const canvas = ctx.getContext('2d')

    canvas.font = "15px Arial"
    canvas.fillStyle = "blue"
    canvas.fillRect(0, 0, 250, 50);
    canvas.fillStyle = "white"
    canvas.fillText(`Total de pessoa detectado: ${objArray.length}`, 10, 50 / 2)  
}


video.addEventListener('play', (e) => {

    loadingContent.style.display = 'none'

    const canvas = faceapi.createCanvasFromMedia(video)
    
    // document.querySelector('#face-detection').append(canvas)
    document.body.append(canvas)


    const displaySize = { width: video.clientWidth, height: video.clientHeight }
    

    faceapi.matchDimensions(canvas, displaySize)
    
    // Parte que detecta o rosto
    setInterval(async () => {
        
        // Configura a canvas para ficar na mesma dimensão do video

        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        
        if(detections.length > 0 ) console.log(detections) // Mostra um log no console com as possibilidade de detecção do rosto

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        
        // Desenha na posição x e y o rosto detectado
        faceapi.draw.drawDetections(canvas, resizedDetections)
        
        // Mostrando o status 
        showFaceDetectionsAll(detections, canvas)

        showTotalPeople(detections, canvas)

    }, 250)
})


let totLoadingVideo = 0
let totAttempt = 0
const TOT_ATTEMPT = 4

const warning = document.querySelector('#warning')
const title = document.querySelector('#title')
const loading = document.querySelector('#loading')

let interval = setInterval(function(){ 

   if (video.readyState === TOT_ATTEMPT) {
      clearInterval(interval);
   }

   // Verificar se deu erro no carregamento, na decima tentativa tentar abrir a camara novamente!
   if (totLoadingVideo % 10 == 0 && totLoadingVideo > 0) {
       startVideo()
       totAttempt++

       document.querySelector('#tentativa').innerHTML = `Tentativa ${totAttempt} de ${TOT_ATTEMPT}`
   }

   // verificando se na quarta tentiva houve uma falhar ao tentar abrir a camara
   if (totAttempt == TOT_ATTEMPT || errorMsg === 'Permission denied') {
       loading.style.backgroundImage="url(img/error.png)" // Alterar icone de erro
       title.style.display = 'none' // Oculta o titulo

       // Verificando se é erro de permissão 
        if(errorMsg === 'Permission denied') {
            warning.innerHTML = 'Por favor! Você precisa dar permissão para que o app acesse sua câmara'
        } else {
            warning.innerHTML = 'Houver uma falhar ao tentar abrir a sua camâra. Verifique se deu permissão necessária para abrir sua câmara!' // coloco o aviso de erro
        }

       loadingContent.style.color = 'red' // coloca cor vermelho
       clearInterval(interval) // limpar o serInteval
   }

   totLoadingVideo++ // Total de carregamento que o videoy

}, 1000);
