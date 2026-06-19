(() => {
  const errors = [];
  const btns = [...document.querySelectorAll('.mode-btn')];
  btns.forEach((b, i) => {
    const on = b.getAttribute('onclick');
    if (!on) return;
    try {
      const fn = new Function(on);
      fn();
    } catch (e) {
      errors.push({
        i: i,
        txt: b.textContent?.slice(0, 20).replace(/\s+/g, ' '),
        msg: e.message
      });
    }
  });
  return JSON.stringify(errors);
})()
