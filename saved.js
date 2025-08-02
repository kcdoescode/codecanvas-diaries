const projectList = document.getElementById("projectList");

function renderProjects() {
  const savedProjects = JSON.parse(localStorage.getItem("savedProjects")) || [];

  if (savedProjects.length === 0) {
    projectList.innerHTML = "<p>No saved projects found.</p>";
    return;
  }

  projectList.innerHTML = "";

  savedProjects.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card";

    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>🕒 ${project.timestamp}</p>
      <div class="project-actions">
        <button class="load-btn" data-name="${project.name}">▶ Load</button>
        <button class="delete-btn" data-name="${project.name}">🗑 Delete</button>
      </div>
    `;

    projectList.appendChild(card);
  });

  // Load & Delete actions
  document.querySelectorAll(".load-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      window.location.href = `index.html?saved=${encodeURIComponent(name)}`;
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      let projects = JSON.parse(localStorage.getItem("savedProjects")) || [];
      projects = projects.filter(p => p.name !== name);
      localStorage.setItem("savedProjects", JSON.stringify(projects));
      renderProjects();
      Toastify({
        text: `❌ Deleted "${name}"`,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #ff416c, #ff4b2b)",
        },
      }).showToast();
    });
  });
}

renderProjects();
// Get the container that already exists in HTML
const codeBubblesContainer = document.getElementById('codeBubbles');

function createCodeBubble() {
  const bubble = document.createElement('div');
  bubble.classList.add('code-bubble'); // ✅ Correct class

  const hackerLines = [
    'console.log("Hello, world!");',
    'fetch("/api/data")',
    'let x = 42;',
    'function hack() {}',
    'document.querySelector("#app")',
    'if (true) { return; }',
    'while(true) {}',
    'const magic = "0xCAFEBABE";',
    'alert("System breached")',
    '/* encrypted stream */'
  ];

  bubble.textContent = hackerLines[Math.floor(Math.random() * hackerLines.length)];
  bubble.style.left = `${Math.random() * 100}%`;
  bubble.style.top = `${100 + Math.random() * 10}vh`; // start below screen
  bubble.style.fontSize = `${12 + Math.random() * 6}px`; // Optional: random size

  codeBubblesContainer.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 8000);
}

// Repeat forever
setInterval(createCodeBubble, 500);
