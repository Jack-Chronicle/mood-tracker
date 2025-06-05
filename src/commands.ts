// commands.ts
// Command registration and modal logic for the Mood & Energy Obsidian plugin.

import { MarkdownView, Editor } from "obsidian";
import { MoodMenu } from "./moodMenu";
import { EnergySlider } from "./energySlider";
import { loadMoodsFromFile, formatBarIcons, openModal, closeModal, currentOpenModal } from "./types";

export async function insertMood(plugin: any) {
  const moods = await loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath);
  const moodMenu = new MoodMenu(moods);
  const selectedMood = await moodMenu.open();
  if (selectedMood) {
    const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (editor) {
      const format = plugin.settings.moodOnlyFormat || "{value}";
      const output = format.replace("{value}", selectedMood);
      editor.focus();
      editor.replaceSelection(output);
    }
  }
}

export async function insertEnergy(plugin: any) {
  const energySlider = new EnergySlider(plugin);
  const selectedEnergyLevel = await energySlider.open();
  if (selectedEnergyLevel !== null) {
    const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (editor) {
      let output = "";
      const settings = plugin.settings;
      if (settings.energyDisplay === "percent") {
        output = settings.energyOnlyFormat.replace("{value}", `${selectedEnergyLevel}%`);
      } else if (settings.energyDisplay === "bar") {
        output = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, selectedEnergyLevel, settings.barIconCount));
      } else {
        output = settings.energyOnlyFormat.replace("{value}", `${selectedEnergyLevel}`);
      }
      editor.focus();
      editor.replaceSelection(output);
    }
  }
}

export async function insertMoodAndEnergy(plugin: any) {
  showMoodAndEnergyModal(plugin);
}

/**
 * Shows a combined modal for selecting both mood and energy, then inserts the formatted result into the editor.
 * @param plugin - The plugin instance.
 */
