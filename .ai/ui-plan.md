# Architektura UI dla ProjectFlow

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla ProjectFlow została zaprojektowana jako aplikacja jednostronicowa (SPA), aby zapewnić płynne i responsywne doświadczenie użytkownika, minimalizując przeładowania strony. Głównym założeniem jest stworzenie intuicyjnego i skoncentrowanego na zadaniach środowiska, które centralizuje zarządzanie projektami.

Struktura opiera się na następujących filarach:

- **Architektura oparta na rolach**: Interfejs dynamicznie dostosowuje się do jednej z trzech ról użytkownika (Administrator, Menedżer Projektu, Członek Zespołu), ukrywając lub pokazując określone elementy nawigacji i funkcjonalności.
- **Nawigacja boczna i kontekstowa**: Główna nawigacja boczna zapewnia dostęp do kluczowych obszarów aplikacji (Dashboard, Zarządzanie użytkownikami). Wewnątrz widoku projektu, nawigacja oparta na zakładkach (tabs) pozwala na łatwe przełączanie się między tablicą Kanban, kamieniami milowymi, członkami i ustawieniami.
- **Komponenty modułowe**: UI jest zbudowane z reużywalnych komponentów React (np. `TaskCard`, `KanbanBoard`, `TaskModal`), co zapewnia spójność wizualną i ułatwia rozwój.
- **Interaktywność i optymistyczne aktualizacje**: Kluczowe interakcje, takie jak przeciąganie zadań (drag & drop) na tablicy Kanban, wykorzystują optymistyczne aktualizacje UI, aby zapewnić natychmiastową informację zwrotną, podczas gdy dane są synchronizowane z serwerem w tle.

## 2. Lista widoków

### Widok: Logowanie / Rejestracja

- **Nazwa widoku**: Authentication View
- **Ścieżka widoku**: `/login`, `/register`
- **Główny cel**: Umożliwienie nowym użytkownikom rejestracji, a istniejącym zalogowania się do aplikacji.
- **Kluczowe informacje do wyświetlenia**: Formularze z polami na e-mail i hasło.
- **Kluczowe komponenty widoku**: `AuthForm`, `Button`, `Input`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Jasne komunikaty o błędach walidacji (np. "Hasło jest za krótkie", "Użytkownik o tym e-mailu już istnieje"). Automatyczne przekierowanie do dashboardu po pomyślnym logowaniu/rejestracji.
  - **Dostępność**: Poprawne etykiety (`<label>`) dla pól formularza, obsługa nawigacji klawiaturą.
  - **Bezpieczeństwo**: Komunikacja z API przez HTTPS.

### Widok: Dashboard (Lista projektów)

- **Nazwa widoku**: Dashboard View
- **Ścieżka widoku**: `/`
- **Główny cel**: Wyświetlenie listy projektów, do których użytkownik ma dostęp, oraz umożliwienie Menedżerom Projektu tworzenia nowych projektów.
- **Kluczowe informacje do wyświetlenia**: Lista kart projektów z ich nazwami. Przycisk "Utwórz nowy projekt" (widoczny dla Menedżerów i Adminów).
- **Kluczowe komponenty widoku**: `ProjectCard`, `Button`, `CreateProjectModal`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Czytelna i łatwa do skanowania lista projektów. Kliknięcie w kartę projektu przenosi bezpośrednio do jego tablicy Kanban.
  - **Dostępność**: Karty projektów zaimplementowane jako linki, co umożliwia nawigację klawiaturą.
  - **Bezpieczeństwo**: API (`GET /projects`) zwraca tylko projekty, do których użytkownik jest przypisany, zgodnie z polityką RLS w Supabase.

### Widok: Projekt

- **Nazwa widoku**: Project View
- **Ścieżka widoku**: `/projects/{projectId}`
- **Główny cel**: Centralny obszar roboczy dla pojedynczego projektu, z nawigacją po jego kluczowych sekcjach.
- **Kluczowe informacje do wyświetlenia**: Nazwa projektu, nawigacja w formie zakładek (Tabs).
- **Kluczowe komponenty widoku**: `Tabs` (Kanban, Milestones, Members, Settings), `KanbanBoard`, `MilestoneList`, `MembersList`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Utrzymanie kontekstu projektu podczas przełączania się między zakładkami. Domyślnie aktywna zakładka to "Kanban".
  - **Dostępność**: Zakładki zaimplementowane zgodnie ze standardami ARIA (`role="tablist"`).
  - **Bezpieczeństwo**: Dostęp do ścieżki chroniony przez middleware w Astro, który weryfikuje przynależność użytkownika do projektu.

#### Pod-widok: Tablica Kanban

- **Ścieżka**: `/projects/{projectId}/kanban` (domyślna)
- **Cel**: Wizualizacja i zarządzanie zadaniami w projekcie.
- **Komponenty**: `KanbanBoard`, `KanbanColumn`, `TaskCard`, `SubtaskCard`, `FilterBar`, `TaskModal`.
- **Interakcje**: Przeciąganie zadań między kolumnami (zmiana statusu) i wewnątrz kolumn (zmiana priorytetu). Otwieranie modala zadania po kliknięciu na kartę.

