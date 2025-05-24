# EcoTrack

EcoTrack is a web application for automating the acceptance of recycled materials.

## Environment Variables

The backend requires a Yandex Maps API key in order to perform geocoding and related features. Create a `.env` file in the project root and define:

```
YANDEX_MAPS_API_KEY=your-api-key-here
ENCRYPTION_KEY=your-32-byte-secret
```

This key is mandatory for both the server and utility modules.
