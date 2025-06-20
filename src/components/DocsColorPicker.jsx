import React, { useRef, useEffect, useState } from "react";

// --- Kleurenhulpjes ---
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
function rgbToHex(r, g, b) {
  const toHex = n => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}
function hsvToRgb({ h, s, v }) {
  h = h / 360; s = s / 100; v = v / 100;
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
    default: r = v, g = t, b = p;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}
function hsvToHex(hsv) {
  const rgb = hsvToRgb(hsv);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
function hexToHsv(hex) {
  return rgbToHsv(hexToRgb(hex));
}

const PIPET_ICON = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="22" height="22" fill="none"/>
    <path d="M16.5 3.5C17.3284 4.32843 17.3284 5.67157 16.5 6.5L15.5 7.5L14.5 6.5L15.5 5.5L14.5 4.5L15.5 3.5C16.3284 2.67157 17.6716 2.67157 18.5 3.5C19.3284 4.32843 19.3284 5.67157 18.5 6.5L8 17H5V14L15.5 3.5Z" stroke="#222" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="4.25" y="16.25" width="3.5" height="2.5" rx="1.25" fill="#fff" stroke="#222" strokeWidth="1.5"/>
  </svg>
);

export default function DocsColorPicker({ value, open, onChange, onCancel, presetColors = [] }) {
  const [draft, setDraft] = useState(value);
  const [last, setLast] = useState(value);
  const [hsv, setHsv] = useState(hexToHsv(value));
  const pickerRef = useRef();
  const colorBoxRef = useRef();
  const hueSliderRef = useRef();
  const [dragging, setDragging] = useState(null); // 'color' | 'hue' | null

  // Sync bij openen
  useEffect(() => {
    if (open) {
      setDraft(value);
      setLast(value);
      setHsv(hexToHsv(value));
    }
  }, [open, value]);

  // Sluit bij klik buiten
  useEffect(() => {
    function handle(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onCancel();
      }
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onCancel]);

  // Pipet
  const handleEyedropper = async () => {
    if (window.EyeDropper) {
      const eyeDropper = new window.EyeDropper();
      try {
        const result = await eyeDropper.open();
        setDraft(result.sRGBHex);
        setHsv(hexToHsv(result.sRGBHex));
      } catch {}
    } else {
      alert('Pipet wordt niet ondersteund in deze browser.');
    }
  };

  // --- Interactief kleurvlak ---
  const handleColorBox = (e) => {
    const rect = colorBoxRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const s = Math.round((x / rect.width) * 100);
    const v = Math.round(100 - (y / rect.height) * 100);
    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    setDraft(hsvToHex(newHsv));
  };
  const handleHueSlider = (e) => {
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const h = Math.round((x / rect.width) * 360);
    const newHsv = { ...hsv, h };
    setHsv(newHsv);
    setDraft(hsvToHex(newHsv));
  };
  // Mouse events
  useEffect(() => {
    if (!dragging) return;
    const move = dragging === 'color' ? handleColorBox : handleHueSlider;
    const onMove = (e) => { move(e); };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, hsv]);

  // Hex input
  const handleHexInput = (val) => {
    setDraft(val);
    if (/^#([A-Fa-f0-9]{6})$/.test(val)) {
      setHsv(hexToHsv(val));
    }
  };

  // RGB input
  const rgb = hexToRgb(draft);
  const handleRgbChange = (channel, val) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, Number(val))) };
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setDraft(hex);
    if (/^#([A-Fa-f0-9]{6})$/.test(hex)) {
      setHsv(hexToHsv(hex));
    }
  };

  // --- UI ---
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div ref={pickerRef} className="bg-white rounded-2xl shadow-2xl border p-6 w-[400px] max-w-full flex flex-col gap-4 relative">
        {/* Kleurvlak bovenaan */}
        <div
          ref={colorBoxRef}
          className="w-full h-32 rounded-lg border mb-2 cursor-crosshair relative"
          style={{
            background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hsv.h}, 100%, 50%))`
          }}
          onMouseDown={e => { setDragging('color'); handleColorBox(e); }}
        >
          {/* Cursor */}
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow"
            style={{
              left: `calc(${hsv.s}% - 8px)` ,
              top: `calc(${100 - hsv.v}% - 8px)` ,
              background: draft,
              pointerEvents: 'none'
            }}
          />
        </div>
        {/* Preview, pipet, slider in één rij */}
        <div className="flex items-center gap-4 mb-2">
          {/* Pipet */}
          <button onClick={handleEyedropper} className="w-10 h-10 flex items-center justify-center border rounded-lg bg-white hover:bg-gray-100" title="Pipet">
            {PIPET_ICON}
          </button>
          {/* Preview */}
          <div className="flex flex-col items-center justify-end">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-300" style={{ background: draft }} />
          </div>
          {/* Slider */}
          <div className="flex-1 flex flex-col items-center">
            <div
              ref={hueSliderRef}
              className="w-full h-2 rounded bg-gradient-to-r mb-2 cursor-pointer relative"
              style={{
                background: `linear-gradient(to right, 
                  #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`
              }}
              onMouseDown={e => { setDragging('hue'); handleHueSlider(e); }}
            >
              {/* Slider cursor */}
              <div
                className="absolute w-5 h-5 rounded-full border-2 border-white shadow -top-1.5"
                style={{
                  left: `calc(${hsv.h / 360 * 100}% - 10px)`,
                  background: `hsl(${hsv.h}, 100%, 50%)`,
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>
        {/* Hex, RGB in één nette rij */}
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex gap-2">
            <div className="w-[110px] text-xs text-gray-500 ml-1">Hex</div>
            <div className="w-16 text-xs text-gray-500 ml-1">R</div>
            <div className="w-16 text-xs text-gray-500 ml-1">G</div>
            <div className="w-16 text-xs text-gray-500 ml-1">B</div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-[110px] flex items-center border border-gray-300 rounded px-2 h-10 bg-white">
              <span className="text-gray-400 text-lg">#</span>
              <input type="text" value={draft.replace('#','')} onChange={e => handleHexInput('#' + e.target.value.replace(/[^A-Fa-f0-9]/g, '').slice(0,6))} className="w-[80px] bg-transparent border-none outline-none px-1 text-base font-mono" maxLength={6} />
            </div>
            <input type="number" value={rgb.r} min={0} max={255} onChange={e => handleRgbChange('r', e.target.value)} className="w-16 border rounded px-2 py-2 h-10 text-base font-mono" />
            <input type="number" value={rgb.g} min={0} max={255} onChange={e => handleRgbChange('g', e.target.value)} className="w-16 border rounded px-2 py-2 h-10 text-base font-mono" />
            <input type="number" value={rgb.b} min={0} max={255} onChange={e => handleRgbChange('b', e.target.value)} className="w-16 border rounded px-2 py-2 h-10 text-base font-mono" />
          </div>
        </div>
        {/* Preset kleuren */}
        {presetColors.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {presetColors.map(color => (
              <button key={color} onClick={() => { setDraft(color); setHsv(hexToHsv(color)); }} className="w-7 h-7 rounded border-2" style={{ backgroundColor: color, borderColor: draft === color ? '#2563eb' : '#ccc' }} />
            ))}
          </div>
        )}
        {/* Knoppen */}
        <div className="flex gap-3 justify-end mt-2 items-center">
          <button onClick={() => { setDraft(last); onCancel(); }} className="px-4 py-2 rounded border font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 h-10 min-w-[110px]">Annuleren</button>
          <button onClick={() => { onChange(draft); }} className="px-4 py-2 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 h-10 min-w-[80px]">OK</button>
        </div>
      </div>
    </div>
  ) : null;
} 