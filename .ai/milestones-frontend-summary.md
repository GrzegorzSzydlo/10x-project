# Milestones Frontend - Podsumowanie Implementacji

## ✅ Co zostało zaimplementowane

### 1. Struktura Katalogów

```
src/
├── components/
│   ├── milestones/
│   │   ├── types.ts                    # Definicje typów i interfejsów
│   │   ├── MilestoneCard.tsx          # Komponent karty milestone
│   │   ├── MilestoneForm.tsx          # Formularz create/edit
│   │   └── MilestonesList.tsx         # Główny widok listy
│   ├── hooks/
│   │   ├── useMilestones.ts           # Hook do pobierania danych
│   │   └── useMilestoneActions.ts     # Hook do CRUD operations
│   └── ui/
│       ├── card.tsx                    # ✨ Nowy komponent UI
│       ├── alert.tsx                   # ✨ Nowy komponent UI
│       ├── alert-dialog.tsx            # ✨ Nowy komponent UI
│       └── form.tsx                    # ✨ Nowy komponent UI
```

### 2. Zainstalowane Zależności

- `react-hook-form` - zarządzanie formularzami
- `@hookform/resolvers` - integracja zod z react-hook-form
- `@radix-ui/react-alert-dialog` - konfirmacja usuwania

### 3. Komponenty

#### MilestoneCard

**Lokalizacja:** `src/components/milestones/MilestoneCard.tsx`

**Funkcjonalność:**

- Wyświetla pojedynczy milestone jako kartę
- Pokazuje nazwę, opis i datę
- Wyróżnia przeterminowane milestones (czerwony kolor)
- Przyciski Edit/Delete (tylko dla Project Managers)
- AlertDialog do potwierdzenia usuwania

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

#### MilestoneForm

**Lokalizacja:** `src/components/milestones/MilestoneForm.tsx`

**Funkcjonalność:**

- Formularz z polami: name (required), description (optional), due_date (optional)
- Walidacja przez zod schema
- Tryb create/edit (zależny od przekazanego milestone)
- Integracja z react-hook-form
- Obsługa błędów z API

**Props:**

```typescript
interface MilestoneFormProps {
  projectId: string;
  milestone?: Milestone;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Walidacja:**

```typescript
const milestoneFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  due_date: z.string().optional(),
});
```

---

#### MilestonesList

**Lokalizacja:** `src/components/milestones/MilestonesList.tsx`

**Funkcjonalność:**

- Wyświetla grid z kartami milestones
- Przycisk "Add Milestone" (tylko dla Project Managers)
- Dialog z formularzem do tworzenia/edycji
- Loading state podczas ładowania danych
- Error state przy błędach API
- Empty state gdy brak milestones

**Props:**

```typescript
interface MilestonesListProps {
  projectId: string;
  userRole: "administrator" | "project_manager" | "team_member";
}
```

**Layout:**

- Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
- Używa Shadcn/ui Dialog do formularza

---

### 4. Custom Hooks

#### useMilestones

**Lokalizacja:** `src/components/hooks/useMilestones.ts`

**Funkcjonalność:**

- Pobiera listę milestones dla projektu
- Auto-fetch przy montowaniu komponentu
- Zarządzanie stanami: loading, error
- Funkcja refetch() do odświeżania danych

**API:**

```typescript
const { milestones, loading, error, refetch } = useMilestones(projectId);
```

**Endpoint:** `GET /api/projects/{projectId}/milestones`

---

#### useMilestoneActions

**Lokalizacja:** `src/components/hooks/useMilestoneActions.ts`

**Funkcjonalność:**

- `createMilestone()` - tworzenie nowego milestone
- `updateMilestone()` - aktualizacja istniejącego
- `deleteMilestone()` - usuwanie milestone
- Osobne loading states dla każdej akcji
- Wspólny error state

**API:**

```typescript
const { creating, updating, deleting, error, createMilestone, updateMilestone, deleteMilestone } =
  useMilestoneActions(projectId);
