(function() {
  // Create a listener on the shared window between content scripts and injected
  // scripts so that injected scripts can talk to the extension via window.postMessage.
  window.addEventListener("message", event => {
    chrome.runtime.sendMessage(event.data);
  });

  // A list of scripts we want to inject into the page rather than have them as a
  // content script.
  const injectionScripts = ["innerhtml.js", "repro.js"];
  // Inject the scripts.
  injectionScripts.map(injectScript);

  // injectScript injects the script into the page and then removes it.
  function injectScript(file) {
    const hookInjector = document.createElement("script");
    hookInjector.type = "text/javascript";
    hookInjector.src = chrome.runtime.getURL(`scripts/${file}`);
    document.documentElement.appendChild(hookInjector);
    hookInjector.parentNode.removeChild(hookInjector);
  }
})();
