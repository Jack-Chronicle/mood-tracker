import { openModal, closeModal } from "../utils";

export class MoodMenu {
  moods: string[];
  selectedMood: string | null = null;
  resolveFn: ((mood: string | null) => void) | null = null;
  modalElement!: HTMLDivElement;

  private static parseMoodsToTree(moods: string[]) {
    type SectionNode = {
      name: string;
      level: number;
      moods: string[];
      sections: SectionNode[];
      parent?: SectionNode;
    };
    const root: SectionNode = { name: "", level: 0, moods: [], sections: [] };
    let currentSection: SectionNode = root;
    const sectionStack: SectionNode[] = [root];
    for (let line of moods) {
      if (/^#+\s/.test(line)) {
        const match = line.match(/^(#+)\s*(.*)$/);
        if (!match) continue;
        const level = match[1].length;
        const name = match[2].trim();
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
          sectionStack.pop();
        }
        const parent = sectionStack[sectionStack.length - 1];
        const newSection: SectionNode = { name, level, moods: [], sections: [], parent };
        parent.sections.push(newSection);
        sectionStack.push(newSection);
        currentSection = newSection;
      } else if (line.trim().length > 0) {
        currentSection.moods.push(line.replace(/^[-*]\s*/, ""));
      }
    }
    return root;
  }

  constructor(moods: string[]) {
    this.moods = moods;
  }

  displayMenu(widthOverride?: string) {
    // Remove any existing modal
    if (this.modalElement) {
      closeModal(this.modalElement);
    }
    // Modal container
    this.modalElement = document.createElement("div");
    this.modalElement.className = "mood-menu";
    this.modalElement.style.position = "fixed";
    this.modalElement.style.top = "50%";
    this.modalElement.style.left = "50%";
    this.modalElement.style.transform = "translate(-50%, -50%)";
    this.modalElement.style.background = "var(--background-secondary)";
    this.modalElement.style.padding = "24px";
    this.modalElement.style.borderRadius = "var(--radius-m)";
    this.modalElement.style.zIndex = "9999";
    this.modalElement.style.display = "flex";
    this.modalElement.style.flexDirection = "column";
    this.modalElement.style.alignItems = "center";
    this.modalElement.style.boxShadow = "0 4px 32px var(--background-modifier-box-shadow)";
    this.modalElement.style.maxHeight = "80vh";
    this.modalElement.style.overflow = "auto";
    this.modalElement.style.width = widthOverride || "min(700px, 90vw)";
    this.modalElement.style.minWidth = "340px";
    this.modalElement.style.maxWidth = "98vw";
    this.modalElement.style.border = "var(--input-border-width) solid var(--background-modifier-border)";

    // --- Tree parsing ---
    const root = MoodMenu.parseMoodsToTree(this.moods);
    let currentSection = root;
    const sectionStack: typeof root[] = [];

    // --- UI elements ---
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
      if (sectionStack.length > 0) {
        currentSection = sectionStack.pop()!;
        renderSection(currentSection);
      }
    };
    sectionDetail.appendChild(backButton);

    // --- Render function for a section node ---
    const renderSection = (section: ReturnType<typeof MoodMenu.parseMoodsToTree>) => {
      // Show/hide correct containers
      if (section === root) {
        sectionGrid.style.display = "grid";
        sectionDetail.style.display = "none";
        backButton.style.display = "none";
        sectionGrid.innerHTML = "";

        // --- Sort sections and moods alphabetically ---
        const sortedSections = [...section.sections].sort((a, b) => a.name.localeCompare(b.name));
        const sortedMoods = [...section.moods].sort((a, b) => a.localeCompare(b));

        // --- Render sections first ---
        sortedSections.forEach((child) => {
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
          sectionLabel.innerText = child.name;
          sectionLabel.style.fontWeight = "bold";
          sectionLabel.style.fontSize = "1.2rem";
          sectionLabel.style.color = "var(--text-accent)";
          sectionCell.appendChild(sectionLabel);
          sectionCell.onclick = () => {
            sectionStack.push(section);
            currentSection = child;
            renderSection(child);
          };
          sectionGrid.appendChild(sectionCell);
        });

        // --- Add a separator if there are both sections and moods ---
        if (sortedSections.length > 0 && sortedMoods.length > 0) {
          const divider = document.createElement("div");
          divider.style.gridColumn = "1 / -1";
          divider.style.height = "1px";
          divider.style.background = "var(--background-modifier-border)";
          divider.style.margin = "12px 0";
          sectionGrid.appendChild(divider);
        }

        // --- Render moods below sections ---
        sortedMoods.forEach((mood) => {
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
          moodButton.style.whiteSpace = "normal";
          moodButton.style.overflow = "hidden";
          moodButton.style.wordBreak = "normal";
          moodButton.style.textOverflow = "ellipsis";
          moodButton.style.height = "auto";
          moodButton.style.minHeight = "48px";
          moodButton.style.display = "block";
          moodButton.style.width = "100%";
          moodButton.onmouseenter = () => moodButton.style.background = "var(--background-modifier-active-hover)";
          moodButton.onmouseleave = () => moodButton.style.background = "var(--background-modifier-hover)";
          moodButton.onclick = () => {
            this.selectMood(mood);
            Array.from(sectionGrid.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
            moodButton.classList.add("selected-mood");
            this.confirmSelection();
          };
          sectionGrid.appendChild(moodButton);
        });
      } else {
        sectionGrid.style.display = "none";
        sectionDetail.style.display = "flex";
        backButton.style.display = "block";
        // Remove all except backButton
        while (sectionDetail.childNodes.length > 1)
          sectionDetail.removeChild(sectionDetail.lastChild!);

        // --- Sort sections and moods alphabetically ---
        const sortedSections = [...section.sections].sort((a, b) => a.name.localeCompare(b.name));
        const sortedMoods = [...section.moods].sort((a, b) => a.localeCompare(b));

        // Child sections grid
        if (sortedSections.length > 0) {
          const childGrid = document.createElement("div");
          childGrid.style.display = "grid";
          childGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
          childGrid.style.gap = "12px";
          childGrid.style.width = "100%";
          sortedSections.forEach((child) => {
            const sectionCell = document.createElement("div");
            sectionCell.style.display = "flex";
            sectionCell.style.flexDirection = "column";
            sectionCell.style.alignItems = "center";
            sectionCell.style.background = "var(--background-modifier-hover)";
            sectionCell.style.borderRadius = "var(--radius-m)";
            sectionCell.style.padding = "14px 4px 14px 4px";
            sectionCell.style.boxSizing = "border-box";
            sectionCell.style.minWidth = "0";
            sectionCell.style.cursor = "pointer";
            sectionCell.style.transition = "background 0.2s";
            sectionCell.onmouseenter = () => sectionCell.style.background = "var(--background-modifier-active-hover)";
            sectionCell.onmouseleave = () => sectionCell.style.background = "var(--background-modifier-hover)";
            const sectionLabel = document.createElement("div");
            sectionLabel.innerText = child.name;
            sectionLabel.style.fontWeight = "bold";
            sectionLabel.style.fontSize = "1.1rem";
            sectionLabel.style.color = "var(--text-accent)";
            sectionCell.appendChild(sectionLabel);
            sectionCell.onclick = () => {
              sectionStack.push(section);
              currentSection = child;
              renderSection(child);
            };
            childGrid.appendChild(sectionCell);
          });
          sectionDetail.appendChild(childGrid);
        }

        // --- Add a separator if there are both sections and moods ---
        if (sortedSections.length > 0 && sortedMoods.length > 0) {
          const divider = document.createElement("div");
          divider.style.width = "100%";
          divider.style.height = "1px";
          divider.style.background = "var(--background-modifier-border)";
          divider.style.margin = "12px 0";
          sectionDetail.appendChild(divider);
        }

        // Moods grid
        if (sortedMoods.length > 0) {
          const moodsGrid = document.createElement("div");
          moodsGrid.style.display = "grid";
          moodsGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(100px, 1fr))";
          moodsGrid.style.gap = "12px";
          moodsGrid.style.width = "100%";
          sortedMoods.forEach((mood) => {
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
            moodButton.style.whiteSpace = "normal";
            moodButton.style.overflow = "hidden";
            moodButton.style.wordBreak = "normal";
            moodButton.style.textOverflow = "ellipsis";
            moodButton.style.height = "auto";
            moodButton.style.minHeight = "48px";
            moodButton.style.display = "block";
            moodButton.style.width = "100%";
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
        }
      }
    };

    // Initial render
    renderSection(root);

    this.modalElement.appendChild(sectionGrid);
    this.modalElement.appendChild(sectionDetail);

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
    this.modalElement.appendChild(buttonRow);

    const style = document.createElement("style");
    style.innerText = `.selected-mood { background: var(--interactive-accent) !important; color: var(--text-on-accent) !important; border: var(--input-border-width) solid var(--background-primary) !important; }`;
    this.modalElement.appendChild(style);

    // Escape key and navigation
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sectionDetail.style.display === "flex" && sectionStack.length > 0) {
          currentSection = sectionStack.pop()!;
          renderSection(currentSection);
        } else {
          this.closeModal(false);
          window.removeEventListener("keydown", escListener);
        }
      }
    };
    window.addEventListener("keydown", escListener);

