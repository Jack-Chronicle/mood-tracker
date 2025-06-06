// src/modals/MoodEnergyModal.ts
// Combined Mood & Energy modal logic, using MoodMenu and EnergySlider modular components

import { loadMoodsFromFile, formatBarIcons, openModal, closeModal } from "../utils";
import { MoodMenu } from "./MoodMenu";
import { EnergySlider } from "./EnergySlider";
import { MarkdownView } from "obsidian";

/**
 * Shows a combined modal for selecting both mood and energy, then inserts the formatted result into the editor.
 * @param plugin - The plugin instance.
 */
export async function showMoodAndEnergyModal(plugin: any) {
  const moods = await loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath);
  const moodMenu = new MoodMenu(moods);
  let selectedMood: string | null = null;
  let selectedEnergy: number = 50;

  // Create modal container
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

  // Mood section
  const moodSection = document.createElement("div");
  moodSection.style.flex = "1 1 0";
  moodSection.style.overflowY = "auto";
  moodSection.style.marginRight = window.innerWidth < 600 ? "0" : "32px";
  moodSection.style.background = "var(--background-modifier-hover, rgba(255,255,255,0.01))";
  moodSection.style.borderRadius = "8px";
  moodSection.style.display = "flex";
  moodSection.style.flexDirection = "column";
  moodSection.style.minWidth = window.innerWidth < 600 ? "0" : "260px";
  moodSection.style.width = window.innerWidth < 600 ? "100%" : "";

  // Energy section
  const energySection = document.createElement("div");
  energySection.style.display = "flex";
  energySection.style.flexDirection = "column";
  energySection.style.alignItems = "center";
  energySection.style.justifyContent = "flex-start";
  energySection.style.width = window.innerWidth < 600 ? "100%" : "320px";
  energySection.style.minWidth = window.innerWidth < 600 ? "0" : "220px";
  energySection.style.maxWidth = window.innerWidth < 600 ? "100vw" : "340px";
  energySection.style.background = "var(--background-modifier-hover)";
  energySection.style.borderRadius = "var(--radius-m)";
  energySection.style.padding = window.innerWidth < 600 ? "12px" : "18px 18px 18px 18px";
  energySection.style.boxSizing = "border-box";
  energySection.style.height = "100%";

  // Inline MoodMenu
  moodMenu.renderInline(moodSection, (mood) => {
    selectedMood = mood;
  });

  // Inline EnergySlider
  const energySlider = new EnergySlider(plugin);
  energySlider.renderInline(energySection, (value) => {
    selectedEnergy = value;
  });

  // Action buttons
  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.gap = "12px";
  buttonRow.style.marginTop = "18px";
  buttonRow.style.justifyContent = "center";
  buttonRow.style.width = "100%";

  const okayButton = document.createElement("button");
  okayButton.innerText = "Okay";
  okayButton.className = "mod-cta";
  okayButton.onclick = () => {
    const activeEditor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (activeEditor && selectedMood && selectedEnergy !== null) {
      const settings = plugin.settings;
      let energyStr = "";
      if (settings.energyDisplay === "percent") {
        energyStr = settings.energyOnlyFormat.replace("{value}", `${selectedEnergy}%`);
      } else if (settings.energyDisplay === "bar") {
        energyStr = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, selectedEnergy, settings.barIconCount));
      } else {
        energyStr = settings.energyOnlyFormat.replace("{value}", `${selectedEnergy}`);
      }
      const format = settings.moodAndEnergyFormat || "{mood} | {energy}";
      const output = format.replace("{mood}", selectedMood).replace("{energy}", energyStr);
      if (typeof activeEditor.focus === "function") activeEditor.focus();
      activeEditor.replaceSelection(output);
    }
    closeModal(modal);
  };
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
  cancelButton.onclick = () => closeModal(modal);
  buttonRow.appendChild(okayButton);
  buttonRow.appendChild(cancelButton);
  energySection.appendChild(buttonRow);

  // Keyboard ESC support
  const escListener = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal(modal);
      window.removeEventListener("keydown", escListener);
    }
  };
  window.addEventListener("keydown", escListener);

  // Compose modal
  modal.appendChild(moodSection);
  modal.appendChild(energySection);
  openModal(modal);
}
