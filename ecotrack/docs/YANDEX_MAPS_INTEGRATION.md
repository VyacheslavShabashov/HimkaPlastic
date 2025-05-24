# Интеграция Яндекс Карт API v3 в EcoTrack

## Обзор интеграции

В проекте EcoTrack Яндекс Карты API используется для:
1. Геокодирования адресов
2. Определения регионов по адресам
3. Расчета расстояний для логистики
4. Отображения карт на фронтенде (маршруты, точки сбора материалов)

## Настройка API ключа

API ключ Яндекс Карт хранится в файле `.env` в корне проекта (`YANDEX_MAPS_API_KEY`).

## Структура интеграции

### Серверная часть

1. **Модуль `src/utils/yandexMaps.ts`**
   - Содержит функции для работы с API (геокодирование, расчет расстояний)
   - Поддерживает запасные варианты на случай недоступности API

2. **Endpoint для получения API ключа**
   - `GET /api/maps/config` - возвращает API ключ и URL скрипта для фронтенда
   - Реализован в `src/server/server.ts`

3. **Интеграция в API функции**
   - Обновлены функции расчета цен и обработки заказов в `src/api/api.ts`
   - Используются функции из модуля `yandexMaps.ts` вместо прежних заглушек

### Клиентская часть

Для использования API на клиенте необходимо:

1. Получить API ключ с сервера:
```javascript
async function getYandexMapsConfig() {
  const response = await fetch('/api/maps/config');
  return response.json();
}
```

2. Добавить скрипт Яндекс Карты API в HTML:
```javascript
async function initYandexMaps() {
  const config = await getYandexMapsConfig();
  
  // Добавление скрипта в head
  const script = document.createElement('script');
  script.src = config.scriptUrl;
  document.head.appendChild(script);
  
  // Дождаться загрузки API
  return new Promise((resolve) => {
    script.onload = resolve;
  });
}
```

3. Инициализировать карту:
```javascript
async function createMap(elementId) {
  await initYandexMaps();
  await ymaps3.ready;
  
  const { YMap, YMapDefaultSchemeLayer } = ymaps3;
  
  // Инициализируем карту
  const map = new YMap(
    document.getElementById(elementId),
    {
      location: {
        center: [37.588144, 55.733842],
        zoom: 10
      }
    }
  );
  
  // Добавляем слой схематической карты
  map.addChild(new YMapDefaultSchemeLayer());
  
  return map;
}
```

## Ограничения

1. Яндекс Maps JavaScript API v3 работает только с ключами, у которых заполнено поле "Ограничение по HTTP Referer"
2. Для локальной разработки необходимо добавить `localhost` в "Ограничение по HTTP Referer" в кабинете разработчика
3. Ограничения начинают действовать через 15 минут после их установки

## Рекомендации по работе

1. Всегда используйте обработку ошибок при работе с API
2. Предусматривайте запасные варианты на случай недоступности API
3. При изменении домена приложения не забудьте обновить "Ограничение по HTTP Referer" в кабинете разработчика
4. Регулярно мониторьте использование API в кабинете разработчика для предотвращения превышения лимитов 