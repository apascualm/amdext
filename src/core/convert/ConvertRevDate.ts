import {DateTime} from "luxon";

/**
 * Convert string date to JS Date Object
 * @param value date string 'yyyyLLdd'
 * ej. '20231230'
 */
export function convertRevDate(value: string): Date {
  return DateTime.fromFormat(value.concat(' +0'), "yyyyLLdd Z").toJSDate()
}
