# Plan implementacji widoku Dashboard

## 1. Przegląd

Widok Dashboard jest głównym ekranem, który użytkownik widzi po zalogowaniu. Jego podstawowym celem jest wyświetlenie listy projektów, do których użytkownik ma dostęp. Umożliwia on szybką nawigację do poszczególnych projektów. Dodatkowo, dla użytkowników z uprawnieniami (Menedżer Projektu, Administrator) widok ten udostępnia funkcjonalność tworzenia nowych projektów.

## 2. Routing widoku

Widok będzie dostępny pod główną ścieżką aplikacji:

- **Ścieżka**: `/`
- **Plik**: `src/pages/index.astro`

## 3. Struktura komponentów

Hierarchia komponentów dla tego widoku będzie zorganizowana w następujący sposób, wykorzystując Astro do renderowania strony i React do części interaktywnych.

```
- src/pages/index.astro (Strona główna)
  - src/components/dashboard/ProjectList.tsx (Komponent React)
    - src/components/dashboard/ProjectCard.tsx (Komponent React)
    - src/components/dashboard/CreateProjectModal.tsx (Komponent React)
      - src/components/ui/button.tsx (Komponent Shadcn/ui)
      - src/components/ui/input.tsx (Komponent Shadcn/ui)
      - ... (inne komponenty UI z Shadcn/ui dla modala)
```

## 4. Szczegóły komponentów

### `ProjectList.tsx`

- **Opis komponentu**: Główny komponent React odpowiedzialny za pobranie i wyświetlenie listy projektów. Zarządza stanem listy, obsługuje ładowanie danych, stany błędów oraz widoczność modala do tworzenia nowego projektu.
- **Główne elementy**: Nagłówek (`h1`), siatka (`div` z gridem Tailwind CSS) do wyświetlania kart projektów, przycisk "Utwórz nowy projekt" oraz komponent `CreateProjectModal`.
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku "Utwórz nowy projekt" otwiera `CreateProjectModal`.
  - Po pomyślnym utworzeniu projektu, lista jest odświeżana, aby pokazać nowy projekt.
- **Warunki walidacji**: Brak bezpośredniej walidacji; komponent deleguje walidację do `CreateProjectModal`.
- **Typy**: `ProjectDto[]`, `User`.
- **Propsy**:
  - `initialProjects: ProjectDto[]`
  - `user: User`

### `ProjectCard.tsx`

- **Opis komponentu**: Karta reprezentująca pojedynczy projekt na liście. Jest linkiem prowadzącym do tablicy Kanban danego projektu.
- **Główne elementy**: Element `a` (link) stylizowany na kartę, zawierający nazwę projektu (`h3`).
- **Obsługiwane interakcje**:
  - Kliknięcie karty nawiguje użytkownika do `/projects/{projectId}`.
- **Warunki walidacji**: Brak.
- **Typy**: `ProjectDto`.
- **Propsy**:
  - `project: ProjectDto`

### `CreateProjectModal.tsx`

- **Opis komponentu**: Modal (okno dialogowe) zawierający formularz do tworzenia nowego projektu.
- **Główne elementy**: Komponenty z biblioteki `shadcn/ui` takie jak `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Input`, `Button`.
- **Obsługiwane interakcje**:
  - Wprowadzanie nazwy projektu w polu tekstowym.
  - Kliknięcie przycisku "Utwórz" w celu wysłania formularza.
  - Zamknięcie modala.
- **Obsługiwana walidacja**:
  - Nazwa projektu jest wymagana.
  - Nazwa projektu musi mieć od 3 do 120 znaków (zgodnie z `createProjectSchema`).
  - Usuwanie białych znaków z początku i końca nazwy.
  - Normalizacja wielokrotnych spacji do pojedynczych.
- **Typy**: `CreateProjectCommand`, `ProjectDetailsDto`.
- **Propsy**:
  - `isOpen: boolean`
  - `onOpenChange: (isOpen: boolean) => void`
  - `onProjectCreated: (newProject: ProjectDetailsDto) => void`

## 5. Typy

Do implementacji widoku potrzebne będą następujące typy danych:

- **`ProjectDto`**: (istniejący w `src/types.ts`) Używany do wyświetlania informacji o projekcie na karcie.
  ```typescript
  export type ProjectDto = Pick<Project, "id" | "name" | "owner_id" | "created_at">;
  ```
- **`CreateProjectCommand`**: (istniejący w `src/types.ts`) Używany jako ciało żądania `POST /api/projects`.
  ```typescript
  export type CreateProjectCommand = Pick<Project, "name">;
  ```
- **`ProjectDetailsDto`**: (istniejący w `src/types.ts`) Reprezentuje odpowiedź z API po utworzeniu projektu.
  ```typescript
  export type ProjectDetailsDto = Project;
  ```
- **`User`**: (istniejący w `src/types.ts`) Potrzebny do sprawdzenia roli użytkownika i warunkowego wyświetlenia przycisku "Utwórz nowy projekt".

## 6. Zarządzanie stanem

Zarządzanie stanem będzie realizowane wewnątrz komponentu `ProjectList.tsx` przy użyciu hooków React.

- **`projects: ProjectDto[]`**: Stan przechowujący listę projektów do wyświetlenia. Inicjalizowany z `initialProjects`.
- **`isModalOpen: boolean`**: Stan kontrolujący widoczność `CreateProjectModal`.
- **`isLoading: boolean`**: Stan wskazujący, czy trwa proces tworzenia nowego projektu.
- **`error: string | null`**: Stan przechowujący komunikaty o błędach z API.

