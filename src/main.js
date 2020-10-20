const canvas = document.querySelector('#canvas')
const hiddenCanvas = document.querySelector('#canvas')
const video = document.querySelector('#video')
const container = document.querySelector('.ascii-container')
const slider = document.querySelector('.slider')

const ctx = canvas.getContext('2d')
const hiddenCtx = hiddenCanvas.getContext('2d')

const dpr = window.devicePixelRatio
const scaleFactor = 0.75
const scale = scaleFactor / dpr

let gridFactor = 2

const char = ['.', ',', '`', '-', '_', ':', ';', '|', '/', '^', '+', '*', '=', '%', '$', '0'].reverse()

let imageText = ''
let pixelList = []

let stop = false

window.onload = () => {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { aspectRatio: 16 / 9 }, audio: false, })
            .then(stream => {
                video.srcObject = stream
                const track = stream.getVideoTracks()[0]
                const capabilities = track.getCapabilities();
                [canvas.width, canvas.height] = [capabilities.width.max * scale, capabilities.height.max * scale];
                [hiddenCanvas.width, hiddenCanvas.height] = [canvas.width, canvas.height];
                [video.width, video.height] = [canvas.width, canvas.height]
                container.style.fontSize = `${gridFactor*2}px`
                document.querySelector('.res-label').innerText = `1/${gridFactor}`
            })
            .catch(err => console.error(err))
    }
    update()
}

slider.addEventListener('change', () => {
    gridFactor = parseInt(slider.value)
    document.querySelector('.res-label').innerText = `1/${gridFactor}`
    container.style.fontSize = `${gridFactor*2}px`

})


ImageData.prototype.process = function() {
    let pixelData = this.data
    let grayscaleData = new Uint8ClampedArray(pixelData.length)

    imageText = ''
    pixelList = []

    for (let i = 0; i < pixelData.length; i += 4 * gridFactor) {
        let line = parseInt(i / (4 * canvas.width))
        const avg = parseInt((pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3)
        if (line % gridFactor === 0) {
            pixelList.push(avg)
            for (let j = 0; j < gridFactor * 4; j++) {
                for (let k = 0; k < gridFactor; k++) {
                    let value = (i + j + 1) % 4 === 0 ? 255 : avg
                    grayscaleData[canvas.width * 4 * k + i + j] = value
                }
            }
        }
    }

    let min = Math.min(...pixelList)
    let range = Math.max(...pixelList) - min
    let realRange = range === 0 ? 255 : range
    pixelList.forEach((pixel, i) => {
        if (i !== 0 && i % parseInt((canvas.width / gridFactor)) === 0) {
            imageText += '<br>'
        }
        const correspondingIndex = Math.floor((pixel - min) * (char.length - 1) / realRange)
        if (!char[correspondingIndex]) {
            console.log(correspondingIndex)
        }
        imageText += char[correspondingIndex]
    })


    let imageData = new ImageData(grayscaleData, this.width, this.height)
    return imageData
}

function update() {
    if (stop) return
    hiddenCtx.drawImage(video, 0, 0, canvas.width, canvas.height)
    let pixelData = hiddenCtx.getImageData(0, 0, canvas.width, canvas.height)

    render(pixelData)
    window.requestAnimationFrame(update)
}


function render(pixelData) {
    container.innerHTML = imageText
    ctx.putImageData(pixelData.process(), 0, 0);
    [container.style.width, container.style.height] = [`${canvas.width}px`, `${canvas.height}px`]
}