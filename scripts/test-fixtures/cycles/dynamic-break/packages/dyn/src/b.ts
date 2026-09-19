export const b = 1;

export async function load() {
  return (await import('./a')).a;
}
