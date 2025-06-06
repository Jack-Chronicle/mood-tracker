/**
 * Tracks the currently open modal (if any).
 */
export let currentOpenModal: HTMLElement | null = null;

/**
 * Opens a modal, ensuring only one is open at a time.
 * @param modalEl - The modal element to open.
 */
export function openModal(modalEl: HTMLElement) {
  if (currentOpenModal && currentOpenModal !== modalEl) {
    currentOpenModal.remove();
  }
  currentOpenModal = modalEl;
  document.body.appendChild(modalEl);
}

/**
 * Closes a modal and clears the currentOpenModal reference.
 * @param modalEl - The modal element to close.
 */
export function closeModal(modalEl: HTMLElement) {
  if (currentOpenModal === modalEl) {
    modalEl.remove();
    currentOpenModal = null;
  } else {
    modalEl.remove();
  }
}
