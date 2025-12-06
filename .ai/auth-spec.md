## Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

### 1. Architektura Interfejsu Użytkownika (Frontend)

#### 1.1. Nowe Strony (Astro)

Wprowadzone zostaną dedykowane strony dla procesów autentykacji, które będą renderowane po stronie serwera.

- **`/src/pages/login.astro`**: Strona logowania. Będzie zawierać i renderować komponent React `LoginForm`. Używa standardowego `Layout.astro` z wyśrodkowanym kontenerem.
- **`/src/pages/register.astro`**: Strona rejestracji. Będzie zawierać i renderować komponent React `RegisterForm`. Używa standardowego `Layout.astro` z wyśrodkowanym kontenerem.
- **`/src/pages/password-recovery.astro`**: Strona do inicjowania procesu odzyskiwania hasła. Używa standardowego `Layout.astro` z wyśrodkowanym kontenerem.
- **`/src/pages/update-password.astro`**: Strona, na którą użytkownik zostanie przekierowany z linku w mailu, aby ustawić nowe hasło. Używa standardowego `Layout.astro` z wyśrodkowanym kontenerem.

#### 1.2. Nowe Komponenty (React)

Interaktywne formularze zostaną zaimplementowane jako komponenty React, aby obsłużyć stan, walidację i komunikację z API bez przeładowywania strony.

- **`/src/components/auth/LoginForm.tsx`**:
  - **Odpowiedzialność**: Zarządzanie stanem pól (email, hasło), obsługa zdarzenia `submit`, walidacja po stronie klienta (np. czy pola nie są puste) oraz komunikacja z endpointem `/api/auth/login`.
  - **Użyte komponenty UI**: `Input`, `Button`, `Label` z biblioteki `shadcn/ui`.
- **`/src/components/auth/RegisterForm.tsx`**:
  - **Odpowiedzialność**: Zarządzanie stanem pól (email, hasło, powtórz hasło), walidacja (zgodność haseł, minimalna długość), komunikacja z endpointem `/api/auth/register`. Wyświetla komunikat sukcesu po poprawnej rejestracji.
- **`/src/components/auth/PasswordRecoveryForm.tsx`**:
  - **Odpowiedzialność**: Zarządzanie stanem pola email i komunikacja z endpointem `/api/auth/password-recovery`. Wyświetla komunikat sukcesu po wysłaniu linku.
- **`/src/components/auth/UpdatePasswordForm.tsx`**:
  - **Odpowiedzialność**: Zarządzanie stanem pól (hasło, powtórz hasło), walidacja i komunikacja z endpointem `/api/auth/update-password`. Wyświetla komunikat sukcesu po zmianie hasła.

#### 1.3. Walidacja i Obsługa Błędów

- **Schematy Walidacji**: Plik `/src/api/validation/auth.ts` zawiera schematy Zod dla wszystkich formularzy: `loginSchema`, `registerSchema`, `passwordRecoverySchema`, `updatePasswordSchema`.

- **Walidacja Client-Side**: Formularze React użyją biblioteki `zod` do wstępnej walidacji formatu danych (np. poprawność adresu e-mail, minimalna długość hasła).
- **Komunikaty**: Błędy walidacji oraz błędy zwrócone z API (np. "Użytkownik o tym adresie e-mail już istnieje", "Nieprawidłowe dane logowania") będą wyświetlane dynamicznie pod odpowiednimi polami formularza.

#### 1.4. Scenariusze Użytkownika

- **Niezalogowany użytkownik**: Próba wejścia na stronę wymagającą autentykacji (np. `/dashboard`) spowoduje przekierowanie do `/login`.
- **Logowanie**: Po poprawnym zalogowaniu na stronie `/login`, użytkownik zostanie przekierowany na stronę główną (`/`).
- **Rejestracja**: Po poprawnej rejestracji na stronie `/register`, użytkownik zobaczy komunikat o konieczności weryfikacji adresu e-mail. Po kliknięciu w link aktywacyjny w mailu, konto zostanie aktywowane, a użytkownik będzie mógł się zalogować.

