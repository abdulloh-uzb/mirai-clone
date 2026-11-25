import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import ja from "../../messages/ja.json";
import ru from "../../messages/ru.json";

type Tree = { [key: string]: string | Tree };

function keyPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : keyPaths(value, `${prefix}${key}.`),
  );
}

const translations = { ja, es, ru } as const;

describe.each(Object.entries(translations))("%s messages", (_, messages) => {
  it("are marked as needing native-speaker review", () => {
    expect(messages._translationNote).toMatch(/native-speaker review/);
  });

  it("translate every English message", () => {
    const missing = keyPaths(en).filter(
      (path) => !keyPaths(messages).includes(path),
    );
    expect(missing).toEqual([]);
  });
});
