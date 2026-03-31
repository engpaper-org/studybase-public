(function () {
  const NAME_KEY = "sb_firstName";

  function getUserName() {
    const name = (localStorage.getItem(NAME_KEY) || "").trim();
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