// types/index.ts
// Type definitions, settings, utilities, and modal management for the Mood & Energy Obsidian plugin.

import { PluginSettingTab, Setting, TFile, normalizePath, App, SuggestModal, TextComponent } from "obsidian";

/**
 * Interface for plugin settings.
 */
export interface MoodEnergyPluginSettings {
  moodsFilePath: string;
  energyDisplay: "text" | "percent" | "bar";
  energyFormat: string;
  barIcons: string; // e.g. '⣿⣷⣶⣦⣤⣄⣀' or '█▓▒░'
  barIconCount: number; // number of icons in the bar
  energyOnlyFormat: string;
  moodOnlyFormat: string;
  moodAndEnergyFormat: string;
  showMoodRibbon?: boolean;
  showEnergyRibbon?: boolean;
  showCombinedRibbon?: boolean;
}

/**
 * Default settings for the plugin.
 */
export const DEFAULT_SETTINGS: MoodEnergyPluginSettings = {
  moodsFilePath: "moods.txt",
  energyDisplay: "bar",
  energyFormat: "Energy: {value}",
  barIcons: "⣿⣷⣶⣦⣤⣄⣀", // Default: 7 levels
  barIconCount: 7,
  energyOnlyFormat: "Energy: {value}",
  moodOnlyFormat: "{value}",
  moodAndEnergyFormat: "{mood} | {energy}",
  showMoodRibbon: true,
  showEnergyRibbon: true,
  showCombinedRibbon: true,
};

/**
 * Formats a progress bar using a string of icons and a value.
 * @param barIcons - String of icons from full to empty.
 * @param value - Value from 0 to 100.
 * @param iconCount - Number of icons to display.
 * @returns The formatted bar string.
 */
export function formatBarIcons(barIcons: string, value: number, iconCount: number): string {
  if (!barIcons || barIcons.length < 2 || iconCount < 1) return value.toString();
  const levels = barIcons.length;
  const percent = Math.max(0, Math.min(100, value));
  let bar = "";
  for (let i = 0; i < iconCount; i++) {
    // For each icon, determine how full it should be
    const iconPercent = 100 * (i + 1) / iconCount;
    const rel = percent - (100 * i / iconCount);
    let iconLevel = Math.round((1 - rel / (100 / iconCount)) * (levels - 1));
    if (percent >= iconPercent) iconLevel = 0; // full
    else if (percent <= 100 * i / iconCount) iconLevel = levels - 1; // empty
    iconLevel = Math.max(0, Math.min(levels - 1, iconLevel));
    bar += barIcons[iconLevel];
  }
  return bar;
}

// --- Modal Management Utility ---
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

/**
 * Modal for suggesting file paths for moods file setting.
 */
export class MoodFileSuggestModal extends SuggestModal<string> {
  plugin: any;
  constructor(app: App, plugin: any) {
    super(app);
    this.plugin = plugin;
  }
  getSuggestions(query: string): string[] {
    const files = this.app.vault.getFiles();
    return files
      .map(f => f.path)
      .filter(path => path.toLowerCase().includes(query.toLowerCase()));
  }
  renderSuggestion(value: string, el: HTMLElement) {
    el.setText(value);
  }
  onChooseSuggestion(value: string) {
    this.plugin.settings.moodsFilePath = value;
    this.plugin.saveSettings();
    if (this.plugin.settingTab?.display) this.plugin.settingTab.display();
  }
}

/**
 * Inline file path suggester for settings tab.
 */
export class FilePathSuggester {
  constructor(inputEl: HTMLInputElement, app: App) {
    let lastSuggestions: string[] = [];
    let dropdown: HTMLDivElement | null = null;
    let selectedIdx: number = -1;
    let items: HTMLDivElement[] = [];
    const highlightClass = "file-path-suggester-highlight";
    // Add style for highlight and dropdown
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
      if (dropdown) closeModal(dropdown);
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
        item.onmouseenter = () => {
          setHighlight(idx);
        };
        item.onmouseleave = () => {
          setHighlight(-1);
        };
        item.onmousedown = (e) => {
          e.preventDefault();
          inputEl.value = s;
          inputEl.dispatchEvent(new Event("input"));
          closeDropdown();
        };
        dropdown!.appendChild(item);
        items.push(item);
      });
      openModal(dropdown);
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
        .map(f => f.path)
        .filter(path => path.toLowerCase().includes(query))
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

/**
 * Settings tab for the plugin.
 */
