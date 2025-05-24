import {
  geocodeAddress,
  calculateDistance,
  getRegionFromAddress,
  fallbackGetRegionFromAddress,
  HIMKA_PLASTIC_ADDRESS,
  HIMKA_PLASTIC_COORDINATES
} from './yandexMaps';

jest.mock('axios');
const axios = require('axios');

describe('yandexMaps utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should return geocode data from API', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          response: {
            GeoObjectCollection: {
              featureMember: [
                {
                  GeoObject: {
                    Point: { pos: '37.429674 55.906336' },
                    metaDataProperty: { GeocoderMetaData: { Address: { Components: [{ kind: 'locality', name: 'Химки' }] } } }
                  }
                }
              ]
            }
          }
        }
      });
      const result = await geocodeAddress('some address');
      expect(result.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos).toBe('37.429674 55.906336');
    });

    it('should use fallback and return factory coordinates on error', async () => {
      axios.get.mockRejectedValueOnce(new Error('API error'));
      const result = await geocodeAddress('bad address');
      expect(result.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos).toBe('37.429674 55.906336');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate haversine distance between two addresses', async () => {
      axios.get.mockResolvedValue({
        data: {
          response: {
            GeoObjectCollection: {
              featureMember: [
                { GeoObject: { Point: { pos: '37.429674 55.906336' }, metaDataProperty: { GeocoderMetaData: { Address: { Components: [{ kind: 'locality', name: 'Химки' }] } } } } }
              ]
            }
          }
        }
      });
      const dist = await calculateDistance('addr1', 'addr2');
      expect(typeof dist).toBe('number');
      expect(dist).toBeGreaterThan(0);
    });

    it('should return fallback distance on error', async () => {
      axios.get.mockRejectedValue(new Error('API error'));
      const dist = await calculateDistance('bad1', 'bad2');
      expect(dist).toBe(10);
    });
  });

  describe('getRegionFromAddress', () => {
    it('should extract region from geocode response', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          response: {
            GeoObjectCollection: {
              featureMember: [
                {
                  GeoObject: {
                    metaDataProperty: {
                      GeocoderMetaData: {
                        Address: {
                          Components: [
                            { kind: 'province', name: 'Московская область' },
                            { kind: 'locality', name: 'Химки' }
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      });
      const region = await getRegionFromAddress('some address');
      expect(region).toBe('Московская область');
    });

    it('should fallback to locality if region not found', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          response: {
            GeoObjectCollection: {
              featureMember: [
                {
                  GeoObject: {
                    metaDataProperty: {
                      GeocoderMetaData: {
                        Address: {
                          Components: [
                            { kind: 'locality', name: 'Химки' }
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      });
      const region = await getRegionFromAddress('some address');
      expect(region).toBe('Химки');
    });

    it('should fallback to fallbackGetRegionFromAddress on error', async () => {
      axios.get.mockRejectedValueOnce(new Error('API error'));
      const region = await getRegionFromAddress('Москва, ул. Тверская');
      expect(region).toBe('Москва');
    });
  });

  describe('fallbackGetRegionFromAddress', () => {
    it('should return region for known city', () => {
      expect(fallbackGetRegionFromAddress('Москва, ул. Тверская')).toBe('Москва');
      expect(fallbackGetRegionFromAddress('г. Химки')).toBe('Московская область');
      expect(fallbackGetRegionFromAddress('Санкт-Петербург')).toBe('Санкт-Петербург');
      expect(fallbackGetRegionFromAddress('Екатеринбург')).toBe('Екатеринбург');
      expect(fallbackGetRegionFromAddress('Новосибирск')).toBe('Новосибирск');
    });
    it('should return "Центральный регион" for unknown address', () => {
      expect(fallbackGetRegionFromAddress('Some unknown address')).toBe('Центральный регион');
    });
  });
});
