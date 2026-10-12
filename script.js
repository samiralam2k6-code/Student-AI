// ========================================
// STUDENT AI - MAIN SCRIPT
// ========================================

let currentUser = null;
let chats = [];
let currentChatId = null;
let currentMode = null;
let editingMessageIndex = null;



// ========================================
// DOM ELEMENTS
// ========================================

const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("appScreen");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const authButton = document.getElementById("authButton");
const authMessage = document.getElementById("authMessage");

const googleLoginButton =
    document.getElementById("googleLoginButton");

const newChatButton =
    document.getElementById("newChatButton");

const recentChats =
    document.getElementById("recentChats");

const searchInput =
    document.getElementById("searchInput");

const messageArea =
    document.getElementById("messageArea");

const userInput =
    document.getElementById("userInput");

const sendBtn =
    document.getElementById("sendBtn");

const welcome =
    document.getElementById("welcome");

const dashboard =
    document.getElementById("dashboard");

const dashboardButton =
    document.getElementById("dashboardButton");

const logoutButton =
    document.getElementById("logoutButton");

const startChatButton =
    document.getElementById("startChatButton");

const topUserName =
    document.getElementById("topUserName");

const dashboardName =
    document.getElementById("dashboardName");

const dashboardEmail =
    document.getElementById("dashboardEmail");

const chatCount =
    document.getElementById("chatCount");

const questionCount =
    document.getElementById("questionCount");

const notesCount =
    document.getElementById("notesCount");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.querySelector(".sidebar");


// ========================================
// AUTH MODE
// ========================================

let authMode = "login";


function setAuthMode(mode) {

    authMode = mode;

    if (mode === "login") {

        loginTab.classList.add("active");
        signupTab.classList.remove("active");

        nameInput.classList.add("hidden");

        authButton.textContent = "Login";

    } else {

        signupTab.classList.add("active");
        loginTab.classList.remove("active");

        nameInput.classList.remove("hidden");

        authButton.textContent = "Create Account";
    }

    authMessage.textContent = "";
}


loginTab.addEventListener("click", () => {
    setAuthMode("login");
});


signupTab.addEventListener("click", () => {
    setAuthMode("signup");
});


// ========================================
// AUTH MESSAGE
// ========================================

function showAuthMessage(message, type = "error") {

    authMessage.textContent = message;

    authMessage.className =
        "auth-message " + type;
}


// ========================================
// LOCAL CHAT STORAGE
// ========================================

function getChatStorageKey() {

    if (!currentUser) return null;

    return "studentAI_chats_" + currentUser.uid;
}


function loadUserChats() {

    if (!currentUser) {

        chats = [];
        return;
    }

    const key = getChatStorageKey();

    const saved =
        localStorage.getItem(key);

    if (saved) {

        try {

            chats = JSON.parse(saved);

        } catch {

            chats = [];
        }

    } else {

        chats = [];
    }
}


function saveChats() {

    if (!currentUser) return;

    const key = getChatStorageKey();

    localStorage.setItem(
        key,
        JSON.stringify(chats)
    );
}


// ========================================
// CHAT CREATION
// ========================================

function createNewChat() {

    const chat = {

        id:
            Date.now().toString(),

        title:
            "New Chat",

        messages:
            [],

        createdAt:
            new Date().toISOString()
    };

    chats.unshift(chat);

    currentChatId =
        chat.id;

    saveChats();

    renderHistory();

    renderMessages();

    showChat();

    userInput.focus();
}


function getCurrentChat() {

    return chats.find(
        chat =>
            chat.id === currentChatId
    );
}


// ========================================
// SHOW / HIDE CHAT
// ========================================

function showChat() {

    welcome.classList.remove("hidden");

    dashboard.classList.remove("active");

    messageArea.style.display = "block";
}


function showDashboard() {

    welcome.classList.add("hidden");

    messageArea.style.display = "none";

    dashboard.classList.add("active");

    updateDashboard();
}


