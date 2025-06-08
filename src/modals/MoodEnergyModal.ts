// src/modals/MoodEnergyModal.ts
// Combined Mood & Energy modal logic, using MoodMenu and EnergySlider modular components

import { Modal, App, MarkdownView } from "obsidian";
import { loadMoodsFromFile, formatBarIcons } from "../utils";
import { MoodMenu } from "./MoodMenu";
import { EnergySlider } from "./EnergySlider";

/**
 * MoodEnergy modal for selecting both mood and energy in a single dialog.
 */
export class MoodEnergy extends Modal {
  plugin: any;
  moods: string[];
  onSubmit: (mood: string, energy: number) => void;
  selectedMood: string | null = null;
  selectedEnergy: number = 50;

  constructor(app: App, plugin: any, moods: string[], onSubmit: (mood: string, energy: number) => void) {
    super(app);
    this.plugin = plugin;
    this.moods = moods;
    this.onSubmit = onSubmit;
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
    // Modal header and title (always at top)
    let header = modalEl.querySelector('.modal-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'modal-header';
      const title = document.createElement('div');
      title.className = 'modal-title';
      title.textContent = "Mood & Energy";
      header.appendChild(title);
      modalEl.insertBefore(header, contentEl);
    } else {
      let title = header.querySelector('.modal-title');
      if (!title) {
        title = document.createElement('div');
        title.className = 'modal-title';
        title.textContent = "Mood & Energy";
        header.appendChild(title);
      } else {
        title.textContent = "Mood & Energy";
      }
    }
    // Add modal class to modalEl for appearance
    this.modalEl.classList.add("mood-energy-modal");
    // Remove any appearance class from contentEl
    contentEl.classList.remove("mood-energy-modal");
    // Container for the rest of the modal content (flex row/column)
    contentEl.style.display = "flex";
    contentEl.style.flexDirection = window.innerWidth < 600 ? "column" : "row";
    contentEl.style.alignItems = "stretch";
    contentEl.style.borderRadius = "var(--radius-m)";
    contentEl.style.overflow = "visible";
    contentEl.style.maxWidth = "98vw";
    // Modal content container
    const modalContent = document.createElement("div");
    modalContent.style.display = "flex";
    modalContent.style.flexDirection = window.innerWidth < 600 ? "column" : "row";
    modalContent.style.alignItems = "stretch";
    modalContent.style.width = "100%";
    modalContent.style.gap = window.innerWidth < 600 ? "12px" : "0";
    contentEl.appendChild(modalContent);
    // Mood section
    const moodSection = document.createElement("div");
    moodSection.className = "mood-section";
    moodSection.style.flex = "1 1 0";
    moodSection.style.overflowY = "auto";
    moodSection.style.marginRight = window.innerWidth < 600 ? "0" : "32px";
    moodSection.style.borderRadius = "8px";
    moodSection.style.display = "flex";
    moodSection.style.flexDirection = "column";
    moodSection.style.minWidth = window.innerWidth < 600 ? "0" : "260px";
    moodSection.style.width = window.innerWidth < 600 ? "100%" : "";
    moodSection.style.padding = "12px";
    modalContent.appendChild(moodSection);
    // Create grid and detail containers for modal
    const sectionGrid = document.createElement("div");
    sectionGrid.className = "mood-menu-grid";
    sectionGrid.style.padding = "12px";
    const sectionDetail = document.createElement("div");
    sectionDetail.className = "mood-menu-section-detail";
    sectionDetail.style.padding = "12px";
    // Render mood menu directly into sectionGrid/sectionDetail (not nested in mood-menu-inline)
    const moodMenu = new MoodMenu(this.app, this.moods, (mood) => {
      this.selectedMood = mood;
    });
    moodMenu.renderInline(
      moodSection, // container (not used for modal, just for inline)
      (mood) => {
        this.selectedMood = mood;
      },
      true, // showBackButton: ensure back button is present in modal
      sectionGrid,
      sectionDetail
    );
    moodSection.appendChild(sectionGrid);
    moodSection.appendChild(sectionDetail);
    // Energy section
    const energySection = document.createElement("div");
    energySection.className = "energy-section";
    energySection.style.display = "flex";
    energySection.style.flexDirection = "column";
    energySection.style.alignItems = "center";
    energySection.style.justifyContent = "flex-start";
    energySection.style.width = window.innerWidth < 600 ? "100%" : "320px";
    // Slider label
    const sliderLabel = document.createElement("label");
    sliderLabel.innerText = "Energy Level";
    sliderLabel.style.marginBottom = "8px";
    sliderLabel.style.fontWeight = "bold";
    sliderLabel.style.color = "var(--text-normal)";
    sliderLabel.setAttribute("for", "energy-slider");
    sliderLabel.className = "energy-slider-label";
    energySection.appendChild(sliderLabel);
    // Slider
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = this.selectedEnergy.toString();
    slider.className = "slider energy-slider";
    slider.id = "energy-slider";
    slider.setAttribute("aria-label", "Energy Level");
    slider.style.width = "220px";
    energySection.appendChild(slider);
    // Preview
    const preview = document.createElement("div");
    preview.className = "energy-preview";
    preview.style.marginTop = "8px";
    preview.style.fontFamily = "monospace";
    preview.style.fontSize = "1.2em";
    preview.setAttribute("aria-live", "polite");
    energySection.appendChild(preview);
    // Update preview
    const updatePreview = () => {
      const settings = this.plugin?.settings || {};
      let output = `${this.selectedEnergy}`;
      if (settings.energyDisplay === "percent") {
        output = `${this.selectedEnergy}%`;
      } else if (settings.energyDisplay === "bar") {
        output = settings.energyOnlyFormat?.replace(
          "{value}",
          formatBarIcons(settings.barIcons, this.selectedEnergy, settings.barIconCount)
        ) || `${this.selectedEnergy}`;
      }
      preview.innerText = output;
    };
    slider.oninput = () => {
      this.selectedEnergy = parseInt(slider.value);
      updatePreview();
    };
    updatePreview();
    // Action buttons
    const buttonRow = document.createElement("div");
    buttonRow.style.display = "flex";
    buttonRow.style.gap = "12px";
    buttonRow.style.marginTop = "18px";
    buttonRow.style.justifyContent = "center";
    buttonRow.style.width = "100%";
    // Okay
    const okBtn = document.createElement("button");
    okBtn.innerText = "Okay";
    okBtn.className = "mod-cta okay-btn";
    okBtn.type = "button";
    okBtn.tabIndex = 0;
    okBtn.style.outline = "none";
    okBtn.removeAttribute("title");
    okBtn.onclick = () => {
      const moodToSubmit = this.selectedMood ?? "";
      if (this.selectedEnergy !== null) {
        this.onSubmit(moodToSubmit, this.selectedEnergy);
      }
      this.close();
    };
    buttonRow.appendChild(okBtn);
    // Cancel
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Cancel";
    cancelBtn.className = "mod-cta cancel-btn";
    cancelBtn.type = "button";
    cancelBtn.tabIndex = 0;
    cancelBtn.style.outline = "none";
    cancelBtn.removeAttribute("title");
    cancelBtn.onclick = () => this.close();
    buttonRow.appendChild(cancelBtn);
    energySection.appendChild(buttonRow);
    modalContent.appendChild(energySection);
  }

  onClose() {
    this.contentEl.empty();
  }
}

/**
 * Opens the Mood & Energy modal. If onSubmit is provided, it will be called with (mood, energy) when Okay is pressed.
 * Otherwise, returns a promise that resolves when the modal closes (legacy usage).
 */
export async function showMoodAndEnergyModal(plugin: any, onSubmit?: (mood: string, energy: number) => void) {
  const moods = await loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath);
  if (onSubmit) {
    const modal = new MoodEnergy(plugin.app, plugin, moods, onSubmit);
    modal.open();
    return;
  }
  return new Promise<void>((resolve) => {
    const modal = new MoodEnergy(plugin.app, plugin, moods, () => resolve());
    modal.open();
  });
}
