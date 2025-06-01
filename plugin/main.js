"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MoodEnergyPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/types/index.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  moodsFilePath: "moods.txt",
  energyDisplay: "bar",
  energyFormat: "Energy: {value}",
  barFull: "",
  barHalf: "",
  barEmpty: "\x1B",
  barIcons: 5,
  energyOnlyFormat: "Energy: {value}",
  moodOnlyFormat: "{value}",
  moodAndEnergyFormat: "{mood} | {energy}"
};
var MoodEnergySettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Mood & Energy Plugin Settings" });
    containerEl.createEl("h3", { text: "Mood Settings" });
    new import_obsidian.Setting(containerEl).setName("Moods File Path").setDesc("Path to the file containing your moods, one per line (excluding frontmatter).").addText(
      (text) => text.setPlaceholder("moods.txt").setValue(this.plugin.settings.moodsFilePath).onChange(async (value) => {
        this.plugin.settings.moodsFilePath = value;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "Energy Settings" });
    new import_obsidian.Setting(containerEl).setName("Energy Display").setDesc("How to display the energy value: as text, percent, or a progress bar.").addDropdown(
      (dropdown) => dropdown.addOption("text", "Text").addOption("percent", "Percent").addOption("bar", "Progress Bar").setValue(this.plugin.settings.energyDisplay).onChange(async (value) => {
        this.plugin.settings.energyDisplay = value;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    if (this.plugin.settings.energyDisplay === "bar") {
      new import_obsidian.Setting(containerEl).setName("Bar Full Icon").setDesc("Icon for a full bar (e.g. \u25AE)").addText(
        (text) => text.setPlaceholder("\u25AE").setValue(this.plugin.settings.barFull).onChange(async (value) => {
          this.plugin.settings.barFull = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(containerEl).setName("Bar Half Icon").setDesc("Icon for a half bar (optional, e.g. \u25B0)").addText(
        (text) => text.setPlaceholder("").setValue(this.plugin.settings.barHalf).onChange(async (value) => {
          this.plugin.settings.barHalf = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(containerEl).setName("Bar Empty Icon").setDesc("Icon for an empty bar (e.g. \u25AF)").addText(
        (text) => text.setPlaceholder("\u25AF").setValue(this.plugin.settings.barEmpty).onChange(async (value) => {
          this.plugin.settings.barEmpty = value;
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(containerEl).setName("Bar Icon Count").setDesc("Number of icons in the progress bar (e.g. 5, 10, 20)").addText(
        (text) => text.setPlaceholder("5").setValue(this.plugin.settings.barIcons.toString()).onChange(async (value) => {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) {
            this.plugin.settings.barIcons = num;
            await this.plugin.saveSettings();
          }
        })
      );
    }
    containerEl.createEl("h3", { text: "Output Format Settings" });
    new import_obsidian.Setting(containerEl).setName("Energy Only Output Format").setDesc("Format for energy only output. Use {value} for the energy bar/number.").addText(
      (text) => text.setPlaceholder("Energy: {value}").setValue(this.plugin.settings.energyOnlyFormat).onChange(async (value) => {
        this.plugin.settings.energyOnlyFormat = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Mood Only Output Format").setDesc("Format for mood only output. Use {value} for the mood.").addText(
      (text) => text.setPlaceholder("{value}").setValue(this.plugin.settings.moodOnlyFormat).onChange(async (value) => {
        this.plugin.settings.moodOnlyFormat = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Mood + Energy Output Format").setDesc("Format for mood + energy output. Use {mood} and {energy}.").addText(
      (text) => text.setPlaceholder("{mood} | {energy}").setValue(this.plugin.settings.moodAndEnergyFormat).onChange(async (value) => {
        this.plugin.settings.moodAndEnergyFormat = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
async function loadMoodsFromFile(vault, filePath) {
  try {
    const file = vault.getAbstractFileByPath((0, import_obsidian.normalizePath)(filePath));
    if (file instanceof import_obsidian.TFile) {
      const content = await vault.read(file);
      let lines = content.split(/\r?\n/);
      if (lines[0].trim() === "---") {
        let i = 1;
        while (i < lines.length && lines[i].trim() !== "---")
          i++;
        lines = lines.slice(i + 1);
      }
      return lines.map((l) => l.replace(/<\/?[a-zA-Z][^>]*>/g, "").trim()).filter((l) => l.length > 0);
    }
  } catch (e) {
    console.error("Failed to load moods file:", e);
  }
  return [];
}

// src/commands.ts
var import_obsidian2 = require("obsidian");

// src/moodMenu.ts
var MoodMenu = class {
  constructor(moods) {
    this.selectedMood = null;
    this.resolveFn = null;
    this.moods = moods;
  }
  displayMenu(widthOverride) {
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
    const sectionData = [];
    while (i < this.moods.length) {
      const mood = this.moods[i];
      if (/^#+\s/.test(mood)) {
        const headerText = mood.replace(/^#+\s*/, "");
        const moods = [];
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
          sectionDetail.removeChild(sectionDetail.lastChild);
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
    const escListener = (e) => {
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
  open() {
    this.displayMenu();
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }
  selectMood(mood) {
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
};

// src/energySlider.ts
var EnergySlider = class {
  constructor() {
    this.resolveFn = null;
    this.selectedValue = 50;
    this.createModal();
  }
  createModal() {
    this.modalElement = document.createElement("div");
    this.modalElement.className = "energy-slider-modal";
    this.modalElement.style.position = "fixed";
    this.modalElement.style.top = "50%";
    this.modalElement.style.left = "50%";
    this.modalElement.style.transform = "translate(-50%, -50%)";
    this.modalElement.style.background = "var(--background-secondary, #222)";
    this.modalElement.style.padding = "24px";
    this.modalElement.style.borderRadius = "12px";
    this.modalElement.style.zIndex = "9999";
    this.modalElement.style.display = "flex";
    this.modalElement.style.flexDirection = "column";
    this.modalElement.style.alignItems = "center";
    this.modalElement.style.boxShadow = "0 4px 32px var(--shadow-s, rgba(0,0,0,0.3))";
    this.modalElement.style.maxHeight = "80vh";
    this.modalElement.style.overflow = "auto";
    this.modalElement.style.minWidth = "340px";
    this.modalElement.style.width = "min(420px, 98vw)";
    this.modalElement.innerHTML = `
            <div class="slider-container" style="display:flex;flex-direction:column;align-items:center;">
                <input type="range" min="0" max="100" value="50" class="slider" id="energySlider" style="width:200px;">
                <div class="slider-value" id="sliderValue" style="margin-top:8px;color:var(--text-normal, #fff);">50</div>
                <div class="energy-preview" id="energyPreview" style="margin-top:8px;color:var(--text-normal, #fff);font-family:monospace;font-size:1.2em;"></div>
            </div>
            <div style="display:flex;gap:12px;margin-top:18px;">
                <button id="okayButton" style="padding:8px 18px;border-radius:8px;border:none;background:var(--interactive-accent, #3a7);color:var(--text-on-accent, #fff);font-weight:bold;cursor:pointer;">Okay</button>
                <button id="cancelButton" style="padding:8px 18px;border-radius:8px;border:none;background:var(--color-red, #a33);color:var(--text-on-accent, #fff);font-weight:bold;cursor:pointer;">Cancel</button>
            </div>
        `;
    this.sliderElement = this.modalElement.querySelector("#energySlider");
    const sliderValueDisplay = this.modalElement.querySelector("#sliderValue");
    const preview = this.modalElement.querySelector("#energyPreview");
    const okayButton = this.modalElement.querySelector("#okayButton");
    const cancelButton = this.modalElement.querySelector("#cancelButton");
    const updatePreview = () => {
      const settings = window.app?.plugins?.plugins?.["obsidian-mood-energy-plugin"]?.settings || {
        energyDisplay: "bar",
        energyFormat: "Energy: {value}",
        barFull: "\u25AE",
        barHalf: "",
        barEmpty: "\u25AF",
        barIcons: 5,
        energyOnlyFormat: "Energy: {value}",
        moodOnlyFormat: "{value}",
        moodAndEnergyFormat: "{mood} | {energy}"
      };
      const value = parseInt(this.sliderElement.value);
      let output = "";
      if (settings.energyDisplay === "percent") {
        output = settings.energyOnlyFormat.replace("{value}", `${value}%`);
      } else if (settings.energyDisplay === "bar") {
        const totalBars = settings.barIcons || 5;
        const percent = value / 100;
        const bars = percent * totalBars;
        const fullBars = Math.floor(bars);
        const hasHalf = settings.barHalf && settings.barHalf.length > 0;
        let halfBars = 0;
        if (hasHalf) {
          if (bars - fullBars >= 0.75) {
            output = settings.energyOnlyFormat.replace("{value}", settings.barFull.repeat(fullBars + 1) + settings.barEmpty.repeat(totalBars - fullBars - 1));
            preview.innerText = output;
            return;
          } else if (bars - fullBars >= 0.25) {
            halfBars = 1;
          }
        }
        const emptyBars = totalBars - fullBars - halfBars;
        output = settings.energyOnlyFormat.replace(
          "{value}",
          settings.barFull.repeat(fullBars) + (halfBars ? settings.barHalf : "") + settings.barEmpty.repeat(emptyBars)
        );
      } else {
        output = settings.energyOnlyFormat.replace("{value}", `${value}`);
      }
      preview.innerText = output;
    };
    this.sliderElement.addEventListener("input", () => {
      this.selectedValue = parseInt(this.sliderElement.value);
      sliderValueDisplay.textContent = this.selectedValue.toString();
      updatePreview();
    });
    updatePreview();
    okayButton.addEventListener("click", () => {
      this.closeModal();
      if (this.resolveFn)
        this.resolveFn(this.selectedValue);
    });
    cancelButton.addEventListener("click", () => {
      this.closeModal();
      if (this.resolveFn)
        this.resolveFn(null);
    });
    const escListener = (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        window.removeEventListener("keydown", escListener);
      }
    };
    window.addEventListener("keydown", escListener);
  }
  open() {
    document.body.appendChild(this.modalElement);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }
  closeModal() {
    if (this.modalElement.parentElement) {
      this.modalElement.parentElement.removeChild(this.modalElement);
    }
  }
};

// src/commands.ts
function showMoodAndEnergyModal(plugin) {
  const modal = document.createElement("div");
  modal.className = "mood-energy-modal";
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.background = "var(--background-secondary, #222)";
  modal.style.padding = "24px";
  modal.style.borderRadius = "12px";
  modal.style.zIndex = "9999";
  modal.style.display = "flex";
  modal.style.flexDirection = "row";
  modal.style.alignItems = "stretch";
  modal.style.boxShadow = "0 4px 32px var(--shadow-s, rgba(0,0,0,0.3))";
  modal.style.maxHeight = "80vh";
  modal.style.overflow = "visible";
  modal.style.width = "min(900px, 98vw)";
  modal.style.minWidth = "340px";
  modal.style.maxWidth = "98vw";
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
  moodContainer.style.minWidth = "260px";
  const controlsContainer = document.createElement("div");
  controlsContainer.style.display = "flex";
  controlsContainer.style.flexDirection = "column";
  controlsContainer.style.alignItems = "center";
  controlsContainer.style.justifyContent = "flex-start";
  controlsContainer.style.width = "320px";
  controlsContainer.style.minWidth = "220px";
  controlsContainer.style.maxWidth = "340px";
  controlsContainer.style.background = "var(--background-modifier-hover, rgba(255,255,255,0.02))";
  controlsContainer.style.borderRadius = "8px";
  controlsContainer.style.padding = "18px 18px 18px 18px";
  controlsContainer.style.boxSizing = "border-box";
  controlsContainer.style.height = "100%";
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
      output = settings.energyFormat.replace("{value}", `${value}%`);
    } else if (settings.energyDisplay === "bar") {
      const totalBars = settings.barIcons || 5;
      const percent = value / 100;
      const bars = percent * totalBars;
      const fullBars = Math.floor(bars);
      const hasHalf = settings.barHalf && settings.barHalf.length > 0;
      let halfBars = 0;
      if (hasHalf) {
        if (bars - fullBars >= 0.75) {
          output = settings.energyFormat.replace("{value}", settings.barFull.repeat(fullBars + 1) + settings.barEmpty.repeat(totalBars - fullBars - 1));
          preview.innerText = output;
          return;
        } else if (bars - fullBars >= 0.25) {
          halfBars = 1;
        }
      }
      const emptyBars = totalBars - fullBars - halfBars;
      output = settings.energyFormat.replace(
        "{value}",
        settings.barFull.repeat(fullBars) + (halfBars ? settings.barHalf : "") + settings.barEmpty.repeat(emptyBars)
      );
    } else {
      output = settings.energyFormat.replace("{value}", `${value}`);
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
  okayButton.style.padding = "8px 18px";
  okayButton.style.borderRadius = "8px";
  okayButton.style.border = "none";
  okayButton.style.background = "var(--interactive-accent, #3a7)";
  okayButton.style.color = "var(--text-on-accent, #fff)";
  okayButton.style.fontWeight = "bold";
  okayButton.style.cursor = "pointer";
  const cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.style.padding = "8px 18px";
  cancelButton.style.borderRadius = "8px";
  cancelButton.style.border = "none";
  cancelButton.style.background = "var(--color-red, #a33)";
  cancelButton.style.color = "var(--text-on-accent, #fff)";
  cancelButton.style.fontWeight = "bold";
  cancelButton.style.cursor = "pointer";
  buttonRow.appendChild(okayButton);
  buttonRow.appendChild(cancelButton);
  controlsContainer.appendChild(buttonRow);
  let selectedMood = null;
  let selectedMoodButton = null;
  let moods = [];
  const moodSectionGrid = document.createElement("div");
  moodSectionGrid.style.display = "grid";
  moodSectionGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
  moodSectionGrid.style.gap = "18px";
  moodSectionGrid.style.width = "100%";
  moodSectionGrid.style.marginBottom = "18px";
  const moodSectionDetail = document.createElement("div");
  moodSectionDetail.style.display = "none";
  moodSectionDetail.style.flexDirection = "column";
  moodSectionDetail.style.alignItems = "stretch";
  moodSectionDetail.style.width = "100%";
  moodSectionDetail.style.marginBottom = "18px";
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
    moodSectionDetail.style.display = "none";
    moodSectionGrid.style.display = "grid";
    backButton.style.display = "none";
  };
  moodSectionDetail.appendChild(backButton);
  backButton.style.display = "none";
  loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath).then((moodList) => {
    moods = moodList;
    let i = 0;
    const sectionData = [];
    while (i < moods.length) {
      const mood = moods[i];
      if (/^#+\s/.test(mood)) {
        const headerText = mood.replace(/^#+\s*/, "");
        const moodsArr = [];
        i++;
        while (i < moods.length && !/^#+\s/.test(moods[i])) {
          moodsArr.push(moods[i].replace(/^[-*]\s*/, ""));
          i++;
        }
        sectionData.push({ header: headerText, moods: moodsArr });
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
        moodSectionGrid.style.display = "none";
        moodSectionDetail.style.display = "flex";
        backButton.style.display = "block";
        while (moodSectionDetail.childNodes.length > 1)
          moodSectionDetail.removeChild(moodSectionDetail.lastChild);
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
            selectedMood = mood;
            Array.from(moodsGrid.querySelectorAll("button")).forEach((btn) => btn.classList.remove("selected-mood"));
            moodButton.classList.add("selected-mood");
            selectedMoodButton = moodButton;
          };
          moodsGrid.appendChild(moodButton);
        });
        moodSectionDetail.appendChild(moodsGrid);
      };
      moodSectionGrid.appendChild(sectionCell);
    });
  });
  moodContainer.appendChild(moodSectionGrid);
  moodContainer.appendChild(moodSectionDetail);
  const style = document.createElement("style");
  style.innerText = `.selected-mood { background: var(--interactive-accent, #3a7) !important; color: var(--text-on-accent, #fff) !important; border: 2px solid var(--background-primary, #fff) !important; }`;
  modal.appendChild(style);
  const escListener = (e) => {
    if (e.key === "Escape") {
      if (moodSectionDetail.style.display === "flex") {
        moodSectionDetail.style.display = "none";
        moodSectionGrid.style.display = "grid";
        backButton.style.display = "none";
      } else {
        document.body.removeChild(modal);
        window.removeEventListener("keydown", escListener);
      }
    }
  };
  window.addEventListener("keydown", escListener);
  modal.appendChild(moodContainer);
  modal.appendChild(controlsContainer);
  document.body.appendChild(modal);
  okayButton.onclick = () => {
    const editor = plugin.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView)?.editor;
    if (editor && selectedMood) {
      const settings = plugin.settings;
      let energyStr = "";
      if (settings.energyDisplay === "percent") {
        energyStr = settings.energyOnlyFormat.replace("{value}", `${slider.value}%`);
      } else if (settings.energyDisplay === "bar") {
        const totalBars = settings.barIcons || 5;
        const percent = parseInt(slider.value) / 100;
        const bars = percent * totalBars;
        const fullBars = Math.floor(bars);
        const hasHalf = settings.barHalf && settings.barHalf.length > 0;
        let halfBars = 0;
        if (hasHalf) {
          if (bars - fullBars >= 0.75) {
            energyStr = settings.energyOnlyFormat.replace("{value}", settings.barFull.repeat(fullBars + 1) + settings.barEmpty.repeat(totalBars - fullBars - 1));
          } else if (bars - fullBars >= 0.25) {
            halfBars = 1;
          }
        }
        if (!energyStr) {
          const emptyBars = totalBars - fullBars - halfBars;
          energyStr = settings.energyOnlyFormat.replace(
            "{value}",
            settings.barFull.repeat(fullBars) + (halfBars ? settings.barHalf : "") + settings.barEmpty.repeat(emptyBars)
          );
        }
      } else {
        energyStr = settings.energyOnlyFormat.replace("{value}", slider.value);
      }
      const format = settings.moodAndEnergyFormat || "{mood} | {energy}";
      const output = format.replace("{mood}", selectedMood).replace("{energy}", energyStr);
      editor.replaceSelection(output);
      if (editor.focus)
        editor.focus();
    }
    document.body.removeChild(modal);
  };
  cancelButton.onclick = () => {
    document.body.removeChild(modal);
  };
}
function registerCommands(plugin) {
  plugin.addCommand({
    id: "insert-mood",
    name: "Insert Mood",
    hotkeys: [{ modifiers: ["Ctrl"], key: "M" }],
    callback: async () => {
      const moods = await loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath);
      const moodMenu = new MoodMenu(moods);
      const selectedMood = await moodMenu.open();
      if (selectedMood) {
        const editor = plugin.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView)?.editor;
        if (editor) {
          const format = plugin.settings.moodOnlyFormat || "{value}";
          const output = format.replace("{value}", selectedMood);
          editor.replaceSelection(output);
          if (editor.focus)
            editor.focus();
        }
      }
    }
  });
  plugin.addCommand({
    id: "insert-energy-level",
    name: "Insert Energy Level",
    hotkeys: [{ modifiers: ["Ctrl"], key: "E" }],
    callback: async () => {
      const energySlider = new EnergySlider();
      const selectedEnergyLevel = await energySlider.open();
      if (selectedEnergyLevel !== null) {
        const editor = plugin.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView)?.editor;
        if (editor) {
          let output = "";
          const settings = plugin.settings;
          if (settings.energyDisplay === "percent") {
            output = settings.energyOnlyFormat.replace("{value}", `${selectedEnergyLevel}%`);
          } else if (settings.energyDisplay === "bar") {
            const totalBars = settings.barIcons || 5;
            const percent = selectedEnergyLevel / 100;
            const bars = percent * totalBars;
            const fullBars = Math.floor(bars);
            const hasHalf = settings.barHalf && settings.barHalf.length > 0;
            let halfBars = 0;
            if (hasHalf) {
              if (bars - fullBars >= 0.75) {
                output = settings.energyOnlyFormat.replace("{value}", settings.barFull.repeat(fullBars + 1) + settings.barEmpty.repeat(totalBars - fullBars - 1));
                editor.replaceSelection(output);
                if (editor.focus)
                  editor.focus();
                return;
              } else if (bars - fullBars >= 0.25) {
                halfBars = 1;
              }
            }
            const emptyBars = totalBars - fullBars - halfBars;
            output = settings.energyOnlyFormat.replace(
              "{value}",
              settings.barFull.repeat(fullBars) + (halfBars ? settings.barHalf : "") + settings.barEmpty.repeat(emptyBars)
            );
          } else {
            output = settings.energyOnlyFormat.replace("{value}", `${selectedEnergyLevel}`);
          }
          editor.replaceSelection(output);
          if (editor.focus)
            editor.focus();
        }
      }
    }
  });
  plugin.addCommand({
    id: "insert-mood-and-energy",
    name: "Insert Mood and Energy Level",
    hotkeys: [{ modifiers: ["Ctrl"], key: "B" }],
    callback: () => showMoodAndEnergyModal(plugin)
  });
}

// src/main.ts
var MoodEnergyPlugin = class extends import_obsidian3.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData?.());
    this.addSettingTab(new MoodEnergySettingTab(this.app, this));
    registerCommands(this);
  }
  async saveSettings() {
    await this.saveData?.(this.settings);
  }
  onunload() {
  }
};
