# Personal Finance Tracker - Mobile Web Application

A comprehensive, mobile-first Progressive Web App (PWA) for tracking personal finances, converted from the original Python desktop application.

## 🌟 Features

### Core Financial Management
- **Assets Tracking**: Monitor various asset types (Bank Accounts, FDs, RDs, Mutual Funds, etc.)
- **Expense Management**: Categorized expense tracking with fixed/variable classification
- **Income Tracking**: Multiple income source management
- **Financial Goals**: Set and track progress towards financial objectives
- **Comprehensive Reports**: Monthly/yearly financial summaries

### Mobile-First Design
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Progressive Web App**: Install on any device like a native app
- **Offline Functionality**: Works without internet connection
- **Dark/Light Theme**: Automatic theme switching

### Security & Privacy
- **Client-Side Encryption**: AES-256 encryption for sensitive data
- **Local Storage**: All data stays on your device
- **Password Protection**: Optional encryption with user-defined passwords
- **Secure Backup**: Encrypted export/import functionality

### Analytics & Insights
- **Interactive Charts**: Net worth trends, expense categories, savings rate
- **Financial Insights**: AI-powered recommendations based on spending patterns
- **Goal Progress**: Visual progress tracking for financial goals
- **Category Analysis**: Detailed breakdown of spending patterns

## 🚀 Quick Start

### Method 1: Direct Use (Recommended)
1. Download all files to a folder on your device
2. Open `index.html` in any modern web browser
3. Start tracking your finances immediately!

### Method 2: Local Web Server
```bash
# Using Python
cd finance-tracker-web
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### Method 3: GitHub Pages Deployment
1. Fork this repository
2. Go to Settings → Pages
3. Select source branch (main)
4. Access your app at `https://yourusername.github.io/finance-tracker-web`

## 📱 Installation as PWA

### On Mobile Devices (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" option:
   - **iOS Safari**: Tap Share button → "Add to Home Screen"
   - **Android Chrome**: Tap menu → "Add to Home Screen"
3. The app will appear as a native app icon

### On Desktop
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install" to add to your applications

## 🏗️ Project Structure

```
finance-tracker-web/
├── index.html              # Main application HTML
├── manifest.json           # PWA manifest configuration
├── sw.js                  # Service Worker for offline functionality
├── css/
│   └── app.css            # Main application styles
├── js/
│   ├── app.js             # Main application controller
│   ├── data-manager.js    # Data management layer
│   ├── security.js        # Encryption and security features
│   └── charts.js          # Analytics and chart rendering
├── assets/                # Icons and images (create this folder)
│   ├── icon-*.png         # PWA icons (various sizes)
│   └── screenshots/       # App screenshots
└── README.md              # This file
```

## 🔧 Technical Requirements

### Minimum Browser Support
- **Chrome/Edge**: Version 80+
- **Firefox**: Version 75+
- **Safari**: Version 13+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+

### Required Browser Features
- ES6+ JavaScript support
- Web Crypto API (for encryption)
- LocalStorage
- Service Workers (for PWA features)
- Canvas API (for charts)

## 📊 Data Management

### Storage Options
- **LocalStorage**: Primary storage for all financial data
- **IndexedDB**: Used for offline sync and large datasets
- **Memory**: Temporary storage for active sessions

### Data Structure
```javascript
// Assets
{
  assets: [
    {
      id: "unique_id",
      name: "Asset Name",
      type: "Bank Account|FD|RD|Mutual Fund|etc",
      value: 50000,
      created: "2023-01-01T00:00:00.000Z",
      lastUpdated: "2023-01-01T00:00:00.000Z"
    }
  ],
  history: [...] // Asset value history
}

// Expenses
{
  expenses: [
    {
      id: "unique_id",
      description: "Expense description",
      amount: 1000,
      category: "Food & Dining|Transport|etc",
      type: "Fixed|Variable",
      date: "2023-01-01",
      timestamp: "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🔐 Security Features

### Encryption Options
- **Disabled**: Data stored in plain text (default)
- **Enabled**: AES-256-GCM encryption with PBKDF2 key derivation

### Security Best Practices
1. Use strong passwords (12+ characters)
2. Enable encryption for sensitive data
3. Regular data backups
4. Keep browser updated
5. Use HTTPS when hosting online

### Data Privacy
- **No Server**: All data remains on your device
- **No Tracking**: No analytics or tracking scripts
- **No Network**: Works completely offline
- **User Control**: You own and control all data

## 📈 Usage Guide

### Getting Started
1. **Add Assets**: Start by adding your bank accounts, investments
2. **Set Categories**: Customize expense categories for your needs
3. **Track Expenses**: Record daily expenses with categories
4. **Record Income**: Add income sources and amounts
5. **Set Goals**: Define financial objectives and timelines
6. **Review Analytics**: Check progress with charts and insights

### Daily Workflow
1. **Quick Add**: Use dashboard quick actions for common transactions
2. **Categorize**: Assign appropriate categories to expenses
3. **Review**: Check recent transactions for accuracy
4. **Update Assets**: Regularly update asset values
5. **Monitor Goals**: Track progress towards financial objectives

### Monthly Tasks
1. **Copy Fixed Expenses**: Use the copy function for recurring expenses
2. **Generate Reports**: Review monthly financial summary
3. **Update Budgets**: Adjust spending categories based on patterns
4. **Backup Data**: Export encrypted backup of your data
5. **Review Goals**: Update or adjust financial goals

## 🎨 Customization

### Themes
- **Light Theme**: Default clean interface
- **Dark Theme**: Easy on the eyes for low-light use
- **Auto Theme**: Follows system preference

### Categories
Add custom expense categories:
```javascript
// In browser console or modify data-manager.js
dataManager.getData('categories').custom.push('New Category');
```

### Currency
Currently supports INR (₹). To change:
1. Modify `formatCurrency()` method in `data-manager.js`
2. Update currency symbols throughout the application

## 🔧 Development

### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/finance-tracker-web.git
cd finance-tracker-web

# Start local server
python -m http.server 8000
# or
npx serve .

# Open in browser
open http://localhost:8000
```