```

**Endpoints:**

- `POST /api/projects/{projectId}/milestones`
- `PATCH /api/milestones/{milestoneId}` ⚠️ Wymaga implementacji backend
- `DELETE /api/milestones/{milestoneId}` ⚠️ Wymaga implementacji backend

---

### 5. Integracja z ProjectWorkspace

**Plik:** `src/components/dashboard/ProjectWorkspace.tsx`

**Zmiany:**

1. Dodano import `MilestonesList`
2. Dodano prop `userRole: UserRole`
3. Zakładka "Milestones" renderuje `<MilestonesList />`

**Plik:** `src/pages/projects/[id].astro`

**Zmiany:**

1. Przekazywanie `userRole={user.role}` do ProjectWorkspace

---

### 6. Typy TypeScript

**Lokalizacja:** `src/components/milestones/types.ts`

**Definicje:**

```typescript
export interface MilestoneCardProps { ... }
export interface MilestoneFormProps { ... }
export interface MilestonesListProps { ... }
export interface MilestoneFormValues { ... }
export interface CreateMilestoneRequest { ... }
export interface UpdateMilestoneRequest { ... }
```

Wszystkie typy są eksportowane i używają typu `Milestone` z `@/types`.

---

### 7. Styling & UI/UX

**Podejście:**

- Tailwind CSS 4 do stylowania
- Shadcn/ui komponenty (Card, Dialog, Alert, Form, Button, Input, Textarea)
- Responsive design (mobile-first)
- Dark mode ready
- Ikony z `lucide-react`

**Accessibility:**

- ARIA labels na przyciskach
- Semantic HTML
- Keyboard navigation
- Form validation feedback
- Alert roles dla komunikatów błędów

---

## ⚠️ Co wymaga dokończenia na backendzie

### Brakujące Endpointy

#### 1. PATCH /api/milestones/{milestoneId}

**Status:** ❌ Nie zaimplementowany

**Potrzebne:**

- Plik: `src/pages/api/milestones/[milestoneId].ts`
- Handler: `PATCH`
- Walidacja: `updateMilestoneSchema` (trzeba dodać do `projects.schemas.ts`)
- Serwis: `updateMilestone()` - dodać do `milestones.service.ts`

**Schemat walidacji:**

```typescript
export const updateMilestoneSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    due_date: z.string().datetime().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
```

---

#### 2. DELETE /api/milestones/{milestoneId}

**Status:** ❌ Nie zaimplementowany

**Potrzebne:**

- Plik: `src/pages/api/milestones/[milestoneId].ts` (ten sam co PATCH)
- Handler: `DELETE`
- Serwis: `deleteMilestone()` - dodać do `milestones.service.ts`
- Logika biznesowa: sprawdzenie czy milestone ma przypisane zadania

**Opcje usuwania:**

- Opcja A: Blokować jeśli są przypisane zadania (bezpieczniejsze)
- Opcja B: Przy usuwaniu ustawić `milestone_id = NULL` w zadaniach

---

## 📋 Checklist - Backend TODO

### src/api/services/milestones.service.ts

- [ ] Dodać `getMilestoneById(milestoneId, supabase)`
- [ ] Dodać `updateMilestone(milestoneId, data, supabase)`
- [ ] Dodać `deleteMilestone(milestoneId, supabase)`
- [ ] Dodać `countTasksByMilestone(milestoneId, supabase)` - dla walidacji delete

### src/api/validation/projects.schemas.ts

- [ ] Dodać `updateMilestoneSchema`
- [ ] Dodać `milestoneIdParamSchema`

### src/pages/api/milestones/[milestoneId].ts

- [ ] Utworzyć plik
- [ ] Implementować `GET` handler (opcjonalnie)
- [ ] Implementować `PATCH` handler
  - Autoryzacja: project_manager lub administrator
  - Walidacja: updateMilestoneSchema
  - Sprawdzenie membership w projekcie
- [ ] Implementować `DELETE` handler
  - Autoryzacja: project_manager lub administrator
  - Walidacja biznesowa: czy są przypisane zadania?
  - Sprawdzenie membership w projekcie

---

## 🧪 Testy TODO

### E2E (Playwright)

- [ ] `e2e/milestones.spec.ts` - testy scenariuszy użytkownika
  - Wyświetlanie listy milestones
  - Tworzenie milestone (PM)
  - Edycja milestone (PM)
  - Usuwanie milestone (PM)
  - Brak dostępu do akcji (team member)
  - Walidacja formularza

### Unit (Vitest)

- [ ] `src/components/milestones/__tests__/MilestoneCard.test.tsx`
- [ ] `src/components/milestones/__tests__/MilestoneForm.test.tsx`
- [ ] `src/components/milestones/__tests__/MilestonesList.test.tsx`
- [ ] `src/components/hooks/__tests__/useMilestones.test.ts`
- [ ] `src/components/hooks/__tests__/useMilestoneActions.test.ts`

### Backend

- [ ] `src/api/services/__tests__/milestones.service.test.ts`
- [ ] `src/api/validation/__tests__/milestones.schemas.test.ts`

---

## 🎯 Następne Kroki

### Priorytet 1 - Backend Endpoints (1-2 dni)

1. Implementacja PATCH i DELETE endpoints
2. Testy jednostkowe serwisu
3. Testy integracyjne API

### Priorytet 2 - Integracja z Zadaniami (1 dzień)

1. Dodać `MilestoneSelect` do formularza zadania
2. Pokazywać milestone na karcie zadania w Kanban
3. Implementować `MilestoneFilter` dla tablicy Kanban

### Priorytet 3 - Testy (2 dni)

1. Testy E2E dla wszystkich scenariuszy
2. Testy jednostkowe komponentów
3. Testy integracyjne

---

## 📝 Uwagi Techniczne

### TypeScript Cache

- W VSCode mogą pojawić się błędy "Cannot find module" dla nowo utworzonych komponentów UI
- Rozwiązanie: Restart TypeScript Server (Cmd+Shift+P → "TypeScript: Restart TS Server")

### ESLint

- Dodano `/* eslint-disable react/prop-types */` w MilestoneForm
- Dodano `// eslint-disable-next-line no-console` w hookach
- Wszystkie pliki sformatowane przez Prettier

### Compatibility

- Używa React 19
- react-hook-form v7
- Kompatybilne z Astro 5
- TypeScript strict mode

---

## 🎨 Design Decisions

1. **Osobny katalog milestones/** - lepsze separation of concerns
2. **Custom hooks zamiast Context API** - prostsze dla tego use case
3. **Shadcn/ui komponenty** - spójność z resztą projektu
4. **Grid layout** - lepsze wykorzystanie przestrzeni niż lista
5. **Dialog zamiast osobnej strony** - lepsza UX, mniej nawigacji
6. **Walidacja po stronie klienta i serwera** - bezpieczeństwo i UX

---

## 📚 Dokumentacja

### Użycie MilestonesList

```tsx
import { MilestonesList } from "@/components/milestones/MilestonesList";

<MilestonesList projectId="uuid-here" userRole="project_manager" />;
```

### Użycie w Astro

```astro
---
import { MilestonesList } from "@/components/milestones/MilestonesList";
const userRole = user.role; // from locals
const projectId = Astro.params.id;
---

<MilestonesList client:load projectId={projectId} userRole={userRole} />
```

---

Data implementacji: 24 stycznia 2026
Szacowany czas: ~4h implementacji frontendu
Pozostały czas (backend): ~2-3h
