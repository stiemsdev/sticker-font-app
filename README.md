# Sticker Font App

Een lichtgewicht Progressive Web App (PWA) voor het maken van stickers met verschillende lettertypes. Perfect voor gebruik op Android tablets en desktop.

## 🚀 Features

- **21 Populaire Google Fonts** - Live preview in dropdown
- **Lettertype aanpassingen** - Grootte, bold, italic, underline
- **Print functionaliteit** - A4 formaat met instelbare marges
- **PWA ondersteuning** - Installeerbaar op Android tablet
- **Mobielvriendelijk** - Touch-vriendelijke interface
- **Printopties** - Oriëntatie, marges, uitlijning, achtergrondkleur
- **Raster optie** - Voor kniplijnen bij het maken van stickers

## 🛠️ Installatie & Ontwikkeling

### Lokaal draaien
```bash
# Dependencies installeren
npm install

# Ontwikkelserver starten
npm run dev

# App openen in browser
# Ga naar: http://localhost:5173
```

### Build voor productie
```bash
# Productie build maken
npm run build

# Preview van productie build
npm run preview
```

## 📱 PWA Installatie

### Op Android Tablet:
1. Open de app in Chrome
2. Je krijgt automatisch een "Toevoegen aan startscherm" prompt
3. Of gebruik de groene "Installeren" knop in de app

### Op Desktop:
1. De groene "Installeren" knop verschijnt automatisch
2. Klik op de knop om de app te installeren

## 🖨️ Printen

1. **Stel je sticker in** - Kies lettertype, grootte, stijl
2. **Configureer printopties** - Oriëntatie, marges, uitlijning
3. **Klik "Print Sticker"** - Alleen het preview-veld wordt geprint
4. **Knip langs de lijnen** - Gebruik het raster voor perfecte stickers

## 🎨 Beschikbare Lettertypes

- Roboto, Open Sans, Montserrat
- Lato, Oswald, Raleway, Poppins
- Merriweather, Nunito, Playfair Display
- Rubik, Bebas Neue, Pacifico
- Dancing Script, Fjalla One, Abril Fatface
- Bitter, Quicksand, Source Sans Pro
- Work Sans, Inter

## 🚀 Deploy naar Vercel

### Automatische Deploy:
1. Push je code naar GitHub
2. Verbind je repository met Vercel
3. Vercel detecteert automatisch Vite en bouwt de app

### Handmatige Deploy:
```bash
# Build maken
npm run build

# Deploy naar Vercel
npx vercel --prod
```

## 📁 Project Structuur

```
sticker-font-app/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── index.html             # HTML template
├── src/
│   ├── App.jsx                # Hoofdcomponent
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind CSS
├── vite.config.js             # Vite + PWA configuratie
├── tailwind.config.js         # Tailwind configuratie
└── package.json               # Dependencies
```

## 🛠️ Technische Details

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **PWA**: Vite PWA Plugin
- **Fonts**: Google Fonts via WebFontLoader
- **Print**: React-to-Print
- **Build**: Vite

## 📱 Browser Ondersteuning

- Chrome (aanbevolen voor PWA)
- Firefox
- Safari
- Edge

## 🎯 Gebruik

1. **Kies een lettertype** uit de dropdown
2. **Pas de grootte aan** met de slider
3. **Voeg stijlen toe** (B/I/U knoppen)
4. **Typ je tekst** in het preview veld
5. **Configureer printopties** (oriëntatie, marges, etc.)
6. **Print je sticker** op A4 papier
7. **Knip langs de lijnen** voor perfecte stickers

## 🔧 Troubleshooting

### Tailwind CSS werkt niet:
```bash
npm install @tailwindcss/postcss
```

### PWA werkt niet:
- Controleer of je HTTPS gebruikt (vereist voor PWA)
- Zorg dat de manifest.json correct is

### Print werkt niet:
- Controleer of je browser print ondersteunt
- Probeer een andere browser

## 📄 Licentie

MIT License - Vrij te gebruiken voor persoonlijk en commercieel gebruik.
