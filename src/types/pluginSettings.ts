// ...MoodEnergyPluginSettings and DEFAULT_SETTINGS from src/types/index.ts...
export interface MoodEnergyPluginSettings {
  moodsFilePath: string;
  energyDisplay: "text" | "percent" | "bar";
  energyFormat: string;
  barIcons: string;
  barIconCount: number;
  energyOnlyFormat: string;
  moodOnlyFormat: string;
  moodAndEnergyFormat: string;
  showMoodRibbon?: boolean;
  showEnergyRibbon?: boolean;
  showCombinedRibbon?: boolean;
}

export const DEFAULT_SETTINGS: MoodEnergyPluginSettings = {
  moodsFilePath: "moods.txt",
  energyDisplay: "bar",
  energyFormat: "Energy: {value}",
  barIcons: "⣿⣷⣶⣦⣤⣄⣀",
  barIconCount: 7,
  energyOnlyFormat: "Energy: {value}",
  moodOnlyFormat: "{value}",
  moodAndEnergyFormat: "{mood} | {energy}",
  showMoodRibbon: true,
  showEnergyRibbon: true,
  showCombinedRibbon: true,
};
