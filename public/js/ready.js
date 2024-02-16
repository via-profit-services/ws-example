const bootstrap = async () => {
  const socket = new WebSocket("ws://localhost:8083");
  const statusElem = document.querySelector("#socket-status");
  const inputElem = document.querySelector("#message-input");
  const incommingMessList = document.querySelector("#messages-list");
  const sendBtn = document.querySelector("#send-btn");

  inputElem.focus();

  /**
   * Render message
   * @param {*} blob - incommig blob
   * @param {*} isMy - If true, then message will be marked as my
   */
  const renderMessage = async (blob, isMy = false) => {
    const plainData = await blob.text();
    const { message } = JSON.parse(plainData);
    const messageEl = document.createElement("div");
    const innerEl = document.createElement("div");
    messageEl.setAttribute("class", "message");
    if (isMy) {
      messageEl.classList.add("-my");
    }
    innerEl.setAttribute("class", "inner");

    innerEl.innerHTML = message;
    messageEl.appendChild(innerEl);
    incommingMessList.appendChild(messageEl);
  };

  // When socked opened
  socket.onopen = () => {
    statusElem.innerHTML = "Connected ✅";
  };

  // When failure
  socket.onerror = (err) => {
    statusElem.innerHTML = "Error 🚫";
  };

  // When recived message
  socket.onmessage = (event) => {
    renderMessage(event.data);
  };

  // Submit the message
  sendBtn.addEventListener("click", () => {
    const text = inputElem.value.trim();
    if (!text.length) {
      return;
    }

    // Make a blob
    const blob = new Blob([JSON.stringify({ message: text })], {
      type: "plain/text",
    });

    // Render my message
    renderMessage(blob, true);

    // Emit message
    socket.send(blob);

    inputElem.value = "";
    inputElem.focus();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  bootstrap();
});
