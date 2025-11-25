# API Endpoint Implementation Plan: POST /projects

## 1. Przegląd punktu końcowego

- Tworzy nowy rekord projektu w `public.projects`, przypisując bieżącego użytkownika jako `owner_id` i dodając go do `project_members`.
- Endpoint będzie zaimplementowany w `src/pages/api/projects/index.ts` z `export const prerender = false`.
- Operacja dostępna wyłącznie dla ról `project_manager` lub `administrator`; użytkownik musi być zalogowany w Supabase.
- Logika tworzenia projektu zostanie wyodrębniona do serwisu `src/lib/services/projects/createProject.ts`, aby umożliwić jej ponowne wykorzystanie i łatwiejsze testowanie.

## 2. Szczegóły żądania

- Metoda HTTP: `POST`
- URL: `/api/projects`
- Nagłówki: `Authorization: Bearer <JWT>`, `Content-Type: application/json`.
- Parametry zapytania: brak.
- Request Body (`CreateProjectCommand`):
  ```json
  {
    "name": "New Marketing Campaign"
  }
  ```
- Walidacja (Zod, zaimplementowana w warstwie API):
  - `name`: `z.string().trim().min(3).max(120)`; dodatkowo normalizujemy wielokrotne spacje.
  - Odrzucić żądania bez `Content-Type: application/json` lub z pustym body (400).
  - Przygotować komunikaty błędów przyjazne użytkownikowi, np. `{"error":"Project name is required"}`.
- Powiązane typy: `CreateProjectCommand` (żądanie), `ProjectDetailsDto` (odpowiedź), `UserRole` (autoryzacja).

## 3. Szczegóły odpowiedzi

- `201 Created` + `application/json` zawierający `ProjectDetailsDto` (wszystkie kolumny `projects`).
- Przykład:
  ```json
  {
    "id": "uuid",
    "name": "New Marketing Campaign",
    "owner_id": "uuid",
    "created_at": "2024-11-25T12:00:00Z",
    "updated_at": "2024-11-25T12:00:00Z"
  }
  ```
- Nagłówki: `Location: /projects/{id}` do łatwiejszej nawigacji klienta.
- Błędy: `400`, `401`, `403`, `500` według sytuacji opisanych poniżej.

## 4. Przepływ danych

1. Astro API route pobiera `locals.supabase` i `locals.session` (ustawiane przez middleware).
2. Sprawdzenie sesji (`401` jeśli brak) i pobranie `authUser.id`.
3. Zapytanie `supabase.from("users").select("role")` ograniczone do `authUser.id` by potwierdzić rolę; brak rekordu => `403`.
4. Walidacja payloadu za pomocą przygotowanego schematu Zod; zwraca `400` z listą błędów.
5. Wywołanie serwisu `createProject({ name }, { ownerId, supabase })`:
   - Serwis tworzy transakcję (preferowana funkcja RPC w SQL) zapisującą rekord w `projects` i odpowiadający wpis w `project_members`.
   - W przypadku braku funkcji RPC: wykonać `projects.insert` i po sukcesie `project_members.insert`, przy niepowodzeniu drugiego kroku wykonać kompensacyjne `projects.delete`.
   - Serwis zwraca świeżo utworzony `ProjectDetailsDto`.
6. API mapuje wynik na odpowiedź HTTP 201; ustawienie `Location` i serializacja JSON.
7. Wszelkie błędy serwisowe są przechwytywane, logowane (patrz punkt bezpieczeństwa) i zwracane w zunifikowanym formacie.

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie**: wymagane ważne Supabase JWT; polegamy na `locals.session`. Brak sesji => `401`.
- **Autoryzacja**: ograniczenie do ról `project_manager` i `administrator` poprzez sprawdzenie pola `role` w tabeli `users`. Dodatkowo RLS w `projects` i `project_members` wymaga obecności właściciela w projekcie.
- **Walidacja danych**: Zod + sanityzacja (trim), by zapobiec SQL injection i niepożądanym wpisom.
- **Ochrona przed duplikacją**: opcjonalnie sprawdzić istnienie projektu o takiej samej nazwie dla tego właściciela (jeśli biznesowo wymagane), w przeciwnym razie opierać się na walidacji użytkownika.
- **Logowanie błędów**: utworzyć helper `logApiError` (np. w `src/lib/services/logging/logApiError.ts`). Jeśli docelowa tabela błędów jeszcze nie istnieje, helper powinien warunkowo zapisywać do niej (kiedy będzie dostępna) lub degradować do `console.error`/monitoringu.
- **Least privilege**: serwis korzysta wyłącznie z `SupabaseClient` dostarczonego przez middleware, co respektuje RLS.

## 6. Obsługa błędów

| Scenariusz                                               | Kod | Komunikat                                                        |
| -------------------------------------------------------- | --- | ---------------------------------------------------------------- |
| Brak uwierzytelnienia (`locals.session` null)            | 401 | `{"error":"Authentication required"}`                            |
| Użytkownik nie ma roli `project_manager`/`administrator` | 403 | `{"error":"Insufficient role"}`                                  |
| Walidacja Zod nie powiodła się                           | 400 | Lista błędów pola `name`                                         |
| Błąd RLS lub insertu w `projects`                        | 500 | `{"error":"Unable to create project"}` + identyfikator zdarzenia |
| Insert `project_members` nie powiódł się                 | 500 | Ten sam komunikat + rollback                                     |
| Nieoczekiwany wyjątek (np. Supabase outage)              | 500 | `{"error":"Internal server error"}`                              |

Dodatkowo: logować każdy błąd w `logApiError({ endpoint: "POST /projects", status, detail })` w celu audytu.

## 7. Wydajność

- Operacja obejmuje dwie krótkie transakcje INSERT; spodziewane opóźnienia są minimalne.
- Utrzymanie jednego zapytania SELECT (pobranie roli) + dwóch INSERT; zadbać o wybór tylko niezbędnych kolumn (`select("role")`).
- Opcjonalnie użyć funkcji PostgreSQL łączącej oba inserty, co gwarantuje atomowość i zmniejsza round-tripy.
- Unikać dodatkowych zapytań (np. listy projektów) w trakcie żądania; walidacja powinna odbywać się w pamięci.

## 8. Kroki implementacji

1. **Schemat wejścia**: dodać/rozszerzyć zależność `zod` (jeśli nie istnieje) i utworzyć `createProjectSchema` w `src/lib/validation/projects.ts`.
2. **Serwis**: utworzyć `src/lib/services/projects/createProject.ts` eksportujący funkcję przyjmującą `SupabaseClient`, `CreateProjectCommand`, `ownerId`; funkcja wykonuje inserty oraz obsługuje rollback/logowanie.
3. **Logger**: dodać helper `logApiError` zapisujący do tabeli błędów (gdy dostępna) lub fallback do `console.error` z identyfikatorem korelacji.
4. **Endpoint**: zaimplementować `POST` w `src/pages/api/projects/index.ts`:
   - import schema, serwisu oraz typów z `src/types.ts`.
   - pobrać sesję, rolę użytkownika, zweryfikować uprawnienia.
   - zwalidować body i w razie potrzeby zwrócić `400`.
   - wywołać serwis i zwrócić `201` z ciałem JSON + nagłówek `Location`.
5. **Dokumentacja**: zaktualizować README/kontrakty API, jeśli wymagane, oraz ewentualne kolekcje HTTP klienta.
6. **Monitorowanie**: upewnić się, że logger jest zintegrowany z obserwacją (np. Sentry) i że identyfikatory błędów są zwracane klientowi dla wsparcia.