Nie ma potrzeby tworzenia dedykowanego hooka (`useDashboard`), ponieważ logika jest stosunkowo prosta i zamknięta w obrębie jednego głównego komponentu.

## 7. Integracja API

Widok będzie korzystał z dwóch endpointów API:

1.  **Pobieranie projektów (po stronie serwera w Astro)**:
    - **Endpoint**: `GET /api/projects`
    - **Akcja**: Wywołanie w `src/pages/index.astro` w celu pobrania początkowej listy projektów. Dane te zostaną przekazane jako `props` do komponentu `ProjectList.tsx`.
    - **Typ odpowiedzi**: `{ data: ProjectDto[] }` (zakładając paginację lub prostą tablicę).

2.  **Tworzenie nowego projektu (po stronie klienta w React)**:
    - **Endpoint**: `POST /api/projects`
    - **Akcja**: Wywołanie `fetch` z komponentu `CreateProjectModal.tsx` po walidacji i zatwierdzeniu formularza.
    - **Typ żądania**: `CreateProjectCommand`
    - **Typ odpowiedzi**: `ProjectDetailsDto`

## 8. Interakcje użytkownika

- **Użytkownik (każda rola)**:
  - Widzi listę projektów, do których należy.
  - Klika na kartę projektu, co przenosi go na stronę `/projects/{projectId}`.
- **Użytkownik (Menedżer Projektu / Administrator)**:
  - Widzi przycisk "Utwórz nowy projekt".
  - Klika przycisk, co otwiera modal `CreateProjectModal`.
  - Wpisuje nazwę projektu i klika "Utwórz".
  - Po pomyślnym utworzeniu, modal zamyka się, a nowa karta projektu pojawia się na liście.

## 9. Warunki i walidacja

- **Widoczność przycisku "Utwórz nowy projekt"**: Przycisk i funkcjonalność tworzenia projektu są dostępne tylko dla użytkowników z rolą `project_manager` lub `administrator`. Ta weryfikacja odbywa się w komponencie `ProjectList.tsx` na podstawie `propsa` `user`.
- **Walidacja formularza tworzenia projektu**: Realizowana w `CreateProjectModal.tsx` przy użyciu biblioteki `zod` i schemy `createProjectSchema`. Przycisk "Utwórz" jest nieaktywny, dopóki warunki nie zostaną spełnione. Komunikaty o błędach są wyświetlane pod polem `Input`.

## 10. Obsługa błędów

- **Błąd pobierania listy projektów**: Jeśli `index.astro` nie otrzyma danych, powinien wyświetlić komunikat o błędzie lub pusty stan.
- **Błąd tworzenia projektu**:
  - W przypadku błędu sieciowego lub odpowiedzi serwera z kodem 5xx, w modalu zostanie wyświetlony ogólny komunikat o błędzie.
  - W przypadku błędu walidacji (400), komunikat powinien wskazywać na problem z nazwą.
  - W przypadku braku uprawnień (403), użytkownik powinien zobaczyć stosowny komunikat, chociaż ten scenariusz nie powinien wystąpić przy poprawnej logice UI.
- **Pusta lista projektów**: Jeśli użytkownik nie należy do żadnego projektu, `ProjectList.tsx` powinien wyświetlić informację "Nie należysz jeszcze do żadnego projektu" zamiast pustej siatki.

## 11. Kroki implementacji

1.  **Stworzenie komponentu `ProjectCard.tsx`**: Zaimplementuj komponent karty projektu, który przyjmuje `project: ProjectDto` i renderuje link (`<a>`) do strony projektu.
2.  **Stworzenie komponentu `CreateProjectModal.tsx`**:
    - Zbuduj UI modala przy użyciu komponentów `Dialog` z `shadcn/ui`.
    - Zintegruj formularz z `zod` (`createProjectSchema`) do walidacji.
    - Zaimplementuj logikę wysyłania żądania `POST /api/projects`.
    - Dodaj obsługę stanu ładowania i błędów.
    - Wywołaj `onProjectCreated` po pomyślnym utworzeniu projektu.
3.  **Stworzenie komponentu `ProjectList.tsx`**:
    - Zaimplementuj logikę zarządzania stanem (lista projektów, modal).
    - Wyświetl siatkę komponentów `ProjectCard` na podstawie stanu.
    - Dodaj przycisk "Utwórz nowy projekt" i warunkowo go wyświetlaj na podstawie roli użytkownika.
    - Zintegruj `CreateProjectModal` i zarządzaj jego otwieraniem/zamykaniem.
    - Zaimplementuj funkcję `onProjectCreated`, która aktualizuje stan listy projektów.
4.  **Aktualizacja strony `src/pages/index.astro`**:
    - Pobierz dane zalogowanego użytkownika i listę projektów z `Astro.locals`.
    - Przekaż pobrane dane (`initialProjects` i `user`) jako propsy do komponentu `<ProjectList client:load />`.
    - Zadbaj o obsługę sytuacji, gdy użytkownik nie jest zalogowany (przekierowanie do logowania).
5.  **Stylowanie**: Użyj Tailwind CSS, aby ostylować wszystkie komponenty zgodnie z designem, dbając o responsywność.
6.  **Testowanie**: Przetestuj wszystkie interakcje, walidację formularza oraz obsługę błędów i przypadków brzegowych.