export function showMoodAndEnergyModal(plugin: any) {
  const modal = document.createElement("div");
  modal.className = "mood-energy-modal";
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.background = "var(--background-secondary)";
  modal.style.padding = "24px";
  modal.style.borderRadius = "var(--radius-m)";
  modal.style.zIndex = "9999";
  modal.style.display = "flex";
  modal.style.flexDirection = window.innerWidth < 600 ? "column" : "row";
  modal.style.alignItems = "stretch";
  modal.style.boxShadow = "0 4px 32px var(--background-modifier-box-shadow)";
  modal.style.maxHeight = window.innerWidth < 600 ? "98vh" : "80vh";
  modal.style.overflow = "visible";
  modal.style.width = window.innerWidth < 600 ? "98vw" : "min(900px, 98vw)";
  modal.style.minWidth = window.innerWidth < 600 ? "0" : "340px";
  modal.style.maxWidth = "98vw";
  modal.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    if (window.innerWidth < 600) {
    modal.style.width = "98vw";
    modal.style.minWidth = "0";
    modal.style.maxHeight = "98vh";
    modal.style.padding = "8px";
    modal.style.margin = "0";
  }
  const moodContainer = document.createElement("div");
  moodContainer.style.flex = "1 1 0";
  moodContainer.style.overflowY = "auto";
  moodContainer.style.maxHeight = "calc(80vh - 24px)";
  moodContainer.style.marginRight = "32px";
  moodContainer.style.background = "var(--background-modifier-hover, rgba(255,255,255,0.01))";
  moodContainer.style.borderRadius = "8px";
  moodContainer.style.padding = "0 0 0 0";
  moodContainer.style.display = "flex";
  moodContainer.style.flexDirection = "column";
  moodContainer.style.minWidth = window.innerWidth < 600 ? "0" : "260px";
    if (window.innerWidth < 600) {
      moodContainer.style.marginRight = "0";
      moodContainer.style.maxHeight = "none";
      moodContainer.style.padding = "0";
      moodContainer.style.width = "100%"; // <-- Use 100% so it fits inside modal padding
      moodContainer.style.flex = "1 1 auto";
    }
  const controlsContainer = document.createElement("div");
  controlsContainer.style.display = "flex";
  controlsContainer.style.flexDirection = "column";
  controlsContainer.style.alignItems = "center";
  controlsContainer.style.justifyContent = "flex-start";
  controlsContainer.style.width = window.innerWidth < 600 ? "100%" : "320px";
  controlsContainer.style.minWidth = window.innerWidth < 600 ? "0" : "220px";
  controlsContainer.style.maxWidth = window.innerWidth < 600 ? "100vw" : "340px";
  controlsContainer.style.background = "var(--background-modifier-hover)";
  controlsContainer.style.borderRadius = "var(--radius-m)";
  controlsContainer.style.padding = window.innerWidth < 600 ? "12px" : "18px 18px 18px 18px";
  controlsContainer.style.boxSizing = "border-box";
  controlsContainer.style.height = "100%";
    if (window.innerWidth < 600) {
    controlsContainer.style.padding = "12px 6px";
    controlsContainer.style.minWidth = "0";
    controlsContainer.style.maxWidth = "100vw";
  }
  const sliderLabel = document.createElement("div");
  sliderLabel.innerText = "Energy Level:";
  sliderLabel.style.color = "var(--text-normal, #fff)";
  sliderLabel.style.marginBottom = "8px";
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "50";
  slider.style.width = "220px";
    if (window.innerWidth < 600) {
    slider.style.width = "90vw";
  }
  const sliderValue = document.createElement("div");
  sliderValue.innerText = "50";
  sliderValue.style.color = "var(--text-normal, #fff)";
  sliderValue.style.marginTop = "8px";
  const preview = document.createElement("div");
  preview.style.marginTop = "8px";
  preview.style.color = "var(--text-normal, #fff)";
  preview.style.fontFamily = "monospace";
  preview.style.fontSize = "1.2em";
  const updatePreview = () => {
    const settings = plugin.settings;
    let output = "";
    const value = parseInt(slider.value);
    if (settings.energyDisplay === "percent") {
      output = settings.energyOnlyFormat.replace("{value}", `${value}%`);
    } else if (settings.energyDisplay === "bar") {
      output = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, value, settings.barIconCount));
    } else {
      output = settings.energyOnlyFormat.replace("{value}", `${value}`);
    }
    preview.innerText = output;
  };
  slider.oninput = () => {
    sliderValue.innerText = slider.value;
    updatePreview();
  };
  controlsContainer.appendChild(sliderLabel);
  controlsContainer.appendChild(slider);
  controlsContainer.appendChild(sliderValue);
  controlsContainer.appendChild(preview);
  updatePreview();
  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.gap = "12px";
  buttonRow.style.marginTop = "18px";
  buttonRow.style.justifyContent = "center";
  buttonRow.style.width = "100%";
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
    if (window.innerWidth < 600) {
    okayButton.style.fontSize = "1.2em";
    okayButton.style.padding = "18px";
  }
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
  buttonRow.appendChild(okayButton);
  buttonRow.appendChild(cancelButton);
  controlsContainer.appendChild(buttonRow);
  let selectedMood: string | null = null;
  let selectedMoodButton: HTMLButtonElement | null = null;
  let moods: string[] = [];
    if (window.innerWidth < 600) {
    cancelButton.style.fontSize = "1.2em";
    cancelButton.style.padding = "18px";
  }
  const moodSectionGrid = document.createElement("div");
  moodSectionGrid.style.display = "grid";
  moodSectionGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
  moodSectionGrid.style.gap = "18px";
  moodSectionGrid.style.width = "100%";
  moodSectionGrid.style.minHeight = "120px"; // Prevents collapse if empty
  moodSectionGrid.style.boxSizing = "border-box";
  moodSectionGrid.style.marginBottom = "18px";
  const moodSectionDetail = document.createElement("div");
  moodSectionDetail.style.display = "none";
  moodSectionDetail.style.flexDirection = "column";
  moodSectionDetail.style.alignItems = "stretch";
  moodSectionDetail.style.width = "100%";
  moodSectionDetail.style.marginBottom = "18px";
  const backButton = document.createElement("button");
  backButton.innerText = "\u2190 Back";
  backButton.style.margin = "12px 0";
  backButton.style.padding = window.innerWidth < 600 ? "10px 18px" : "6px 16px";
  backButton.style.borderRadius = "8px";
  backButton.style.border = "none";
  backButton.style.background = "var(--background-modifier-hover, #444)";
  backButton.style.color = "var(--text-normal, #fff)";
  backButton.style.fontWeight = "bold";
  backButton.style.fontSize = window.innerWidth < 600 ? "1.1em" : "1em";
  backButton.style.lineHeight = "1.2";
  backButton.style.height = "auto";
  backButton.style.display = "block";
  backButton.style.verticalAlign = "middle";
  backButton.style.alignSelf = "stretch";
  backButton.style.textAlign = "left";
  backButton.onclick = () => {
    moodSectionDetail.style.display = "none";
    moodSectionGrid.style.display = "grid";
    backButton.style.display = "none";
  };
  moodSectionDetail.appendChild(backButton);
  backButton.style.display = "none";


  // --- Nested Section/Mood Parsing and Rendering ---
  loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath).then((moodList: string[]) => {
    moods = moodList;
    // Build a tree structure for nested sections and moods
    type SectionNode = {
      name: string;
      level: number;
      moods: string[];
      sections: SectionNode[];
      parent?: SectionNode;
    };
    const root: SectionNode = { name: "__root__", level: 0, moods: [], sections: [] };
    let currentSection: SectionNode = root;
    const sectionStack: SectionNode[] = [root];
    for (let line of moods) {
      if (/^#+\s/.test(line)) {
        const match = line.match(/^(#+)\s*(.*)$/);
        if (!match) continue;
        const level = match[1].length;
        const name = match[2].trim();
        // Find parent section for this level
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
    // Helper to render a section's contents in the modal
    function renderSection(section: SectionNode, container: HTMLElement, detailContainer: HTMLElement, parentPath: string[] = []) {
      // Clear container
      container.innerHTML = "";
    
      // --- Sort sections and moods alphabetically ---
      const sortedSections = [...section.sections].sort((a, b) => a.name.localeCompare(b.name));
      const sortedMoods = [...section.moods].sort((a, b) => a.localeCompare(b));
    
      // --- Render sections first ---
      sortedSections.forEach(childSection => {
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
        sectionLabel.innerText = childSection.name;
        sectionLabel.style.fontWeight = "bold";
        sectionLabel.style.fontSize = "1.2rem";
        sectionLabel.style.color = "var(--text-accent, #aaf)";
        sectionCell.appendChild(sectionLabel);
        sectionCell.onclick = () => {
          container.style.display = "none";
          detailContainer.style.display = "flex";
          backButton.style.display = "block";
          while (detailContainer.childNodes.length > 1)
            detailContainer.removeChild(detailContainer.lastChild!);
          const moodsGrid = document.createElement("div");
          moodsGrid.style.display = "grid";
          moodsGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(100px, 1fr))";
          moodsGrid.style.gap = "12px";
          moodsGrid.style.width = "100%";
          renderSection(childSection, moodsGrid, detailContainer, [...parentPath, childSection.name]);
          detailContainer.appendChild(moodsGrid);
        };
        container.appendChild(sectionCell);
      });
    
      // --- Add a separator if there are both sections and moods ---
      if (sortedSections.length > 0 && sortedMoods.length > 0) {
        const divider = document.createElement("div");
        divider.style.gridColumn = "1 / -1";
        divider.style.height = "1px";
        divider.style.background = "var(--background-modifier-border)";
        divider.style.margin = "12px 0";
        container.appendChild(divider);
      }
    
      // --- Render moods below sections ---
      sortedMoods.forEach(mood => {
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
          selectedMood = mood;
          Array.from(container.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
          moodButton.classList.add("selected-mood");
          selectedMoodButton = moodButton;
        };
        container.appendChild(moodButton);
      });
    }
    // Initial modal: show root's moods and all sections with parent=root (top-level headings)
    renderSection(root, moodSectionGrid, moodSectionDetail);
  });
  moodContainer.appendChild(moodSectionGrid);
  moodContainer.appendChild(moodSectionDetail);
  const style = document.createElement("style");
  style.innerText = `.selected-mood { background: var(--interactive-accent) !important; color: var(--text-on-accent) !important; border: var(--input-border-width) solid var(--background-primary) !important; }`;
  modal.appendChild(style);
  const escListener = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (moodSectionDetail.style.display === "flex") {
        moodSectionDetail.style.display = "none";
        moodSectionGrid.style.display = "grid";
        backButton.style.display = "none";
      } else {
        closeModal(modal);
        window.removeEventListener("keydown", escListener);
      }
    }
  };
  window.addEventListener("keydown", escListener);
  modal.appendChild(moodContainer);
  modal.appendChild(controlsContainer);
  openModal(modal);
  okayButton.onclick = () => {
    const activeEditor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (activeEditor && selectedMood) {
      const settings = plugin.settings;
      let energyStr = "";
      const value = parseInt(slider.value);
      if (settings.energyDisplay === "percent") {
        energyStr = settings.energyOnlyFormat.replace("{value}", `${value}%`);
      } else if (settings.energyDisplay === "bar") {
        energyStr = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, value, settings.barIconCount));
      } else {
        energyStr = settings.energyOnlyFormat.replace("{value}", `${value}`);
      }
      const format = settings.moodAndEnergyFormat || "{mood} | {energy}";
      const output = format.replace("{mood}", selectedMood).replace("{energy}", energyStr);
      if (typeof activeEditor.focus === "function") activeEditor.focus();
      activeEditor.replaceSelection(output);
    }
    closeModal(modal);
  };
  cancelButton.onclick = () => {
    closeModal(modal);
  };
}

