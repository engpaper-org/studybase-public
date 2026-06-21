(function () {
  function getUserName() {
    let name = "";
    try { name = JSON.parse(localStorage.getItem("studybase_user") || "null")?.name || ""; } catch (_) {}
    name = String(name).trim();
    return name.length ? name : "user";
  }

  function replaceUserTokens() {
    const userName = getUserName();

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.includes("{user}")) {
        node.nodeValue = node.nodeValue.replaceAll("{user}", userName);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", replaceUserTokens);
  } else {
    replaceUserTokens();
  }
})();
