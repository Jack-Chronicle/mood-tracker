import { MarkdownView } from "obsidian";
import { MoodMenu, EnergySlider } from "../modals";
import { loadMoodsFromFile, formatBarIcons, currentOpenModal } from "../utils";
import { showMoodAndEnergyModal } from "../modals/MoodEnergyModal";

/**
 * Opens the Mood selection modal and inserts the selected mood into the editor.
 */
export async function insertMood(plugin: any) {
  const moods = await loadMoodsFromFile(plugin.app.vault, plugin.settings.moodsFilePath);
  return new Promise<void>((resolve) => {
    const modal = new MoodMenu(plugin.app, moods, (selectedMood: string | null) => {
      if (selectedMood !== null && selectedMood !== undefined) {
        const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) {
          const format = plugin.settings.moodOnlyFormat || "{value}";
          const output = format.replace("{value}", selectedMood);
          editor.focus();
          editor.replaceSelection(output);
        }
      }
      resolve();
    });
    modal.open();
  });
}

/**
 * Opens the Energy slider modal and inserts the selected energy value into the editor.
 */
export async function insertEnergy(plugin: any) {
  return new Promise<void>((resolve) => {
    const modal = new EnergySlider(plugin.app, plugin, (selectedEnergyLevel: number) => {
      if (selectedEnergyLevel !== null && selectedEnergyLevel !== undefined) {
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
      resolve();
    });
    modal.open();
  });
}

/**
 * Opens the combined Mood & Energy modal and inserts the formatted result into the editor.
 */
export async function insertMoodAndEnergy(plugin: any) {
  await showMoodAndEnergyModal(plugin, (selectedMood: string, selectedEnergy: number) => {
    const editor = plugin.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (editor) {
      const settings = plugin.settings;
      // Format energy part
      let energyStr = `${selectedEnergy}`;
      if (settings.energyDisplay === "percent") {
        energyStr = `${selectedEnergy}%`;
      } else if (settings.energyDisplay === "bar") {
        energyStr = settings.energyOnlyFormat.replace("{value}", formatBarIcons(settings.barIcons, selectedEnergy, settings.barIconCount));
      } else {
        energyStr = settings.energyOnlyFormat.replace("{value}", `${selectedEnergy}`);
      }
      // Format mood part
      const moodStr = (settings.moodOnlyFormat || "{value}").replace("{value}", selectedMood || "").trim();
      // Format combined output, trimming each part before insertion
      let output = (settings.moodAndEnergyFormat || "{mood} | {energy}")
        .replace("{mood}", moodStr)
        .replace("{energy}", energyStr.trim());
      editor.focus();
      editor.replaceSelection(output);
    }
  });
}

/**
 * Registers all plugin commands and their hotkeys with Obsidian.
 */
export function registerCommands(plugin: any) {
  function canRunCommand() {
    return !currentOpenModal;
  }
  plugin.addCommand({
    id: "insert-mood",
    name: "Insert Mood",
    callback: async () => {
      if (!canRunCommand()) return;
      await insertMood(plugin);
    }
  });
  plugin.addCommand({
    id: "insert-energy-level",
    name: "Insert Energy Level",
    callback: async () => {
      if (!canRunCommand()) return;
      await insertEnergy(plugin);
    }
  });
  plugin.addCommand({
    id: "insert-mood-and-energy",
    name: "Insert Mood and Energy Level",
    callback: async () => {
      if (!canRunCommand()) return;
      await insertMoodAndEnergy(plugin);
    }
  });
}