// ========================================
// MESSAGE RENDER
// ========================================

function renderMessages() {

    messageArea.innerHTML = "";

    const chat =
        getCurrentChat();

    if (!chat) {

        return;
    }

    if (chat.messages.length === 0) {

        return;
    }

    welcome.classList.add("hidden");

    chat.messages.forEach((message, index) => {
    addMessageToUI(
        message.role,
        message.content,
        false,
        index
    );
});
}

function cleanMathFormatting(text) {
    return text
        .replace(/\\\\\[/g, "\\[")
        .replace(/\\\\\]/g, "\\]")
        .replace(/\\\\\(/g, "\\(")
        .replace(/\\\\\)/g, "\\)")
        .replace(/\[\s*([\s\S]*?)\s*\]/g, "\\[$1\\]")
        .trim();
}


function addMessageToUI(
    role,
    content,
    scroll = true,
    messageIndex = null
)  {
    const message =
        document.createElement("div");

    message.className =
        "message " + role;

    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";

    // Clean math formatting
    if (typeof cleanMathFormatting === "function") {
        content = cleanMathFormatting(content);
    }

    // Render Markdown
    if (typeof marked !== "undefined") {
        bubble.innerHTML = marked.parse(content);
    } else {
        bubble.textContent = content;
    }

    message.appendChild(bubble);
    messageArea.appendChild(message);
    
if (role === "user" && typeof messageIndex === "number") {
    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "edit-message-btn";
    editButton.textContent = "✏️ Edit";

    editButton.addEventListener("click", (event) => {
        event.stopPropagation();

        editingMessageIndex = messageIndex;
        userInput.value = content;
        userInput.focus();
        userInput.style.height = "auto";
        userInput.style.height = userInput.scrollHeight + "px";
    });

    message.appendChild(editButton);
}


    
// Render Mermaid diagrams
if (window.mermaid) {
    const mermaidBlocks =
        bubble.querySelectorAll("code.language-mermaid");

    mermaidBlocks.forEach((block) => {
        const diagram =
            document.createElement("div");

        diagram.className = "mermaid";

        diagram.textContent =
            block.textContent.trim();

        const pre = block.closest("pre");

        if (pre) {
            pre.replaceWith(diagram);
        }
    });

    const diagrams =
        bubble.querySelectorAll(".mermaid");

    if (diagrams.length > 0) {
        window.mermaid.run({
            nodes: diagrams
        }).catch((error) => {
            console.error("Mermaid error:", error);
        });
    }
}


    // Render MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([bubble]).catch((error) => {
            console.error("MathJax error:", error);
        });
    }

    if (scroll) {
    const conversationScroll =
        document.getElementById("conversationScroll");

    if (conversationScroll) {
    requestAnimationFrame(() => {
        conversationScroll.scrollTo({
            top: conversationScroll.scrollHeight,
            behavior: "auto"
        });
    });
}
}
}


// ========================================
// TYPING INDICATOR
// ========================================

// ========================================
// TYPING INDICATOR
// ========================================

