### 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

#### Typy niestandardowe (ENUMs)

- **`public.user_role`**: ENUM (`'administrator'`, `'project_manager'`, `'team_member'`)
- **`public.task_status`**: ENUM (`'To Do'`, `'In Progress'`, `'Testing'`, `'Done'`)

#### Tabela `public.users`

Przechowuje profile użytkowników aplikacji.
| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|---------------|---------------|--------------------------------------------------------------|------------------------------------------------|
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Klucz główny, powiązany z użytkownikiem Supabase Auth. |
| `first_name` | `TEXT` | | Imię użytkownika. |
| `last_name` | `TEXT` | | Nazwisko użytkownika. |
| `avatar_url` | `TEXT` | | URL do awatara użytkownika. |
| `role` | `user_role` | `NOT NULL`, `DEFAULT 'team_member'` | Rola użytkownika w systemie. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu utworzenia rekordu. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu ostatniej aktualizacji rekordu. |

#### Tabela `public.projects`

Przechowuje informacje o projektach.
| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|---------------|---------------|--------------------------------------------|------------------------------------------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unikalny identyfikator projektu. |
| `name` | `TEXT` | `NOT NULL` | Nazwa projektu. |
| `owner_id` | `UUID` | `NOT NULL`, `REFERENCES public.users(id)` | ID użytkownika, który jest właścicielem projektu. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu utworzenia rekordu. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu ostatniej aktualizacji rekordu. |

#### Tabela `public.project_members`

Tabela łącząca, zarządzająca przynależnością użytkowników do projektów.
| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|---------------|---------------|--------------------------------------------------------------|------------------------------------------------|
| `project_id` | `UUID` | `PRIMARY KEY (project_id, user_id)`, `REFERENCES public.projects(id) ON DELETE CASCADE` | ID projektu. |
| `user_id` | `UUID` | `PRIMARY KEY (project_id, user_id)`, `REFERENCES public.users(id) ON DELETE CASCADE` | ID użytkownika. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu utworzenia rekordu. |

#### Tabela `public.milestones`

Przechowuje kamienie milowe dla projektów.
| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|---------------|---------------|--------------------------------------------------------------|------------------------------------------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unikalny identyfikator kamienia milowego. |
| `project_id` | `UUID` | `NOT NULL`, `REFERENCES public.projects(id) ON DELETE CASCADE` | ID projektu, do którego należy kamień milowy. |
| `name` | `TEXT` | `NOT NULL`, `UNIQUE (project_id, name)` | Nazwa kamienia milowego. |
| `description` | `TEXT` | | Opcjonalny opis. |
| `due_date` | `DATE` | | Termin realizacji kamienia milowego. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu utworzenia rekordu. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu ostatniej aktualizacji rekordu. |

#### Tabela `public.tasks`

Przechowuje zadania i podzadania.
| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|----------------|--------------------|--------------------------------------------------------------|------------------------------------------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unikalny identyfikator zadania. |
| `project_id` | `UUID` | `NOT NULL`, `REFERENCES public.projects(id) ON DELETE CASCADE` | ID projektu, do którego należy zadanie. |
| `milestone_id` | `UUID` | `REFERENCES public.milestones(id) ON DELETE SET NULL` | Opcjonalne powiązanie z kamieniem milowym. |
| `assignee_id` | `UUID` | `REFERENCES public.users(id) ON DELETE SET NULL` | Opcjonalne przypisanie do użytkownika. |
| `parent_task_id`| `UUID` | `REFERENCES public.tasks(id) ON DELETE CASCADE` | ID zadania nadrzędnego (dla podzadań). |
| `title` | `TEXT` | `NOT NULL` | Tytuł zadania. |
| `description` | `TEXT` | | Opcjonalny opis zadania. |
| `status` | `task_status` | `NOT NULL`, `DEFAULT 'To Do'` | Status zadania. |
| `display_order`| `DOUBLE PRECISION` | | Kolejność wyświetlania na tablicy Kanban. |
| `due_date` | `TIMESTAMPTZ` | | Termin wykonania zadania. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu utworzenia rekordu. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu ostatniej aktualizacji rekordu. |

#### Tabela `public.task_history`

