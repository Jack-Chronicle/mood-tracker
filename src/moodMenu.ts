export class MoodMenu {
  moods: string[];
  selectedMood: string | null = null;
  resolveFn: ((mood: string | null) => void) | null = null;

  constructor(moods: string[]) {
    this.moods = moods;
  }

  displayMenu(widthOverride?: string) {
    const menu = document.createElement("div");
    menu.className = "mood-menu";
    menu.style.position = "fixed";
    menu.style.top = "50%";
    menu.style.left = "50%";
    menu.style.transform = "translate(-50%, -50%)";
    menu.style.background = "var(--background-secondary, #222)";
    menu.style.padding = "24px";
    menu.style.borderRadius = "12px";
    menu.style.zIndex = "9999";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.alignItems = "center";
    menu.style.boxShadow = "0 4px 32px var(--shadow-s, rgba(0,0,0,0.3))";
    menu.style.maxHeight = "80vh";
    menu.style.overflow = "auto";
    menu.style.width = widthOverride || "min(700px, 90vw)";
    menu.style.minWidth = "340px";
    menu.style.maxWidth = "98vw";
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
    backButton.style.marginBottom = "12px";
    backButton.style.alignSelf = "flex-start";
    backButton.style.padding = "6px 16px";
    backButton.style.borderRadius = "8px";
    backButton.style.border = "none";
    backButton.style.background = "var(--background-modifier-hover, #444)";
    backButton.style.color = "var(--text-normal, #fff)";
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
      sectionCell.style.background = "var(--background-modifier-hover, rgba(255,255,255,0.02))";
      sectionCell.style.borderRadius = "8px";
      sectionCell.style.padding = "18px 6px 18px 6px";
      sectionCell.style.boxSizing = "border-box";
      sectionCell.style.minWidth = "0";
      sectionCell.style.cursor = "pointer";
      sectionCell.style.transition = "background 0.2s";
      sectionCell.onmouseenter = () => sectionCell.style.background = "var(--background-modifier-active-hover, rgba(80,120,255,0.08))";
      sectionCell.onmouseleave = () => sectionCell.style.background = "var(--background-modifier-hover, rgba(255,255,255,0.02))";
      const sectionLabel = document.createElement("div");
      sectionLabel.innerText = section.header;
      sectionLabel.style.fontWeight = "bold";
      sectionLabel.style.fontSize = "1.2rem";
      sectionLabel.style.color = "var(--text-accent, #aaf)";
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
          moodButton.style.padding = "10px 18px";
          moodButton.style.borderRadius = "8px";
          moodButton.style.border = "none";
          moodButton.style.background = "var(--background-modifier-hover, #444)";
          moodButton.style.color = "var(--text-normal, #fff)";
          moodButton.style.fontSize = "1rem";
          moodButton.style.cursor = "pointer";
          moodButton.onmouseenter = () => moodButton.style.background = "var(--background-modifier-active-hover, #666)";
          moodButton.onmouseleave = () => moodButton.style.background = "var(--background-modifier-hover, #444)";
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
    okayButton.style.padding = "8px 18px";
    okayButton.style.borderRadius = "8px";
    okayButton.style.border = "none";
    okayButton.style.background = "var(--interactive-accent, #3a7)";
    okayButton.style.color = "var(--text-on-accent, #fff)";
    okayButton.style.fontWeight = "bold";
    okayButton.style.cursor = "pointer";
    okayButton.onclick = () => this.confirmSelection();
    buttonRow.appendChild(okayButton);
    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.style.padding = "8px 18px";
    cancelButton.style.borderRadius = "8px";
    cancelButton.style.border = "none";
    cancelButton.style.background = "var(--color-red, #a33)";
    cancelButton.style.color = "var(--text-on-accent, #fff)";
    cancelButton.style.fontWeight = "bold";
    cancelButton.style.cursor = "pointer";
    cancelButton.onclick = () => this.cancelSelection();
    buttonRow.appendChild(cancelButton);
    menu.appendChild(buttonRow);
    const style = document.createElement("style");
    style.innerText = `.selected-mood { background: var(--interactive-accent, #3a7) !important; color: var(--text-on-accent, #fff) !important; border: 2px solid var(--background-primary, #fff) !important; }`;
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

  open(): Promise<string | null> {
    this.displayMenu();
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  selectMood(mood: string) {
    this.selectedMood = mood;
  }

  confirmSelection() {
    if (this.resolveFn)
      this.resolveFn(this.selectedMood);
    this.closeMenu();
  }

  cancelSelection() {
    if (this.resolveFn)
      this.resolveFn(null);
    this.closeMenu();
  }

  closeMenu() {
    const menu = document.querySelector(".mood-menu");
    if (menu) {
      menu.remove();
    }
  }
}
