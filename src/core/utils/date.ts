import {DateTime} from "luxon";

export const globalNowZ:Date = nowZ();

export function nowZ():Date {
  return DateTime.now().toJSDate();
}
