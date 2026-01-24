# Plan Implementacji: Zarządzanie Kamieniami Milowymi (Milestones)

## 1. Przegląd

Ten dokument opisuje plan implementacji funkcjonalności kamieni milowych (milestones) dla aplikacji ProjectFlow. Implementacja obejmuje backend (API), frontend (komponenty i strony) oraz testy, zgodnie z wymaganiami z PRD (US-012, US-013) oraz sekcji 3.5.

## 2. Wymagania Funkcjonalne

### 2.1. Z PRD (Sekcja 3.5)

- Menedżerowie Projektu mogą tworzyć kamienie milowe (z nazwą, opisem i datą) w ramach projektu
- Zadania mogą być przypisywane do kamieni milowych

### 2.2. US-012: Zarządzanie kamieniami milowymi

**Kryteria akceptacji:**

1. Menedżer Projektu ma dostęp do sekcji "Milestones" w ustawieniach projektu
2. Może tworzyć nowy kamień milowy, podając jego nazwę, opis i datę docelową
3. Może edytować i usuwać istniejące kamienie milowe
4. Podczas tworzenia lub edycji zadania można je przypisać do istniejącego kamienia milowego

### 2.3. US-013: Filtrowanie tablicy Kanban (część dotycząca milestones)

**Kryteria akceptacji:**

- Użytkownik może wybrać kamień milowy, aby zobaczyć tylko zadania z nim związane

## 3. Backend Implementation

### 3.1. API Endpoints

#### `GET /api/projects/{projectId}/milestones`

**Opis:** Pobiera wszystkie kamienie milowe dla danego projektu.

**Autoryzacja:**

- Użytkownik musi być członkiem projektu

**Response 200 OK:**

```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "name": "string",
    "description": "string",
    "due_date": "date",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
]
```

**Error Responses:**

- `401 Unauthorized`: Użytkownik nie jest zalogowany
- `403 Forbidden`: Użytkownik nie jest członkiem projektu
- `404 Not Found`: Projekt nie istnieje

**Lokalizacja pliku:** `src/pages/api/projects/[projectId]/milestones/index.ts`

---

#### `POST /api/projects/{projectId}/milestones`

**Opis:** Tworzy nowy kamień milowy w projekcie.

**Autoryzacja:**

- Użytkownik musi mieć rolę `project_manager` lub `administrator`
- Użytkownik musi być członkiem projektu

**Request Body:**

```json
{
  "name": "Q4 Launch",
  "description": "Tasks related to the Q4 product launch.",
  "due_date": "2025-12-31"
}
```

**Response 201 Created:**

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Q4 Launch",
  "description": "Tasks related to the Q4 product launch.",
  "due_date": "2025-12-31",
  "created_at": "timestamptz",
  "updated_at": "timestamptz"
}
```

**Error Responses:**

- `400 Bad Request`: Nieprawidłowe dane wejściowe
- `401 Unauthorized`: Użytkownik nie jest zalogowany
- `403 Forbidden`: Użytkownik nie ma uprawnień (nie jest project_manager/administrator)
- `404 Not Found`: Projekt nie istnieje

**Lokalizacja pliku:** `src/pages/api/projects/[projectId]/milestones/index.ts`

---

#### `PATCH /api/milestones/{milestoneId}`

**Opis:** Aktualizuje istniejący kamień milowy.

**Autoryzacja:**

- Użytkownik musi mieć rolę `project_manager` lub `administrator`
- Użytkownik musi być członkiem projektu, do którego należy milestone

**Request Body** (wszystkie pola opcjonalne):

```json
{
  "name": "string",
  "description": "string",
  "due_date": "date"
}
```

**Response 200 OK:**

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "string",
  "description": "string",
  "due_date": "date",
  "created_at": "timestamptz",
  "updated_at": "timestamptz"
}
```

**Error Responses:**

- `400 Bad Request`: Nieprawidłowe dane wejściowe
- `401 Unauthorized`: Użytkownik nie jest zalogowany
- `403 Forbidden`: Użytkownik nie ma uprawnień
- `404 Not Found`: Milestone nie istnieje

**Lokalizacja pliku:** `src/pages/api/milestones/[milestoneId].ts`

---

