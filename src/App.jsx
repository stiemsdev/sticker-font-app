import React, { useState, useEffect, useRef } from "react";
import WebFont from "webfontloader";
import FontDropdown from "./components/FontDropdown";
import { ChromePicker } from "react-color";
import DocsColorPicker from "./components/DocsColorPicker";

// Fallback fonts voor als de API niet werkt
const FALLBACK_FONTS = [
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Oswald",
  "Raleway",
  "Poppins",
  "Merriweather",
  "Nunito",
  "Playfair Display",
  "Rubik",
  "Bebas Neue",
  "Pacifico",
  "Dancing Script",
  "Fjalla One",
  "Abril Fatface",
  "Bitter",
  "Quicksand",
  "Source Sans Pro",
  "Work Sans",
  "Inter",
];

const PAGE_SIZES = [
  { label: "A4 (21x29.7cm)", value: "a4", width: 21, height: 29.7 },
];

// Preview style - responsive A4 formaat
const getPreviewScale = (orientation) => {
  if (typeof window === 'undefined') return 1;
  const isPortrait = orientation === "portrait";
  const a4Width = isPortrait ? 21 : 29.7; // cm
  const a4Height = isPortrait ? 29.7 : 21; // cm
  // Sidebar breedte
  const sidebarWidth = window.innerWidth >= 1024 ? 384 : 320; // lg:w-96 of sm:w-80
  // Main content breedte
  const availableWidth = window.innerWidth - sidebarWidth - 64; // 64px voor padding/marges
  const availableHeight = window.innerHeight - 220; // 220px voor headers, tekstveld, etc.
  const scaleX = availableWidth / (a4Width * 37.8);
  const scaleY = availableHeight / (a4Height * 37.8);
  return Math.min(scaleX, scaleY, 1);
};

function getA4Px(orientation) {
  const isPortrait = orientation === "portrait";
  return {
    width: (isPortrait ? 21 : 29.7) * 37.8,
    height: (isPortrait ? 29.7 : 21) * 37.8,
  };
}