### 2. Logika Backendowa

#### 2.1. Middleware (Astro)

- **`/src/middleware/index.ts`**:
  - **Odpowiedzialność**: Przechwytywanie wszystkich żądań. Sprawdzanie, czy użytkownik posiada aktywną sesję (na podstawie ciasteczka Supabase).
  - **Logika**:
    1.  Pobranie sesji z `Astro.cookies`.
    2.  Jeśli sesja nie istnieje, a użytkownik próbuje uzyskać dostęp do chronionej ścieżki (np. `/dashboard`, `/projects/*`), nastąpi przekierowanie do `/login`.
    3.  Jeśli sesja istnieje, dane użytkownika zostaną umieszczone w `context.locals.user`, aby były dostępne w endpointach API i na stronach renderowanych serwerowo.

#### 2.2. Endpointy API (Astro)

Nowe endpointy zostaną utworzone w katalogu `/src/pages/api/auth/`. Będą one pełniły rolę fasady dla Supabase Auth.

- **`POST /api/auth/login`**:
  - **Logika**: Przyjmuje email i hasło. Wywołuje `supabase.auth.signInWithPassword()`. W przypadku sukcesu, Supabase automatycznie zarządza sesją i ustawia odpowiednie ciasteczka.
  - **Walidacja**: Użycie `zod` do walidacji `body` żądania.
- **`POST /api/auth/register`**:
  - **Logika**: Przyjmuje email i hasło. Wywołuje `supabase.auth.signUp()`. Supabase automatycznie wyśle e-mail weryfikacyjny. Po kliknięciu linku przez użytkownika, jego konto zostanie aktywowane.
- **`GET /api/auth/callback`**:
  - **Logika**: Endpoint, na który Supabase przekieruje użytkownika po kliknięciu linku weryfikacyjnego. Odpowiada za wymianę kodu autoryzacyjnego na sesję i ustawienie ciasteczek.
- **`POST /api/auth/logout`**:
  - **Logika**: Wywołuje `supabase.auth.signOut()`. Usuwa sesję i ciasteczka.
- **`POST /api/auth/password-recovery`**:
  - **Logika**: Przyjmuje email. Wywołuje `supabase.auth.resetPasswordForEmail()`.

#### 2.3. Renderowanie Stron

- **`astro.config.mjs`**: Należy upewnić się, że tryb renderowania to `hybrid` lub `server`, aby middleware i endpointy API działały poprawnie.
- **Strony Chronione**: Strony takie jak `index.astro` (główny panel) będą mogły teraz bezpiecznie korzystać z `Astro.locals.user` do pobierania danych specyficznych dla zalogowanego użytkownika, np. listy jego projektów.

### 3. System Autentykacji (Supabase Auth)

- **Konfiguracja Supabase**:
  - **Provider E-mail**: Będzie głównym i jedynym dostawcą autentykacji.
  - **Potwierdzenie E-mail**: Zostanie włączone (`Secure email confirmation` w panelu Supabase), aby wymagać od użytkowników weryfikacji adresu e-mail przed uzyskaniem dostępu do aplikacji.
  - **Szablony E-mail**: Szablony do potwierdzenia adresu e-mail i odzyskiwania hasła zostaną dostosowane, aby zawierały linki do odpowiednich stron w naszej aplikacji (`/api/auth/callback` oraz `/update-password`).
- **Integracja z Astro**:
  - Klient Supabase (`/src/db/supabase.client.ts`) będzie wykorzystywany zarówno po stronie serwera (w middleware i API), jak i klienta (w komponentach React).
  - Zarządzanie sesją będzie oparte o mechanizm ciasteczek Supabase, co jest bezpieczniejsze i zgodne z renderowaniem serwerowym w Astro. Helper `@supabase/ssr` zostanie użyty do poprawnej obsługi sesji w środowisku serwerowym Astro.