#### Pod-widok: Kamienie Milowe (Milestones)

- **Ścieżka**: `/projects/{projectId}/milestones`
- **Cel**: Zarządzanie kamieniami milowymi projektu (tworzenie, edycja).
- **Komponenty**: `MilestoneList`, `MilestoneItem`, `CreateMilestoneModal`.
- **Interakcje**: Dodawanie i edycja kamieni milowych (funkcjonalność dostępna dla Menedżerów Projektu).

#### Pod-widok: Członkowie (Members)

- **Ścieżka**: `/projects/{projectId}/members`
- **Cel**: Zarządzanie członkami projektu.
- **Komponenty**: `MembersList`, `MemberItem`, `AddMemberForm`.
- **Interakcje**: Dodawanie i usuwanie użytkowników z projektu (dla Menedżerów Projektu).

### Widok: Zarządzanie Użytkownikami (Admin)

- **Nazwa widoku**: User Management View
- **Ścieżka widoku**: `/admin/users`
- **Główny cel**: Umożliwienie Administratorom zarządzania rolami użytkowników.
- **Kluczowe informacje do wyświetlenia**: Tabela z listą użytkowników, ich rolami i opcją zmiany roli.
- **Kluczowe komponenty widoku**: `UsersTable`, `RoleSelector`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Prosta tabela z możliwością wyszukiwania/filtrowania użytkowników. Potwierdzenie akcji zmiany roli.
  - **Dostępność**: Tabela z odpowiednimi nagłówkami (`<th>`) i strukturą.
  - **Bezpieczeństwo**: Widok dostępny wyłącznie dla użytkowników z rolą `administrator`. Dostęp chroniony na poziomie routingu (middleware).

## 3. Mapa podróży użytkownika

Główny przepływ pracy dla **Członka Zespołu**:

1.  **Logowanie**: Użytkownik wchodzi na `/login`, podaje dane i zostaje przekierowany na `/`.
2.  **Wybór projektu**: Na Dashboardzie użytkownik widzi listę swoich projektów. Klika na projekt "Nowa kampania marketingowa".
3.  **Praca na tablicy Kanban**: Użytkownik ląduje na `/projects/{id-projektu}/kanban`.
    - Klika przycisk "Dodaj zadanie", co otwiera `TaskModal`. Wypełnia tytuł "Stworzyć grafikę" i zapisuje. Zadanie pojawia się w kolumnie "To Do".
    - Przeciąga nowo utworzone zadanie z "To Do" do "In Progress". UI natychmiast odzwierciedla zmianę (optimistic update), a w tle wysyłane jest żądanie `PATCH /tasks/{taskId}`.
    - Klika na zadanie, aby otworzyć `TaskModal` w trybie edycji. Dodaje podzadanie "Przygotować wersję na social media".
4.  **Filtrowanie**: Użytkownik używa `FilterBar` na górze tablicy, aby wyświetlić tylko zadania przypisane do siebie.
5.  **Wylogowanie**: Użytkownik klika na swój awatar w nawigacji i wybiera "Wyloguj".

## 4. Układ i struktura nawigacji

- **Główny układ**: Aplikacja będzie miała stałą, pionową nawigację boczną po lewej stronie i główny obszar treści po prawej.
  - **Nawigacja boczna (szerokość 250px)**: Zawiera logo aplikacji, linki do głównych widoków oraz profil użytkownika z opcją wylogowania. Linki są dynamicznie renderowane na podstawie roli użytkownika:
    - Wszyscy: Dashboard.
    - Administrator: Dashboard, Zarządzanie Użytkownikami.
  - **Obszar treści**: Zajmuje resztę dostępnej przestrzeni. W tym obszarze renderowane są poszczególne widoki.
- **Nawigacja wewnątrz projektu**: Po wejściu do widoku projektu, nad główną treścią pojawia się poziomy pasek zakładek (Tabs), umożliwiający przełączanie się między `Kanban`, `Milestones`, `Members` i `Settings`. Zapewnia to spójny i przewidywalny sposób poruszania się w kontekście jednego projektu.

## 5. Kluczowe komponenty

- **`KanbanBoard`**: Główny kontener tablicy Kanban, zarządzający stanem kolumn i logiką drag & drop.
- **`KanbanColumn`**: Reprezentuje jedną kolumnę statusu (np. "To Do"). Renderuje listę `TaskCard`.
- **`TaskCard`**: Karta reprezentująca pojedyncze zadanie. Wyświetla tytuł, przypisaną osobę i inne kluczowe informacje. Jest elementem przeciąganym.
- **`TaskModal`**: Modal do tworzenia i edycji zadań oraz ich podzadań. Zawiera formularz z wszystkimi polami zadania oraz zakładkę do przeglądania historii zmian.
- **`FilterBar`**: Pasek narzędzi nad tablicą Kanban, zawierający rozwijane menu do filtrowania zadań po przypisanym użytkowniku i kamieniu milowym.
- **`SideNav`**: Komponent nawigacji bocznej, renderujący linki nawigacyjne w zależności od roli zalogowanego użytkownika.
- **`Toast`**: Komponent do wyświetlania globalnych powiadomień (np. "Zadanie zaktualizowane", "Błąd połączenia z serwerem").
