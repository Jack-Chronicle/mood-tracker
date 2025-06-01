import { PluginSettingTab, Setting, TFile, normalizePath } from "obsidian";

export interface MoodEnergyPluginSettings {
  moodsFilePath: string;
  energyDisplay: "text" | "percent" | "bar";
  energyFormat: string;
  barFull: string;
  barHalf: string;
  barEmpty: string;
  barIcons: number;
  energyOnlyFormat: string;
  moodOnlyFormat: string;
  moodAndEnergyFormat: string;
}

export const DEFAULT_SETTINGS: MoodEnergyPluginSettings = {
  moodsFilePath: "moods.txt",
  energyDisplay: "bar",
  energyFormat: "Energy: {value}",
  barFull: "",
  barHalf: "",
  barEmpty: "",
  barIcons: 5,
  energyOnlyFormat: "Energy: {value}",
  moodOnlyFormat: "{value}",
  moodAndEnergyFormat: "{mood} | {energy}"
};

export class MoodEnergySettingTab extends PluginSettingTab {
  plugin: any;
  constructor(app: any, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Mood & Energy Plugin Settings" });
    containerEl.createEl("h3", { text: "Mood Settings" });
    new Setting(containerEl)
      .setName("Moods File Path")
      .setDesc("Path to the file containing your moods, one per line (excluding frontmatter).")
      .addText((text) =>
        text
          .setPlaceholder("moods.txt")
          .setValue(this.plugin.settings.moodsFilePath)
          .onChange(async (value) => {
            this.plugin.settings.moodsFilePath = value;
            await this.plugin.saveSettings();
          })
      );
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
        .setName("Bar Full Icon")
        .setDesc("Icon for a full bar (e.g. \u25AE)")
        .addText((text) =>
          text
            .setPlaceholder("\u25AE")
            .setValue(this.plugin.settings.barFull)
            .onChange(async (value) => {
              this.plugin.settings.barFull = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Bar Half Icon")
        .setDesc("Icon for a half bar (optional, e.g. \u25B0)")
        .addText((text) =>
          text
            .setPlaceholder("")
            .setValue(this.plugin.settings.barHalf)
            .onChange(async (value) => {
              this.plugin.settings.barHalf = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Bar Empty Icon")
        .setDesc("Icon for an empty bar (e.g. \u25AF)")
        .addText((text) =>
          text
            .setPlaceholder("\u25AF")
            .setValue(this.plugin.settings.barEmpty)
            .onChange(async (value) => {
              this.plugin.settings.barEmpty = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Bar Icon Count")
        .setDesc("Number of icons in the progress bar (e.g. 5, 10, 20)")
        .addText((text) =>
          text
            .setPlaceholder("5")
            .setValue(this.plugin.settings.barIcons.toString())
            .onChange(async (value) => {
              const num = parseInt(value);
              if (!isNaN(num) && num > 0) {
                this.plugin.settings.barIcons = num;
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
  }
}

export async function loadMoodsFromFile(vault: any, filePath: string): Promise<string[]> {
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
  return [];
}
