# Steed Video Editor

> A professional-grade browser-based video editing studio powered by React and TypeScript

## 🎬 Overview

Steed is a comprehensive video editing application that brings professional editing capabilities to the browser. Built with modern web technologies, it offers a rich set of features for video creation, audio mixing, effects, and AI-powered tools.

## ✨ Key Features

### Video Editing
- **Timeline Editor** - Multi-track timeline with drag-and-drop support
- **Video Stage** - Real-time preview with playback controls
- **Trimming & Splitting** - Precise clip manipulation
- **Keyframe Animation** - Advanced motion graphics and effects
- **Transitions** - Smooth transitions between clips
- **Color Grading** - Professional color correction tools

### Audio Production
- **Audio Mixer** - Multi-channel audio mixing
- **Waveform Visualization** - Visual audio editing
- **Audio Effects** - Comprehensive effects library
- **Audio Ducking** - Automatic background music adjustment
- **Audio Meter** - Real-time level monitoring

### AI-Powered Tools
- **Auto Transcription** - Automatic speech-to-text
- **Video Analysis** - Intelligent scene detection
- **Audio Analysis** - Smart audio enhancement
- **AI Tools Panel** - Integrated AI assistance

### Professional Features
- **Export Queue** - Batch export management
- **Project Management** - Organize multiple projects
- **Template System** - Quick-start templates
- **History & Undo** - Complete edit history
- **Keyboard Shortcuts** - Professional workflow support
- **Grid & Safe Zones** - Professional layout guides

### Asset Management
- **Project Bins** - Organized asset storage
- **Recent Assets** - Quick access to recent files
- **Thumbnail Scrubber** - Visual navigation
- **Search & Filter** - Find assets quickly
- **Batch Operations** - Process multiple assets

## 🏗️ Project Structure

```
Steed/
├── frontend/               # React/TypeScript video editor
│   ├── components/        # React components
│   │   ├── Timeline.tsx
│   │   ├── VideoStage.tsx
│   │   ├── AudioMixer.tsx
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   ├── video-analysis.ts
│   │   ├── audio-analysis.ts
│   │   ├── export-queue.ts
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── types.ts          # TypeScript definitions
│   └── App.tsx           # Main application
├── archive/              # Previous project files
└── README.md            # This file
```

## 🔧 Technical Stack

**Frontend:**
- React 19.2
- TypeScript 5.8
- Vite 6.2
- Lucide React (icons)

**Build Tools:**
- Vite for fast development and optimized builds
- TypeScript for type safety
- ES modules for modern JavaScript

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

### Building for Production

```bash
cd frontend
npm run build
```

The optimized production build will be in the `frontend/dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎯 Roadmap

### Current Features (v1.0)
- ✅ Multi-track timeline editing
- ✅ Audio mixing and effects
- ✅ Video playback and preview
- ✅ Export functionality
- ✅ AI-powered tools
- ✅ Project management

### Planned Features (v2.0)
- 🔄 Real-time collaboration
- 🔄 Cloud storage integration
- 🔄 Advanced color grading
- 🔄 Motion tracking
- 🔄 3D text and titles
- 🔄 Plugin system

### Future Considerations
- Mobile app support
- Advanced AI features
- Team collaboration tools
- Asset marketplace

## 🎨 Component Architecture

The application is built with a modular component architecture:

- **Core Components**: Timeline, VideoStage, AudioMixer
- **UI Components**: Buttons, Modals, Panels, Overlays
- **Utility Components**: Waveform, Trimmer, ColorPicker
- **Feature Components**: ExportQueue, ProjectManager, AITools

## 📊 Performance

The editor is optimized for performance with:
- Worker pool for parallel processing
- Waveform caching
- Thumbnail generation
- Lazy loading of assets
- Efficient render optimization

## 🤝 Contributing

This is an active development project. Contributions are welcome!

## 📝 License

Copyright © 2025 Steed Video Editor. All rights reserved.

## 🎯 Design Philosophy

1. **Professional Quality** - Tools that match industry standards
2. **Browser-First** - No installation required, works everywhere
3. **AI-Enhanced** - Intelligent assistance without replacing creativity
4. **Performance** - Smooth editing even with complex projects
5. **User-Friendly** - Powerful features with intuitive interface

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: Coming soon
- **Community**: [To be added]

---

**Built for creators, powered by modern web technology.**
