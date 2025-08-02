# Overview

This is a browser-based ninja-themed endless runner game called "Tap Ninja: Sakura Run" built with React, TypeScript, and Canvas 2D rendering. The game features a ninja character jumping across platforms in a parallax-scrolled Japanese-inspired sunset cityscape with sakura (cherry blossom) particle effects.

The application follows a full-stack architecture with an Express.js backend and React frontend, though the current implementation focuses primarily on the client-side game mechanics. The game includes audio effects, local score persistence, and responsive touch/keyboard controls.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Rendering**: HTML5 Canvas with 2D context for game graphics and animations
- **State Management**: Zustand stores for game state, audio management, and user preferences
- **Styling**: Tailwind CSS with custom design system using CSS variables and Radix UI components
- **Game Loop**: Custom React hook (`useGameLoop`) using `requestAnimationFrame` for smooth 60fps gameplay
- **Input Handling**: Unified keyboard and touch event system supporting both desktop and mobile devices

## Game Engine Design
- **Component-Based Architecture**: Separate classes for game entities (Ninja, Platform, Background, Particles)
- **Physics System**: Simple gravity-based physics with collision detection utilities
- **Camera System**: Side-scrolling camera that follows the player with parallax background layers
- **Audio System**: HTML5 Audio with centralized state management and mute functionality
- **Score Persistence**: Local storage for high score tracking across sessions

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Development**: Hot module replacement with Vite integration for seamless full-stack development

## Data Layer
- **Schema Definition**: Shared TypeScript schemas using Drizzle ORM with Zod validation
- **Storage Interface**: Abstract storage interface with in-memory implementation for development
- **Migration System**: Drizzle Kit for database schema migrations and management

## Build and Deployment
- **Development**: Concurrent client/server development with Vite dev server integration
- **Production Build**: Client assets built to `dist/public`, server bundled with esbuild
- **Asset Handling**: Support for 3D models (.gltf, .glb), audio files, and GLSL shaders
- **TypeScript Configuration**: Monorepo setup with shared types and path aliases

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Build Tools**: Vite with React plugin, TypeScript compiler, esbuild for server bundling
- **Database**: Neon Database (serverless PostgreSQL), Drizzle ORM, connect-pg-simple for sessions

## UI and Styling
- **Design System**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing and custom design tokens
- **Fonts**: Google Fonts (Sawarabi Mincho for Japanese theming), Fontsource Inter
- **Animations**: Class Variance Authority for component variants, Tailwind animations

## Game-Specific Libraries
- **3D Graphics**: React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- **Particles**: Particles.js for background sakura effects
- **Audio**: Native HTML5 Audio API with Zustand state management
- **Utility Libraries**: date-fns for time formatting, clsx for conditional styling, nanoid for unique IDs

## Development and Quality Tools
- **Error Handling**: Replit-specific error overlay plugin for development
- **Type Safety**: Zod for runtime validation, Drizzle Zod integration
- **Code Quality**: ESLint-compatible setup with TypeScript strict mode
- **Development Experience**: tsx for TypeScript execution, source map support