export class MoodEnergySettingTab extends PluginSettingTab {
  plugin: any;
  constructor(app: any, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
    plugin.settingTab = this;
  }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Mood & Energy Plugin Settings" });
    containerEl.createEl("h3", { text: "Mood Settings" });
    new Setting(containerEl)
      .setName("Moods File Path")
      .setDesc("Path to the file containing your moods, one per line (excluding frontmatter). Start typing to see suggestions from your vault.")
      .addText((text: TextComponent) => {
        text.setPlaceholder("moods.txt")
          .setValue(this.plugin.settings.moodsFilePath)
          .onChange(async (value) => {
            this.plugin.settings.moodsFilePath = value;
            await this.plugin.saveSettings();
          });
        // Attach inline file path suggester
        setTimeout(() => new FilePathSuggester(text.inputEl, this.app), 0);
      });
    containerEl.createEl("h3", { text: "Energy Settings" });
    new Setting(containerEl)
      .setName("Energy Display")
      .setDesc("How to display the energy value: as text, percent, or a progress bar.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("text", "Text")
          .addOption("percent", "Percent")
          .addOption("bar", "Progress Bar")
          .setValue(this.plugin.settings.energyDisplay)
          .onChange(async (value) => {
            this.plugin.settings.energyDisplay = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );
    if (this.plugin.settings.energyDisplay === "bar") {
      new Setting(containerEl)
        .setName("Bar Icons")
        .setDesc("Icons for the progress bar, from full to empty (e.g. ⣿⣷⣶⣦⣤⣄⣀ or █▓▒░)")
        .addText((text) =>
          text
            .setPlaceholder("⣿⣷⣶⣦⣤⣄⣀")
            .setValue(this.plugin.settings.barIcons)
            .onChange(async (value) => {
              this.plugin.settings.barIcons = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Bar Icon Count")
        .setDesc("Number of icons in the progress bar (e.g. 5, 7, 10, 20)")
        .addText((text) =>
          text
            .setPlaceholder("7")
            .setValue(this.plugin.settings.barIconCount.toString())
            .onChange(async (value) => {
              const num = parseInt(value);
              if (!isNaN(num) && num > 0) {
                this.plugin.settings.barIconCount = num;
                await this.plugin.saveSettings();
              }
            })
        );
    }
    containerEl.createEl("h3", { text: "Output Format Settings" });
    new Setting(containerEl)
      .setName("Energy Only Output Format")
      .setDesc("Format for energy only output. Use {value} for the energy bar/number.")
      .addText((text) =>
        text
          .setPlaceholder("Energy: {value}")
          .setValue(this.plugin.settings.energyOnlyFormat)
          .onChange(async (value) => {
            this.plugin.settings.energyOnlyFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Mood Only Output Format")
      .setDesc("Format for mood only output. Use {value} for the mood.")
      .addText((text) =>
        text
          .setPlaceholder("{value}")
          .setValue(this.plugin.settings.moodOnlyFormat)
          .onChange(async (value) => {
            this.plugin.settings.moodOnlyFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Mood + Energy Output Format")
      .setDesc("Format for mood + energy output. Use {mood} and {energy}.")
      .addText((text) =>
        text
          .setPlaceholder("{mood} | {energy}")
          .setValue(this.plugin.settings.moodAndEnergyFormat)
          .onChange(async (value) => {
            this.plugin.settings.moodAndEnergyFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Show Mood Ribbon Icon")
      .setDesc("Show a toolbar button for the Mood menu.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showMoodRibbon)
        // Mood
        .onChange(async (value) => {
          this.plugin.settings.showMoodRibbon = value;
          await this.plugin.saveSettings();
          this.plugin.reloadRibbonIcons();
        }));

    new Setting(containerEl)
      .setName("Show Energy Ribbon Icon")
      .setDesc("Show a toolbar button for the Energy slider.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showEnergyRibbon)
        .onChange(async (value) => {
          this.plugin.settings.showEnergyRibbon = value;
          await this.plugin.saveSettings();
          this.plugin.reloadRibbonIcons();
        }));

    new Setting(containerEl)
      .setName("Show Combined Ribbon Icon")
      .setDesc("Show a toolbar button for the combined Mood & Energy modal.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCombinedRibbon)
        .onChange(async (value) => {
          this.plugin.settings.showCombinedRibbon = value;
          await this.plugin.saveSettings();
          this.plugin.reloadRibbonIcons();
        }));
  }
}

/**
 * Loads moods from a file in the vault, skipping frontmatter if present.
 * @param vault - The Obsidian vault instance.
 * @param filePath - Path to the moods file.
 * @returns Array of mood strings.
 */
export async function loadMoodsFromFile(vault: any, filePath: string): Promise<string[]> {
  try {
    const file = vault.getAbstractFileByPath(normalizePath(filePath));
    if (file instanceof TFile) {
      const content = await vault.read(file);
      let lines = content.split(/\r?\n/);
      if (lines[0].trim() === "---") {
        let i = 1;
        while (i < lines.length && lines[i].trim() !== "---") i++;
        lines = lines.slice(i + 1);
      }
      return lines
        .map((l: string) => l.replace(/<\/?[a-zA-Z][^>]*>/g, "").trim())
        .filter((l: string) => l.length > 0);
    }
  } catch (e) {
    console.error("Failed to load moods file:", e);
  }
  return [];
}
