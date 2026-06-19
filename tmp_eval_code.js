(
  () => {
    const buttons = [...document.querySelectorAll('.mode-btn,.btn,.feature-item,.nav-card')].map((b, i) => ({
      i,
      text: b.textContent?.slice(0, 30),
      onclick: b.getAttribute('onclick'),
      id: b.id
    }));
    return JSON.stringify(buttons.slice(0, 30));
  }
)()
