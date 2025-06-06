import { MarkdownView } from "obsidian";
import { MoodMenu, EnergySlider } from "../modals";
import { loadMoodsFromFile, formatBarIcons, currentOpenModal } from "../utils";

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

export function showMoodAndEnergyModal(plugin: any) {
  // This is a stub. You must move the full implementation from your old commands.ts here if you want the combined modal to work.
  // For now, this will do nothing.
}

export function registerCommands(plugin: any) {
  function canRunCommand() {
    return !currentOpenModal;
  }
  plugin.addCommand({
    id: "insert-mood",
    name: "Insert Mood",
    hotkeys: [{ modifiers: ["Alt"], key: "6" }],
    callback: async () => {
      if (!canRunCommand()) return;
      await insertMood(plugin);
    }
  });
  plugin.addCommand({
    id: "insert-energy-level",
    name: "Insert Energy Level",
    hotkeys: [{ modifiers: ["Alt"], key: "5" }],
    callback: async () => {
      if (!canRunCommand()) return;
      await insertEnergy(plugin);
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
