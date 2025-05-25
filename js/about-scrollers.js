const baseText = "thousand.cursed.enemies";
const chars = (baseText.repeat(3)).split('').reverse();
const symbolHeightPx = 20;
const speed = 200;
const containerHeight = window.innerHeight;
const visibleCharsCount = Math.ceil(containerHeight / symbolHeightPx);
const baseLength = baseText.length;

let colorCycle = 0;

function createVerticalScroller(containerId, offset, scrollerIndex) {
  const container = document.getElementById(containerId);
  const elements = [];

  for (let i = 0; i < visibleCharsCount; i++) {
    const span = document.createElement('span');
    span.className = 'char';
    const index = (i + offset) % chars.length;
    span.textContent = chars[index];
    span.style.top = (containerHeight - (i + 1) * symbolHeightPx) + 'px';
    span.dataset.charIndex = index;
    span.dataset.baseOffset = i;
    container.appendChild(span);
    elements.push(span);
  }

  let lastTimestamp = null;
  let passedCount = 0;

  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    let delta = timestamp - lastTimestamp;
    if (delta > 100) delta = 100;
    lastTimestamp = timestamp;

    for (let el of elements) {
      let topPx = parseFloat(el.style.top);
      topPx -= speed * (delta / 1000);

      if (topPx + symbolHeightPx <= 0) {
        topPx = containerHeight - symbolHeightPx;
        let currentIndex = parseInt(el.dataset.charIndex);
        currentIndex = (currentIndex + 1) % chars.length;
        el.dataset.charIndex = currentIndex;
        el.textContent = chars[currentIndex];

        if (chars[currentIndex] === baseText[baseLength - 1]) {
          passedCount++;
          if (passedCount % (baseLength * 3) === 0 && colorCycle % 3 === scrollerIndex) {
            for (let j = 0; j < elements.length; j++) {
              const el = elements[j];
              const idx = parseInt(el.dataset.charIndex);
              let isMatch = true;
              for (let k = 0; k < baseLength; k++) {
                const nextIndex = (idx + k) % chars.length;
                if (chars[nextIndex] !== baseText[baseLength - 1 - k]) {
                  isMatch = false;
                  break;
                }
              }
              if (isMatch) {
                for (let k = 0; k < baseLength; k++) {
                  const indexToColor = (j + k) % elements.length;
                  elements[indexToColor].style.color = 'red';
                }
                break;
              }
            }
            colorCycle++;
          }
        }
      }

      if (el.style.color !== 'red') {
        el.style.color = 'white';
      } else {
        el.style.color = 'white'; // сброс цвета
      }

      el.style.top = topPx + 'px';
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

createVerticalScroller("container1", 0, 0);
createVerticalScroller("container2", 7, 1);
createVerticalScroller("container3", 14, 2);
