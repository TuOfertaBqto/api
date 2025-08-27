export function formatString(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match, index: number) => {
    return typeof args[index] !== 'undefined' ? args[index] : match;
  });
}

export function formatHtmlString(template: string, ...args: string[]): string {
  return template.replace(/{{(\d+)}}/g, (match, index: number) => {
    return typeof args[index] !== 'undefined' ? args[index] : match;
  });
}

export function generateOTP(digits: number): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return String(Math.floor(Math.random() * (max - min + 1) + min));
}
