# Cynet Rework — Frontend

React + Vite dashboard для мониторинга безопасности Cynet.

## Структура проекта

```
src/
├── api/
│   └── securityApi.js        ← ВСЕ вызовы бэкенда здесь (сейчас mock)
├── hooks/
│   └── useSecurityData.js    ← React-хук, получает данные + polling
├── components/
│   ├── SecurityRing.jsx/css  ← Главный SVG-круг с сегментами
│   ├── SectionCard.jsx/css   ← Карточка модуля безопасности
│   └── Navbar.jsx/css        ← Верхняя навигация
└── pages/
    ├── Dashboard.jsx/css     ← Главная страница (кольцо + карточки + issues)
    └── SectionPage.jsx/css   ← Детальная страница раздела
```

## Запуск

```bash
npm install
npm run dev
```

## Подключение бэкенда

Все данные идут через **src/api/securityApi.js**.
Замените mock-функции на реальные fetch/axios вызовы:

```js
// Было (mock):
export async function fetchSecurityOverview() {
  await delay(600);
  return structuredClone(MOCK_SECURITY_DATA);
}

// Станет (реальный API):
export async function fetchSecurityOverview() {
  const res = await fetch('/api/v1/security/overview', {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch security overview');
  return res.json();
}
```

## Структура данных (контракт с бэкендом)

```
SecurityOverview {
  lastUpdated: ISO string
  sections: Section[]
}

Section {
  id: string          // "endpoints" | "users" | "network" | "email" | "saas" | "mobile"
  label: string
  icon: string (emoji)
  score: number       // 0-100
  status: "ok" | "warning" | "critical"
  issues: Issue[]
  subModules: { name, enabled, ok }[]
}

Issue {
  id, severity, title, description
  affectedAssets: string[]
  detectedAt: ISO string
  route: string       // frontend route
}
```

## Polling

По умолчанию данные обновляются каждые 30 сек.
Изменить можно в Dashboard.jsx:

```js
const { data } = useSecurityData(60_000); // раз в 60 сек
const { data } = useSecurityData(0);      // без polling
```
