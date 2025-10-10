# ⚖️ MyanLawLexicon

A modern, responsive Myanmar-English law dictionary web application built with HTML, CSS, jQuery, and Bootstrap 5.

## 🚀 Quick Start

### Option 1: Using Python (Recommended)
```bash
# Navigate to the project directory
cd /path/to/MyanLawLexicon

# Start a local web server
python -m http.server 8000

# Open your browser and go to:
# http://localhost:8000
```

### Option 2: Using Node.js
```bash
# Install a simple HTTP server
npm install -g http-server

# Navigate to the project directory
cd /path/to/MyanLawLexicon

# Start the server
http-server

# Open your browser and go to:
# http://localhost:8080
```

### Option 3: Using PHP
```bash
# Navigate to the project directory
cd /path/to/MyanLawLexicon

# Start PHP built-in server
php -S localhost:8000

# Open your browser and go to:
# http://localhost:8000
```

## 📁 File Structure

```
MyanLawLexicon/
├── index.html                          # Main HTML file
├── styles.css                          # Custom CSS styles
├── app.js                             # JavaScript application logic
├── MyanmarEnglishLawDictionary.json   # Dictionary data (existing file)
└── README.md                          # This file
```

## 🔧 Features

### Core Functionality
- **Search**: Live search through English words and Myanmar definitions
- **Filter**: Filter by word type (nouns, verbs, adjectives, adverbs)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Myanmar Font Support**: Proper display of Myanmar text using Noto Sans Myanmar

### Editing Features (Password Protected)
- **Add Terms**: Add new dictionary entries
- **Edit Terms**: Modify existing entries
- **Delete Terms**: Remove unwanted entries
- **Export Data**: Download updated JSON file

### UI/UX Features
- **Modern Design**: Clean, minimalist interface with smooth animations
- **Dark/Light Theme**: Toggle between themes (saved in localStorage)
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + K`: Focus search
  - `Escape`: Close modals
- **Mobile Optimized**: Touch-friendly interface with responsive layout

## 🔐 Security & Authentication

### Password Protection
- **Default Password**: `admin123$`
- **Authentication**: SHA-256 hashed password verification
- **Client-side Only**: ⚠️ **NOT SECURE FOR PRODUCTION USE**

### Changing the Password
1. Open browser console (F12)
2. Run: `CryptoJS.SHA256('your_new_password').toString()`
3. Copy the generated hash
4. In `app.js`, replace the `PASSWORD_HASH` constant with your new hash

## 📱 Mobile Features

- **Responsive Grid**: Cards automatically adjust to screen size
- **Touch Gestures**: Tap to view details, swipe-friendly interface
- **Auto-focus Search**: Search input automatically focused on mobile
- **Full-screen Modals**: Modals expand to full screen on small devices

## 🎨 Customization

### Themes
The app supports both light and dark themes. The theme preference is saved in localStorage and persists across sessions.

### Styling
- **CSS Variables**: Easy theme customization via CSS custom properties
- **Bootstrap 5**: Built on Bootstrap 5 for consistent styling
- **Myanmar Fonts**: Optimized for Myanmar text display

## 📊 Data Format

The dictionary uses a simple JSON structure:
```json
[
    {
        "word": "abandon",
        "type": "v",
        "definition": "စွန့်ခွာသည်။ ပယ်ခွာသည်။"
    }
]
```

### Field Descriptions
- `word`: English word or term
- `type`: Part of speech (n, v, adj, adv)
- `definition`: Myanmar translation/definition

## 🛠️ Development

### Adding New Features
1. **Search Enhancement**: Modify the `filterTerms()` function in `app.js`
2. **UI Changes**: Update `styles.css` or `index.html`
3. **Data Structure**: Modify the JSON loading logic in `loadDictionaryData()`

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **JavaScript**: ES6+ features used (arrow functions, const/let, template literals)

## ⚠️ Important Security Warning

**This application is designed for educational and demonstration purposes only.**

### Security Limitations:
- Password authentication is client-side only
- No server-side validation or security
- JSON data can be modified by anyone with browser access
- Not suitable for production environments with sensitive data

### For Production Use:
- Implement server-side authentication
- Use secure APIs for data management
- Add proper input validation and sanitization
- Implement proper user session management

## 🐛 Troubleshooting

### "Failed to load dictionary data" Error
This error occurs when the app can't load the JSON file. Solutions:

1. **Use a Web Server**: Don't open `index.html` directly in the browser
2. **Check File Path**: Ensure `MyanmarEnglishLawDictionary.json` is in the same directory
3. **CORS Issues**: Some browsers block local file access - use a web server

### Myanmar Text Not Displaying
1. **Font Loading**: Ensure internet connection for Google Fonts
2. **Browser Support**: Use a modern browser with Unicode support
3. **Font Fallback**: The app includes fallback fonts for Myanmar text

### Search Not Working
1. **JavaScript Console**: Check for errors in browser console (F12)
2. **Data Loading**: Verify the JSON file loaded successfully
3. **Browser Compatibility**: Ensure JavaScript is enabled

## 📄 License

This project is developed for educational purposes. All rights reserved.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding server-side components
- Implementing proper authentication
- Adding data validation
- Creating a proper database backend

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all files are in the correct directory
3. Ensure you're using a web server (not opening HTML directly)
4. Check browser console for error messages

---

**Developed for educational purposes — MyanLawLexicon v1.0**# MyanLawLexicon
