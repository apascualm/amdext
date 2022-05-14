import {DateTime} from "luxon";

export function convertRevDate(value: string): Date {
  return DateTime.fromFormat(value.concat(' +0'), "yyyyLLdd Z").toJSDate()
}
