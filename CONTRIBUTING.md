# Contributing to RealCanvas

## Getting Started

1. **Clone and setup**
   ```bash
   npm install
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

2. **Start development**
   ```bash
   # Option A: Using Docker
   npm run docker:up
   
   # Option B: Local development
   npm run dev
   ```

## Development Workflow

### Making Changes

- **Frontend**: Changes in `client/src` automatically reload with Vite
- **Backend**: Changes in `server/src` require restart (use `npm run dev` with tsx watch)
- **Types**: Keep client and server types synchronized

### Running Tests

```bash
# Run all tests
npm test --workspaces

# Run specific workspace tests
npm test --workspace=client
npm test --workspace=server
```

### Building for Production

```bash
# Build all workspaces
npm run build

# Build with Docker
npm run docker:up --build
```

## Code Style

- TypeScript strict mode enabled
- No implicit `any` types
- Use absolute imports with `@/` and `@shared/` aliases
- Components in separate files
- Stores follow Zustand conventions

## Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and test
3. Commit with clear messages: `git commit -m "feat: description"`
4. Push and create pull request

## Common Issues

### Module Resolution
If you see "Cannot find module" errors, ensure:
- Paths in `tsconfig.json` are correct
- Imports use relative paths or configured aliases
- `npm install` has been run

### Type Errors
- Discriminated unions require strict type literals
- Use `as any` for complex Zustand operations if needed
- Keep types synchronized between client/server

### Docker Issues
- Ensure Docker daemon is running
- Check port availability (5173, 4000, 27017)
- Use `npm run docker:down` to clean up

## Performance Tips

- Use React.memo for expensive components
- Throttle cursor updates (already configured at 50ms)
- Don't persist cursor movements to database
- Batch board object updates

## Future Improvements

See README.md for planned features and enhancements.
