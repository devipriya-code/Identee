// data/fontCatalog.js
//
// Powers the "CHOOSE FONT" picker (see components/FontPicker.jsx).
//
// Two buckets, both rendered the same way in the picker:
//
//   GOOGLE_FONTS   — real Google Fonts, loaded on demand via the Google
//                    Fonts CSS API (no npm package, no local font files).
//
//   CUSTOM_FONTS   — for the bold/novelty display faces you see on
//                    yourdesignstore.in (e.g. "AVENGEANCE MIGHTIEST
//                    AVENGER", "sportsjersey", "Rakoon"). Those aren't
//                    on Google Fonts — that kind of site licenses/uploads
//                    .woff/.woff2 files (often from dafont.com-style
//                    foundries) and registers them with @font-face.
//                    This array is empty until you add your own — see
//                    the instructions below the array.
//
// Both arrays share the same shape: { family, label, category, css }
//   family   — the actual font-family name used in CSS / canvas / saved
//              customization.fontFamily
//   label    — display name shown under the "EXAMPLE" preview card
//   category — optional grouping (not required, used for future filter chips)
//   css      — for CUSTOM_FONTS only: an @font-face block; GOOGLE_FONTS
//              don't need this since loadGoogleFont() injects a <link>.

export const GOOGLE_FONTS = [
  { family: "Yeseva One", label: "Yeseva One", category: "display" },
  { family: "Trocchi", label: "Trocchi", category: "serif" },
  { family: "Trirong", label: "Trirong", category: "serif" },
  { family: "Varela Round", label: "Varela Round", category: "sans" },
  { family: "Walter Turncoat", label: "Walter Turncoat", category: "script" },
  { family: "Voltaire", label: "Voltaire", category: "sans" },
  { family: "Vampiro One", label: "Vampiro One", category: "display" },
  { family: "Ubuntu Condensed", label: "Ubuntu Condensed", category: "sans" },
  { family: "Rosarivo", label: "Rosarivo", category: "serif" },
  { family: "Underdog", label: "Underdog", category: "display" },
  { family: "Yatra One", label: "Yatra One", category: "display" },
  { family: "Varela", label: "Varela", category: "sans" },
  { family: "Uncial Antiqua", label: "Uncial Antiqua", category: "display" },
  { family: "Ubuntu", label: "Ubuntu", category: "sans" },
  { family: "Vollkorn", label: "Vollkorn", category: "serif" },
  { family: "Vibur", label: "Vibur", category: "script" },
  { family: "Trochut", label: "Trochut", category: "display" },
  { family: "Yrsa", label: "Yrsa", category: "serif" },
  { family: "Tinos", label: "Tinos", category: "serif" },
  { family: "Bangers", label: "Bangers", category: "display" },
  { family: "Fredoka", label: "Fredoka One", category: "display" },
  { family: "Lobster", label: "Lobster", category: "script" },
  { family: "Pacifico", label: "Pacifico", category: "script" },
  { family: "Permanent Marker", label: "Permanent Marker", category: "script" },
  { family: "Bebas Neue", label: "Bebas Neue", category: "display" },
  { family: "Anton", label: "Anton", category: "display" },
  { family: "Righteous", label: "Righteous", category: "display" },
  { family: "Bungee", label: "Bungee", category: "display" },
  { family: "Luckiest Guy", label: "Luckiest Guy", category: "display" },
  { family: "Caveat", label: "Caveat", category: "script" },
  { family: "Shrikhand", label: "Shrikhand", category: "display" },
  { family: "Sancreek", label: "Sancreek", category: "display" },
  { family: "Rye", label: "Rye", category: "display" },
  { family: "Fascinate", label: "Fascinate", category: "display" },
  { family: "Monoton", label: "Monoton", category: "display" },
  { family: "Creepster", label: "Creepster", category: "display" },
  { family: "Alfa Slab One", label: "Alfa Slab One", category: "display" },
  { family: "Amatic SC", label: "Amatic SC", category: "script" },
  { family: "Archivo Black", label: "Archivo Black", category: "sans" },
  { family: "Baloo 2", label: "Baloo 2", category: "display" },
  { family: "Bree Serif", label: "Bree Serif", category: "serif" },
  { family: "Chewy", label: "Chewy", category: "display" },
  { family: "Cinzel", label: "Cinzel", category: "serif" },
  { family: "Comfortaa", label: "Comfortaa", category: "sans" },
  {
    family: "Cormorant Garamond",
    label: "Cormorant Garamond",
    category: "serif",
  },
  { family: "Dancing Script", label: "Dancing Script", category: "script" },
  { family: "DM Serif Display", label: "DM Serif Display", category: "serif" },
  { family: "Fjalla One", label: "Fjalla One", category: "sans" },
  { family: "Frijole", label: "Frijole", category: "display" },
  { family: "Great Vibes", label: "Great Vibes", category: "script" },
  { family: "Indie Flower", label: "Indie Flower", category: "script" },
  { family: "Jolly Lodger", label: "Jolly Lodger", category: "display" },
  { family: "Kalam", label: "Kalam", category: "script" },
  { family: "Knewave", label: "Knewave", category: "display" },
  {
    family: "Libre Baskerville",
    label: "Libre Baskerville",
    category: "serif",
  },
  { family: "Lobster Two", label: "Lobster Two", category: "script" },
  { family: "Merriweather", label: "Merriweather", category: "serif" },
  { family: "Montserrat", label: "Montserrat", category: "sans" },
  { family: "Nunito", label: "Nunito", category: "sans" },
  { family: "Oswald", label: "Oswald", category: "sans" },
  { family: "Passion One", label: "Passion One", category: "display" },
  { family: "Patrick Hand", label: "Patrick Hand", category: "script" },
  { family: "Playfair Display", label: "Playfair Display", category: "serif" },
  { family: "Poiret One", label: "Poiret One", category: "display" },
  { family: "Poppins", label: "Poppins", category: "sans" },
  { family: "Quicksand", label: "Quicksand", category: "sans" },
  { family: "Raleway", label: "Raleway", category: "sans" },
  { family: "Rock Salt", label: "Rock Salt", category: "script" },
  { family: "Russo One", label: "Russo One", category: "display" },
  { family: "Satisfy", label: "Satisfy", category: "script" },
  { family: "Special Elite", label: "Special Elite", category: "display" },
  { family: "Staatliches", label: "Staatliches", category: "display" },
  { family: "Titan One", label: "Titan One", category: "display" },
  { family: "Zilla Slab", label: "Zilla Slab", category: "serif" },
];

