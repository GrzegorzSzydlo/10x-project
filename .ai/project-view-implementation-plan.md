# Plan implementacji widoku Project View

## 1. Przegląd

Widok "Project View" (`/projects/{projectId}`) stanowi centralny hub zarządzania projektem. Jego głównym celem jest umożliwienie użytkownikom śledzenia postępów prac (poprzez tablicę Kanban), zarządzania zadaniami (CRUD, podzadania, statusy) oraz dostępu do powiązanych zasobów (kamienie milowe, członkowie). Widok łączy statyczny rendering (Astro) dla struktury i SEO z dynamicznym interfejsem (React) dla interaktywności.

## 2. Routing widoku

- **Ścieżka:** `/projects/[id]` (Astro dynamic route)
- **Middleware:** Weryfikacja sesji użytkownika oraz sprawdzenie, czy użytkownik jest członkiem projektu o danym `id` (zwraca 404/403 jeśli nie).

## 3. Struktura komponentów

```text
src/pages/projects/[id].astro (Server-side root)
└── Layout.astro (Główny layout aplikacji)
    └── ProjectWorkspace (React Client Component - hydrating)
        ├── ProjectHeader (Nazwa projektu, breadcrumbs)
        ├── Tabs (Navigation: Kanban, Milestones, Members, Settings)
        │   ├── TabsList
        │   └── TabsContent (Kanban)
        │       ├── KanbanToolbar (Filters, "Add Task" button)
        │       ├── KanbanBoard (DndContext)
        │       │   ├── KanbanColumn (Droppable "To Do")
        │       │   │   └── TaskCard (Draggable)
        │       │   ├── KanbanColumn (Droppable "In Progress")
        │       │   ├── ...
        │       │   └── DragOverlay (Podgląd przeciągania)
        │       └── TaskSheet (Slide-over form for Create/Edit)
        │           └── TaskForm
        ├── TabsContent (Milestones)
        │   └── MilestoneList
        └── TabsContent (Members)
            └── MemberList
```

## 4. Szczegóły komponentów

### `src/pages/projects/[id].astro`

- **Rola:** Entry point. Pobiera dane projektu (ID, nazwa, właściciel) po stronie serwera. Weryfikuje uprawnienia. Przekazuje wstępne dane do komponentu React (`ProjectWorkspace`).
- **Główne elementy:** `Layout`, `ProjectWorkspace`.
- **Props:** Brak (pobiera parametry z URL).

### `ProjectWorkspace` (`src/components/dashboard/ProjectWorkspace.tsx`)

- **Rola:** Główny kontener stanu aplikacji klienckiej. Inicjalizuje QueryClientProvider (jeśli używany React Query) lub kontekst projektu.
- **Props:** `initialProjectData: ProjectDetailsDto`.
- **Stan:** Aktywna zakładka (domyślnie "board").

### `KanbanBoard` (`src/components/dashboard/board/KanbanBoard.tsx`)

- **Opis:** Zarządza logiką Drag & Drop (używając np. `@dnd-kit/core`).
- **Obsługiwane interakcje:** `onDragStart`, `onDragOver`, `onDragEnd`.
- **Walidacja:** Sprawdza regułę "Blokada przeniesienia do Done, jeśli podzadania są nieukończone" w `onDragEnd` przed wysłaniem żądania.
- **Stan:** Lokalne odwzorowanie zadań na kolumny (optymistyczne UI).

### `KanbanColumn`

- **Props:** `status: TaskStatus`, `tasks: TaskCardDto[]`.
- **Rola:** Kontener renderujący listę zadań dla danego statusu. Sortowalna lista (`SortableContext`).

### `TaskCard`

- **Props:** `task: TaskCardDto`.
- **Wygląd:** Karta z tytułem, awatarem przypisanej osoby, identyfikatorem wizualnym priorytetu/typu, licznikiem podzadań. Kliknięcie otwiera `TaskSheet` w trybie edycji.
- **Dostępność:** Obsługa klawiatury do przenoszenia zadań.

### `TaskSheet` / `TaskForm`

- **Opis:** Komponent typu Sheet (z shadcn/ui) lub Dialog zawierający formularz. Służy do tworzenia nowego zadania oraz edycji istniejącego.
- **Tryby:** Create (pusty formularz), Edit (wypełniony danymi).
- **Walidacja:** `zod` schema (tytuł wymagany).
- **Pola:** Tytuł, Opis (Textarea), Przypisana osoba (Select), Kamień milowy (Select), Data (DatePicker), Zadanie nadrzędne (tylko w trybie edycji/tworzenia podzadania).

## 5. Typy

Wymagane rozszerzenie typów z pliku `types.ts` o typy specyficzne dla widoku (ViewModel):

```typescript
// Typy pomocnicze dla stanu Kanbanu
export type KanbanColumns = {
  [key in TaskStatus]: TaskCardDto[];
};

// DTO dla formularza (Zod inference)
export type TaskFormValues = {
  title: string;
  description?: string;
  assignee_id?: string;
  milestone_id?: string;
  due_date?: Date;
  status: TaskStatus;
  parent_task_id?: string;
};
```