#### `DELETE /api/milestones/{milestoneId}`

**Opis:** Usuwa kamień milowy.

**Autoryzacja:**

- Użytkownik musi mieć rolę `project_manager` lub `administrator`
- Użytkownik musi być członkiem projektu, do którego należy milestone

**Response 204 No Content**

**Error Responses:**

- `401 Unauthorized`: Użytkownik nie jest zalogowany
- `403 Forbidden`: Użytkownik nie ma uprawnień
- `404 Not Found`: Milestone nie istnieje
- `409 Conflict`: Milestone ma przypisane zadania (opcjonalna walidacja biznesowa)

**Lokalizacja pliku:** `src/pages/api/milestones/[milestoneId].ts`

---

### 3.2. Walidacja (Zod Schemas)

**Lokalizacja:** `src/api/validation/milestones.ts`

```typescript
import { z } from "zod";

export const createMilestoneSchema = z.object({
  name: z.string().min(1, "Nazwa kamienia milowego jest wymagana").max(255),
  description: z.string().max(1000).optional().nullable(),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Nieprawidłowa data",
  }),
});

export const updateMilestoneSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    due_date: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Nieprawidłowa data",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Przynajmniej jedno pole musi być dostarczone",
  });

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
```

### 3.3. Services

**Lokalizacja:** `src/lib/services/milestones.service.ts`

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { CreateMilestoneInput, UpdateMilestoneInput } from "@/api/validation/milestones";

