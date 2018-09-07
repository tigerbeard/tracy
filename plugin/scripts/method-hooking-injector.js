(function() {
  // Create a listener on the shared window between content scripts and injected
  // scripts so that injected scripts can talk to the extension via window.postMessage.
  window.addEventListener("message", event => {
    chrome.runtime.sendMessage(event.data);
  });

  function proxyInnerHTML() {
    // Get a reference to the original innerHTML prototype.
    const originalSet = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "innerHTML"
    ).set;

    // Define a new prototype for innerHTML that proxies the call and then calls
    // the original innerHTML.
    Object.defineProperty(Element.prototype, "innerHTML", {
      set: function(value) {
        // Send a message to the extension to check the arguments of any
        // call to innerHTML have user-controlled input.
        window.postMessage(
          {
            "message-type": "job",
            type: "innerHTML",
            msg: value,
            location: document.location.href
          },
          "*"
        );

        //Call the original setter
        return originalSet.call(this, value);
      }
    });
  }

  // r is injected to
  function r() {
    window.postMessage(
      {
        "message-type": "reproduction"
      },
      "*"
    );
  }

  // A list of scripts we want to inject into the page rather than have them as a
  // content script.
  const injectionScripts = [r, proxyInnerHTML];
  // Inject the scripts.
  injectionScripts.map(injectScript);

  // injectScript injects the script into the page and then removes it.
  function injectScript(func) {
    const hookInjector = document.createElement("script");
    hookInjector.type = "text/javascript";
    hookInjector.innerHTML = func.toString();
    document.documentElement.appendChild(hookInjector);
    hookInjector.parentNode.removeChild(hookInjector);
  }
})();