/**
 * Registers all plugin commands and their hotkeys with Obsidian.
 * @param plugin - The plugin instance.
 */
export function registerCommands(plugin: any) {
  function canRunCommand() {
    // Only require that no modal is open
    return !currentOpenModal;
  }
  plugin.addCommand({
    id: "insert-mood",
    name: "Insert Mood",
    hotkeys: [{ modifiers: ["Alt"], key: "6" }],
    callback: async () => {
      if (!canRunCommand()) return;
      const moods = await loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath);
      const moodMenu = new MoodMenu(moods);
      const selectedMood = await moodMenu.open();
      if (selectedMood) {
        const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) {
          const format = plugin.settings.moodOnlyFormat || "{value}";
          const output = format.replace("{value}", selectedMood);
          editor.replaceSelection(output);
          if (editor.focus) editor.focus();
        }
      }
    }
  });
  plugin.addCommand({
    id: "insert-energy-level",
    name: "Insert Energy Level",
    hotkeys: [{ modifiers: ["Alt"], key: "5" }],
    callback: async () => {
      if (!canRunCommand()) return;
      const energySlider = new EnergySlider(plugin);
      const selectedEnergyLevel = await energySlider.open();
      if (selectedEnergyLevel !== null) {
        const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) {
          let output = "";
          const settings = plugin.settings;
          if (settings.energyDisplay === "percent") {
            output = settings.energyOnlyFormat.replace("{value}", `${selectedEnergyLevel}%`);
          } else if (settings.energyDisplay === "bar") {
            output = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, selectedEnergyLevel, settings.barIconCount));
          } else {
            output = settings.energyOnlyFormat.replace("{value}", `${selectedEnergyLevel}`);
          }
          editor.replaceSelection(output);
          if (editor.focus) editor.focus();
        }
      }
    }
  });
  plugin.addCommand({
    id: "insert-mood-and-energy",
    name: "Insert Mood and Energy Level",
    hotkeys: [{ modifiers: ["Alt"], key: "7" }],
    callback: () => {
      if (!canRunCommand()) return;
      showMoodAndEnergyModal(plugin);
    }
  });
}
