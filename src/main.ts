// main.ts
// Main plugin entry point for the Mood & Energy Obsidian plugin.

import { Plugin, Editor, MarkdownView } from "obsidian";
import { MoodEnergyPluginSettings, DEFAULT_SETTINGS } from "./types";
import { MoodEnergySettingTab } from "./settings";
import { registerCommands, insertMood, insertEnergy, insertMoodAndEnergy } from "./commands";
import { showMoodAndEnergyModal } from "./modals/MoodEnergyModal";
import { MoodMenu, EnergySlider } from "./modals";
import { loadMoodsFromFile } from "./utils";

/**
 * MoodEnergyPlugin: Main plugin class for Mood & Energy tracking in Obsidian.
 * Handles settings, ribbon icons, and command registration.
 */
export default class MoodEnergyPlugin extends Plugin {
  settings: MoodEnergyPluginSettings;
  settingTab: MoodEnergySettingTab | null = null;
  ribbonIcons: HTMLElement[] = [];

  constructor(app: any, manifest: any) {
    super(app, manifest);
    this.settings = DEFAULT_SETTINGS;
  }

  /**
   * Reloads ribbon icons based on current settings.
   */
  reloadRibbonIcons() {
    this.ribbonIcons.forEach(icon => icon.remove());
    this.ribbonIcons = [];
    const closeOpenModal = () => {
      const modals = document.querySelectorAll('.modal-container');
      modals.forEach((modal: Element) => {
        const closeBtn = modal.querySelector('.modal-close-button');
        if (closeBtn instanceof HTMLElement) closeBtn.click();
      });
    };
    if (this.settings.showMoodRibbon) {
      const moodIcon = this.addRibbonIcon("smile", "Open Mood Menu", async () => {
        closeOpenModal();
        const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) editor.focus();
        await insertMood(this);
      });
      this.ribbonIcons.push(moodIcon);
    }
    if (this.settings.showEnergyRibbon) {
      const energyIcon = this.addRibbonIcon("activity", "Open Energy Slider", async () => {
        closeOpenModal();
        const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) editor.focus();
        await insertEnergy(this);
      });
      this.ribbonIcons.push(energyIcon);
    }
    if (this.settings.showCombinedRibbon) {
      const combinedIcon = this.addRibbonIcon("bar-chart-2", "Open Mood & Energy Modal", async () => {
        closeOpenModal();
        const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) editor.focus();
        await insertMoodAndEnergy(this);
      });
      this.ribbonIcons.push(combinedIcon);
    }
  }

  /**
   * Loads settings and registers commands on plugin load.
   */
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData?.());
    await this.saveSettings();
    this.addSettingTab(new MoodEnergySettingTab(this.app, this));
    registerCommands(this);
    await this.reloadRibbonIcons();
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
    this.ribbonIcons.forEach(icon => icon.remove());
    this.ribbonIcons = [];
  }
}
