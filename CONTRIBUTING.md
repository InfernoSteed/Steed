# Contributing to Steed Video Editor

Thank you for your interest in contributing to Steed Video Editor! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/InfernoSteed/Steed.git
   cd Steed
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Code Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use strict mode

### React Components

- Use functional components with hooks
- Follow the component structure in existing files
- Keep components focused and single-purpose
- Use meaningful component and prop names

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use arrow functions where appropriate
- Keep functions small and focused

### File Organization

```
frontend/
├── components/        # React components
│   └── [Component].tsx
├── utils/            # Utility functions
│   └── [utility].ts
├── hooks/            # Custom React hooks
│   └── use[Hook].ts
├── types.ts          # Shared TypeScript types
└── App.tsx           # Main application
```

## 🔧 Development Workflow

### Creating a Feature

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Test your changes thoroughly
4. Commit with clear messages
5. Push and create a pull request

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(timeline): add multi-select functionality
fix(audio): resolve waveform rendering issue
docs(readme): update installation instructions
```

## 🧪 Testing

- Test your changes in different browsers
- Verify video and audio playback
- Check performance with large projects
- Test keyboard shortcuts
- Verify export functionality

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node version
6. **Screenshots**: If applicable

## 💡 Feature Requests

When requesting features:

1. **Use Case**: Describe why this feature is needed
2. **Proposed Solution**: How it could work
3. **Alternatives**: Other approaches considered
4. **Additional Context**: Screenshots, examples, etc.

## 📦 Pull Requests

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] TypeScript compiles without errors
- [ ] Components render correctly
- [ ] No console errors or warnings
- [ ] Tested in Chrome, Firefox, and Safari
- [ ] Documentation updated if needed

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots
If applicable

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

## 🎨 Component Guidelines

### Creating New Components

1. Create file in `frontend/components/`
2. Use PascalCase for component names
3. Export as default
4. Include TypeScript props interface
5. Add JSDoc comments for complex components

Example:
```typescript
interface TimelineProps {
  clips: Clip[]
  onClipSelect: (clip: Clip) => void
  zoom: number
}

/**
 * Timeline component for video editing
 * Displays video and audio clips on a multi-track timeline
 */
export default function Timeline({ clips, onClipSelect, zoom }: TimelineProps) {
  // Component implementation
}
```

## 🛠️ Utility Functions

### Creating Utilities

1. Create file in `frontend/utils/`
2. Use kebab-case for file names
3. Export individual functions
4. Include JSDoc documentation
5. Add unit tests when applicable

Example:
```typescript
/**
 * Converts seconds to timecode format (HH:MM:SS:FF)
 * @param seconds - Time in seconds
 * @param fps - Frames per second (default: 30)
 * @returns Formatted timecode string
 */
export function secondsToTimecode(seconds: number, fps: number = 30): string {
  // Implementation
}
```

## 🎯 Areas for Contribution

### High Priority

- Performance optimizations
- Browser compatibility fixes
- Accessibility improvements
- Bug fixes
- Documentation improvements

### Feature Areas

- Timeline editing features
- Audio effects and mixing
- Export formats and presets
- AI tool enhancements
- Keyboard shortcuts
- Template system
- Project management

### Good First Issues

Look for issues tagged with `good-first-issue` for beginner-friendly tasks.

## 📚 Resources

### Documentation

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev)

### Project Resources

- [Project README](README.md)
- [Issue Tracker](https://github.com/InfernoSteed/Steed/issues)
- [Pull Requests](https://github.com/InfernoSteed/Steed/pulls)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create a GitHub Issue
- **Chat**: [To be added]

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Steed Video Editor! 🎬
