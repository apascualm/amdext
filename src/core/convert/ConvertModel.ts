export function convertModel(value: string): string {
  if (!value || value.length <= 0) return "UNK";
  const result = /A\d{3}/.exec(value);
  if (!result || result.length <= 0) return "UNK";
  return result[0] as string;
}
