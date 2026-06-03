import { toast } from "sonner";
import { formatPronunciation } from "./pronunciation";

export const parseWordFromCambridge = (html: string, silent = false) => {
  if (!html) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Check for Cambridge Dictionary specific classes
  const wordElement =
    doc.querySelector(".hw.dhw") || doc.querySelector(".hw.dsense_hw");
  if (!wordElement && !silent) {
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

  const wordText = wordElement?.textContent?.trim() || "";
  const pos = (
    doc.querySelector(".pos.dpos") || doc.querySelector(".pos.dsense_pos")
  )?.textContent?.trim();
  const pronunciationRaw = (
    doc.querySelector(".uk.dpron-i .ipa.dipa") ||
    doc.querySelector(".us.dpron-i .ipa.dipa") ||
    doc.querySelector(".ipa.dipa")
  )?.textContent?.trim();
  const pronunciation = formatPronunciation(pronunciationRaw);

  const guideWord = (
    doc.querySelector(".guideword.dgw") ||
    doc.querySelector(".guideword.dsense_gw")
  )?.textContent
    ?.trim()
    .replace(/^\(|\)$/g, "");

  const cefr = doc.querySelector(".epp-xref.dxref")?.textContent?.trim();
  let definition =
    doc.querySelector(".def.ddef_d.db")?.textContent?.trim() || "";
  if (definition.endsWith(":")) {
    definition = definition.slice(0, -1).trim();
  }

  // If we can't find a definition, this isn't a valid dictionary fragment
  if (!definition) return null;

  const examples = Array.from(doc.querySelectorAll(".eg.deg"))
    .map((el) => el.textContent?.trim())
    .filter((t): t is string => !!t)
    .slice(0, 10);

  const synonyms = Array.from(
    doc.querySelectorAll(
      ".xref.synonym .x-h.dx-h, .synonyms .x-h.dx-h, .synonym .x-h.dx-h",
    ),
  )
    .map((el) => el.textContent?.trim())
    .filter((t): t is string => !!t)
    .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  const antonyms = Array.from(
    doc.querySelectorAll(
      ".xref.opposites .x-h.dx-h, .opposites .x-h.dx-h, .opposite .x-h.dx-h",
    ),
  )
    .map((el) => el.textContent?.trim())
    .filter((t): t is string => !!t)
    .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  return {
    word: wordText,
    pos,
    pronunciation,
    cefr,
    definition,
    examples,
    synonyms: synonyms.join(", "),
    antonyms: antonyms.join(", "),
    guideWord: guideWord || null,
  };
};
