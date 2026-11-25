// TODO(spec): replace with the shared helper in src/lib/exam once ticket 05 lands.
/** True for the final exam pages, where the assistant is disabled and hidden. */
export function isExamPath(pathname: string): boolean {
  return /^(\/(ja|es|ru))?\/portal\/exam(\/|$)/.test(pathname);
}
