// Elements
const htmlCode = document.getElementById("htmlCode");
const cssCode = document.getElementById("cssCode");
const jsCode = document.getElementById("jsCode");
const outputFrame = document.getElementById("outputFrame");

const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const savedProjectsBtn = document.getElementById("savedProjectsBtn");
const projectNameInput = document.getElementById("projectNameInput");
const themeSwitch = document.getElementById("themeSwitch");
const tabs = document.querySelectorAll(".tab");
const editors = document.querySelectorAll(".editor");
const errorBox = document.getElementById("errorBox");
const body = document.body;

// Output iframe update
function updateOutput() {
  runBtn.click();
}

// Run
runBtn.addEventListener("click", () => {
  const html = htmlCode.value.trim();
  const css = cssCode.value.trim();
  const js = jsCode.value.trim();
  const currentTheme = themeSwitch.value;

  errorBox.style.display = "none";
  errorBox.textContent = "";

  let injectedCSS = css;
  if (!css) {
    const themeDefaults = {
      light: "body { background: white; color: black; font-family: sans-serif; padding: 1rem; }",
      dark: "body { background: #1a1a1a; color: white; font-family: sans-serif; padding: 1rem; }",
      hacker: "body { background: black; color: #00ff00; font-family: monospace; padding: 1rem; }"
    };
    injectedCSS = themeDefaults[currentTheme] || "";
  }

  if (!html && !css && !js) {
    errorBox.style.display = "block";
    errorBox.textContent = "⚠️ Please enter some code to run!";
    outputFrame.srcdoc = "";
    return;
  }

  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(html, "text/html");
  const htmlErrors = parsedDoc.querySelectorAll("parsererror");
  if (htmlErrors.length > 0) {
    errorBox.style.display = "block";
    errorBox.textContent = "⚠️ Invalid HTML structure. Please fix it.";
    outputFrame.srcdoc = "";
    return;
  }

  const errorColor = { light: "red", dark: "#ff6b6b", hacker: "#ff4b4b" }[currentTheme] || "red";
  const errorStyle = `<style>.error { color: ${errorColor}; font-family: sans-serif; padding: 1rem; white-space: pre-wrap; }</style>`;
  const wrappedJS = js ? `<script>try { ${js} } catch(e) { document.body.innerHTML = \`${errorStyle}<pre class='error'>❌ JS Error: \${e.message}</pre>\`; }<\/script>` : "";

  const finalCode = `
    <!DOCTYPE html>
    <html>
    <head><style>${injectedCSS}</style></head>
    <body>${html}${wrappedJS}</body>
    </html>
  `;

  outputFrame.srcdoc = finalCode;

  setTimeout(() => {
    const frameDoc = outputFrame.contentDocument || outputFrame.contentWindow.document;
    if (!frameDoc.body.innerText.trim()) {
      outputFrame.srcdoc = `${errorStyle}<pre class="error">⚠️ No visible output. Please check your code!</pre>`;
    }
  }, 150);
});

// Reset
resetBtn.addEventListener("click", () => {
  htmlCode.value = "";
  cssCode.value = "";
  jsCode.value = "";
  outputFrame.srcdoc = "";
});

// Copy
copyBtn.addEventListener("click", async () => {
  const code = `<!-- HTML -->\n${htmlCode.value}\n\n/* CSS */\n${cssCode.value}\n\n// JavaScript\n${jsCode.value}`;
  try {
    await navigator.clipboard.writeText(code);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
  } catch {
    alert("Failed to copy code.");
  }
});

// Save
saveBtn.addEventListener("click", () => {
  const name = projectNameInput.value.trim();
  if (!name) {
    Toastify({
      text: "⚠️ Please enter a project name!",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
    }).showToast();
    return;
  }

  const savedProjects = JSON.parse(localStorage.getItem("savedProjects")) || [];

  const projectData = {
    name,
    html: htmlCode.value,
    css: cssCode.value,
    js: jsCode.value,
    timestamp: new Date().toLocaleString()
  };

  const existingIndex = savedProjects.findIndex(p => p.name === name);
  if (existingIndex !== -1) {
    savedProjects[existingIndex] = projectData;
  } else {
    savedProjects.push(projectData);
  }

  localStorage.setItem("savedProjects", JSON.stringify(savedProjects));

  Toastify({
    text: `✅ Project "${name}" saved!`,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
  }).showToast();

  saveBtn.textContent = "💾 Saved";
});

// Load from URL param
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const savedName = params.get("saved");
  if (savedName) {
    const savedProjects = JSON.parse(localStorage.getItem("savedProjects")) || [];
    const project = savedProjects.find(p => p.name === savedName);
    if (project) {
      htmlCode.value = project.html || "";
      cssCode.value = project.css || "";
      jsCode.value = project.js || "";
      projectNameInput.value = project.name;
      updateOutput();
    }
  }
  handleResponsiveTabs(); // Setup tabs on load
});

// Theme switch
themeSwitch.addEventListener("change", () => {
  body.classList.remove("light-theme", "dark-theme", "hacker-theme");
  body.classList.add(`${themeSwitch.value}-theme`);
});

// Mobile tabs
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    editors.forEach(e => (e.style.display = "none"));
    tab.classList.add("active");
    document.querySelector(`[data-editor="${tab.dataset.tab}"]`).style.display = "block";
  });
}); 

// Load saved theme on page load
const savedTheme = localStorage.getItem("selectedTheme") || "light";
document.querySelector(`input[value="${savedTheme}"]`).checked = true;
body.classList.add(`${savedTheme}-theme`);


// Mobile tabs
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    editors.forEach(e => (e.style.display = "none"));
    tab.classList.add("active");
    document.querySelector(`[data-editor="${tab.dataset.tab}"]`).style.display = "block";
  });
});

// Handle tab visibility
function handleResponsiveTabs() {
  if (window.innerWidth <= 768) {
    const active = document.querySelector(".tab.active")?.dataset.tab || "html";
    editors.forEach(e => {
      e.style.display = e.dataset.editor === active ? "block" : "none";
    });
  } else {
    editors.forEach(e => (e.style.display = "block"));
  }
}
window.addEventListener("resize", handleResponsiveTabs);

// Timer
const timeValue = document.getElementById("timeValue");

// ⏱️ Run timer ONLY if we're on index.html (where timeValue exists)
if (timeValue && window.location.pathname.includes("index.html")) {
  let startTime = Date.now();

  setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    timeValue.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

// Saved projects button
if (savedProjectsBtn) {
  savedProjectsBtn.addEventListener("click", () => {
    window.location.href = "saved.html";
  });
}
