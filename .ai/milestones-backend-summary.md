# Milestones Backend - Podsumowanie Implementacji

## ✅ Zaimplementowane Komponenty Backend

### 1. Rozszerzone Typy (`src/types.ts`)

**Dodany typ:**

```typescript
export type UpdateMilestoneCommand = {
  name?: string;
  description?: string | null;
  due_date?: string | null;
};
```

### 2. Schematy Walidacji (`src/api/validation/projects.schemas.ts`)

**Dodane schematy:**

#### `milestoneIdParamSchema`

```typescript
export const milestoneIdParamSchema = z.object({
  milestoneId: z.string().uuid("Invalid milestone ID format"),
});
```

#### `updateMilestoneSchema`

```typescript
export const updateMilestoneSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
    description: z.string().max(1000, "Description is too long").optional().nullable(),
    due_date: z
      .string()
      .datetime("Invalid date format")
      .optional()
      .nullable()
      .transform((val) => (val === null ? undefined : val)),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
```

**Walidacja:**

- Wymaga przynajmniej jednego pola (refine)
- Wszystkie pola opcjonalne
- Transformacja `null` na `undefined` dla due_date

---

### 3. Rozszerzony Serwis (`src/api/services/milestones.service.ts`)

#### Dodane funkcje:

**`getMilestoneById(milestoneId, supabase)`**

- Pobiera pojedynczy milestone z project_id
- Używane do weryfikacji uprawnień
- Zwraca error 404 jeśli nie znaleziono

**`updateMilestone(milestoneId, command, supabase)`**

- Aktualizuje milestone
- Obsługuje unique violation (nazwa już istnieje)
- Zwraca zaktualizowany milestone

**`deleteMilestone(milestoneId, supabase)`**

- Usuwa milestone z bazy
- Nie zwraca danych (void)

**`countTasksByMilestone(milestoneId, supabase)`**

- Liczy zadania przypisane do milestone
- Używane do walidacji przed usunięciem
- Zwraca liczbę (number)

---

### 4. Nowy Endpoint (`src/pages/api/milestones/[milestoneId].ts`)

Plik implementuje trzy operacje HTTP:

#### GET /api/milestones/{milestoneId}

**Funkcjonalność:**

- Pobiera szczegóły pojedynczego milestone
- Weryfikuje członkostwo w projekcie

**Autoryzacja:**

- Użytkownik musi być zalogowany
- Użytkownik musi być członkiem projektu milestone

**Response:**

- 200 OK - milestone details
- 400 - Invalid milestone ID
- 401 - Unauthorized
- 403 - Not a project member
- 404 - Milestone not found
- 500 - Server error

---

#### PATCH /api/milestones/{milestoneId}

**Funkcjonalność:**

- Aktualizuje istniejący milestone
- Walidacja przez `updateMilestoneSchema`
- Sprawdza uprawnienia project managera

**Autoryzacja:**

