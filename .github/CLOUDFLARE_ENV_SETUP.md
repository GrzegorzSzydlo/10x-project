# Cloudflare Pages - Environment Variables Setup

## Problem

Po wdrożeniu aplikacji na Cloudflare Pages pojawia się błąd:

```
Error: supabaseUrl is required.
```

## Przyczyna

Zmienne środowiskowe nie są dostępne w runtime aplikacji. GitHub Secrets są używane tylko w procesie CI/CD, ale **nie są automatycznie przekazywane do Cloudflare Pages**.

## Rozwiązanie

### Krok 1: Dodaj zmienne środowiskowe w Cloudflare Dashboard

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Przejdź do **Workers & Pages**
3. Wybierz swój projekt (`10x-project`)
4. Kliknij **Settings** → **Environment variables**
5. W sekcji **Production** dodaj następujące zmienne:

| Variable Name        | Value                   | Source                                                                |
| -------------------- | ----------------------- | --------------------------------------------------------------------- |
| `SUPABASE_URL`       | Twój Supabase URL       | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `SUPABASE_KEY`       | Twój Supabase anon key  | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `OPENROUTER_API_KEY` | Twój OpenRouter API key | [OpenRouter Dashboard](https://openrouter.ai/keys)                    |

6. Kliknij **Save**

### Krok 2: Redeploy aplikacji

Po dodaniu zmiennych środowiskowych musisz wykonać ponowne wdrożenie:

**Opcja A: Przez GitHub (zalecane)**

```bash
git commit --allow-empty -m "Trigger redeploy after env vars setup"
git push origin master
```

**Opcja B: Przez Cloudflare Dashboard**

1. Przejdź do **Deployments**
2. Znajdź ostatni deployment
3. Kliknij **Retry deployment** lub **Rollback to this deployment**

### Krok 3: Weryfikacja

Po redeploymencie sprawdź czy aplikacja działa poprawnie:

1. Otwórz swoją stronę na Cloudflare Pages
2. Sprawdź czy logowanie do Supabase działa
3. Sprawdź logi w **Cloudflare Dashboard** → **Your Project** → **Deployments** → **Latest** → **View logs**

## Struktura zmiennych środowiskowych

### GitHub Secrets (dla CI/CD)

Te zmienne są używane **podczas budowania** w GitHub Actions:

- Używane w jobsach: `build`, `deploy`
- Nie są dostępne w runtime aplikacji
- Konfigurowane w: GitHub Repository → Settings → Secrets

### Cloudflare Environment Variables (dla runtime)

Te zmienne są używane **podczas działania** aplikacji:

- Dostępne przez `import.meta.env.VARIABLE_NAME`
- Używane przez kod aplikacji (np. `supabase.client.ts`)
- Konfigurowane w: Cloudflare Dashboard → Workers & Pages → Settings → Environment variables

## Dodatkowe uwagi

### Environment Scopes w Cloudflare

- **Production**: Używane dla deploymentów z branch `master`
- **Preview**: Używane dla deploymentów z pull requestów/innych branchy

Jeśli testujesz na preview deployments, dodaj również zmienne w sekcji **Preview**.

### Bezpieczeństwo

- Nigdy nie commituj zmiennych środowiskowych do repozytorium
- Używaj `.env.example` jako template (bez wartości)
- Traktuj `SUPABASE_KEY` jako public (anon key), ale `SUPABASE_URL` + Service Role Key jako tajne

## Troubleshooting

### Problem: Zmienne nadal nie są dostępne po redeploymencie

**Rozwiązanie**: Upewnij się że:

1. Zmienne są dodane w sekcji **Production** (nie Preview)
2. Nazwy zmiennych są identyczne z tymi w kodzie
3. Wykonałeś pełny redeploy (nie tylko retry)

### Problem: Aplikacja działa lokalnie, ale nie na Cloudflare

**Rozwiązanie**:

1. Sprawdź czy używasz `import.meta.env` zamiast `process.env`
2. Sprawdź logi w Cloudflare Dashboard
3. Użyj `wrangler pages dev` do testowania lokalnie z Cloudflare runtime

### Problem: Build się udaje, ale aplikacja crashuje

**Rozwiązanie**: To typowy objaw braku zmiennych środowiskowych w Cloudflare. Zobacz Krok 1 powyżej.
