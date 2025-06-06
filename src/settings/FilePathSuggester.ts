export class FilePathSuggester {
  constructor(inputEl: HTMLInputElement, app: any) {
    let lastSuggestions: string[] = [];
    let dropdown: HTMLDivElement | null = null;
    let selectedIdx: number = -1;
    let items: HTMLDivElement[] = [];
    const highlightClass = "file-path-suggester-highlight";
    if (!document.getElementById("file-path-suggester-style")) {
      const style = document.createElement("style");
      style.id = "file-path-suggester-style";
      style.textContent = `
        .file-path-suggester-dropdown {
          background: var(--background-secondary);
          border: 1px solid var(--background-modifier-border);
          color: var(--text-normal);
          box-shadow: 0 2px 8px var(--background-modifier-box-shadow);
          border-radius: var(--radius-m);
          font-size: var(--font-ui-medium);
          padding: 4px 0;
        }
        .file-path-suggester-dropdown div {
          padding: 4px 12px;
          cursor: pointer;
          border-radius: var(--radius-s);
        }
        .file-path-suggester-dropdown div:hover,
        .file-path-suggester-highlight {
          background: var(--background-modifier-hover);
          color: var(--text-accent);
        }
      `;
      document.head.appendChild(style);
    }
    function closeDropdown() {
      if (dropdown) dropdown.remove();
      dropdown = null;
      items = [];
      selectedIdx = -1;
    }
    function openDropdown(suggestions: string[]) {
      closeDropdown();
      if (!suggestions.length) return;
      dropdown = document.createElement("div");
      dropdown.className = "file-path-suggester-dropdown";
      dropdown.style.position = "absolute";
      dropdown.style.zIndex = "9999";
      dropdown.style.maxHeight = "200px";
      dropdown.style.overflowY = "auto";
      dropdown.style.width = inputEl.offsetWidth + "px";
      const rect = inputEl.getBoundingClientRect();
      dropdown.style.left = rect.left + window.scrollX + "px";
      dropdown.style.top = (rect.bottom + window.scrollY) + "px";
      suggestions.forEach((s, idx) => {
        const item = document.createElement("div");
        item.textContent = s;
        item.tabIndex = -1;
        item.onmouseenter = () => setHighlight(idx);
        item.onmouseleave = () => setHighlight(-1);
        item.onmousedown = (e) => {
          e.preventDefault();
          inputEl.value = s;
          inputEl.dispatchEvent(new Event("input"));
          closeDropdown();
        };
        dropdown!.appendChild(item);
        items.push(item);
      });
      document.body.appendChild(dropdown);
    }
    function setHighlight(idx: number) {
      items.forEach((el, i) => {
        if (i === idx) el.classList.add(highlightClass);
        else el.classList.remove(highlightClass);
      });
      selectedIdx = idx;
    }
    inputEl.addEventListener("input", () => {
      const query = inputEl.value.toLowerCase();
      const files = app.vault.getFiles();
      const suggestions = files
        .map((f: any) => f.path)
        .filter((path: string) => path.toLowerCase().includes(query))
        .slice(0, 20);
      lastSuggestions = suggestions;
      openDropdown(suggestions);
    });
    inputEl.addEventListener("keydown", (e) => {
      if (!dropdown || !items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((selectedIdx + 1) % items.length);
        items[selectedIdx]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((selectedIdx - 1 + items.length) % items.length);
        items[selectedIdx]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        if (selectedIdx >= 0 && selectedIdx < items.length) {
          inputEl.value = lastSuggestions[selectedIdx];
          inputEl.dispatchEvent(new Event("input"));
          closeDropdown();
          e.preventDefault();
        }
      } else if (e.key === "Escape") {
        closeDropdown();
      }
    });
    inputEl.addEventListener("blur", () => setTimeout(closeDropdown, 100));
  }
}
