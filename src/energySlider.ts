// energySlider.ts
// Energy slider modal logic for the Mood & Energy Obsidian plugin.

import { formatBarIcons, openModal, closeModal } from "./types";

/**
 * Modal for selecting an energy level using a slider.
 */
export class EnergySlider {
  plugin: any; // Reference to the plugin instance, if needed
  resolveFn: ((value: number | null) => void) | null = null;
  selectedValue: number = 50;
  modalElement!: HTMLDivElement;
  sliderElement!: HTMLInputElement;

  /**
   * Initializes the modal and slider elements.
   */
  constructor(plugin: any) {
    this.plugin = plugin; // Store the plugin instance if needed
    this.createModal();
  }

  /**
   * Creates the modal DOM structure and event handlers.
   */
  createModal() {
    this.modalElement = document.createElement("div");
    this.modalElement.className = "energy-slider-modal";
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
    this.modalElement.style.minWidth = "340px";
    this.modalElement.style.width = "min(420px, 98vw)";
    this.modalElement.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    this.modalElement.innerHTML = `
            <div class="slider-container" style="display:flex;flex-direction:column;align-items:center;">
                <input type="range" min="0" max="100" value="50" class="slider" id="energySlider" style="width:200px;">
                <div class="slider-value" id="sliderValue" style="margin-top:8px;color:var(--text-normal);">50</div>
                <div class="energy-preview" id="energyPreview" style="margin-top:8px;color:var(--text-normal);font-family:monospace;font-size:1.2em;"></div>
            </div>
            <div style="display:flex;gap:12px;margin-top:18px;justify-content:center;width:100%;">
                <button id="okayButton" class="mod-cta" style="padding:var(--size-4-2) var(--size-4-4);border-radius:var(--radius-s);border:var(--input-border-width) solid var(--background-modifier-border);background:var(--interactive-accent);color:var(--text-on-accent);font-weight:bold;cursor:pointer;">Okay</button>
                <button id="cancelButton" class="mod-cta" style="padding:var(--size-4-2) var(--size-4-4);border-radius:var(--radius-s);border:var(--input-border-width) solid var(--background-modifier-border);background:var(--background-modifier-hover);color:var(--color-red);font-weight:bold;cursor:pointer;">Cancel</button>
            </div>
        `;
    this.sliderElement = this.modalElement.querySelector("#energySlider")!;
    const sliderValueDisplay = this.modalElement.querySelector("#sliderValue")!;
    const preview = this.modalElement.querySelector("#energyPreview") as HTMLElement;
    const okayButton = this.modalElement.querySelector("#okayButton")!;
    const cancelButton = this.modalElement.querySelector("#cancelButton")!;
    const updatePreview = () => {
      const settings = this.plugin?.settings || {
        energyDisplay: "bar",
        energyFormat: "Energy: {value}",
        barIcons: "⣿⣷⣶⣦⣤⣄⣀",
        barIconCount: 7,
        energyOnlyFormat: "Energy: {value}",
        moodOnlyFormat: "{value}",
        moodAndEnergyFormat: "{mood} | {energy}"
      };
      const value = parseInt(this.sliderElement.value);
      let output = "";
      if (settings.energyDisplay === "percent") {
        output = settings.energyOnlyFormat.replace("{value}", `${value}%`);
      } else if (settings.energyDisplay === "bar") {
        output = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, value, settings.barIconCount));
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
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeModal();
        window.removeEventListener("keydown", escListener);
      }
    };
    window.addEventListener("keydown", escListener);
  }

  /**
   * Opens the modal and returns a promise resolving to the selected value or null.
   */
  open(): Promise<number | null> {
    openModal(this.modalElement);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  /**
   * Closes the modal and cleans up.
   */
  closeModal() {
    closeModal(this.modalElement);
  }
}
