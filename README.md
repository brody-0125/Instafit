# Instafit - Instagram Image Resizer

[한국어](./README.ko.md) | English

A web-based image editor optimized for Instagram. Resize images to Instagram-compatible aspect ratios with customizable backgrounds, blur effects, and batch processing.

## Features

- **Template Presets**: Square (1:1), Portrait (4:5), Landscape (1.91:1) formats
- **Background Options**: Solid colors, blur effect with adjustable intensity
- **Batch Processing**: Upload and process multiple images at once
- **Multi-language Support**: English, Korean, Japanese
- **PWA Support**: Installable on home screen, offline capable
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Components | Radix UI |
| Testing | Vitest, Testing Library |
| Performance | Web Workers, Virtual List (@tanstack/react-virtual) |

## Project Structure

```
instafit/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with PWA metadata
│   └── page.tsx            # Main page
├── components/
│   ├── ui/                 # Reusable UI components (Button, Card, Slider, etc.)
│   ├── image-editor.tsx    # Main editor component
│   ├── image-canvas.tsx    # Canvas rendering component
│   ├── template-selector.tsx
│   ├── background-controls.tsx
│   └── image-thumbnail-list.tsx  # Virtualized thumbnail list
├── hooks/
│   ├── use-canvas-renderer.ts    # Canvas rendering logic
│   └── use-image-worker.ts       # Web Worker communication
├── lib/
│   └── i18n/               # Internationalization
│       ├── translations.ts
│       └── context.tsx
├── workers/
│   └── image-processor.worker.ts  # Image processing Web Worker
├── types/
│   └── editor.ts           # TypeScript type definitions
├── public/
│   ├── manifest.json       # PWA manifest
│   └── offline.html        # Offline fallback page
└── tests/                  # Unit tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/instafit.git
cd instafit

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |

## Usage

1. **Upload Images**: Drag & drop or click to select images
2. **Select Template**: Choose Square, Portrait, or Landscape format
3. **Customize Background**: Pick a solid color or enable blur effect
4. **Adjust Settings**: Modify blur intensity and image padding
5. **Download**: Export individual images or download all at once

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## License

This project is licensed under the [MIT License](./LICENSE).
