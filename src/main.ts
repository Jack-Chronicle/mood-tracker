import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, MoodEnergySettingTab } from "./types";
import { registerCommands } from "./commands";

export default class MoodEnergyPlugin extends Plugin {
  settings: typeof DEFAULT_SETTINGS;

  constructor(app: any, manifest: any) {
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
    // No special cleanup
  }
}
