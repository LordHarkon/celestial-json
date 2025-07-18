# Celestial & CYOA Roller

A comprehensive rolling tool for Celestial spreadsheets and CYOA JSON files, featuring advanced filtering, multi-item rolling, and collection management.

**Created by Hooshu**

## Features

### 🎲 **Dual-Purpose Rolling System**

- **Celestial Tab**: Process Excel files (.xlsx/.xls) with advanced sheet management
- **CYOA Tab**: Load JSON files from URLs or local uploads for Choose Your Own Adventure content

### 📊 **Celestial Spreadsheet Support**

- Load pre-configured Celestial documents or upload custom Excel files
- Intelligent sheet selection with header preview
- Dynamic header mapping and standardization across sheets
- Advanced filtering system (text, index, price-based)
- Perk randomization with customizable filters
- Build management for keeping favorite perks

### 🎯 **CYOA JSON Processing**

- Load CYOAs from predefined URLs or custom links
- Upload local CYOA JSON files
- Row-based object selection with preview
- Multi-row filtering for combined rolling
- Support for objects with images, text, and addons
- Collection management for rolled items

### ⚙️ **Advanced Features**

- **State Persistence**: Import/export complete application state
- **Multi-Item Rolling**: Roll multiple items at once with duplicate prevention
- **Visual Item Cards**: Rich display of rolled items with images and details
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Automatic theme switching based on system preference

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **File Processing**: SheetJS (xlsx) for Excel file handling
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. **Celestial Mode**: Upload Excel files or select from pre-loaded Celestial documents
2. **CYOA Mode**: Load from URLs or upload JSON files
3. **Configure**: Select sheets/rows and set up filters
4. **Roll**: Generate random items based on your configuration
5. **Collect**: Keep items you like and manage your collection
6. **Export**: Save your complete state for later use

## File Support

- **Celestial**: `.xlsx`, `.xls` Excel files
- **CYOA**: `.json` files (local or remote URLs)
- **State**: `.json` export/import files

## Contributing

This project uses modern React patterns with TypeScript for type safety and Tailwind CSS for styling. All components are built using Radix UI primitives for accessibility.

---

**Created with ❤️ by Hooshu**
