// moodMenu.ts
// Mood selection modal logic for the Mood & Energy Obsidian plugin.

/**
 * Modal for selecting a mood from a list/grid.
 */
export class MoodMenu {
  moods: string[];
  selectedMood: string | null = null;
  resolveFn: ((mood: string | null) => void) | null = null;

  /**
   * @param moods - List of available moods.
   */
  constructor(moods: string[]) {
    this.moods = moods;
  }

  /**
   * Displays the mood selection menu.
   * @param widthOverride - Optional width override for the menu.
   */
  displayMenu(widthOverride?: string) {
    const menu = document.createElement("div");
    menu.className = "mood-menu";
    menu.style.position = "fixed";
    menu.style.top = "50%";
    menu.style.left = "50%";
    menu.style.transform = "translate(-50%, -50%)";
    menu.style.background = "var(--background-secondary)";
    menu.style.padding = "24px";
    menu.style.borderRadius = "var(--radius-m)";
    menu.style.zIndex = "9999";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.alignItems = "center";
    menu.style.boxShadow = "0 4px 32px var(--background-modifier-box-shadow)";
    menu.style.maxHeight = "80vh";
    menu.style.overflow = "auto";
    menu.style.width = widthOverride || "min(700px, 90vw)";
    menu.style.minWidth = "340px";
    menu.style.maxWidth = "98vw";
    menu.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    const sectionGrid = document.createElement("div");
    sectionGrid.style.display = "grid";
    sectionGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
    sectionGrid.style.gap = "18px";
    sectionGrid.style.width = "100%";
    sectionGrid.style.marginBottom = "18px";
    const sectionDetail = document.createElement("div");
    sectionDetail.style.display = "none";
    sectionDetail.style.flexDirection = "column";
    sectionDetail.style.alignItems = "stretch";
    sectionDetail.style.width = "100%";
    sectionDetail.style.marginBottom = "18px";
    const backButton = document.createElement("button");
    backButton.innerText = "\u2190 Back";
    backButton.className = "mod-cta";
    backButton.style.marginBottom = "12px";
    backButton.style.alignSelf = "flex-start";
    backButton.style.padding = "var(--size-4-2) var(--size-4-4)";
    backButton.style.borderRadius = "var(--radius-s)";
    backButton.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    backButton.style.background = "var(--background-modifier-hover)";
    backButton.style.color = "var(--text-normal)";
    backButton.style.fontWeight = "bold";
    backButton.style.cursor = "pointer";
    backButton.onclick = () => {
      sectionDetail.style.display = "none";
      sectionGrid.style.display = "grid";
      backButton.style.display = "none";
    };
    sectionDetail.appendChild(backButton);
    backButton.style.display = "none";
    let i = 0;
    const sectionData: { header: string, moods: string[] }[] = [];
    while (i < this.moods.length) {
      const mood = this.moods[i];
      if (/^#+\s/.test(mood)) {
        const headerText = mood.replace(/^#+\s*/, "");
        const moods: string[] = [];
        i++;
        while (i < this.moods.length && !/^#+\s/.test(this.moods[i])) {
          moods.push(this.moods[i].replace(/^[-*]\s*/, ""));
          i++;
        }
        sectionData.push({ header: headerText, moods });
      } else if (!/^[-*]\s*/.test(mood)) {
        sectionData.push({ header: mood, moods: [] });
        i++;
      } else {
        i++;
      }
    }
    sectionData.forEach((section) => {
      const sectionCell = document.createElement("div");
      sectionCell.style.display = "flex";
      sectionCell.style.flexDirection = "column";
      sectionCell.style.alignItems = "center";
      sectionCell.style.background = "var(--background-modifier-hover)";
      sectionCell.style.borderRadius = "var(--radius-m)";
      sectionCell.style.padding = "18px 6px 18px 6px";
      sectionCell.style.boxSizing = "border-box";
      sectionCell.style.minWidth = "0";
      sectionCell.style.cursor = "pointer";
      sectionCell.style.transition = "background 0.2s";
      sectionCell.onmouseenter = () => sectionCell.style.background = "var(--background-modifier-active-hover)";
      sectionCell.onmouseleave = () => sectionCell.style.background = "var(--background-modifier-hover)";
      const sectionLabel = document.createElement("div");
      sectionLabel.innerText = section.header;
      sectionLabel.style.fontWeight = "bold";
      sectionLabel.style.fontSize = "1.2rem";
      sectionLabel.style.color = "var(--text-accent)";
      sectionCell.appendChild(sectionLabel);
      sectionCell.onclick = () => {
        sectionGrid.style.display = "none";
        sectionDetail.style.display = "flex";
        backButton.style.display = "block";
        while (sectionDetail.childNodes.length > 1)
          sectionDetail.removeChild(sectionDetail.lastChild!);
        const moodsGrid = document.createElement("div");
        moodsGrid.style.display = "grid";
        moodsGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(100px, 1fr))";
        moodsGrid.style.gap = "12px";
        moodsGrid.style.width = "100%";
        section.moods.forEach((mood) => {
          const moodButton = document.createElement("button");
          moodButton.innerText = mood;
          moodButton.className = "mod-cta";
          moodButton.style.padding = "var(--size-4-2) var(--size-4-4)";
          moodButton.style.borderRadius = "var(--radius-s)";
          moodButton.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
          moodButton.style.background = "var(--background-modifier-hover)";
          moodButton.style.color = "var(--text-normal)";
          moodButton.style.fontSize = "1rem";
          moodButton.style.cursor = "pointer";
          moodButton.onmouseenter = () => moodButton.style.background = "var(--background-modifier-active-hover)";
          moodButton.onmouseleave = () => moodButton.style.background = "var(--background-modifier-hover)";
          moodButton.onclick = () => {
            this.selectMood(mood);
            Array.from(moodsGrid.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
            moodButton.classList.add("selected-mood");
            this.confirmSelection();
          };
          moodsGrid.appendChild(moodButton);
        });
        sectionDetail.appendChild(moodsGrid);
      };
      sectionGrid.appendChild(sectionCell);
    });
    menu.appendChild(sectionGrid);
    menu.appendChild(sectionDetail);
    const buttonRow = document.createElement("div");
    buttonRow.style.display = "flex";
    buttonRow.style.gap = "12px";
    buttonRow.style.marginTop = "10px";
    const okayButton = document.createElement("button");
    okayButton.innerText = "Okay";
    okayButton.className = "mod-cta";
    okayButton.style.padding = "var(--size-4-2) var(--size-4-4)";
    okayButton.style.borderRadius = "var(--radius-s)";
    okayButton.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    okayButton.style.background = "var(--interactive-accent)";
    okayButton.style.color = "var(--text-on-accent)";
    okayButton.style.fontWeight = "bold";
    okayButton.style.cursor = "pointer";
    okayButton.onclick = () => this.confirmSelection();
    buttonRow.appendChild(okayButton);
    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.className = "mod-cta";
    cancelButton.style.padding = "var(--size-4-2) var(--size-4-4)";
    cancelButton.style.borderRadius = "var(--radius-s)";
    cancelButton.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    cancelButton.style.background = "var(--background-modifier-hover)";
    cancelButton.style.color = "var(--color-red)";
    cancelButton.style.fontWeight = "bold";
    cancelButton.style.cursor = "pointer";
    cancelButton.onclick = () => this.cancelSelection();
    buttonRow.appendChild(cancelButton);
    menu.appendChild(buttonRow);
    const style = document.createElement("style");
    style.innerText = `.selected-mood { background: var(--interactive-accent) !important; color: var(--text-on-accent) !important; border: var(--input-border-width) solid var(--background-primary) !important; }`;
    menu.appendChild(style);
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sectionDetail.style.display === "flex") {
          sectionDetail.style.display = "none";
          sectionGrid.style.display = "grid";
          backButton.style.display = "none";
        } else {
          this.closeMenu();
          window.removeEventListener("keydown", escListener);
        }
      }
    };
    window.addEventListener("keydown", escListener);
    document.body.appendChild(menu);
  }

  /**
   * Opens the modal and returns a promise resolving to the selected mood or null.
   */
  open(): Promise<string | null> {
    this.displayMenu();
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  /**
   * Selects a mood.
   * @param mood - The mood to select.
   */
  selectMood(mood: string) {
    this.selectedMood = mood;
  }

  /**
   * Confirms the current selection and closes the modal.
   */
  confirmSelection() {
    if (this.resolveFn)
      this.resolveFn(this.selectedMood);
    this.closeMenu();
  }

  /**
   * Cancels the selection and closes the modal.
   */
  cancelSelection() {
    if (this.resolveFn)
      this.resolveFn(null);
    this.closeMenu();
  }

  /**
   * Closes the modal and cleans up.
   */
  closeMenu() {
    const menu = document.querySelector(".mood-menu");
    if (menu) {
      menu.remove();
    }
  }
}
