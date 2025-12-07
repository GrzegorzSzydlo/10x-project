# Plan Testów dla ProjectFlow

## 1. Wprowadzenie i cele testowania

Celem niniejszego planu jest zapewnienie wysokiej jakości oprogramowania ProjectFlow poprzez systematyczną weryfikację funkcjonalności, bezpieczeństwa i wydajności. Głównym priorytetem jest zagwarantowanie stabilności kluczowych procesów biznesowych (zarządzanie projektami i zadaniami) oraz bezpieczeństwa danych użytkowników.

## 2. Zakres testów

Plan obejmuje testowanie:

- **Frontend:** Interfejs użytkownika, interakcje (React), renderowanie (Astro), responsywność.
- **Backend/API:** Endpointy Astro, walidacja danych, kody odpowiedzi HTTP.
- **Baza Danych:** Integralność danych, triggery, polityki bezpieczeństwa (RLS) w Supabase.
- **Integracja:** Współpraca między komponentami Astro, React i Supabase.

**Wyłączenia:** Testy obciążeniowe (na obecnym etapie MVP), testy penetracyjne zewnętrzne.

## 3. Typy testów

1.  **Testy Jednostkowe (Unit Tests):**
    - Logika biznesowa w `src/lib`.
    - Utility functions (`utils.ts`).
    - Izolowane komponenty React (np. `ProjectCard`, formularze).
2.  **Testy Integracyjne (Integration Tests):**
    - Endpointy API (`src/pages/api/*`) w połączeniu z testową instancją bazy danych.
    - Weryfikacja polityk RLS (czy zapytania zwracają poprawne dane dla danej roli).
3.  **Testy End-to-End (E2E):**
    - Pełne ścieżki użytkownika w przeglądarce (od logowania do utworzenia zadania).
    - Weryfikacja krytycznych interakcji UI (Drag & Drop na tablicy Kanban).

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### A. Uwierzytelnianie i Autoryzacja

- **TC-AUTH-01:** Rejestracja nowego użytkownika (poprawne dane).
- **TC-AUTH-02:** Próba rejestracji na istniejący email (walidacja).
- **TC-AUTH-03:** Logowanie i przekierowanie do Dashboardu.
- **TC-AUTH-04:** Próba dostępu do chronionej trasy (`/projects/*`) bez logowania (Middleware check).

### B. Zarządzanie Projektami

- **TC-PROJ-01:** Utworzenie nowego projektu (weryfikacja wpisu w DB i przekierowania).
- **TC-PROJ-02:** Wyświetlanie listy projektów (tylko projekty, do których użytkownik ma dostęp).
- **TC-PROJ-03:** Dodanie członka do projektu i weryfikacja jego uprawnień.

### C. Tablica Kanban i Zadania

- **TC-TASK-01:** Dodanie nowego zadania do kolumny "To Do".
- **TC-TASK-02:** Przeniesienie zadania między kolumnami (Drag & Drop) -> weryfikacja zmiany statusu w DB.
- **TC-TASK-03:** Edycja szczegółów zadania (tytuł, opis).
- **TC-TASK-04:** Usuwanie zadania.

## 5. Środowisko testowe

- **Lokalne (Local):** Maszyna deweloperska, lokalna instancja Supabase (Docker).
- **CI (Continuous Integration):** GitHub Actions uruchamiające testy na każdym Pull Request.
- **Baza danych testowa:** Oddzielna instancja lub schemat Supabase, resetowany przed każdym uruchomieniem testów E2E/Integracyjnych.

## 6. Narzędzia do testowania

- **Unit & Integration:** `Vitest` (kompatybilny z ekosystemem Vite/Astro).
- **Component Testing:** `React Testing Library` (w ramach Vitest).
- **E2E:** `Playwright` (zalecany dla nowoczesnych aplikacji webowych, świetna obsługa wielu kart i uwierzytelniania).
- **Baza Danych:** `supabase-js` (klient do setupu danych testowych).

## 7. Harmonogram testów

- **Testy Jednostkowe:** Pisane na bieżąco przez programistów (TDD lub równolegle z kodem).
- **Testy Integracyjne:** Uruchamiane automatycznie w CI przy każdym PR.
- **Testy E2E:** Uruchamiane w CI przed mergem do gałęzi `main` oraz nocne przebiegi (nightly builds).

## 8. Kryteria akceptacji testów

- **Pass Rate:** 100% dla testów jednostkowych i integracyjnych w CI.
- **Pokrycie kodu (Code Coverage):** Minimum 70% dla logiki biznesowej (`src/lib`, `src/pages/api`).
- **Brak błędów krytycznych (Critical/Blocker):** Żaden znany błąd krytyczny nie może trafić na produkcję.

## 9. Role i odpowiedzialności

- **Developerzy:** Pisanie testów jednostkowych i integracyjnych dla swoich funkcjonalności.
- **QA Engineer / Lead Dev:** Konfiguracja środowiska testowego, pisanie scenariuszy E2E, review testów, monitorowanie wyników CI.

## 10. Procedury raportowania błędów

Błędy wykryte podczas testów powinny być zgłaszane w systemie śledzenia (np. GitHub Issues) z następującymi informacjami:

1.  **Tytuł:** Zwięzły opis problemu.
2.  **Kroki do reprodukcji:** Dokładna instrukcja "krok po kroku".
3.  **Oczekiwany rezultat:** Co powinno się stać.
4.  **Rzeczywisty rezultat:** Co się stało (w tym zrzuty ekranu/logi).
5.  **Priorytet:** Określenie pilności naprawy.
6.  **Środowisko:** Przeglądarka, wersja systemu, wersja aplikacji.