### Code Structure
- **Modular Design**: Separate concerns (data, UI, security, charts)
- **ES6+ JavaScript**: Modern JavaScript features
- **Mobile-First CSS**: Responsive design principles
- **Progressive Enhancement**: Works on basic browsers, enhanced on modern ones

### Extending Functionality
1. **New Chart Types**: Add to `charts.js`
2. **Additional Security**: Extend `security.js`
3. **New Data Types**: Modify `data-manager.js`
4. **UI Components**: Update `app.js` and CSS

## 🌐 Deployment Options

### Static Hosting (Recommended)
- **GitHub Pages**: Free, easy setup
- **Netlify**: Advanced features, custom domains
- **Vercel**: Fast global CDN
- **Firebase Hosting**: Google's platform

### Self-Hosting
- **Apache/Nginx**: Traditional web servers
- **Docker**: Containerized deployment
- **Cloud Storage**: AWS S3, Google Cloud Storage

### Deployment Checklist
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Optimize images and assets
- [ ] Test PWA installation
- [ ] Verify offline functionality
- [ ] Test on various devices

## 📱 Mobile Optimization

### Performance
- **Lazy Loading**: Charts and heavy components
- **Caching**: Aggressive caching with Service Worker
- **Compression**: Minified CSS and JavaScript
- **Efficient DOM**: Minimal DOM manipulation

### User Experience
- **Touch Targets**: 44px minimum touch areas
- **Gestures**: Swipe navigation support
- **Haptic Feedback**: Vibration for actions
- **Loading States**: Visual feedback for operations

## 🔍 Troubleshooting

### Common Issues

**PWA Installation Not Available**
- Ensure HTTPS is enabled
- Check browser support
- Verify manifest.json is accessible

**Encryption Not Working**
- Check browser crypto API support
- Ensure secure context (HTTPS/localhost)
- Verify no console errors

**Charts Not Displaying**
- Check Chart.js library loading
- Verify canvas element support
- Check console for JavaScript errors

**Data Not Persisting**
- Check localStorage availability
- Verify storage quota not exceeded
- Check browser's private/incognito mode

### Browser Console Commands
```javascript
// Check data storage
console.log(localStorage);

// View current data
console.log(dataManager.exportAllData());

// Clear all data (caution!)
dataManager.clearAllData();

// Check PWA installation
console.log(window.matchMedia('(display-mode: standalone)').matches);
```

## 🤝 Contributing

### Ways to Contribute
1. **Bug Reports**: Open issues for bugs
2. **Feature Requests**: Suggest new features
3. **Code Contributions**: Submit pull requests
4. **Documentation**: Improve docs and guides
5. **Testing**: Test on different devices/browsers

### Development Guidelines
1. Follow existing code style
2. Add comments for complex logic
3. Test on mobile devices
4. Ensure accessibility compliance
5. Update documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

### Getting Help
1. **Documentation**: Check this README thoroughly
2. **Issues**: Search existing GitHub issues
3. **Browser DevTools**: Check console for errors
4. **Community**: Join discussions in Issues

### Reporting Bugs
Please include:
- Browser and version
- Device type (mobile/desktop)
- Steps to reproduce
- Expected vs actual behavior
- Console error messages

## 🔄 Migration from Desktop App

### Data Migration
1. **Export from Python App**: Use the export functionality
2. **Format Conversion**: Convert CSV/JSON to web app format
3. **Import to Web App**: Use the import feature
4. **Verify Data**: Check all data imported correctly

### Feature Mapping
| Desktop Feature | Web App Equivalent |
|---|---|
| SQLite Database | LocalStorage/IndexedDB |
| CSV Export | JSON Export |
| Matplotlib Charts | Chart.js Visualizations |
| Tkinter GUI | Responsive Web UI |
| File System | Browser Storage |

## 🚀 Future Enhancements

### Planned Features
- [ ] Multi-currency support
- [ ] Advanced budgeting tools
- [ ] Investment portfolio tracking
- [ ] Bill reminders and notifications
- [ ] Receipt photo capture
- [ ] Cloud sync options
- [ ] Advanced analytics and AI insights
- [ ] Multi-user support

### Technical Improvements
- [ ] WebAssembly for heavy computations
- [ ] Better offline sync
- [ ] Push notifications
- [ ] Background processing
- [ ] Enhanced security options

---

## 📞 Contact

For questions, suggestions, or support, please open an issue on GitHub or contact the development team.

**Happy Financial Tracking! 💰📱**
