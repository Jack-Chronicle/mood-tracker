// main.ts
// Main plugin entry point for the Mood & Energy Obsidian plugin.

import { Plugin } from "obsidian";
import { MoodEnergyPluginSettings, DEFAULT_SETTINGS, MoodEnergySettingTab } from "./types";
import { registerCommands } from "./commands";

/**
 * Main plugin class for Mood & Energy tracking in Obsidian.
 */
export default class MoodEnergyPlugin extends Plugin {
  settings: MoodEnergyPluginSettings;
  settingTab: MoodEnergySettingTab | null = null;

  constructor(app: any, manifest: any) {
    super(app, manifest);
    this.settings = DEFAULT_SETTINGS;
  }

  /**
   * Loads settings and registers commands on plugin load.
   */
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData?.());
    this.addSettingTab(new MoodEnergySettingTab(this.app, this));
    registerCommands(this);
  }

  /**
   * Saves plugin settings to disk.
   */
  async saveSettings() {
    await this.saveData?.(this.settings);
  }

  /**
   * Cleans up on plugin unload.
   */
  onunload() {
    // No special cleanup
  }
}