function showTyping() {

    const typing =
        document.createElement("div");

    typing.id =
        "typingIndicator";

    typing.className =
        "message assistant";

    typing.innerHTML = `
        <div class="message-bubble typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    messageArea.appendChild(typing);

    messageArea.scrollTop =
        messageArea.scrollHeight;
}


function hideTyping() {

    const typing =
        document.getElementById(
            "typingIndicator"
        );

    if (typing) {

        typing.remove();
    }
}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

    const text =
        userInput.value.trim();

    if (!text) return;

    if (!currentUser) {

        alert("Please login first.");
        return;
    }


    // Create chat if needed

    if (!currentChatId) {

        createNewChat();
    }


    const chat =
        getCurrentChat();

    if (!chat) return;


    // First message becomes title

    if (
        chat.messages.length === 0
    ) {

        chat.title =
            text.length > 35
                ? text.substring(0, 35) + "..."
                : text;
    }


    // Add or update user message

const displayText = text.replace(/^QUIZ_MODE:\s*/i, "");

if (editingMessageIndex !== null) {
    // Replace the old question
    chat.messages[editingMessageIndex].content = text;

    // Remove the old assistant replies after this question
    chat.messages.splice(editingMessageIndex + 1);

    editingMessageIndex = null;

    renderMessages();

} else {
    // Normal new message
    if (chat.messages.length === 0) {
        chat.title = text.length > 35
            ? text.substring(0, 35) + "..."
            : text;
    }

    chat.messages.push({
        role: "user",
        content: text,
        time: new Date().toISOString()
    });

    addMessageToUI(
        "user",
        displayText,
        true,
        chat.messages.length - 1
    );
}

userInput.value = "";
userInput.style.height = "auto";

saveChats();
renderHistory();
updateDashboard();

    showTyping();


    try {

        const response =
            await fetch(
                "https://student-ai-gy7i.onrender.com/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: text,

                        mode:
                            currentMode || "normal"
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error"
            );
        }


        const data =
            await response.json();


        hideTyping();


        const answer =
            data.reply ||
            data.response ||
            "Sorry, I couldn't generate a response.";

            if (currentMode === "quiz") {
    startInteractiveQuiz(answer);
    return;
}


        chat.messages.push({

            role: "assistant",

            content: answer,

            time:
                new Date().toISOString()
        });

        addMessageToUI(
    "assistant",
    answer
);


        saveChats();

        updateDashboard();


    } catch (error) {

        hideTyping();

        console.error(error);


        const errorMessage =
    "⚠️ " + error.message;


        chat.messages.push({

            role: "assistant",

            content: errorMessage,

            time:
                new Date().toISOString()
        });


        addMessageToUI(
            "assistant",
            errorMessage
        );


        saveChats();
    }
}


// ========================================
// SEND BUTTON
// ========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);
// Enable Send only when there is text
userInput.addEventListener("input", () => {
    sendBtn.disabled = !userInput.value.trim();
});

userInput.addEventListener("paste", () => {
    requestAnimationFrame(() => {
        sendBtn.disabled = !userInput.value.trim();
    });
});


// ========================================
// ENTER KEY
// ========================================

userInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


// ========================================
// NEW CHAT
// ========================================

newChatButton.addEventListener(
    "click",
    () => {

        createNewChat();

        sidebar.classList.remove(
            "open"
        );
    }
);


startChatButton.addEventListener(
    "click",
    () => {

        createNewChat();
    }
);


// ========================================
// CHAT HISTORY
// ========================================

function renderHistory(
    filter = ""
) {

    recentChats.innerHTML = "";

    const search =
        filter.toLowerCase();


    const filtered =
        chats.filter(
            chat =>
                chat.title
                    .toLowerCase()
                    .includes(search)
        );


    filtered.forEach(
        chat => {

            const item =
                document.createElement("div");

            item.className =
                "chat-history-item";


            if (
                chat.id ===
                currentChatId
            ) {

                item.classList.add(
                    "active"
                );
            }


            const title =
                document.createElement(
                    "span"
                );

            title.textContent =
                chat.title;


            const deleteButton =
                document.createElement(
                    "button"
                );

            
deleteButton.textContent = "⋮";
deleteButton.className = "delete-chat";
deleteButton.title = "Chat options";

deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();

    // Agar menu pehle se khula hai, toh band karo
    const existingMenu = document.querySelector(".chat-options-menu");

    if (existingMenu) {
        existingMenu.remove();

        if (deleteButton.dataset.menuOpen === "true") {
            deleteButton.dataset.menuOpen = "false";
            return;
        }
    }

    deleteButton.dataset.menuOpen = "true";

    const menu = document.createElement("div");
    menu.className = "chat-options-menu";
    menu.textContent = "Delete Chat";

    menu.addEventListener("click", (menuEvent) => {
        menuEvent.stopPropagation();
        menu.remove();
        deleteButton.dataset.menuOpen = "false";
        deleteChat(chat.id);
    });

    item.appendChild(menu);
});

// Menu ke bahar click karne par menu band ho
document.addEventListener("click", () => {
    document.querySelectorAll(".chat-options-menu").forEach(menu => {
        menu.remove();
    });

    document.querySelectorAll(".delete-chat").forEach(button => {
        button.dataset.menuOpen = "false";
    });
});



            item.appendChild(title);

            item.appendChild(
                deleteButton
            );


            item.addEventListener(
                "click",
                () => {

                    currentChatId =
                        chat.id;

                    renderHistory();

                    renderMessages();

                    showChat();
                }
            );


            recentChats.appendChild(
                item
            );
        }
    );
}


// ========================================
// DELETE CHAT
// ========================================


function deleteChat(id) {
    const chat = chats.find(
        chat => chat.id === id
    );

    if (!chat) return;

    const confirmed = confirm(
        `Kya tum "${chat.title}" chat delete karna chahte ho?`
    );

    if (!confirmed) return;

    chats = chats.filter(
        chat => chat.id !== id
    );

    if (currentChatId === id) {
        currentChatId = chats.length
            ? chats[0].id
            : null;
    }

    saveChats();
    renderHistory();
    renderMessages();
    showChat();
    updateDashboard();
}

// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    () => {

        renderHistory(
            searchInput.value
        );
    }
);


// ========================================
// STUDY TOOLS
// ========================================

document
    .querySelectorAll(".tool-btn")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentMode =
                        button.dataset.mode;


                    const prompts = {

    notes:
        "Make detailed study notes on ",

    mcqs:
        "Create 10 MCQs with answers on ",

    explain:
    "Explain this topic in very simple language. Include definition, key points, a simple example, and important exam points: ",

    exam:
        "Write an exam-ready answer for ",

    quiz:
    "Create an interactive quiz on "
};


                    userInput.value =
                        prompts[
                            currentMode
                        ] || "";


                    userInput.focus();

                    showChat();
                }
            );
        }
    );


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    chatCount.textContent =
        chats.length;


    let questions = 0;

    let notes = 0;


    chats.forEach(
        chat => {

            chat.messages.forEach(
                message => {

                    if (
                        message.role ===
                        "user"
                    ) {

                        questions++;
                    }
                }
            );


            if (
                chat.title
                    .toLowerCase()
                    .includes("note")
            ) {

                notes++;
            }
        }
    );


    questionCount.textContent =
        questions;

    notesCount.textContent =
        notes;


    if (currentUser) {

        dashboardName.textContent =
            currentUser.displayName ||
            currentUser.email
                ?.split("@")[0] ||
            "Student";

        dashboardEmail.textContent =
            currentUser.email ||
            "";
    }
}


dashboardButton.addEventListener(
    "click",
    showDashboard
);


// ========================================
// MOBILE MENU
// ========================================



function closeMobileMenu() {
    sidebar.classList.remove("open");
}

menuButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    sidebar.classList.toggle("open");
});

document.addEventListener("click", (event) => {
    if (!sidebar.classList.contains("open")) return;

    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedMenuButton = menuButton.contains(event.target);

    if (!clickedInsideSidebar && !clickedMenuButton) {
        closeMobileMenu();
    }
});




// ========================================
// OPEN APP
// ========================================

function openApp(user) {

    currentUser = user;

    authScreen.classList.add(
        "hidden"
    );

    appScreen.classList.remove(
        "hidden"
    );


    topUserName.textContent =
        user.displayName ||
        user.email
            ?.split("@")[0] ||
        "Student";


    loadUserChats();

    renderHistory();

    updateDashboard();


    if (chats.length > 0) {

        currentChatId =
            chats[0].id;

        renderMessages();

    } else {

        currentChatId = null;

        messageArea.innerHTML = "";

        welcome.classList.remove(
            "hidden"
        );
    }
}


// ========================================
// CLOSE APP
// ========================================

function closeApp() {

    currentUser = null;

    chats = [];

    currentChatId = null;

    appScreen.classList.add(
        "hidden"
    );

    authScreen.classList.remove(
        "hidden"
    );

    emailInput.value = "";

    passwordInput.value = "";

    nameInput.value = "";

    authMessage.textContent = "";
}


// ========================================
// FIREBASE LOGIN
// ========================================

async function handleAuth() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showAuthMessage(
            "Email aur password dono enter karo."
        );

        return;
    }


    try {

        authButton.disabled = true;


        if (
            authMode === "login"
        ) {

            if (
                typeof window.firebaseSignIn !==
                "function"
            ) {

                throw new Error(
                    "Firebase abhi load nahi hua. Page refresh karo."
                );
            }


            const user =
                await window.firebaseSignIn(
                    email,
                    password
                );


            showAuthMessage(
                "Login successful!",
                "success"
            );


            openApp(user);


        } else {

            const name =
                nameInput.value.trim();


            if (!name) {

                showAuthMessage(
                    "Apna name enter karo."
                );

                return;
            }


            if (
                typeof window.firebaseSignUp !==
                "function"
            ) {

                throw new Error(
                    "Firebase abhi load nahi hua. Page refresh karo."
                );
            }


            const user =
                await window.firebaseSignUp(
                    name,
                    email,
                    password
                );


            showAuthMessage(
                "Account created!",
                "success"
            );


            openApp(user);
        }


    } catch (error) {

        console.error(error);


        let message =
            "Something went wrong.";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Email ya password incorrect hai.";

        } else if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "Is email se account already bana hua hai.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Password thoda strong rakho.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Email address valid nahi hai.";

        } else {

            message =
                error.message ||
                message;
        }


        showAuthMessage(
            message
        );

    } finally {

        authButton.disabled = false;
    }
}


authButton.addEventListener(
    "click",
    handleAuth
);


// ========================================
// GOOGLE LOGIN
// ========================================

googleLoginButton.addEventListener(
    "click",
    async () => {

        try {

            googleLoginButton.disabled =
                true;


            if (
                typeof window.googleSignIn !==
                "function"
            ) {

                throw new Error(
                    "Firebase load nahi hua. Page refresh karo."
                );
            }


            const user =
                await window.googleSignIn();


            openApp(user);


        } catch (error) {

            console.error(error);


            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                showAuthMessage(
                    "Google login cancel ho gaya."
                );

            } else {

                showAuthMessage(
                    error.message ||
                    "Google login failed."
                );
            }


        } finally {

            googleLoginButton.disabled =
                false;
        }
    }
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            if (
                typeof window.firebaseSignOut ===
                "function"
            ) {

                await window.firebaseSignOut();

            } else if (
                typeof window.googleSignOut ===
                "function"
            ) {

                await window.googleSignOut();
            }


        } catch (error) {

            console.error(error);
        }


        closeApp();
    }
);


// ========================================
// FIREBASE AUTH STATE
// ========================================

window.addEventListener(
    "firebaseUserReady",
    event => {
        const user = event.detail;

        if (user) {
            openApp(user);
        }
    }
);


// ========================================
// STARTUP
// ========================================

// Firebase module index.html se load hoga.
// Isliye yahan direct login state assume nahi kar rahe.

authScreen.classList.remove(
    "hidden"
);

appScreen.classList.add(
    "hidden"
);

setAuthMode("login");
function startInteractiveQuiz(answer) {

    console.log("QUIZ AI RESPONSE:");
    console.log(answer);

    addMessageToUI(
        "assistant",
        answer
    );
}