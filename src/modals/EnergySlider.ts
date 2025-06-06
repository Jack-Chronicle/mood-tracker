import { formatBarIcons, openModal, closeModal } from "../utils";

export class EnergySlider {
  plugin: any;
  resolveFn: ((value: number | null) => void) | null = null;
  selectedValue: number = 50;
  modalElement!: HTMLDivElement;
  sliderElement!: HTMLInputElement;

  constructor(plugin: any) {
    this.plugin = plugin;
    this.createModal();
  }

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

  open(): Promise<number | null> {
    openModal(this.modalElement);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  closeModal() {
    closeModal(this.modalElement);
  }

  /**
   * Render the energy slider inline into a container. Calls onChange when the value changes.
   */
  renderInline(container: HTMLElement, onChange: (value: number) => void) {
    container.innerHTML = "";
    // Create a styled wrapper to match modal appearance
    const wrapper = document.createElement("div");
    wrapper.className = "energy-slider-inline";
    wrapper.style.background = "var(--background-secondary)";
    wrapper.style.padding = "24px";
    wrapper.style.borderRadius = "var(--radius-m)";
    wrapper.style.boxShadow = "0 4px 32px var(--background-modifier-box-shadow)";
    wrapper.style.border = "var(--input-border-width) solid var(--background-modifier-border)";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.width = "100%";
    const sliderLabel = document.createElement("div");
    sliderLabel.innerText = "Energy Level:";
    sliderLabel.style.color = "var(--text-normal, #fff)";
    sliderLabel.style.marginBottom = "8px";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = this.selectedValue.toString();
    slider.className = "slider";
    slider.style.width = "220px";
    slider.style.margin = "0 0 0 0";
    const sliderValue = document.createElement("div");
    sliderValue.innerText = this.selectedValue.toString();
    sliderValue.style.color = "var(--text-normal, #fff)";
    sliderValue.style.marginTop = "8px";
    const preview = document.createElement("div");
    preview.style.marginTop = "8px";
    preview.style.color = "var(--text-normal, #fff)";
    preview.style.fontFamily = "monospace";
    preview.style.fontSize = "1.2em";
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
      const value = parseInt(slider.value);
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
    slider.oninput = () => {
      this.selectedValue = parseInt(slider.value);
      sliderValue.innerText = slider.value;
      updatePreview();
      onChange(this.selectedValue);
    };
    updatePreview();
    // Style the slider to match the modal
    slider.style.appearance = "none";
    slider.style.height = "6px";
    slider.style.background = "var(--background-modifier-border)";
    slider.style.borderRadius = "4px";
    slider.style.outline = "none";
    slider.style.marginBottom = "0";
    slider.style.marginTop = "0";
    slider.style.marginLeft = "0";
    slider.style.marginRight = "0";
    slider.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
    // Add thumb styling for webkit browsers
    slider.style.setProperty("::-webkit-slider-thumb", "background: var(--interactive-accent); border-radius: 50%; width: 18px; height: 18px; cursor: pointer; border: 2px solid var(--background-primary);");
    wrapper.appendChild(sliderLabel);
    wrapper.appendChild(slider);
    wrapper.appendChild(sliderValue);
    wrapper.appendChild(preview);
    container.appendChild(wrapper);
  }
}