export class MilestonesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getMilestonesByProject(projectId: string) {
    const { data, error } = await this.supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data;
  }

  async createMilestone(projectId: string, input: CreateMilestoneInput) {
    const { data, error } = await this.supabase
      .from("milestones")
      .insert({
        project_id: projectId,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMilestoneById(milestoneId: string) {
    const { data, error } = await this.supabase
      .from("milestones")
      .select("*, project:projects(id, owner_id)")
      .eq("id", milestoneId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateMilestone(milestoneId: string, input: UpdateMilestoneInput) {
    const { data, error } = await this.supabase
      .from("milestones")
      .update(input)
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMilestone(milestoneId: string) {
    const { error } = await this.supabase.from("milestones").delete().eq("id", milestoneId);

    if (error) throw error;
  }

  async countTasksByMilestone(milestoneId: string) {
    const { count, error } = await this.supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("milestone_id", milestoneId);

    if (error) throw error;
    return count ?? 0;
  }
}
```

### 3.4. Middleware i Helpers

Wykorzystanie istniejących mechanizmów:

- Middleware w `src/middleware/index.ts` do weryfikacji sesji
- Helper do sprawdzania roli użytkownika (do utworzenia w `src/api/utils.ts`)

**Lokalizacja:** `src/api/utils.ts` (rozszerzenie)

```typescript
export async function checkProjectManager(supabase: SupabaseClient<Database>, userId: string): Promise<boolean> {
  const { data } = await supabase.from("users").select("role").eq("id", userId).single();

  return data?.role === "project_manager" || data?.role === "administrator";
}

export async function checkProjectMembership(
  supabase: SupabaseClient<Database>,
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single();

  return !!data;
}
```

## 4. Frontend Implementation

### 4.1. Komponenty React

#### 4.1.1. Lista Milestones

**Lokalizacja:** `src/components/milestones/MilestonesList.tsx`

**Funkcjonalność:**

- Wyświetla listę milestones dla projektu
- Obsługuje edycję i usuwanie (tylko dla Project Managers)
- Pokazuje liczbę przypisanych zadań
- Sortowanie po dacie

**Props:**

```typescript
interface MilestonesListProps {
  projectId: string;
  userRole: "administrator" | "project_manager" | "team_member";
}
```

---

#### 4.1.2. Formularz Tworzenia/Edycji Milestone

**Lokalizacja:** `src/components/milestones/MilestoneForm.tsx`

**Funkcjonalność:**

- Formularz z polami: name, description, due_date
- Walidacja po stronie klienta
- Obsługa błędów z API
- Tryb create/edit

**Props:**

```typescript
interface MilestoneFormProps {
  projectId: string;
  milestone?: Milestone; // dla trybu edycji
  onSuccess: () => void;
  onCancel: () => void;
}
```

---

#### 4.1.3. Karta Milestone

**Lokalizacja:** `src/components/milestones/MilestoneCard.tsx`

**Funkcjonalność:**

- Wyświetla pojedynczy milestone
- Akcje: Edytuj, Usuń (z potwierdzeniem)
- Pokazuje due_date z odpowiednim formatowaniem
- Wskaźnik zadań (np. "12 zadań")

**Props:**

```typescript
interface MilestoneCardProps {
  milestone: Milestone;
  canEdit: boolean;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
}
```

---

#### 4.1.4. Selektor Milestone (dla zadań)

**Lokalizacja:** `src/components/milestones/MilestoneSelect.tsx`

**Funkcjonalność:**

- Dropdown/Select do wyboru milestone przy tworzeniu/edycji zadania
- Opcja "Brak milestone"
- Sortowanie po dacie

**Props:**

```typescript
interface MilestoneSelectProps {
  projectId: string;
  value?: string | null;
  onChange: (milestoneId: string | null) => void;
}
```

---

#### 4.1.5. Filtr Milestones dla Kanban

**Lokalizacja:** `src/components/dashboard/MilestoneFilter.tsx`

**Funkcjonalność:**

- Dropdown z listą milestones
- Opcja "Wszystkie milestones"
- Integracja z filtrowaniem tablicy Kanban

**Props:**

```typescript
interface MilestoneFilterProps {
  projectId: string;
  selectedMilestoneId?: string | null;
  onMilestoneChange: (milestoneId: string | null) => void;
}
```

---

### 4.2. Custom Hooks

#### 4.2.1. useMilestones

**Lokalizacja:** `src/components/hooks/useMilestones.ts`

**Funkcjonalność:**

- Pobieranie listy milestones dla projektu
- Cache i refetch
- Loading/error states

```typescript
export function useMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    // implementacja
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return { milestones, loading, error, refetch: fetchMilestones };
}
```

---

#### 4.2.2. useMilestoneActions

**Lokalizacja:** `src/components/hooks/useMilestoneActions.ts`

**Funkcjonalność:**

- Tworzenie nowego milestone
- Aktualizacja milestone
- Usuwanie milestone
- Obsługa stanów loading/error dla akcji

```typescript
export function useMilestoneActions(projectId: string) {
  const createMilestone = async (data: CreateMilestoneInput) => {
    // implementacja
  };

  const updateMilestone = async (id: string, data: UpdateMilestoneInput) => {
    // implementacja
  };

  const deleteMilestone = async (id: string) => {
    // implementacja
  };

  return { createMilestone, updateMilestone, deleteMilestone };
}
```

---

### 4.3. Strony Astro

#### 4.3.1. Widok zarządzania Milestones w ustawieniach projektu

**Opcja A - Dedykowana strona:**
**Lokalizacja:** `src/pages/projects/[projectId]/milestones.astro`

**Opcja B - Zakładka w ustawieniach:**
**Lokalizacja:** `src/pages/projects/[projectId]/settings.astro`

- Dodać zakładkę "Milestones" obok "Members"

**Funkcjonalność:**

- Lista wszystkich milestones
- Przycisk "Dodaj Milestone" (tylko dla Project Managers)
- Integracja z komponentami MilestonesList i MilestoneForm

**Rekomendacja:** Opcja B - zakładka w settings dla lepszej UX

---

### 4.4. Integracja z istniejącymi komponentami

#### 4.4.1. Modyfikacja formularza zadania

**Lokalizacja:** `src/components/dashboard/TaskForm.tsx` (założenie, że istnieje)

**Zmiany:**

- Dodać pole do wyboru milestone (używając MilestoneSelect)
- Uwzględnić milestone_id w payload do API

---

#### 4.4.2. Modyfikacja tablicy Kanban

**Lokalizacja:** `src/components/dashboard/KanbanBoard.tsx` (założenie, że istnieje)

**Zmiany:**

- Dodać MilestoneFilter do sekcji filtrów
- Filtrować zadania na podstawie selectedMilestoneId
- Wyświetlać nazwę milestone na kartach zadań

---

### 4.5. Typy TypeScript

**Lokalizacja:** `src/types.ts` (rozszerzenie)

```typescript
// Milestone entity
export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  due_date: string; // format: YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

// DTOs
export interface CreateMilestoneDTO {
  name: string;
  description?: string | null;
  due_date: string;
}

export interface UpdateMilestoneDTO {
  name?: string;
  description?: string | null;
  due_date?: string;
}
```

## 5. Testing

### 5.1. Testy E2E (Playwright)

**Lokalizacja:** `e2e/milestones.spec.ts`

**Scenariusze testowe:**

```typescript
describe("Milestones Management", () => {
  test("should display milestones list for project manager", async ({ page }) => {
    // Test wyświetlania listy milestones
  });

  test("should create a new milestone successfully", async ({ page }) => {
    // Test tworzenia milestone
    // Weryfikacja: milestone pojawia się na liście
  });

  test("should validate required fields when creating milestone", async ({ page }) => {
    // Test walidacji: próba zapisu bez nazwy
    // Oczekiwany błąd walidacji
  });

  test("should edit existing milestone", async ({ page }) => {
    // Test edycji milestone
    // Weryfikacja: zmiany są widoczne
  });

  test("should delete milestone with confirmation", async ({ page }) => {
    // Test usuwania milestone
    // Weryfikacja: pojawia się dialog potwierdzenia
    // Weryfikacja: milestone znika z listy
  });

  test("should not allow team member to create/edit/delete milestones", async ({ page }) => {
    // Test uprawnień: członek zespołu nie widzi przycisków akcji
  });

  test("should assign milestone to task", async ({ page }) => {
    // Test przypisywania milestone do zadania
    // Weryfikacja: milestone jest widoczny na karcie zadania
  });

  test("should filter Kanban board by milestone", async ({ page }) => {
    // Test filtrowania tablicy
    // Weryfikacja: wyświetlane są tylko zadania z wybranym milestone
  });
});
```

---

### 5.2. Testy jednostkowe (Vitest)

#### 5.2.1. Testy serwisu

**Lokalizacja:** `src/lib/services/__tests__/milestones.service.test.ts`

**Scenariusze:**

- getMilestonesByProject zwraca milestones posortowane po dacie
- createMilestone tworzy nowy rekord
- updateMilestone aktualizuje tylko podane pola
- deleteMilestone usuwa rekord
- Obsługa błędów Supabase

---

#### 5.2.2. Testy walidacji

**Lokalizacja:** `src/api/validation/__tests__/milestones.test.ts`

**Scenariusze:**

- createMilestoneSchema: nazwa jest wymagana
- createMilestoneSchema: data musi być prawidłowa
- updateMilestoneSchema: przynajmniej jedno pole musi być podane
- Walidacja maksymalnej długości pól

---

#### 5.2.3. Testy komponentów

**Lokalizacja:** `src/components/milestones/__tests__/`

**Pliki:**

- `MilestoneCard.test.tsx`
- `MilestoneForm.test.tsx`
- `MilestoneSelect.test.tsx`

**Przykładowe scenariusze:**

- MilestoneCard: wyświetla poprawne dane
- MilestoneCard: pokazuje przyciski akcji tylko gdy canEdit=true
- MilestoneForm: waliduje pola przed submitem
- MilestoneSelect: ładuje listę milestones dla projektu

---

### 5.3. Testy integracyjne API

**Lokalizacja:** `src/pages/api/projects/[projectId]/milestones/__tests__/`

**Narzędzie:** Vitest z mockami Supabase

**Scenariusze:**

- GET zwraca listę milestones dla członka projektu
- GET zwraca 403 dla użytkownika spoza projektu
- POST tworzy milestone dla project managera
- POST zwraca 403 dla team membera
- PATCH aktualizuje milestone
- DELETE usuwa milestone

## 6. Kolejność Implementacji

### Faza 1: Backend (2-3 dni)

1. ✅ Utworzenie validation schemas (`milestones.ts`)
2. ✅ Implementacja MilestonesService
3. ✅ Endpoint GET `/api/projects/{projectId}/milestones`
4. ✅ Endpoint POST `/api/projects/{projectId}/milestones`
5. ✅ Endpoint PATCH `/api/milestones/{milestoneId}`
6. ✅ Endpoint DELETE `/api/milestones/{milestoneId}`
7. ✅ Testy jednostkowe serwisu i walidacji

### Faza 2: Frontend - Komponenty podstawowe (2-3 dni)

1. ✅ Definicje typów TypeScript
2. ✅ Hook useMilestones
3. ✅ Hook useMilestoneActions
4. ✅ Komponent MilestoneCard
5. ✅ Komponent MilestoneForm
6. ✅ Komponent MilestonesList
7. ✅ Testy jednostkowe komponentów

### Faza 3: Frontend - Integracja (2 dni)

1. ✅ Komponent MilestoneSelect
2. ✅ Komponent MilestoneFilter
3. ✅ Modyfikacja formularza zadania (dodanie pola milestone)
4. ✅ Modyfikacja tablicy Kanban (filtrowanie, wyświetlanie milestone)
5. ✅ Strona/zakładka zarządzania milestones w settings

### Faza 4: Testy E2E (1-2 dni)

1. ✅ Scenariusze zarządzania milestones
2. ✅ Scenariusze przypisywania do zadań
3. ✅ Scenariusze filtrowania
4. ✅ Scenariusze uprawnień

### Faza 5: Dokumentacja i review (1 dzień)

1. ✅ Aktualizacja dokumentacji użytkownika
2. ✅ Code review
3. ✅ Testy regresyjne
4. ✅ Deployment na środowisko testowe

**Całkowity szacowany czas: 8-11 dni roboczych**

## 7. Acceptance Criteria Checklist

### US-012: Zarządzanie kamieniami milowymi

- [ ] Menedżer Projektu ma dostęp do sekcji "Milestones" w ustawieniach projektu
- [ ] Może tworzyć nowy kamień milowy, podając jego nazwę, opis i datę docelową
- [ ] Może edytować istniejące kamienie milowe
- [ ] Może usuwać istniejące kamienie milowe
- [ ] Podczas tworzenia zadania można je przypisać do istniejącego kamienia milowego
- [ ] Podczas edycji zadania można zmienić przypisany kamień milowy

### US-013: Filtrowanie tablicy Kanban (część milestones)

- [ ] Na tablicy Kanban dostępny jest filtr milestones
- [ ] Użytkownik może wybrać kamień milowy z listy
- [ ] Po wybraniu wyświetlane są tylko zadania przypisane do tego milestone
- [ ] Filtr można połączyć z filtrem użytkowników

### Ogólne

- [ ] Tylko Project Manager i Administrator mogą tworzyć/edytować/usuwać milestones
- [ ] Członkowie zespołu widzą listę milestones (read-only)
- [ ] Wszystkie operacje są zabezpieczone na poziomie API (autoryzacja)
- [ ] RLS w Supabase chroni dane milestones
- [ ] Walidacja działa zarówno na frontendzie, jak i backendzie
- [ ] Wszystkie testy przechodzą pomyślnie
- [ ] UI jest responsywne i dostępne (ARIA)

## 8. Potencjalne Ryzyka i Mitigacja

### Ryzyko 1: Usuwanie milestone z przypisanymi zadaniami

**Mitigacja:**

- Opcja A: Zablokować usuwanie i wyświetlić komunikat
- Opcja B: Przy usuwaniu ustawić milestone_id zadań na NULL
- **Rekomendacja:** Opcja A dla bezpieczeństwa danych

### Ryzyko 2: Performance przy dużej liczbie milestones

**Mitigacja:**

- Implementacja paginacji jeśli projekt ma >50 milestones
- Lazy loading w selektorach

### Ryzyko 3: Równoczesne edycje

**Mitigacja:**

- Optimistic updates na frontendzie
- Obsługa konfliktów wersji (updated_at)

## 9. Metryki Sukcesu

- ✅ 100% kryteriów akceptacji spełnionych
- ✅ Pokrycie kodu testami >= 80%
- ✅ Wszystkie testy E2E przechodzą
- ✅ Brak błędów krytycznych w production
- ✅ Czas odpowiedzi API < 200ms dla operacji CRUD
- ✅ US-012 osiąga cel: 80% zadań przypisanych do milestones (po 2 tygodniach użytkowania)
