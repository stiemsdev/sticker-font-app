import React, { useEffect, useState, useRef, useCallback } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import WebFont from "webfontloader";

const API_KEY = "AIzaSyDdsSI5i__DskwfOnW4PYoHNsUTB4Xc5ag";
const GOOGLE_FONTS_API = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`;

function useGoogleFonts() {
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchFonts() {
      try {
        const res = await fetch(GOOGLE_FONTS_API);
        const data = await res.json();
        if (data.items) {
          const fontFamilies = data.items.map(f => f.family);
          setFonts(fontFamilies);
        }
      } catch {
        // Gebruik fallback fonts bij een API fout
        const fallbackFonts = [
          "Roboto", "Open Sans", "Montserrat", "Lato", "Oswald", "Raleway", "Poppins", "Merriweather", "Nunito", "Playfair Display", "Rubik", "Bebas Neue", "Pacifico", "Dancing Script", "Fjalla One", "Abril Fatface", "Bitter", "Quicksand", "Source Sans Pro", "Work Sans", "Inter"
        ];
        setFonts(fallbackFonts);
      } finally {
        setLoading(false);
      }
    }
    fetchFonts();
  }, []);
  
  return { fonts, loading };
}

// Custom hook voor het dynamisch laden van zichtbare lettertypen
function useFontObserver(fonts) {
  const loadedFontsRef = useRef(new Set());

  const loadFont = useCallback((fontFamily) => {
    if (fontFamily && !loadedFontsRef.current.has(fontFamily)) {
      WebFont.load({ google: { families: [fontFamily] } });
      loadedFontsRef.current.add(fontFamily);
    }
  }, []);

  useEffect(() => {
    // Initialiseer de eerste 20 fonts voor een snelle start
    if (fonts.length > 0) {
      fonts.slice(0, 20).forEach(font => loadFont(font));
    }
  }, [fonts, loadFont]);

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const fontFamily = entry.target.dataset.font;
            loadFont(fontFamily);
          }
        });
      },
      { rootMargin: '200px' }
    )
  );

  const observe = useCallback(node => {
    if (node) {
      observer.current.observe(node);
    }
  }, []);

  return { observe };
}

export default function FontDropdown({ value, onChange, onFontsLoaded }) {
  const { fonts, loading } = useGoogleFonts();
  const { observe } = useFontObserver(fonts);
  const [query, setQuery] = useState("");

  // Notify parent component when fonts are available
  useEffect(() => {
    if (!loading && fonts.length > 0 && onFontsLoaded) {
      onFontsLoaded(fonts);
    }
  }, [fonts, loading, onFontsLoaded]);

  const filteredFonts = query
    ? fonts.filter(f => f.toLowerCase().includes(query.toLowerCase()))
    : fonts;

  return (
    <div className="w-full">
      <label className="block mb-2 font-medium text-gray-700 text-base">Lettertype</label>
      {loading ? (
        <div className="text-gray-500 py-2">Lettertypes laden...</div>
      ) : (
        <Listbox value={value} onChange={onChange}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base" style={{ fontFamily: value }}>
              <span className="block truncate" style={{ fontFamily: value }}>{value}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="sticky top-0 z-10 bg-white px-2 py-1">
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded px-2 py-1 mb-1 text-base"
                  placeholder="Zoek lettertype..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
              {filteredFonts.length === 0 && (
                <div className="px-4 py-2 text-gray-500">Geen lettertypes gevonden</div>
              )}
              {filteredFonts.map(font => (
                <Listbox.Option
                  ref={observe}
                  key={font}
                  value={font}
                  data-font={font}
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"}`
                  }
                  style={{ fontFamily: font }}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`} style={{ fontFamily: font }}>
                        {font}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      )}
    </div>
  );
} 