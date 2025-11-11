const centralCard = document.getElementById("centralCard");
const myNameInput = document.getElementById("myName");
const myIntroInput = document.getElementById("myIntro");
const myPhotoInput = document.getElementById("myPhoto");
const myNameDisplay = document.getElementById("myNameDisplay");
const myIntroDisplay = document.getElementById("myIntroDisplay");
const myPhotoPreview = document.getElementById("myPhotoPreview");

const objNameInput = document.getElementById("objName");
const objDescInput = document.getElementById("objDesc");
const objPhotoInput = document.getElementById("objPhoto");
const createObjBtn = document.getElementById("createObjBtn");

const themeButtons = document.querySelectorAll(".theme-circle");
const captureBtn = document.getElementById("captureBtn");

const mainArea = document.getElementById("mainArea");
const linkCanvas = document.getElementById("linkCanvas");
const ctx = linkCanvas.getContext("2d");

function resizeCanvas() {
  linkCanvas.width = mainArea.clientWidth;
  linkCanvas.height = mainArea.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let objects = [];
let globalTheme = "pink";
const PADDING = 10;

const themes = {
  pink: {
    bg: "#ffeaf3",
    text: "#d6336c",
    line: "#d6336c",
    cardColors: ["#ffc0cb", "#ffb6c1", "#ff99aa", "#ffd1dc"]
  },
  blue: {
    bg: "#e0f0ff",
    text: "#003366",
    line: "#003366",
    cardColors: ["#a0d2ff", "#80bfff", "#99ccff", "#b3e0ff"]
  },
  green: {
    bg: "#e8ffe8",
    text: "#006600",
    line: "#006600",
    cardColors: ["#b0ffb0", "#90ee90", "#c0ffc0", "#aaffaa"]
  },
  dark: {
    bg: "#222222",
    text: "#ffffff",
    line: "#ffffff",
    cardColors: ["#555555", "#666666", "#777777", "#888888"]
  }
};

function getRandomCardColor(theme) {
  const colors = themes[theme].cardColors;
  return colors[Math.floor(Math.random() * colors.length)];
}

myNameInput.addEventListener(
  "input",
  () => (myNameDisplay.textContent = myNameInput.value || "이름")
);
myIntroInput.addEventListener(
  "input",
  () => (myIntroDisplay.textContent = myIntroInput.value || "소개")
);
myPhotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    myPhotoPreview.src = URL.createObjectURL(file);
    myPhotoPreview.style.display = "block";
  }
});

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    globalTheme = btn.dataset.theme;
    const t = themes[globalTheme];
    mainArea.style.backgroundColor = t.bg;
    centralCard.style.backgroundColor = getRandomCardColor(globalTheme);
    centralCard.style.color = t.text;
  });
});

createObjBtn.addEventListener("click", () => {
  const name = objNameInput.value || "오브젝트";
  const desc = objDescInput.value || "설명";
  const file = objPhotoInput.files[0];

  const card = document.createElement("div");
  card.className = "card";
  card.style.backgroundColor = getRandomCardColor(globalTheme);
  card.style.color = themes[globalTheme].text;

  const xBtn = document.createElement("div");
  xBtn.textContent = "✕";
  xBtn.className = "delete-x";
  xBtn.style.backgroundColor = themes[globalTheme].text;
  xBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    card.remove();
    objects = objects.filter((o) => o.el !== card);
  });
  card.appendChild(xBtn);

  const h2 = document.createElement("h2");
  h2.textContent = name;
  h2.style.color = themes[globalTheme].text;
  const p = document.createElement("p");
  p.textContent = desc;
  p.style.color = themes[globalTheme].text;
  card.appendChild(h2);
  card.appendChild(p);

  function finalize() {
    mainArea.appendChild(card);

    const w = card.offsetWidth,
      h = card.offsetHeight;
    const pos = getNonOverlapPosition(w, h, PADDING);
    card.style.left = pos.x + "px";
    card.style.top = pos.y + "px";

    objects.push({
      el: card,
      x: pos.x,
      y: pos.y,
      w,
      h,
      speedX: Math.random() - 0.5,
      speedY: Math.random() - 0.5
    });

    objNameInput.value = "";
    objDescInput.value = "";
    objPhotoInput.value = "";
  }

  if (file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.onload = finalize;
    card.appendChild(img);
  } else finalize();
});

function getNonOverlapPosition(w, h, p) {
  const max = 300;
  const rect = centralCard.getBoundingClientRect();
  const areaRect = mainArea.getBoundingClientRect();
  const cx = rect.left - areaRect.left;
  const cy = rect.top - areaRect.top;
  const cw = rect.width;
  const ch = rect.height;

  let x,
    y,
    i = 0;
  do {
    x = Math.random() * (mainArea.clientWidth - w);
    y = Math.random() * (mainArea.clientHeight - h);

    let bad = objects.some((o) => {
      return !(
        x + w + p < o.x ||
        x > o.x + o.w + p ||
        y + h + p < o.y ||
        y > o.y + o.h + p
      );
    });

    let badCenter = !(
      x + w + p < cx ||
      x > cx + cw + p ||
      y + h + p < cy ||
      y > cy + ch + p
    );

    if (!bad && !badCenter) break;
    i++;
  } while (i < max);

  return { x, y };
}

function isColliding(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

function animate() {
  ctx.clearRect(0, 0, linkCanvas.width, linkCanvas.height);

  const areaRect = mainArea.getBoundingClientRect();
  const cRect = centralCard.getBoundingClientRect();
  const centerX = cRect.left - areaRect.left + cRect.width / 2;
  const centerY = cRect.top - areaRect.top + cRect.height / 2;

  const centralObj = {
    x: cRect.left - areaRect.left,
    y: cRect.top - areaRect.top,
    w: cRect.width,
    h: cRect.height
  };

  objects.forEach((o) => {
    o.w = o.el.offsetWidth;
    o.h = o.el.offsetHeight;
    o.x += o.speedX;
    o.y += o.speedY;

    if (o.x < 0) {
      o.x = 0;
      o.speedX *= -1;
    }
    if (o.x + o.w > mainArea.clientWidth) {
      o.x = mainArea.clientWidth - o.w;
      o.speedX *= -1;
    }
    if (o.y < 0) {
      o.y = 0;
      o.speedY *= -1;
    }
    if (o.y + o.h > mainArea.clientHeight) {
      o.y = mainArea.clientHeight - o.h;
      o.speedY *= -1;
    }

    if (isColliding(o, centralObj)) {
      o.speedX *= -1;
      o.speedY *= -1;
    }
  });

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (isColliding(objects[i], objects[j])) {
        objects[i].speedX *= -1;
        objects[i].speedY *= -1;
        objects[j].speedX *= -1;
        objects[j].speedY *= -1;
      }
    }
  }

  objects.forEach((o) => {
    o.el.style.left = o.x + "px";
    o.el.style.top = o.y + "px";

    const r = o.el.getBoundingClientRect();
    let ox = r.left - areaRect.left + r.width / 2;
    let oy = r.top - areaRect.top + r.height / 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(ox, oy);
    ctx.strokeStyle = themes[globalTheme].line;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  requestAnimationFrame(animate);
}
animate();

captureBtn.addEventListener("click", () => {
  html2canvas(mainArea, { backgroundColor: themes[globalTheme].bg }).then(
    (canvas) => {
      const a = document.createElement("a");
      a.download = "mindmap.png";
      a.href = canvas.toDataURL();
      a.click();
    }
  );
});