// Utility functies voor kleur conversie
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const isValidHex = (hex) => {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

export default function App() {
  const [text, setText] = useState("Sticker tekst");
  const [font, setFont] = useState("Roboto");
  const [size, setSize] = useState(48);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [orientation, setOrientation] = useState("landscape");
  const [margin, setMargin] = useState(1); // cm
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [alignH, setAlignH] = useState("center"); // left, center, right
  const [alignV, setAlignV] = useState("middle"); // top, middle, bottom
  const [showGrid, setShowGrid] = useState(false);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [textFits, setTextFits] = useState(true);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [availableFonts, setAvailableFonts] = useState(FALLBACK_FONTS);

  const printRef = useRef();
  const previewWrapperRef = useRef();

  // PWA installatie detectie
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Laad het gekozen font dynamisch voor preview
  useEffect(() => {
    if (font) {
      console.log(`Loading font: ${font}`);
      WebFont.load({
        google: {
          families: [font],
        },
        active: () => {
          console.log(`Font ${font} loaded successfully`);
          // Force a re-render to update the font
          setFontsLoaded(prev => !prev);
        },
        inactive: () => {
          console.log(`Failed to load font ${font}`);
        }
      });
    }
  }, [font]);

  const handleAlignmentChange = (type, value) => {
    if (type === 'h') {
      setAlignH(value);
    } else if (type === 'v') {
      setAlignV(value);
    }
  };

  // Helper-functies voor CSS-klassen
  const getJustifyContent = (alignH) => {
    switch (alignH) {
      case 'left': return 'flex-start';
      case 'center': return 'center';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  };

  const getAlignItems = (alignV) => {
    switch (alignV) {
      case 'top': return 'flex-start';
      case 'middle': return 'center';
      case 'bottom': return 'flex-end';
      default: return 'center';
    }
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker voorkomt het openen van het print venster. Sta pop-ups toe en probeer opnieuw.');
      return;
    }

    // Get the print content
    const printElement = document.getElementById('print-content');
    if (!printElement) {
      alert('Print content niet gevonden. Probeer het opnieuw.');
      return;
    }

    // Create the print HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sticker Print</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@${bold ? '700' : '400'}${italic ? ';1' : ''}&display=swap" rel="stylesheet">
          <style>
            @page {
              size: ${orientation === "portrait" ? "21cm 29.7cm" : "29.7cm 21cm"};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .print-container {
              width: ${orientation === "portrait" ? "21cm" : "29.7cm"};
              height: ${orientation === "portrait" ? "29.7cm" : "21cm"};
              background: ${bgColor};
              padding: ${margin}cm;
              display: flex;
              align-items: ${getAlignItems(alignV)};
              justify-content: ${getJustifyContent(alignH)};
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
            }
            .sticker-text {
              font-family: "${font}", system-ui, -apple-system, sans-serif;
              font-size: ${size}px;
              font-weight: ${bold ? 'bold' : 'normal'};
              font-style: ${italic ? 'italic' : 'normal'};
              text-decoration: ${underline ? 'underline' : 'none'};
              color: ${textColor};
              position: relative;
              z-index: 1;
              width: 100%;
              overflow-wrap: break-word;
              word-break: break-word;
              text-align: ${alignH};
            }
            ${showGrid ? `
            .grid-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: radial-gradient(circle, #ccc 1px, transparent 1px);
              background-size: 20px 20px;
              pointer-events: none;
            }
            ` : ''}
          </style>
        </head>
        <body>
          <div class="print-container">
            ${showGrid ? '<div class="grid-overlay"></div>' : ''}
            <div class="sticker-text">${text}</div>
          </div>
          <script>
            // Wait for fonts to load before printing
            document.fonts.ready.then(function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            });
          </script>
        </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  const previewStyle = {
    width: orientation === "portrait" ? "21cm" : "29.7cm",
    height: orientation === "portrait" ? "29.7cm" : "21cm",
    margin: "auto",
    background: bgColor,
    padding: `${margin}cm`,
    display: "flex",
    alignItems: getAlignItems(alignV),
    justifyContent: getJustifyContent(alignH),
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #ccc",
  };

  // Bepaal of portrait of landscape
  const isPortrait = orientation === 'portrait';

  // Schaalfactor: bereken exacte schaal voor preview
  useEffect(() => {
    function updateScale() {
      if (!previewWrapperRef.current) return;
      
      // Exacte A4 afmetingen in pixels (CSS pixels, ca. 96 DPI)
      const a4WidthPx = (isPortrait ? 21 : 29.7) * 37.8;
      const a4HeightPx = (isPortrait ? 29.7 : 21) * 37.8;
      
      // Beschikbare ruimte in preview container
      const availW = previewWrapperRef.current.offsetWidth - 32; // 32px voor padding
      const availH = previewWrapperRef.current.offsetHeight - 32;
      
      // Bereken schaal zodat A4 precies past
      const scaleX = availW / a4WidthPx;
      const scaleY = availH / a4HeightPx;
      
      // Gebruik de kleinste schaal zodat alles past, maar niet groter dan 1
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setPreviewScale(newScale);
    }
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [orientation]);

  useEffect(() => {
    if (!printRef.current) return;
    const content = printRef.current.querySelector('.sticker-content');
    if (!content) return;
    const fits = content.scrollHeight <= content.clientHeight && content.scrollWidth <= content.clientWidth;
    setTextFits(fits);
  }, [text, size, font, alignH, alignV, margin, orientation, previewScale]);

  return (
    <div className="flex flex-col sm:flex-row h-screen min-h-0">
      {/* Sidebar */}
      <aside className="w-full sm:w-80 lg:w-96 h-1/2 sm:h-screen overflow-y-auto bg-white shadow-lg p-4 lg:p-6 flex flex-col order-2 sm:order-1">
        <div className="flex-1 flex flex-col gap-4 lg:gap-6 min-h-0 overflow-y-auto pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Sticker Font App</h1>
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors min-h-[44px] font-medium"
              >
                Installeren
              </button>
            )}
          </div>
          
          {/* Lettertype */}
          <div>
            <FontDropdown 
              value={font} 
              onChange={setFont} 
              onFontsLoaded={setAvailableFonts}
            />
          </div>
          
          {/* Lettergrootte */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-base">Lettergrootte</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min={8} 
                max={200} 
                value={size} 
                onChange={e => setSize(Number(e.target.value))} 
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="number"
                min={8}
                max={200}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ minWidth: 60 }}
              />
            </div>
          </div>
          
          {/* Stijlen */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-base">Stijlen</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setBold(b => !b)} 
                className={`flex-1 py-3 px-4 border rounded-lg text-lg font-medium min-h-[44px] transition-colors ${
                  bold ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                }`}
                style={{ fontWeight: 'bold' }}
              >
                B
              </button>
              <button 
                onClick={() => setItalic(i => !i)} 
                className={`flex-1 py-3 px-4 border rounded-lg text-lg font-medium min-h-[44px] transition-colors ${
                  italic ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                }`}
                style={{ fontStyle: 'italic' }}
              >
                I
              </button>
              <button 
                onClick={() => setUnderline(u => !u)} 
                className={`flex-1 py-3 px-4 border rounded-lg text-lg font-medium min-h-[44px] transition-colors ${
                  underline ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                }`}
                style={{ textDecoration: 'underline' }}
              >
                U
              </button>
            </div>
          </div>
          
          {/* Printopties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-base">Oriëntatie</label>
              <select className="w-full border border-gray-300 rounded-lg p-3 text-base min-h-[44px] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" value={orientation} onChange={e => setOrientation(e.target.value)}>
                <option value="portrait">Staand</option>
                <option value="landscape">Liggend</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-base">Marges (cm)</label>
              <input type="number" min={0} max={5} step={0.1} value={margin} onChange={e => setMargin(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-3 text-base min-h-[44px] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
          </div>
          
          {/* Uitlijning */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-base">Uitlijning</label>
            <div className="space-y-3">
              {/* Horizontaal */}
              <div className="flex items-center gap-2">
                <span className="w-24 text-sm text-gray-600">Horizontaal</span>
                <div className="flex-1 grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleAlignmentChange('h', 'left')}
                    className={`p-2 border rounded-lg transition-colors flex justify-center items-center ${alignH === 'left' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    title="Links uitlijnen"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h12v2H4zm0 4h8v2H4zm0 4h12v2H4zm0 4h8v2H4z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('h', 'center')}
                    className={`p-2 border rounded-lg transition-colors flex justify-center items-center ${alignH === 'center' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    title="Centreren"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4zm4 4h8v2H8zm-4 4h16v2H4zm4 4h8v2H8z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('h', 'right')}
                    className={`p-2 border rounded-lg transition-colors flex justify-center items-center ${alignH === 'right' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    title="Rechts uitlijnen"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5h12v2H8zm4 4h8v2h-8zm-4 4h12v2H8zm4 4h8v2h-8z"></path></svg>
                  </button>
                </div>
              </div>
              {/* Verticaal */}
              <div className="flex items-center gap-2">
                <span className="w-24 text-sm text-gray-600">Verticaal</span>
                <div className="flex-1 grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleAlignmentChange('v', 'top')}
                    className={`p-2 border rounded-lg transition-colors flex justify-center items-center ${alignV === 'top' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    title="Boven uitlijnen"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="rotate-90"><path d="M4 5h12v2H4zm0 4h8v2H4zm0 4h12v2H4zm0 4h8v2H4z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('v', 'middle')}
                    className={`p-2 border rounded-lg transition-colors flex justify-center items-center ${alignV === 'middle' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    title="Midden uitlijnen"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="rotate-90"><path d="M4 5h16v2H4zm4 4h8v2H8zm-4 4h16v2H4zm4 4h8v2H8z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleAlignmentChange('v', 'bottom')}
                    className={`p-2 border rounded-lg transition-colors flex justify-center items-center ${alignV === 'bottom' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                    title="Onder uitlijnen"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="rotate-90"><path d="M8 5h12v2H8zm4 4h8v2h-8zm-4 4h12v2H8zm4 4h8v2h-8z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tekstkleur */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-base">Tekstkleur</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={textColor}
                onChange={e => setTextColor(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#000000"
              />
              <button
                onClick={() => setShowTextColorPicker(true)}
                className="w-12 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: textColor }}
                title="Open color picker"
              />
            </div>
            <DocsColorPicker
              value={textColor}
              open={showTextColorPicker}
              onChange={c => { setTextColor(c); setShowTextColorPicker(false); }}
              onCancel={() => setShowTextColorPicker(false)}
              presetColors={[
                "#000000", "#212529", "#495057", "#6c757d",
                "#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6",
                "#dc3545", "#fd7e14", "#ffc107", "#198754",
                "#0d6efd", "#6f42c1", "#d63384"
              ]}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-base">Achtergrondkleur</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#ffffff"
              />
              <button
                onClick={() => setShowBgColorPicker(true)}
                className="w-12 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: bgColor }}
                title="Open color picker"
              />
            </div>
            <DocsColorPicker
              value={bgColor}
              open={showBgColorPicker}
              onChange={c => { setBgColor(c); setShowBgColorPicker(false); }}
              onCancel={() => setShowBgColorPicker(false)}
              presetColors={[
                "#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6", 
                "#000000", "#212529", "#495057", "#6c757d",
                "#ffeb3b", "#ffc107", "#ff9800", "#f44336",
                "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
                "#2196f3", "#03a9f4", "#00bcd4", "#009688",
                "#4caf50", "#8bc34a", "#cddc39"
              ]}
            />
          </div>
          
          {/* Raster */}
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="grid" 
              checked={showGrid} 
              onChange={e => setShowGrid(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="grid" className="font-medium text-gray-700">Toon raster</label>
          </div>
        </div>
        <button 
          onClick={handlePrint} 
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors min-h-[44px] mt-4"
        >
          Printen
        </button>
      </aside>
      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen min-h-0 order-1 sm:order-2">
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full min-h-0">
          {/* Tekst input */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex-shrink-0">
            <label htmlFor="sticker-text-input" className="block mb-2 font-medium text-gray-700 text-base">Tekst</label>
            <div className="relative">
              <textarea
                id="sticker-text-input"
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-base min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Voer je sticker tekst in..."
              />
              {text.length > 0 && (
                <button
                  onClick={() => setText("")}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Tekst wissen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {/* Preview */}
          <div className="flex-1 min-h-0 flex flex-col bg-gray-50 overflow-hidden">
            <div
              ref={previewWrapperRef}
              className={
                isPortrait
                  ? "flex flex-row items-center justify-center h-full w-full min-h-0 min-w-0 overflow-hidden"
                  : "flex flex-col items-center justify-center h-full w-full min-h-0 min-w-0 overflow-hidden"
              }
              style={{ height: '100%', width: '100%' }}
            >
              {isPortrait ? (
                <>
                  <div
                    ref={printRef}
                    id="print-content"
                    style={{
                      width: `${(isPortrait ? 21 : 29.7) * 37.8 * previewScale}px`,
                      height: `${(isPortrait ? 29.7 : 21) * 37.8 * previewScale}px`,
                      padding: `${margin * 37.8 * previewScale}px`,
                      background: bgColor,
                      boxSizing: "border-box",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid #ccc",
                      margin: "auto",
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                    }}
                  >
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none grid-overlay" style={{
                        backgroundImage: `radial-gradient(circle, #ccc 1px, transparent 1px)`,
                        backgroundSize: `${20 * previewScale}px ${20 * previewScale}px`
                      }} />
                    )}
                    <div
                      className="sticker-content"
                      style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        display: 'flex',
                        alignItems: getAlignItems(alignV),
                        justifyContent: getJustifyContent(alignH),
                        textAlign: alignH,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: `${size * previewScale}px`,
                          lineHeight: 1.2,
                          fontWeight: bold ? 'bold' : 'normal',
                          fontStyle: italic ? 'italic' : 'normal',
                          textDecoration: underline ? 'underline' : 'none',
                          color: textColor,
                          position: 'relative',
                          zIndex: 1,
                          width: '100%',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                        }}
                      >
                        {text}
                      </div>
                    </div>
                  </div>
                  <div className="ml-8 flex flex-col items-start justify-center">
                    <p>Formaat: 21cm × 29.7cm (A4 staand)</p>
                    <p>Marges: {margin}cm aan alle zijden</p>
                    <p>Schaalfactor: {Math.round(previewScale * 100)}%</p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    ref={printRef}
                    id="print-content"
                    style={{
                      width: `${(isPortrait ? 21 : 29.7) * 37.8 * previewScale}px`,
                      height: `${(isPortrait ? 29.7 : 21) * 37.8 * previewScale}px`,
                      padding: `${margin * 37.8 * previewScale}px`,
                      background: bgColor,
                      boxSizing: "border-box",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid #ccc",
                      margin: "auto",
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                    }}
                  >
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none grid-overlay" style={{
                        backgroundImage: `radial-gradient(circle, #ccc 1px, transparent 1px)`,
                        backgroundSize: `${20 * previewScale}px ${20 * previewScale}px`
                      }} />
                    )}
                    <div
                      className="sticker-content"
                      style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        display: 'flex',
                        alignItems: getAlignItems(alignV),
                        justifyContent: getJustifyContent(alignH),
                        textAlign: alignH,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: font,
                          fontSize: `${size * previewScale}px`,
                          lineHeight: 1.2,
                          fontWeight: bold ? 'bold' : 'normal',
                          fontStyle: italic ? 'italic' : 'normal',
                          textDecoration: underline ? 'underline' : 'none',
                          color: textColor,
                          position: 'relative',
                          zIndex: 1,
                          width: '100%',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                        }}
                      >
                        {text}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col items-center justify-center">
                    <p>Formaat: 29.7cm × 21cm (A4 liggend)</p>
                    <p>Marges: {margin}cm aan alle zijden | Schaalfactor: {Math.round(previewScale * 100)}%</p>
                  </div>
                </>
              )}
            </div>
            {!textFits && (
              <div className="mt-2 text-red-600 text-sm font-semibold">
                De tekst past niet op de pagina. Verklein de lettergrootte of verkort de tekst om alles op 1 pagina te krijgen.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
