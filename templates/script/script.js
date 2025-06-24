      const chatContainer = document.getElementById("chatContainer");
      const chatForm = document.getElementById("chatForm");
      const promptInput = document.getElementById("promptInput");
      const imageInput = document.getElementById("imageInput");
      const imagePreview = document.getElementById("imagePreview");
      const imagePreviewContainer = document.getElementById(
        "imagePreviewContainer"
      );
      const removeImageBtn = document.getElementById("removeImageBtn");
      const toast = document.getElementById("toast");
      const submitBtn = chatForm.querySelector('button[type="submit"]');
      let toastTimeout;
      const MAX_LINES = 5;

      let isSendingMessage = false;

      function showWelcomeMessage() {
        chatContainer.innerHTML = `<div id="welcome-container" class="text-center animate-fade-in-slide-up flex flex-col items-center justify-center h-full p-8">
                                    <div class="bg-blue-600 rounded-full w-28 h-28 flex items-center justify-center mb-8 shadow-xl text-white dark:bg-blue-600 dark:text-white">
                                        <svg class="w-14 h-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                                    </div>
                                    <h1 class="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-sm">Olá!</h1>
                                    <p class="text-xl text-gray-700 dark:text-gray-300 max-w-md leading-relaxed">Eu sou a TNL² - CHAT, sua assistente virtual.<br>Como posso te auxiliar hoje?</p>
                                </div>`;
      }

      function removeWelcomeMessage() {
        const welcomeContainer = document.getElementById("welcome-container");
        if (welcomeContainer) {
          welcomeContainer.style.transition =
            "opacity 0.3s ease-out, transform 0.3s ease-out";
          welcomeContainer.style.opacity = "0";
          welcomeContainer.style.transform = "translateY(-10px)";
          setTimeout(() => {
            welcomeContainer.remove();
          }, 300);
        }
      }

      promptInput.addEventListener("input", () => {
        promptInput.style.height = "auto";
        promptInput.style.height = promptInput.scrollHeight + "px";
        updateSubmitButtonState();
      });

      function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.remove("opacity-0", "pointer-events-none");
        toast.classList.add("opacity-100");
        toastTimeout = setTimeout(() => {
          toast.classList.add("opacity-0", "pointer-events-none");
          toast.classList.remove("opacity-100");
        }, 3000);
      }

      function updateSubmitButtonState() {
        const hasText = promptInput.value.trim().length > 0;
        const hasImage = imageInput.files.length > 0;
        submitBtn.disabled = (!hasText && !hasImage) || isSendingMessage;
        promptInput.disabled = isSendingMessage; 
      }

      function resetForm() {
        promptInput.value = "";
        imageInput.value = "";
        imagePreview.src = "";
        imagePreviewContainer.classList.add("hidden");
        promptInput.style.height = "auto";
        updateSubmitButtonState();
      }

      imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          imagePreview.src = url;
          imagePreviewContainer.classList.remove("hidden");
        } else {
          imagePreviewContainer.classList.add("hidden");
        }
        updateSubmitButtonState();
      });

      removeImageBtn.addEventListener("click", () => {
        imageInput.value = "";
        imagePreview.src = "";
        imagePreviewContainer.classList.add("hidden");
        updateSubmitButtonState();
      });

      function showTypingIndicator() {
        const typingIndicatorHTML = `<div id="typing-indicator" class="flex items-start gap-3 animate-fade-in-slide-up">
                                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md dark:bg-blue-600 dark:text-white">
                                                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                                                </div>
                                                <div class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600">
                                                    <div class="typing-indicator flex space-x-1">
                                                        <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full inline-block"></span>
                                                        <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full inline-block"></span>
                                                        <span class="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full inline-block"></span>
                                                    </div>
                                                </div>
                                            </div>`;
        chatContainer.insertAdjacentHTML("beforeend", typingIndicatorHTML);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      function hideTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
      }

      function addMessage(text, fromUser = true, imageUrl = null) {
        const messageWrapper = document.createElement("div");
        messageWrapper.className = `flex items-start gap-3 animate-fade-in-slide-up ${
          fromUser ? "flex-row-reverse" : ""
        }`;

        if (!fromUser) {
          const avatar = document.createElement("div");
          avatar.className =
            "flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md dark:bg-blue-600 dark:text-white";
          avatar.innerHTML = `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>`;
          messageWrapper.appendChild(avatar);
        }

        const contentWrapper = document.createElement("div");
        contentWrapper.className = `flex flex-col space-y-2 max-w-[75%] ${
          fromUser ? "items-end" : "items-start"
        }`;

        if (imageUrl) {
          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = "Imagem enviada";
          img.className =
            "rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 max-w-full h-auto object-cover max-h-48 mb-2";
          contentWrapper.appendChild(img);
        }

        if (text) {
          const bubble = document.createElement("div");
          bubble.className = `message-bubble ${
            fromUser ? "user" : "bot"
          } text-base leading-relaxed`;

          const messageContent = document.createElement("div");
          messageContent.className = "message-content";

          const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
          let lastIndex = 0;
          let match;

          while ((match = codeBlockRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              const textNode = document.createTextNode(
                text.substring(lastIndex, match.index)
              );
              messageContent.appendChild(textNode);
            }

            const lang = match[1] || "";
            const code = match[2].trim();
            const pre = document.createElement("pre");
            const codeElement = document.createElement("code");

            if (lang) {
              codeElement.classList.add(lang);
            } else {
              codeElement.classList.add("plaintext");
            }

            codeElement.textContent = code;
            pre.appendChild(codeElement);
            messageContent.appendChild(pre);

            lastIndex = codeBlockRegex.lastIndex;
          }

          if (lastIndex < text.length) {
            const textNode = document.createTextNode(text.substring(lastIndex));
            messageContent.appendChild(textNode);
          }

          bubble.appendChild(messageContent);
          contentWrapper.appendChild(bubble);

          requestAnimationFrame(() => {
            if (!fromUser) {
              messageContent.querySelectorAll("pre code").forEach((block) => {
                hljs.highlightElement(block);
              });
            }

            const lineHeight = parseFloat(
              window.getComputedStyle(messageContent).lineHeight
            );
            const maxContentHeight = lineHeight * MAX_LINES;

            if (messageContent.scrollHeight > maxContentHeight) {
              const readMoreBtn = document.createElement("button");
              readMoreBtn.textContent = "Leia mais";
              readMoreBtn.className = `read-more-btn ${
                fromUser ? "user-message" : "bot-message"
              }`;
              readMoreBtn.addEventListener("click", () => {
                messageContent.classList.toggle("expanded");
                readMoreBtn.textContent = messageContent.classList.contains(
                  "expanded"
                )
                  ? "Mostrar menos"
                  : "Leia mais";
                chatContainer.scrollTop = chatContainer.scrollHeight;
              });
              bubble.appendChild(readMoreBtn);
            }
          });
        }

        messageWrapper.appendChild(contentWrapper);
        chatContainer.appendChild(messageWrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (isSendingMessage) {
          return;
        }

        const prompt = promptInput.value.trim();
        const imageFile = imageInput.files[0];

        if (!prompt && !imageFile) {
          showToast("Por favor, digite uma mensagem ou envie uma imagem.");
          return;
        }

        removeWelcomeMessage();

        isSendingMessage = true;
        updateSubmitButtonState();

        const imageURL = imageFile ? URL.createObjectURL(imageFile) : null;
        addMessage(prompt || null, true, imageURL);

        resetForm();
        showTypingIndicator();

        try {
          const formData = new FormData();
          if (prompt) formData.append("prompt", prompt);
          if (imageFile) formData.append("image", imageFile);

          const response = await fetch(
            "https://3851-35-236-168-102.ngrok-free.app/chat",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok)
            throw new Error(
              `Erro na API: ${response.statusText} (${response.status})`
            );

          const data = await response.json();

          hideTypingIndicator();
          addMessage(data.response || JSON.stringify(data), false);
        } catch (error) {
          hideTypingIndicator();
          addMessage(
            `Desculpe, ocorreu um erro: ${error.message}. Verifique a conexão com a API.`,
            false
          );
        } finally {
          isSendingMessage = false;
          updateSubmitButtonState();
        }
      });

      document.addEventListener("DOMContentLoaded", () => {
        if (
          localStorage.theme === "dark" ||
          (!("theme" in localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        showWelcomeMessage();
        updateSubmitButtonState();
      });