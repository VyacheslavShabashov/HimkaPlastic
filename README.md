# EcoTrack

EcoTrack is a web application for automating the acceptance of recycled materials.

## Environment Variables

All configuration is provided via a `.env` file located in the project root. The following variables are recognised:

- `DATABASE_URL` – connection string for the PostgreSQL database.
- `PORT` – port for the HTTP server (defaults to `3001`).
- `YANDEX_MAPS_API_KEY` – Yandex Maps API key used by the backend for geocoding and routing.
- `REACT_APP_YANDEX_API_KEY` – API key used by the frontend. It can be the same as `YANDEX_MAPS_API_KEY`.
- `NODE_ENV` – set to `development` to enable development helpers.

Example `.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/ecotrack
YANDEX_MAPS_API_KEY=your-yandex-key
REACT_APP_YANDEX_API_KEY=your-yandex-key
PORT=3001
NODE_ENV=development
```

## Running the application

1. Install dependencies:

```bash
npm install
```

2. Build the TypeScript sources:

```bash
npm run build
```

3. Start the server:

```bash
node dist/index.js
```

The API will then be available at `http://localhost:${PORT}/api`.

## Testing

Jest is used for automated tests. Run them with:

```bash
npm test
```