    openModal(this.modalElement);
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
    this.closeModal(true);
  }

  cancelSelection() {
    if (this.resolveFn)
      this.resolveFn(null);
    this.closeModal(false);
  }

  closeModal(confirmed = false) {
    closeModal(this.modalElement);
  }

  /**
   * Render the mood menu inline into a container. Calls onSelect when a mood is chosen.
   * This version does NOT wrap in an extra flexbox, so the grid layout is preserved.
   */
  renderInline(container: HTMLElement, onSelect: (mood: string) => void) {
    container.innerHTML = "";
    // --- Tree parsing ---
    const root = MoodMenu.parseMoodsToTree(this.moods);
    let currentSection = root;
    const sectionStack: typeof root[] = [];
    // --- UI elements ---
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
      if (sectionStack.length > 0) {
        currentSection = sectionStack.pop()!;
        renderSection(currentSection);
      }
    };
    sectionDetail.appendChild(backButton);
    // --- Render function for a section node ---
    const renderSection = (section: ReturnType<typeof MoodMenu.parseMoodsToTree>) => {
      if (section === root) {
        sectionGrid.style.display = "grid";
        sectionDetail.style.display = "none";
        backButton.style.display = "none";
        sectionGrid.innerHTML = "";
        const sortedSections = [...section.sections].sort((a, b) => a.name.localeCompare(b.name));
        const sortedMoods = [...section.moods].sort((a, b) => a.localeCompare(b));
        sortedSections.forEach((child) => {
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
          sectionLabel.innerText = child.name;
          sectionLabel.style.fontWeight = "bold";
          sectionLabel.style.fontSize = "1.2rem";
          sectionLabel.style.color = "var(--text-accent)";
          sectionCell.appendChild(sectionLabel);
          sectionCell.onclick = () => {
            sectionStack.push(section);
            currentSection = child;
            renderSection(child);
          };
          sectionGrid.appendChild(sectionCell);
        });
        if (sortedSections.length > 0 && sortedMoods.length > 0) {
          const divider = document.createElement("div");
          divider.style.gridColumn = "1 / -1";
          divider.style.height = "1px";
          divider.style.background = "var(--background-modifier-border)";
          divider.style.margin = "12px 0";
          sectionGrid.appendChild(divider);
        }
        sortedMoods.forEach((mood) => {
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
          moodButton.style.whiteSpace = "normal";
          moodButton.style.overflow = "hidden";
          moodButton.style.wordBreak = "normal";
          moodButton.style.textOverflow = "ellipsis";
          moodButton.style.height = "auto";
          moodButton.style.minHeight = "48px";
          moodButton.style.display = "block";
          moodButton.style.width = "100%";
          moodButton.onmouseenter = () => moodButton.style.background = "var(--background-modifier-active-hover)";
          moodButton.onmouseleave = () => moodButton.style.background = "var(--background-modifier-hover)";
          moodButton.onclick = () => {
            this.selectedMood = mood;
            Array.from(sectionGrid.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
            moodButton.classList.add("selected-mood");
            onSelect(mood);
          };
          sectionGrid.appendChild(moodButton);
        });
      } else {
        sectionGrid.style.display = "none";
        sectionDetail.style.display = "flex";
        backButton.style.display = "block";
        while (sectionDetail.childNodes.length > 1)
          sectionDetail.removeChild(sectionDetail.lastChild!);
        const sortedSections = [...section.sections].sort((a, b) => a.name.localeCompare(b.name));
        const sortedMoods = [...section.moods].sort((a, b) => a.localeCompare(b));
        if (sortedSections.length > 0) {
          const childGrid = document.createElement("div");
          childGrid.style.display = "grid";
          childGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
          childGrid.style.gap = "12px";
          childGrid.style.width = "100%";
          sortedSections.forEach((child) => {
            const sectionCell = document.createElement("div");
            sectionCell.style.display = "flex";
            sectionCell.style.flexDirection = "column";
            sectionCell.style.alignItems = "center";
            sectionCell.style.background = "var(--background-modifier-hover)";
            sectionCell.style.borderRadius = "var(--radius-m)";
            sectionCell.style.padding = "14px 4px 14px 4px";
            sectionCell.style.boxSizing = "border-box";
            sectionCell.style.minWidth = "0";
            sectionCell.style.cursor = "pointer";
            sectionCell.style.transition = "background 0.2s";
            sectionCell.onmouseenter = () => sectionCell.style.background = "var(--background-modifier-active-hover)";
            sectionCell.onmouseleave = () => sectionCell.style.background = "var(--background-modifier-hover)";
            const sectionLabel = document.createElement("div");
            sectionLabel.innerText = child.name;
            sectionLabel.style.fontWeight = "bold";
            sectionLabel.style.fontSize = "1.1rem";
            sectionLabel.style.color = "var(--text-accent)";
            sectionCell.appendChild(sectionLabel);
            sectionCell.onclick = () => {
              sectionStack.push(section);
              currentSection = child;
              renderSection(child);
            };
            childGrid.appendChild(sectionCell);
          });
          sectionDetail.appendChild(childGrid);
        }
        if (sortedSections.length > 0 && sortedMoods.length > 0) {
          const divider = document.createElement("div");
          divider.style.width = "100%";
          divider.style.height = "1px";
          divider.style.background = "var(--background-modifier-border)";
          divider.style.margin = "12px 0";
          sectionDetail.appendChild(divider);
        }
        if (sortedMoods.length > 0) {
          const moodsGrid = document.createElement("div");
          moodsGrid.style.display = "grid";
          moodsGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(100px, 1fr))";
          moodsGrid.style.gap = "12px";
          moodsGrid.style.width = "100%";
          sortedMoods.forEach((mood) => {
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
            moodButton.style.whiteSpace = "normal";
            moodButton.style.overflow = "hidden";
            moodButton.style.wordBreak = "normal";
            moodButton.style.textOverflow = "ellipsis";
            moodButton.style.height = "auto";
            moodButton.style.minHeight = "48px";
            moodButton.style.display = "block";
            moodButton.style.width = "100%";
            moodButton.onmouseenter = () => moodButton.style.background = "var(--background-modifier-active-hover)";
            moodButton.onmouseleave = () => moodButton.style.background = "var(--background-modifier-hover)";
            moodButton.onclick = () => {
              this.selectedMood = mood;
              Array.from(moodsGrid.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
              moodButton.classList.add("selected-mood");
              onSelect(mood);
            };
            moodsGrid.appendChild(moodButton);
          });
          sectionDetail.appendChild(moodsGrid);
        }
      }
    };
    renderSection(root);
    container.appendChild(sectionGrid);
    container.appendChild(sectionDetail);
    // Add style for selected mood
    const style = document.createElement("style");
    style.innerText = `.selected-mood { background: var(--interactive-accent) !important; color: var(--text-on-accent) !important; border: var(--input-border-width) solid var(--background-primary) !important; }`;
    container.appendChild(style);
  }
}
