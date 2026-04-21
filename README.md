# Опросник (GitHub Pages)

Статический сайт на **Vite + React**, с визуальными компонентами в стиле **reactbits.dev**:
- `FloatingLines` (WebGL/Three.js фон)
- `GlassIcons` (стеклянные иконки)

Ответы отправляются в Formspree: `https://formspree.io/f/xzdyajgz`.

## Локальный запуск

```bash
npm i
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Деплой на GitHub Pages

Этот репозиторий публикуется как project site:
`https://karimovkarimj85-hue.github.io/oprosnik-/`

Настройки:
- Repo → **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: `main`
- Folder: `/docs`

Дальше сделайте build в папку `docs` (она уже настроена в `vite.config.js`) и закоммитьте изменения.

> Важно: в `vite.config.js` выставлен `base: '/oprosnik-/'` под Pages URL.

