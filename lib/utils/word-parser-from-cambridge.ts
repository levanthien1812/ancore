import { toast } from "sonner";
import { formatPronunciation } from "./pronunciation";

export const parseWordFromCambridge = (html: string, silent = false) => {
  if (!html) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Check for Cambridge Dictionary specific classes
  const wordElement = doc.querySelector(".hw.dhw");
  if (!wordElement) {
    if (!silent) {
      toast.error(
        "No recognizable word found in the pasted content. Please make sure to copy from Cambridge Dictionary and include the word itself in the selection.",
        {
          duration: 7000,
        },
      );
    }
    return null;
  }

  const wordText = wordElement.textContent?.trim() || "";
  const pos = doc.querySelector(".pos.dpos")?.textContent?.trim();
  const pronunciationRaw = doc
    .querySelector(".us.dpron-i .ipa.dipa")
    ?.textContent?.trim();
  const pronunciation = formatPronunciation(pronunciationRaw);

  const cefr = doc.querySelector(".epp-xref.dxref")?.textContent?.trim();
  let definition =
    doc.querySelector(".def.ddef_d.db")?.textContent?.trim() || "";
  if (definition.endsWith(":")) {
    definition = definition.slice(0, -1).trim();
  }
  const examples = Array.from(doc.querySelectorAll(".eg.deg"))
    .map((el) => el.textContent?.trim())
    .filter((t): t is string => !!t)
    .slice(0, 10);

  return {
    word: wordText,
    pos,
    pronunciation,
    cefr,
    definition,
    examples,
  };
};