## 6. Zarządzanie stanem

Zalecane użycie biblioteki **TanStack Query (React Query)** do zarządzania stanem asynchronicznym (zadania, milestony):

- `useProjectTasks(projectId)`: Pobiera zadania pogrupowane statusami.
- `useTaskMutation()`: Hooki do `createTask`, `updateTask` (patch), `moveTask` (optymistyczne update'y pozycji i statusu).

Lokalny stan w `KanbanBoard`:

- `activeDragItem`: Zadanie aktualnie "trzymane" przez kursor (dla `DragOverlay`).

## 7. Integracja API

Integracja poprzez serwisy w `src/lib/api/` wywoływane przez React Query:

1.  **Pobranie zadań:**
    - `GET /api/projects/{projectId}/tasks`
    - Response: `{ "To Do": [...], "In Progress": [...] }` (zgodnie z API Plan).
2.  **Utworzenie zadania:**
    - `POST /api/projects/{projectId}/tasks`
    - Body: `CreateTaskCommand`.
3.  **Aktualizacja zadania (Przesunięcie/Edycja):**
    - `PATCH /api/tasks/{taskId}`
    - Body: `{ status: 'done', display_order: 2.5 }` lub pełne dane edycji.
4.  **Pobranie słowników:**
    - `GET /api/projects/{projectId}/members` (do selecta w formularzu).
    - `GET /api/projects/{projectId}/milestones` (do selecta w formularzu).

## 8. Interakcje użytkownika

1.  **Przeciąganie karty (Zmiana statusu):** Użytkownik chwyta kartę z "To Do" i upuszcza w "In Progress".
    - _Akcja:_ UI natychmiast przenosi kartę. API request leci w tle.
2.  **Zmiana kolejności (Reorder):** Użytkownik przesuwa kartę w górę w tej samej kolumnie.
    - _Akcja:_ Obliczenie nowego `display_order` (średnia z sąsiadów). API request `PATCH`.
3.  **Kliknięcie "Dodaj zadanie":** Otwiera pusty formularz. Domyślny status to kolumna, z której kliknięto plusa (lub "To Do").
4.  **Edycja:** Kliknięcie w kartę otwiera panel boczny. Zmiana pól triggeruje `PATCH` po kliknięciu "Zapisz".

## 9. Warunki i walidacja

- **Blokada "Done":** Jeśli zadanie nadrzędne jest przenoszone do "Done", frontend sprawdza, czy wszystkie jego podzadania (jeśli są załadowane/dostępne w kontekście) są w "Done". Jeśli nie -> Toast error "Ukończ najpierw podzadania". API również zwróci 400.
- **Wymagane pola:** Tytuł zadania jest obowiązkowy.
- **Uprawnienia:** Tylko członkowie projektu mogą edytować/tworzyć (API zwróci 403, ale UI powinno ukryć przyciski edycji dla viewerów, jeśli tacy istnieją - w MVP wszyscy członkowie mają prawa edycji).

## 10. Obsługa błędów

- **Błąd ładowania:** Wyświetlenie komponentu `ErrorState` zamiast tablicy, z przyciskiem "Spróbuj ponownie".
- **Błąd zapisu (Optymistyczne UI):** Jeśli przesunięcie karty nie uda się na serwerze (np. brak sieci, błąd walidacji biznesowej 400), karta musi "wrócić" na swoje pierwotne miejsce, a użytkownik otrzymuje powiadomienie (Toast "Nie udało się zaktualizować zadania").
- **404 Project:** Przekierowanie na stronę listy projektów lub dedykowana strona 404.

## 11. Kroki implementacji

1.  **Setup Backend/Types:** Upewnienie się, że typy DB i DTO w `src/types.ts` są zgodne z `types` w planie.
2.  **Page Shell:** Utworzenie `src/pages/projects/[id].astro` z pobieraniem danych projektu.
3.  **UI Components:** Implementacja `ProjectWorkspace`, `ProjectHeader`, `Tabs` używając Shadcn/ui.
4.  **Kanban Logic (Read):**
    - Stworzenie serwisu API do pobierania zadań.
    - Implementacja `KanbanBoard` wyświetlającego kolumny i karty (statycznie).
5.  **DND Implementation:**
    - Integracja `@dnd-kit`.
    - Obsługa zdarzeń drag and drop (tylko lokalny stan).
6.  **Mutations (Write):**
    - Obsługa obliczania `display_order`.
    - Podłączenie API `PATCH` do zdarzeń dnd.
    - Obsługa błędów i rollbacku stanu.
7.  **Task Management (Forms):**
    - Implementacja `TaskSheet`/Dialog.
    - Podłączenie `POST` (Create) i `PATCH` (Edit).
    - Pobieranie listy członków i milestonów do selectów.
8.  **Refinement:**
    - Dodanie filtrów (Assignee/Milestone).
    - Stylowanie i dopracowanie UX (loading states, skeletons).