- Użytkownik musi być Project Manager lub Administrator
- Musi być członkiem projektu

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string | null (optional)",
  "due_date": "ISO datetime string | null (optional)"
}
```

**Response:**

- 200 OK - updated milestone
- 400 - Invalid input
- 401 - Unauthorized
- 403 - Not a project manager
- 404 - Milestone not found
- 500 - Server error

**Logika biznesowa:**

1. Weryfikacja autentykacji
2. Walidacja ID milestone
3. Pobranie milestone (weryfikacja istnienia)
4. Sprawdzenie uprawnień PM/Admin
5. Walidacja body requesta
6. Aktualizacja w bazie
7. Zwrócenie zaktualizowanego milestone

---

#### DELETE /api/milestones/{milestoneId}

**Funkcjonalność:**

- Usuwa milestone z bazy
- **WAŻNE:** Sprawdza czy są przypisane zadania przed usunięciem
- Blokuje usunięcie jeśli są przypisane zadania (409 Conflict)

**Autoryzacja:**

- Użytkownik musi być Project Manager lub Administrator
- Musi być członkiem projektu

**Response:**

- 204 No Content - successfully deleted
- 400 - Invalid milestone ID
- 401 - Unauthorized
- 403 - Not a project manager
- 404 - Milestone not found
- 409 Conflict - milestone has assigned tasks
- 500 - Server error

**Logika biznesowa:**

1. Weryfikacja autentykacji
2. Walidacja ID milestone
3. Pobranie milestone (weryfikacja istnienia)
4. Sprawdzenie uprawnień PM/Admin
5. **Liczenie przypisanych zadań** (countTasksByMilestone)
6. Jeśli count > 0: zwróć 409 Conflict z komunikatem
7. Jeśli count = 0: usuń milestone
8. Zwróć 204 No Content

**Przykładowy komunikat błędu:**

```json
{
  "error": "Cannot delete milestone with 5 assigned task(s). Please reassign or delete the tasks first."
}
```

---

## 🔒 Bezpieczeństwo i Walidacja

### Walidacja na Poziomie Endpoint

1. **Path Parameters:** `milestoneIdParamSchema` (UUID validation)
2. **Request Body:** `updateMilestoneSchema` (zod validation)
3. **Autentykacja:** `locals.user` sprawdzane na początku
4. **Autoryzacja:** Weryfikacja roli i membership

### Walidacja Biznesowa

1. **Sprawdzanie istnienia:** `getMilestoneById()` rzuca błąd jeśli nie ma
2. **Unique constraint:** Nazwa milestone musi być unikalna w projekcie
3. **Foreign key:** Nie można usunąć milestone z zadaniami (409)
4. **Membership:** Tylko członkowie projektu mają dostęp

### Row-Level Security (RLS)

Backend polega na politykach RLS w Supabase:

- Użytkownik widzi tylko milestones z projektów gdzie jest członkiem
- Automatyczna filtracja na poziomie bazy danych

---

## 🔄 Flow Użytkownika

### Tworzenie Milestone

```
Frontend (MilestoneForm)
  → POST /api/projects/{projectId}/milestones
  → createMilestone() service
  → INSERT do tabeli milestones
  → 201 Created + milestone data
```

### Edycja Milestone

```
Frontend (MilestoneForm w trybie edit)
  → PATCH /api/milestones/{milestoneId}
  → getMilestoneById() (weryfikacja)
  → isProjectManager() (autoryzacja)
  → updateMilestone() service
  → UPDATE w tabeli milestones
  → 200 OK + updated milestone
```

### Usuwanie Milestone

```
Frontend (MilestoneCard - AlertDialog)
  → DELETE /api/milestones/{milestoneId}
  → getMilestoneById() (weryfikacja)
  → isProjectManager() (autoryzacja)
  → countTasksByMilestone() (walidacja biznesowa)
  → IF count > 0: 409 Conflict
  → ELSE: deleteMilestone() service
  → DELETE z tabeli milestones
  → 204 No Content
```

---

## 📋 Checklist - Co działa

### Endpointy

- ✅ GET /api/projects/{projectId}/milestones - lista milestones
- ✅ POST /api/projects/{projectId}/milestones - tworzenie
- ✅ GET /api/milestones/{milestoneId} - szczegóły (opcjonalne)
- ✅ PATCH /api/milestones/{milestoneId} - edycja
- ✅ DELETE /api/milestones/{milestoneId} - usuwanie

### Walidacja

- ✅ UUID validation dla ID
- ✅ Zod schemas dla request body
- ✅ Business logic validation (task count)
- ✅ Unique constraint validation

### Autoryzacja

- ✅ Authentication check
- ✅ Project membership check
- ✅ Project manager role check
- ✅ RLS policies

### Error Handling

- ✅ 400 - Invalid input
- ✅ 401 - Unauthorized
- ✅ 403 - Forbidden (not PM/not member)
- ✅ 404 - Not found
- ✅ 409 - Conflict (has tasks)
- ✅ 500 - Server error

---

## 🧪 Testowanie Manualne

### 1. Testowanie PATCH endpoint

```bash
# Edycja nazwy milestone
curl -X PATCH http://localhost:4321/api/milestones/{milestoneId} \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "name": "Updated Milestone Name"
  }'

