import { formatBarIcons } from "../utils";
import { Modal, App } from "obsidian";

/**
 * EnergySlider modal for selecting and previewing an energy value.
 */
export class EnergySlider extends Modal {
  plugin: any;
  selectedValue: number;
  onSubmit: (value: number) => void;

  constructor(app: App, plugin: any, onSubmit: (value: number) => void, initialValue = 50) {
    super(app);
    this.plugin = plugin;
    this.selectedValue = initialValue;
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
    const { contentEl } = this;
    contentEl.empty();
    contentEl.classList.add("energy-slider-modal");
    const { modalEl } = this;
    let header = modalEl.querySelector('.modal-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'modal-header';
      const title = document.createElement('div');
      title.className = 'modal-title';
      title.textContent = "Select Energy Level";
      header.appendChild(title);
      modalEl.insertBefore(header, contentEl);
    } else {
      let title = header.querySelector('.modal-title');
      if (!title) {
        title = document.createElement('div');
        title.className = 'modal-title';
        title.textContent = "Select Energy Level";
        header.appendChild(title);
      } else {
        title.textContent = "Select Energy Level";
      }
    }
    this.modalEl.classList.add("energy-slider-modal");
    this.modalEl.classList.add("energy-slider-width");
    // Slider
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = this.selectedValue.toString();
    slider.className = "slider energy-slider";
    slider.id = "energy-slider";
    slider.style.width = "220px";
    slider.removeAttribute("title");
    contentEl.appendChild(slider);
    // Preview
    const preview = document.createElement("div");
    preview.className = "energy-preview";
    preview.setAttribute("aria-live", "polite");
    preview.style.marginTop = "8px";
    preview.style.fontFamily = "monospace";
    preview.style.fontSize = "1.2em";
    contentEl.appendChild(preview);
    // Update preview
    const updatePreview = () => {
      const settings = this.plugin?.settings || {};
      let output = `${this.selectedValue}`;
      if (settings.energyDisplay === "percent") {
        output = `${this.selectedValue}%`;
      } else if (settings.energyDisplay === "bar") {
        output = settings.energyOnlyFormat?.replace(
          "{value}",
          formatBarIcons(settings.barIcons, this.selectedValue, settings.barIconCount)
        ) || `${this.selectedValue}`;
      }
      preview.innerText = output;
    };
    slider.oninput = () => {
      this.selectedValue = parseInt(slider.value);
      updatePreview();
    };
    updatePreview();
    // Buttons
    const buttonRow = document.createElement("div");
    buttonRow.className = "mod-cta btn-row";
    buttonRow.style.display = "flex";
    buttonRow.style.gap = "12px";
    buttonRow.style.marginTop = "18px";
    buttonRow.style.justifyContent = "center";
    buttonRow.style.width = "100%";
    // OK
    const okBtn = document.createElement("button");
    okBtn.innerText = "Okay";
    okBtn.className = "mod-cta okay-btn";
    okBtn.type = "button";
    okBtn.tabIndex = 0;
    okBtn.style.outline = "none";
    okBtn.onclick = () => {
      this.onSubmit(this.selectedValue);
      this.close();
    };
    okBtn.removeAttribute("title");
    buttonRow.appendChild(okBtn);
    // Cancel
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Cancel";
    cancelBtn.className = "mod-cta cancel-btn";
    cancelBtn.type = "button";
    cancelBtn.tabIndex = 0;
    cancelBtn.style.outline = "none";
    cancelBtn.onclick = () => this.close();
    cancelBtn.removeAttribute("title");
    buttonRow.appendChild(cancelBtn);
    contentEl.appendChild(buttonRow);
  }

  onClose() {
    this.contentEl.empty();
  }
}
