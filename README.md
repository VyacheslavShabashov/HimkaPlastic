# EcoTrack

EcoTrack is a small demonstration project for automating the acceptance and logistics of recycled materials. It contains a Node.js/Express backend and a React based frontend. The repository includes compiled output in `dist/` and the original TypeScript sources under `ecotrack/`.

## Setup

1. Install Node.js (version 18 or later is recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root to provide required environment variables.

## Environment Variables

- `PORT` – port number for the backend server (defaults to `3001`).
- `YANDEX_MAPS_API_KEY` – API key for Yandex Maps used on the server side.
- `REACT_APP_YANDEX_API_KEY` – API key for client side requests to Yandex Maps.
- `NODE_ENV` – optional mode flag (`development` enables mock sessions).

## Running the Application

Build the TypeScript sources and start the server:

```bash
npm start
```

This compiles sources to `dist/` and launches the backend at `http://localhost:$PORT`.

## Running Tests

Unit tests are written with Jest. Run them with:

```bash
npm test
```

## Usage Example

Example of requesting a region name from an address using the provided utilities:

```typescript
import { getRegionFromAddress } from './ecotrack/src/utils/yandexMaps';

const region = await getRegionFromAddress('Москва, ул. Тверская');
console.log(region); // => "Москва"
```

For more examples and detailed documentation see the [docs](docs/) directory.