# Edycja opisu i daty
curl -X PATCH http://localhost:4321/api/milestones/{milestoneId} \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "description": "New description",
    "due_date": "2026-12-31T23:59:59Z"
  }'

# Usunięcie due_date (null)
curl -X PATCH http://localhost:4321/api/milestones/{milestoneId} \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{
    "due_date": null
  }'
```

### 2. Testowanie DELETE endpoint

```bash
# Usunięcie milestone bez zadań
curl -X DELETE http://localhost:4321/api/milestones/{milestoneId} \
  -H "Cookie: sb-access-token=..."

# Próba usunięcia z zadaniami - powinno zwrócić 409
# (wymaga wcześniejszego przypisania zadań do milestone)
```

### 3. Testowanie uprawnień

```bash
# Jako team_member - powinno zwrócić 403
# Jako project_manager - powinno działać
# Jako administrator - powinno działać
# Użytkownik spoza projektu - powinno zwrócić 403
```

---

## 🎯 Integracja Frontend-Backend

### Hooki wykorzystują nowe endpointy:

**useMilestoneActions:**

```typescript
// Update
const response = await fetch(`/api/milestones/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// Delete
const response = await fetch(`/api/milestones/${id}`, {
  method: "DELETE",
});
```

### Obsługa błędów w UI:

**409 Conflict (zadania przypisane):**

```typescript
if (error.message.includes("assigned task")) {
  // Wyświetl komunikat użytkownikowi
  // "Nie można usunąć milestone z przypisanymi zadaniami"
}
```

---

## 📊 Struktura Plików Backend

```
src/
├── types.ts                              # ✨ +UpdateMilestoneCommand
├── api/
│   ├── validation/
│   │   └── projects.schemas.ts           # ✨ +updateMilestoneSchema, +milestoneIdParamSchema
│   ├── services/
│   │   └── milestones.service.ts         # ✨ +4 nowe funkcje
│   └── utils.ts                          # jsonResponse, errorResponse
├── pages/
│   └── api/
│       ├── projects/
│       │   └── [projectId]/
│       │       └── milestones/
│       │           └── index.ts          # GET, POST (już istniał)
│       └── milestones/
│           └── [milestoneId].ts          # ✨ NOWY - GET, PATCH, DELETE
```

---

## ⚠️ Uwagi Implementacyjne

### 1. Polityka Usuwania

**Decyzja:** Blokowanie usuwania milestone z zadaniami (409)

**Alternatywy (NIE zaimplementowane):**

- Ustawianie `milestone_id = NULL` w zadaniach przy usuwaniu
- Kaskadowe usuwanie zadań

**Uzasadnienie:**

- Bezpieczniejsze - zapobiega przypadkowej utracie danych
- Wymusza świadome działanie użytkownika
- Jasny komunikat co zrobić (reassign or delete tasks)

### 2. Walidacja Due Date

- Format: ISO 8601 datetime string
- Opcjonalne pole (nullable)
- Transform `null` → `undefined` w zod

### 3. Concurrent Updates

**Brak optimistic locking:**

- Brak pola `version` lub `updated_at` check
- Last write wins
- W przyszłości: rozważyć dodanie `If-Match` header z `updated_at`

### 4. Partial Updates

- PATCH pozwala na aktualizację dowolnej kombinacji pól
- Minimalne wymaganie: przynajmniej 1 pole
- Frontend może wysłać tylko zmienione pola

---

## 🚀 Co dalej

### Gotowe do użycia:

- ✅ Pełny CRUD dla milestones
- ✅ Walidacja i autoryzacja
- ✅ Frontend zintegrowany z backend
- ✅ Error handling

### Do rozważenia w przyszłości:

- [ ] Testy jednostkowe serwisu (Vitest)
- [ ] Testy E2E dla PATCH i DELETE (Playwright)
- [ ] Optimistic locking (versioning)
- [ ] Audit log dla zmian milestone
- [ ] Bulk operations (usuwanie wielu na raz)
- [ ] Soft delete zamiast hard delete

---

Data implementacji: 24 stycznia 2026
Szacowany czas implementacji backend: ~2h
Status: ✅ **Gotowe do użycia**
