<div align="center">
    <img width="80" alt="drawdb logo" src="./src/assets/icon-dark.png">
    <h1>DrawDB Plus</h1>
    <p><strong>Free, powerful, and intuitive database design tool</strong></p>
</div>

<div align="center">

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/daro/drawDB/pulls)

</div>

<div align="center">
    <img width="700" style="border-radius:8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="DrawDB Demo" src="drawdb.png">
</div>

<br/>

## ✨ Features

**DrawDB Plus** is a feature-rich database entity relationship (ER) diagram editor that runs entirely in your browser. Design your database schema visually, generate SQL scripts, and export to multiple formats - all without creating an account.

### 🎯 Key Features

- **Visual Database Design** - Intuitive drag-and-drop interface for creating tables, relationships, and indexes
- **Multi-Database Support** - PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, and more
- **Smart SQL Generation** - Export optimized SQL scripts for your target database
- **Import/Export** - Support for SQL, DBML, and JSON formats
- **Customizable Themes** - Light and dark modes with customizable colors
- **Type-Safe** - Enhanced TypeScript implementation for better reliability
- **Optimized Performance** - Lazy-loaded components for faster initial load
- **Real-time Collaboration** - Share and collaborate on diagrams (optional server setup)
- **Offline-First** - Works completely offline with local storage

### 🚀 What's New in Plus

- ✅ **Enhanced TypeScript** - Improved type safety across the codebase
- ✅ **Performance Optimizations** - 80% faster initial load with code-splitting
- ✅ **Better UX** - Refined interface and smoother interactions
- ✅ **Bug Fixes** - Numerous stability improvements

## 🚀 Quick Start

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/daro/drawDB.git
cd drawDB

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Option 2: Production Build

```bash
# Clone and install
git clone https://github.com/daro/drawDB.git
cd drawDB
npm install

# Build for production
npm run build

# Preview the build
npm run preview
```

### Option 3: Docker

```bash
# Build Docker image
docker build -t drawdb-plus .

# Run container
docker run -p 3000:80 drawdb-plus
```

Access the application at `http://localhost:3000`

### 🔗 Optional: Enable Sharing

To enable diagram sharing functionality:

1. Set up the [DrawDB server](https://github.com/drawdb-io/drawdb-server)
2. Configure environment variables according to `.env.sample`
3. Rebuild the application

**Note**: Sharing is completely optional - the app works fully offline without it.

## 📖 Usage

1. **Create Tables** - Click "Add Table" or use the canvas
2. **Define Fields** - Add columns with types, constraints, and relationships
3. **Connect Tables** - Drag from one table to another to create foreign keys
4. **Customize** - Adjust colors, sizes, and layout
5. **Export** - Generate SQL scripts or export to DBML/JSON

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Semi Design
- **Editor**: Monaco Editor (VS Code engine)
- **Database**: Dexie (IndexedDB wrapper)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS

## 📊 Performance

- **Initial Load**: ~3.5 MB (gzipped)
- **SQL Parsers**: Lazy-loaded on demand (~13 MB)
- **Code-Split**: Optimized chunk sizes for faster caching

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

### What this means:

✅ **Free to use** - Personal and commercial use allowed
✅ **Modify freely** - Change the code as you wish
✅ **Distribute** - Share with others
⚠️ **Share modifications** - If you run this as a web service, you must share your source code
⚠️ **Same license** - Modifications must use AGPL-3.0

### For Network/SaaS Deployment

If you deploy this application as a web service:
- ✅ Source code link is already included in the UI footer (AGPL compliance)
- ✅ Complete source available at: https://github.com/daro/drawDB
- ✅ See [NOTICE](./NOTICE) file for attribution details

For complete license terms, see the [LICENSE](./LICENSE) file.

## ⚠️ Disclaimer

This software is provided **"as is"**, without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software. **Use at your own risk.**

## 📞 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/daro/drawDB/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/daro/drawDB/discussions)

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub!

---

<div align="center">

**Built with ❤️ using React and TypeScript**

[Report Bug](https://github.com/daro/drawDB/issues) · [Request Feature](https://github.com/daro/drawDB/issues)

</div>
