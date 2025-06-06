import { TFile, normalizePath } from "obsidian";
import { PluginSettingTab, Setting, App, TextComponent } from "obsidian";
import { FilePathSuggester } from "./FilePathSuggester";
import { MoodEnergyPluginSettings } from "../types";

export async function loadMoodsFromFile(vault: any, filePath: string): Promise<string[]> {
  const DEFAULT_MOODS = [
    "Happy",
    "Sad",
    "Angry",
    "Excited",
    "Calm",
    "Anxious",
    "Tired",
    "Motivated",
    "Bored",
    "Grateful",
    "Stressed",
    "Content",
    "Confident",
    "Lonely",
    "Hopeful"
  ];
  try {
    const file = vault.getAbstractFileByPath(normalizePath(filePath));
    if (file instanceof TFile) {
      const content = await vault.read(file);
      let lines = content.split(/\r?\n/);
      if (lines[0].trim() === "---") {
        let i = 1;
        while (i < lines.length && lines[i].trim() !== "---") i++;
        lines = lines.slice(i + 1);
      }
      return lines
        .map((l: string) => l.replace(/<\/?[a-zA-Z][^>]*>/g, "").trim())
        .filter((l: string) => l.length > 0);
    }
  } catch (e) {
    console.error("Failed to load moods file:", e);
  }
  return DEFAULT_MOODS;
}

export class MoodEnergySettingTab extends PluginSettingTab {
  plugin: any;
  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
    plugin.settingTab = this;
  }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Mood & Energy Plugin Settings" });
    containerEl.createEl("h3", { text: "Mood Settings" });
    new Setting(containerEl)
      .setName("Moods File Path")
      .setDesc("Path to the file containing your moods, one per line (excluding frontmatter). Start typing to see suggestions from your vault.")
      .addText((text: TextComponent) => {
        text.setPlaceholder("moods.txt")
          .setValue(this.plugin.settings.moodsFilePath)
          .onChange(async (value) => {
            this.plugin.settings.moodsFilePath = value;
            await this.plugin.saveSettings();
          });
        setTimeout(() => new FilePathSuggester(text.inputEl, this.app), 0);
      });
    containerEl.createEl("h3", { text: "Energy Settings" });
    new Setting(containerEl)
      .setName("Energy Display")
      .setDesc("How to display the energy value: as text, percent, or a progress bar.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("text", "Text")
          .addOption("percent", "Percent")
          .addOption("bar", "Progress Bar")
          .setValue(this.plugin.settings.energyDisplay)
          .onChange(async (value) => {
            this.plugin.settings.energyDisplay = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );
    if (this.plugin.settings.energyDisplay === "bar") {
      new Setting(containerEl)
        .setName("Bar Icons")
        .setDesc("Icons for the progress bar, from full to empty (e.g. ⣿⣷⣶⣦⣤⣄⣀ or █▓▒░)")
        .addText((text) =>
          text
            .setPlaceholder("⣿⣷⣶⣦⣤⣄⣀")
            .setValue(this.plugin.settings.barIcons)
            .onChange(async (value) => {
              this.plugin.settings.barIcons = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Bar Icon Count")
        .setDesc("Number of icons in the progress bar (e.g. 5, 7, 10, 20)")
        .addText((text) =>
          text
            .setPlaceholder("7")
            .setValue(this.plugin.settings.barIconCount.toString())
            .onChange(async (value) => {
              const num = parseInt(value);
              if (!isNaN(num) && num > 0) {
                this.plugin.settings.barIconCount = num;
                await this.plugin.saveSettings();
              }
            })
        );
    }
    containerEl.createEl("h3", { text: "Output Format Settings" });
    new Setting(containerEl)
      .setName("Energy Only Output Format")
      .setDesc("Format for energy only output. Use {value} for the energy bar/number.")
      .addText((text) =>
        text
          .setPlaceholder("Energy: {value}")
          .setValue(this.plugin.settings.energyOnlyFormat)
          .onChange(async (value) => {
            this.plugin.settings.energyOnlyFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Mood Only Output Format")
      .setDesc("Format for mood only output. Use {value} for the mood.")
      .addText((text) =>
        text
          .setPlaceholder("{value}")
          .setValue(this.plugin.settings.moodOnlyFormat)
          .onChange(async (value) => {
            this.plugin.settings.moodOnlyFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Mood + Energy Output Format")
      .setDesc("Format for mood + energy output. Use {mood} and {energy}.")
      .addText((text) =>
        text
          .setPlaceholder("{mood} | {energy}")
          .setValue(this.plugin.settings.moodAndEnergyFormat)
          .onChange(async (value) => {
            this.plugin.settings.moodAndEnergyFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Show Mood Ribbon Icon")
      .setDesc("Show a toolbar button for the Mood menu.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showMoodRibbon)
        .onChange(async (value) => {
          this.plugin.settings.showMoodRibbon = value;
          await this.plugin.saveSettings();
          this.plugin.reloadRibbonIcons();
        }));
    new Setting(containerEl)
      .setName("Show Energy Ribbon Icon")
      .setDesc("Show a toolbar button for the Energy slider.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showEnergyRibbon)
        .onChange(async (value) => {
          this.plugin.settings.showEnergyRibbon = value;
          await this.plugin.saveSettings();
          this.plugin.reloadRibbonIcons();
        }));
    new Setting(containerEl)
      .setName("Show Combined Ribbon Icon")
      .setDesc("Show a toolbar button for the combined Mood & Energy modal.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showCombinedRibbon)
        .onChange(async (value) => {
          this.plugin.settings.showCombinedRibbon = value;
          await this.plugin.saveSettings();
          this.plugin.reloadRibbonIcons();
        }));
  }
}