Przechowuje historię zmian dla zadań.
| Nazwa kolumny | Typ danych | Ograniczenia | Opis |
|---------------|---------------|--------------------------------------------------------------|------------------------------------------------|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unikalny identyfikator wpisu w historii. |
| `task_id` | `UUID` | `NOT NULL`, `REFERENCES public.tasks(id) ON DELETE CASCADE` | ID zadania, którego dotyczy zmiana. |
| `user_id` | `UUID` | `REFERENCES public.users(id) ON DELETE SET NULL` | ID użytkownika, który dokonał zmiany. |
| `changed_field`| `TEXT` | `NOT NULL` | Nazwa zmienionego pola. |
| `old_value` | `TEXT` | | Poprzednia wartość pola. |
| `new_value` | `TEXT` | | Nowa wartość pola. |
| `changed_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Znacznik czasu dokonania zmiany. |

### 2. Relacje między tabelami

- **`users` <-> `projects`**: Wiele-do-wielu, realizowana przez tabelę `project_members`.
- **`users` -> `projects`**: Jeden-do-wielu (jeden użytkownik może być właścicielem wielu projektów, `owner_id`).
- **`projects` -> `milestones`**: Jeden-do-wielu (jeden projekt może mieć wiele kamieni milowych).
- **`projects` -> `tasks`**: Jeden-do-wielu (jeden projekt może mieć wiele zadań).
- **`milestones` -> `tasks`**: Jeden-do-wielu (jeden kamień milowy może mieć wiele zadań).
- **`users` -> `tasks`**: Jeden-do-wielu (jeden użytkownik może być przypisany do wielu zadań, `assignee_id`).
- **`tasks` <-> `tasks`**: Jeden-do-wielu (samoodwołująca się relacja dla podzadań, `parent_task_id`).
- **`tasks` -> `task_history`**: Jeden-do-wielu (jedno zadanie może mieć wiele wpisów w historii).

### 3. Indeksy

- **Tabela `tasks`**:
  - `CREATE INDEX ON public.tasks (project_id);`
  - `CREATE INDEX ON public.tasks (assignee_id);`
  - `CREATE INDEX ON public.tasks (milestone_id);`
  - `CREATE INDEX ON public.tasks (parent_task_id);`
  - `CREATE INDEX ON public.tasks (project_id, status);` (indeks złożony dla optymalizacji tablicy Kanban)
- **Tabela `task_history`**:
  - `CREATE INDEX ON public.task_history (task_id);`

### 4. Zasady PostgreSQL (Row Level Security)

Dla wszystkich poniższych tabel należy włączyć RLS: `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`

- **`public.users`**:
  - **Polityka SELECT**: Użytkownicy mogą widzieć tylko swój własny profil.
    ```sql
    CREATE POLICY "Allow users to view their own profile" ON public.users
      FOR SELECT USING (auth.uid() = id);
    ```
- **`public.projects`**:
  - **Polityka SELECT**: Członkowie projektu mogą widzieć projekt.
    ```sql
    CREATE POLICY "Allow project members to view their project" ON public.projects
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid()
      ));
    ```
- **`public.project_members`**:
  - **Polityka SELECT**: Członkowie projektu mogą widzieć innych członków tego samego projektu.
    ```sql
    CREATE POLICY "Allow project members to see other members" ON public.project_members
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.project_members AS pm WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
      ));
    ```
- **`public.tasks`**:
  - **Polityka ALL**: Członkowie projektu mają pełny dostęp (CRUD) do zadań w tym projekcie.
    ```sql
    CREATE POLICY "Allow project members to manage tasks" ON public.tasks
      FOR ALL USING (EXISTS (
        SELECT 1 FROM public.project_members WHERE project_id = tasks.project_id AND user_id = auth.uid()
      ));
    ```
- **`public.milestones`**:
  - **Polityka ALL**: Członkowie projektu mają pełny dostęp (CRUD) do kamieni milowych w tym projekcie.
    ```sql
    CREATE POLICY "Allow project members to manage milestones" ON public.milestones
      FOR ALL USING (EXISTS (
        SELECT 1 FROM public.project_members WHERE project_id = milestones.project_id AND user_id = auth.uid()
      ));
    ```

### 5. Dodatkowe uwagi

- **Automatyczna aktualizacja `updated_at`**: Zaleca się stworzenie funkcji i triggera w PostgreSQL, które automatycznie aktualizują kolumnę `updated_at` przy każdej zmianie wiersza w tabelach `users`, `projects`, `milestones` i `tasks`.

  ```sql
  CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Przykład triggera dla tabeli projects
  CREATE TRIGGER on_projects_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
  ```

- **Normalizacja**: Schemat jest zaprojektowany z uwzględnieniem trzeciej postaci normalnej (3NF), co zapewnia spójność danych i minimalizuje redundancję.
- **Skalowalność**: Użycie `UUID` jako kluczy głównych oraz odpowiednie indeksowanie wspiera przyszłą skalowalność aplikacji.
