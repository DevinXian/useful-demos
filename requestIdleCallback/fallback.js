window.requestIdleCallback = window.requestIdleCallback || function(handler) {
  const start = Date.now()

  return setTimeout(function() {
    handler({
      didTimeout: false,
      timeRemaining: function() {
        return Math.max(0, 50.0 - (Date.now() - start))
      }
    })
  })
}