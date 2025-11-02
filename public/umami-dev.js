(function () {
  if (window.umami) return;

  function send(payload) {
    try {
      const data = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/e", data);
      } else {
        fetch("/e", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        });
      }
    } catch (error) {
      console.warn("[UMAMI STUB] failed to dispatch payload", error);
    }
  }

  window.umami = {
    track: function (eventName, eventData) {
      console.debug("[UMAMI STUB] track()", eventName, eventData);
      send({ type: "event", event: eventName, data: eventData || {} });
    },
  };

  console.debug("[UMAMI STUB] script loaded; window.umami available");
})();
