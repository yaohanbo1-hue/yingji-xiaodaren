/**
 * ============================================================================
 * Modal
 * ============================================================================
 * 
 *
 * Auto-generated from game.js refactoring.
 * ============================================================================
 */

const Modal = {show(title,desc,icon="📢"){document.getElementById("modalTitle").textContent=title,document.getElementById("modalDesc").innerHTML=desc,document.querySelector("#modalContent > div:first-child").textContent=icon,document.getElementById("modalOverlay").classList.add("active")},hide(){document.getElementById("modalOverlay").classList.remove("active")}};
