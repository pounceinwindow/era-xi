# Era XI

Футбольный daily-draft: собери XI из культовых клубных эпох и пройди турнир.

```bash
npm install
npm run dev
```

Без Supabase игра полностью работает в локальном preview-режиме. Для общего Daily-лидерборда добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`, затем примените миграции из `supabase/`.

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase functions deploy start-daily
npx supabase functions deploy submit-run
```

В Supabase нужно включить Anonymous Sign-Ins. Те же две публичные переменные добавляются в GitHub Actions Variables; service-role key остаётся только внутри Supabase.
