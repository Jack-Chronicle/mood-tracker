import { App, Modal } from "obsidian";

/**
 * MoodMenu modal for selecting a mood from a list or tree.
 */
export class MoodMenu extends Modal {
  moods: string[];
  selectedMood: string | null = null;
  onSelect: ((mood: string | null) => void) | null = null;

  constructor(app: App, moods: string[], onSelect?: (mood: string | null) => void) {
    super(app);
    this.moods = moods;
    this.onSelect = onSelect || null;
  }

  onOpen() {
    if (!document.getElementById('mood-energy-bundle-css')) {
      const style = document.createElement('link');
      style.id = 'mood-energy-bundle-css';
      style.rel = 'stylesheet';
      style.type = 'text/css';
      style.href = 'styles.css';
      document.head.appendChild(style);
    }
    const { contentEl, modalEl } = this;
    contentEl.empty();
    contentEl.classList.add("mood-menu-modal");
    contentEl.style.margin = "0";
    contentEl.style.padding = "0";
    // Modal header and title (always at top)
    let header = modalEl.querySelector('.modal-header');
    if (!header) {
      header = document.createElement("div");
      header.className = "modal-header";
      const title = document.createElement("div");
      title.className = "modal-title";
      title.textContent = "Select Mood";
      header.appendChild(title);
      if (modalEl.firstChild !== header) {
        modalEl.insertBefore(header, modalEl.firstChild);
      }
    } else {
      let title = header.querySelector('.modal-title');
      if (!title) {
        title = document.createElement("div");
        title.className = "modal-title";
        header.appendChild(title);
      }
      title.textContent = "Select Mood";
      if (modalEl.firstChild !== header) {
        modalEl.insertBefore(header, modalEl.firstChild);
      }
    }
    // Create grid and detail containers for modal
    const sectionGrid = document.createElement("div");
    sectionGrid.className = "mood-menu-grid";
    const sectionDetail = document.createElement("div");
    sectionDetail.className = "mood-menu-section-detail";
    // Render mood menu into a separate container so header is not cleared
    const menuContainer = document.createElement("div");
    menuContainer.className = "mood-menu-inline";
    menuContainer.style.margin = "0";
    menuContainer.style.padding = "0";
    // For modal, pass sectionGrid/sectionDetail to renderInline and append them directly
    this.renderInline(
      menuContainer, // still used for inline, not for modal
      (mood) => {
        this.selectedMood = mood;
        if (this.onSelect) this.onSelect(mood);
        this.close();
      },
      true,
      sectionGrid,
      sectionDetail
    );
    contentEl.appendChild(sectionGrid);
    contentEl.appendChild(sectionDetail);
    // Cancel button row
    const buttonRow = document.createElement("div");
    buttonRow.className = "mood-menu-actions";
    buttonRow.style.display = "flex";
    buttonRow.style.gap = "12px";
    buttonRow.style.marginTop = "10px";
    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.className = "mod-cta cancel-btn";
    cancelButton.setAttribute("type", "button");
    cancelButton.onclick = () => {
      if (this.onSelect) this.onSelect(null);
      this.close();
    };
    buttonRow.appendChild(cancelButton);
    contentEl.appendChild(buttonRow);
  }

  onClose() {
    this.contentEl.empty();
  }

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

