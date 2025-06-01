import { MarkdownView } from "obsidian";
import { MoodMenu } from "./moodMenu";
import { EnergySlider } from "./energySlider";
import { loadMoodsFromFile } from "./types";

export function showMoodAndEnergyModal(plugin: any) {
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
  let selectedMood: string | null = null;
  let selectedMoodButton: HTMLButtonElement | null = null;
  let moods: string[] = [];
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
  loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath).then((moodList: string[]) => {
    moods = moodList;
    let i = 0;
    const sectionData: { header: string, moods: string[] }[] = [];
    while (i < moods.length) {
      const mood = moods[i];
      if (/^#+\s/.test(mood)) {
        const headerText = mood.replace(/^#+\s*/, "");
        const moodsArr: string[] = [];
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
          moodSectionDetail.removeChild(moodSectionDetail.lastChild!);
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
  const escListener = (e: KeyboardEvent) => {
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
    const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
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
      // Do not set the cursor position after replaceSelection to avoid RangeError
      if (editor.focus) editor.focus();
    }
    document.body.removeChild(modal);
  };
  cancelButton.onclick = () => {
    document.body.removeChild(modal);
  };
}

export function registerCommands(plugin: any) {
  plugin.addCommand({
    id: "insert-mood",
    name: "Insert Mood",
    hotkeys: [{ modifiers: ["Ctrl"], key: "M" }],
    callback: async () => {
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
    hotkeys: [{ modifiers: ["Ctrl"], key: "E" }],
    callback: async () => {
      const energySlider = new EnergySlider();
      const selectedEnergyLevel = await energySlider.open();
      if (selectedEnergyLevel !== null) {
        const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
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
                if (editor.focus) editor.focus();
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
          if (editor.focus) editor.focus();
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
