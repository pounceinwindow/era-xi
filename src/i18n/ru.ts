import type { Position } from "../game/types";

export const positionLabels: Record<Position, string> = {
  GK: "Вратарь",
  LB: "Левый защитник",
  CB: "Центральный защитник",
  RB: "Правый защитник",
  LWB: "Левый фланговый защитник",
  RWB: "Правый фланговый защитник",
  DM: "Опорный полузащитник",
  CM: "Центральный полузащитник",
  AM: "Атакующий полузащитник",
  LM: "Левый полузащитник",
  RM: "Правый полузащитник",
  LW: "Левый вингер",
  RW: "Правый вингер",
  ST: "Нападающий"
};

export const positionShortLabels: Record<Position, string> = {
  GK: "ВР", LB: "ЛЗ", CB: "ЦЗ", RB: "ПЗ", LWB: "ЛФЗ", RWB: "ПФЗ",
  DM: "ОП", CM: "ЦП", AM: "АП", LM: "ЛП", RM: "ПП", LW: "ЛВ", RW: "ПВ", ST: "НАП"
};

export const copy = {
  brand: "Era XI",
  tagline: "Собери эпоху. Перепиши турнир.",
  daily: "Daily Challenge",
  training: "Свободная игра",
  leaderboard: "Лидерборд",
  credits: "Авторы фото",
  chooseFormation: "Выбери систему",
  startDraft: "Начать драфт",
  squad: "Мой состав",
  chemistry: "Химия",
  rating: "Сила",
  fatigue: "Усталость"
} as const;