// ---------------------------------------------------------------------
// CUSTOM_FONTS — add your own uploaded display/novelty fonts here.
//
// To add one (e.g. a font file you licensed/downloaded as
// "AvengeanceMightiestAvenger.woff2"):
//
//   1. Drop the font file in /public/fonts/
//   2. Add an entry here:
//
//      {
//        family: "AvengeanceMightiestAvenger", // must match @font-face below
//        label: "AVENGEANCE MIGHTIEST AVENGER",
//        category: "display",
//        css: `
//          @font-face {
//            font-family: "AvengeanceMightiestAvenger";
//            src: url("/fonts/AvengeanceMightiestAvenger.woff2") format("woff2");
//            font-display: swap;
//          }
//        `,
//      },
//
// FontPicker.jsx injects each entry's `css` into a <style> tag once,
// the same way it injects Google Fonts <link> tags, so no other wiring
// is needed — the family just shows up in the grid.
// ---------------------------------------------------------------------
export const CUSTOM_FONTS = [];

export function getAllFonts() {
  return [...GOOGLE_FONTS, ...CUSTOM_FONTS];
}

// Injects a Google Fonts <link> for a family the first time it's
// requested. Safe to call repeatedly — dedups via the data-font attr.
const loadedFamilies = new Set();

export function loadGoogleFont(family) {
  if (loadedFamilies.has(family)) return;
  loadedFamilies.add(family);

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@400;700&display=swap`;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-font", family);
  document.head.appendChild(link);
}

// Injects a custom font's @font-face block once.
const injectedCustom = new Set();

export function loadCustomFont(fontEntry) {
  if (!fontEntry?.css || injectedCustom.has(fontEntry.family)) return;
  injectedCustom.add(fontEntry.family);

  const style = document.createElement("style");
  style.setAttribute("data-custom-font", fontEntry.family);
  style.textContent = fontEntry.css;
  document.head.appendChild(style);
}
