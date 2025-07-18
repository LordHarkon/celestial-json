# Celestial & CYOA Roller Changelog

**Created by Hooshu**

## Version 1.0.0 (2025-01-20)

### 🎉 Major Release - Dual-Purpose Rolling System

This release transforms the app from a Celestial-only tool into a comprehensive rolling system supporting both Celestial spreadsheets and CYOA JSON files.

### 📊 **Celestial Tab Features**

- **Excel File Support**

  - .xlsx and .xls file handling
  - Pre-loaded Celestial documents
  - Multiple sheet selection and management
  - Automatic "Chapter X" sheet name processing
  - Sheet name customization

- **Header Management**

  - Cross-sheet header standardization
  - Header display name customization
  - Header visibility toggles
  - Preserved header ordering
  - Automatic ID generation

- **Advanced Rolling System**

  - Multiple concurrent filters
  - Advanced filter types:
    - Text: Case-insensitive search
    - Index: Numeric comparison (>, >=, =, <, <=)
    - Price: CP cost with "Free" handling and comparisons
  - Inverse filter logic (NOT)
  - Keyboard shortcut (Shift + R)
  - Random selection from filtered results

- **Build Management**
  - Perk saving system
  - Build overview dialog
  - Expandable perk details
  - Copy perk details to clipboard
  - Remove perks from build
  - Automatic name and cost display

### 🎯 **CYOA Tab Features** (NEW)

- **JSON File Support**

  - Load from predefined URLs
  - Custom URL input
  - Local JSON file upload
  - Optimized data processing for large files

- **Row-Based Selection**

  - Visual row selection with object preview
  - Row name customization
  - Object count display
  - Expandable row details

- **Advanced Rolling**

  - Multi-item rolling (1-20 items)
  - Multi-row filtering with checkboxes
  - Duplicate prevention
  - Row-specific filtering

- **Collection Management**
  - Keep rolled items
  - Visual item cards with images
  - Addon support display
  - Collection overview dialog

### ⚙️ **Shared Features**

- **State Management**

  - Complete state import/export
  - JSON file format
  - Preserved settings and configurations
  - Kept items/perks persistence

- **User Interface**

  - Responsive design for all screen sizes
  - Dark/Light theme support
  - Modern UI with Radix components
  - Consistent design language across tabs
  - Tutorial dialogs for both modes

- **Performance**
  - Optimized for large datasets
  - Efficient memory usage
  - Fast file processing
  - Smooth animations and transitions

### 🔧 **Technical Improvements**

- **Architecture**

  - TypeScript for type safety
  - Modular component design
  - Separation of concerns between tabs
  - Efficient state management

- **Dependencies**
  - Updated to React 18
  - Radix UI for accessibility
  - Tailwind CSS for styling
  - SheetJS for Excel processing

### 🎨 **UI/UX Enhancements**

- **Visual Design**

  - Consistent card-based layout
  - Improved typography
  - Better color scheme
  - Enhanced spacing and layout

- **User Experience**
  - Intuitive tab navigation
  - Clear visual feedback
  - Comprehensive help system
  - Error handling with user-friendly messages

### 📱 **Accessibility**

- **Screen Reader Support**

  - ARIA labels throughout
  - Semantic HTML structure
  - Keyboard navigation support

- **Responsive Design**
  - Mobile-first approach
  - Touch-friendly interactions
  - Adaptive layouts

---

**Created with ❤️ by Hooshu**
