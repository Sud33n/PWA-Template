# PWA Template

A minimal, production-ready Progressive Web App template with encrypted storage and offline support.

## ✨ Features

- 🚀 **Offline Support**: Service worker for caching and offline functionality
- 🔐 **Encrypted Storage**: AES-256-GCM encryption with browser fallbacks  
- 📱 **Mobile Ready**: Responsive design for all devices
- 📲 **Installable**: Native app experience
- ⚡ **Fast Loading**: Optimized caching strategies
- 💾 **Data Management**: Save, load, export, import, and inspect data
- 🎨 **Clean UI**: Minimal, modern interface
- 🔧 **Zero Dependencies**: Pure HTML, CSS, and JavaScript

## 📁 File Structure

```
PWA Template/
├── index.html           # Main HTML file (minimal structure)
├── styles.css           # Clean, minimal CSS styles  
├── app.js              # Core PWA functionality
├── encrypted-storage.js # AES-256 encryption utilities
├── service-worker.js    # Offline caching
├── manifest.json        # PWA configuration
├── icons/              # App icons
│   ├── icon-192x192.png
│   ├── icon-512x512.png  
│   └── *.svg
├── LICENSE             # MIT License
├── .gitignore          # Git ignore patterns
└── README.md           # Documentation
```

## 🚀 Quick Start

1. **Clone this repository**:
   ```bash
   git clone <repository-url>
   cd pwa-template
   ```

2. **Start a local server**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

4. **Test PWA features**:
   - 📲 Install the app (install prompt should appear)
   - 🔌 Toggle offline mode to test caching
   - 💾 Use the storage demo to save/load encrypted data
   - 📱 Test on mobile devices for full experience

## 💾 Storage Demo

The template includes a built-in storage demonstration:

- **Save**: Store text or JSON with optional password encryption
- **Load**: Retrieve saved data (password required for encrypted items)  
- **Export**: Download backup file (preserves encryption)
- **Import**: Restore from backup files
- **Inspect**: View storage details and browser access instructions
- **Clear**: Remove all stored data with confirmation

## PWA Requirements Met

✅ **HTTPS**: Required for production (localhost works for development)  
✅ **Web App Manifest**: `manifest.json` with proper configuration  
✅ **Service Worker**: Handles caching and offline functionality  
✅ **Icons**: Multiple sizes for different platforms  
✅ **Responsive Design**: Works on all screen sizes  
✅ **Fast Loading**: Service worker caching strategy  

## 🛠️ Customization

### Quick Start Customization
1. **App Name**: Update `manifest.json` and `index.html` title
2. **Colors**: Modify gradient colors in `styles.css` 
3. **Icons**: Replace files in `icons/` directory
4. **Cache**: Update file list in `service-worker.js`

### Key Files to Modify
- `manifest.json`: App metadata and configuration
- `styles.css`: Colors, fonts, and layout
- `index.html`: App structure and meta tags
- `service-worker.js`: Caching strategy and file list

## Browser Support

- ✅ Chrome/Chromium (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)
- ✅ Edge (full support)
- ⚠️ Internet Explorer (limited support)

## 🚀 Deployment

1. **Deploy to HTTPS** (required for PWA features)
2. **Test offline functionality** 
3. **Verify installation** works on target devices
4. **Run Lighthouse audit** for PWA compliance
5. **Update cache version** in service worker when deploying changes

## 🧪 Development

- **DevTools**: Use Application tab to debug PWA features
- **Offline Testing**: Toggle network in DevTools
- **PWA Audit**: Run Lighthouse for compliance check  
- **Installation**: Test on mobile devices for full experience
- **Cache Updates**: Increment `CACHE_NAME` when updating files

## License

This template is free to use and modify for any purpose.
