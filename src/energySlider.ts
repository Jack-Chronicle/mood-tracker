export class EnergySlider {
  resolveFn: ((value: number | null) => void) | null = null;
  selectedValue: number = 50;
  modalElement!: HTMLDivElement;
  sliderElement!: HTMLInputElement;

  constructor() {
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
    this.sliderElement = this.modalElement.querySelector("#energySlider")!;
    const sliderValueDisplay = this.modalElement.querySelector("#sliderValue")!;
    const preview = this.modalElement.querySelector("#energyPreview") as HTMLElement;
    const okayButton = this.modalElement.querySelector("#okayButton")!;
    const cancelButton = this.modalElement.querySelector("#cancelButton")!;
    const updatePreview = () => {
      const settings = (window as any).app?.plugins?.plugins?.["obsidian-mood-energy-plugin"]?.settings || {
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
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.closeModal();
        window.removeEventListener("keydown", escListener);
      }
    };
    window.addEventListener("keydown", escListener);
  }

  open(): Promise<number | null> {
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
}