  /**
   * Render the mood menu inline into a container. Calls onSelect when a mood is chosen.
   * @param container HTMLElement to render into
   * @param onSelect Callback when a mood is selected
   * @param showBackButton Whether to show the back button (default: true)
   * @param sectionGrid Optional grid container for modal usage
   * @param sectionDetail Optional detail container for modal usage
   */
  renderInline(container: HTMLElement, onSelect: (mood: string) => void, showBackButton: boolean = true, sectionGrid?: HTMLElement, sectionDetail?: HTMLElement) {
    container.innerHTML = "";
    // --- Tree parsing --- 
    const root = MoodMenu.parseMoodsToTree(this.moods);
    let currentSection = root;
    const sectionStack: typeof root[] = [];
    // --- UI elements ---
    // Use provided sectionGrid/sectionDetail if present (modal), else create new (inline)
    sectionGrid = sectionGrid || document.createElement("div");
    sectionGrid.className = "mood-menu-grid";
    sectionGrid.style.display = "grid";
    // Custom column logic
    const getCustomColumns = (itemCount: number) => {
      if (itemCount <= 4) return 1;
      if (itemCount <= 8) return 2;
      if (itemCount <= 18) return 3;
      if (itemCount <= 24) return 4;
      return 4 + Math.floor((itemCount - 19) / 6) + 1;
    };
    sectionGrid.style.gap = "12px"; // Reduce gap between grid items
    sectionGrid.style.width = "100%";
    sectionGrid.style.marginBottom = "0"; // Remove bottom margin
    sectionDetail = sectionDetail || document.createElement("div");
    sectionDetail.className = "mood-menu-section-detail";
    sectionDetail.style.display = "none";
    sectionDetail.style.flexDirection = "column";
    sectionDetail.style.alignItems = "stretch";
    sectionDetail.style.width = "100%";
    sectionDetail.style.marginBottom = "18px";
    // Only add back button if showBackButton is true
    let backButton: HTMLButtonElement | null = null;
    if (showBackButton) {
      backButton = document.createElement("button");
      backButton.innerText = "Back";
      backButton.className = "mod-cta back-btn";
      backButton.type = "button";
      backButton.tabIndex = 0;
      backButton.style.outline = "none";
      backButton.removeAttribute("title");
      backButton.onclick = () => {
        if (sectionStack.length > 0) {
          currentSection = sectionStack.pop()!;
          renderSection(currentSection);
        }
      };
      sectionDetail.appendChild(backButton);
    }
    // --- Render function for a section node ---
    const renderSection = (section: ReturnType<typeof MoodMenu.parseMoodsToTree>) => {
      if (section === root) {
        sectionGrid.style.display = "grid";
        sectionDetail.style.display = "none";
        if (backButton) backButton.style.display = "none";
        sectionGrid.innerHTML = "";
        const sortedSections = [...section.sections].sort((a, b) => a.name.localeCompare(b.name));
        const sortedMoods = [...section.moods].sort((a, b) => a.localeCompare(b));
        const items = [...sortedSections, ...sortedMoods];
        const itemCount = items.length;
        const columns = getCustomColumns(itemCount);
        sectionGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        // Distribute items vertically (column-wise)
        const rows = Math.ceil(itemCount / columns);
        const columnsArr: any[][] = Array.from({ length: columns }, () => []);
        for (let i = 0; i < itemCount; i++) {
          columnsArr[i % columns].push(items[i]);
        }
        // Now render by columns, row by row
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            const item = columnsArr[col][row];
            if (!item) continue;
            if (typeof item === "object" && item.name) {
              // Section
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
              sectionLabel.innerText = item.name;
              sectionLabel.style.fontWeight = "bold";
              sectionLabel.style.fontSize = "1.2rem";
              sectionLabel.style.color = "var(--text-accent)";
              sectionCell.appendChild(sectionLabel);
              sectionCell.onclick = () => {
                sectionStack.push(section);
                currentSection = item;
                renderSection(item);
              };
              sectionGrid.appendChild(sectionCell);
            } else if (typeof item === "string") {
              // Mood
              const moodButton = document.createElement("button");
              moodButton.innerText = item;
              moodButton.className = "mod-cta";
              moodButton.setAttribute("type", "button");
              moodButton.tabIndex = 0;
              moodButton.style.outline = "none";
              moodButton.removeAttribute("title");
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
                this.selectedMood = item;
                Array.from(sectionGrid.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
                moodButton.classList.add("selected-mood");
                onSelect(item);
              };
              sectionGrid.appendChild(moodButton);
            }
          }
        }
        // ...existing code for divider if needed...
      } else {
        sectionGrid.style.display = "none";
        sectionDetail.style.display = "flex";
        if (backButton) backButton.style.display = "block";
        while (sectionDetail.childNodes.length > (backButton ? 1 : 0))
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
            moodButton.setAttribute("type", "button");
            moodButton.tabIndex = 0;
            moodButton.style.outline = "none";
            moodButton.removeAttribute("title");
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
    // In renderInline, do not append sectionGrid/sectionDetail to container for modal usage
    // Instead, only append them for inline usage
    if (container.classList.contains("mood-menu-inline")) {
      container.appendChild(sectionGrid);
      container.appendChild(sectionDetail);
    }
    // After appending sectionGrid and sectionDetail to container, remove margin/padding from container
    container.style.margin = "0";
    container.style.padding = "0";
    // Add style for selected mood
    const style = document.createElement("style");
    style.innerText = `.selected-mood { background: var(--interactive-accent) !important; color: var(--text-on-accent) !important; border: var(--input-border-width) solid var(--background-primary) !important; }`;
    container.appendChild(style);
  }
}
