# Specyfikacja Biznesowa: Mobilna Nawigacja dla Aplikacji 10x Project

## 1. Przegląd

Niniejsza specyfikacja definiuje zmiany w interfejsie użytkownika aplikacji 10x Project w celu poprawy doświadczeń mobilnych poprzez implementację dolnej nawigacji mobilnej oraz adaptację układu na małych ekranach. Zmiany dotyczą wyłącznie widoku mobilnego (< md breakpoint), zachowując pełną funkcjonalność desktopową bez modyfikacji.

## 2. Stack Technologiczny

- **Frontend Framework**: Astro 5
- **Język**: TypeScript 5
- **Komponenty Interaktywne**: React 19
- **Stylowanie**: Tailwind CSS 4
- **Biblioteka Komponentów**: Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, BaaS)
- **Testowanie**: Vitest (unit/integration), React Testing Library, Playwright (E2E)

## 3. Komponenty Dotknięte Zmianami

### Komponenty do Modyfikacji:

- `AppHeader.tsx` - główny nagłówek aplikacji
- `Layout.astro` - główny layout aplikacji
- `ProjectList.tsx` - lista projektów na dashboardzie

### Komponenty do Utworzenia:

- `MobileNavigation.tsx` - nowy komponent dolnej nawigacji mobilnej
- `MobileLayout.tsx` lub modyfikacja `Layout.astro` - dedykowany layout mobilny

## 4. Zachowanie Desktop (>= md breakpoint)

### Wymagania Niezmienności:

- Utrzymanie obecnego układu z `AppHeader` na górze
- Zachowanie pełnej funkcjonalności listy projektów w układzie grid
- Brak zmian w rozmieszczeniu elementów nawigacyjnych
- Pełna widoczność stopki aplikacji (jeśli istnieje)
- Zachowanie obecnych breakpointów Tailwind (md: 768px)

## 5. Zachowanie Mobile (< md breakpoint)

### 5.1 Układ Strony

#### Modyfikacje Header:

- `AppHeader` pozostaje widoczny z minimalistycznym wyglądem
- Logo/nazwa aplikacji "10x Project" centralnie lub po lewej stronie
- Menu użytkownika zminimalizowane do ikony lub awatara
- Wysokość headera zoptymalizowana dla mobile (compact mode)

#### Główna Zawartość:

- Lista projektów (`ProjectList`) w układzie pionowym (single column)
- Karty projektów (`ProjectCard`) w pełnej szerokości
- Przycisk "Utwórz nowy projekt" zoptymalizowany dla dotyku (min. 44x44px)
- Zachowanie przewijania pionowego dla treści

#### Ukrycie Klasycznej Stopki:

- Globalna stopka aplikacji ukryta na ekranach < md
- Miejsce zarezerwowane dla dolnej nawigacji mobilnej
- Brak konfliktów z-index między stopką a nawigacją mobilną

### 5.2 Dolna Nawigacja Mobilna

#### Komponent `MobileNavigation`:

**Pozycjonowanie:**

- Fixed position na dole ekranu
- Z-index zapewniający widoczność ponad innymi elementami
- Sticky behavior przy scrollowaniu
- Wysokość zoptymalizowana (56-64px recommended)

**Struktura Nawigacji:**

- Nawigacja podzielona na równe sekcje (3-5 elementów)
- Domyślne sekcje:
  1. **Dashboard** (Home) - strona główna z listą projektów
  2. **Projekty** - dostęp do wszystkich projektów
  3. **Profil** - ustawienia użytkownika i wylogowanie

**Elementy Wizualne:**

- Ikony z biblioteki lucide-react lub ikony Shadcn/ui
- Label tekstowy pod każdą ikoną (opcjonalnie skracany)
- Wskaźnik aktywnego widoku (kolor accent, podkreślenie)
- Minimum touch target: 44x44px zgodnie z WCAG 2.1
- Konsystentny padding i spacing między elementami

**Stany Interakcji:**

- Stan aktywny: wyróżnienie kolorem i/lub grubszą ikoną
- Stan hover: subtelna zmiana opacity (desktop fallback)
- Stan focus: widoczny focus ring dla dostępności klawiatury
- Stan disabled: opacity 50% dla niedostępnych sekcji (jeśli dotyczy)

**Kolorystyka i Motyw:**

- Tło: bg-background lub bg-card (zgodne z motywem Shadcn)
- Tekst aktywny: text-foreground lub text-primary
- Tekst nieaktywny: text-muted-foreground
- Border górny: border-t dla wizualnej separacji
- Wsparcie dla dark mode (jeśli aplikacja go używa)

### 5.3 Dostępność (Accessibility)

#### Wymagania WCAG 2.1:

- **Minimum touch targets**: 44x44px dla wszystkich elementów interaktywnych
- **ARIA roles**: `role="navigation"` dla `MobileNavigation`
- **ARIA labels**:
  - `aria-label="Mobile navigation"` dla głównego kontenera
  - `aria-current="page"` dla aktywnego elementu nawigacji
- **Keyboard navigation**: pełna obsługa Tab i Enter/Space
- **Screen reader support**:
  - Opisowe teksty dla każdej zakładki
  - Komunikaty o zmianie aktywnej sekcji
- **Focus management**: zachowanie focus po nawigacji
- **Kontrast kolorów**: minimum 4.5:1 dla tekstu, 3:1 dla elementów UI

### 5.4 Przejścia i Animacje

#### Animacje Nawigacji:

- Czas trwania przejść: 200-300ms (motion-reduce respecting)
- Easing: ease-in-out lub cubic-bezier dla płynności
- Transition properties: transform, opacity
- Brak animacji dla użytkowników z `prefers-reduced-motion`

#### Zachowanie Scrollowania:

- Nawigacja pozostaje widoczna podczas scrollowania (fixed)
- Smooth scroll do góry strony po zmianie zakładki (opcjonalne)
- Zachowanie pozycji scrolla dla każdej zakładki (session storage)

## 6. Routing i Nawigacja

### Struktura URL:

- `/` - Dashboard (domyślny widok)
- `/projects` - Lista wszystkich projektów (jeśli różni się od dashboard)
- `/profile` - Profil użytkownika
- Wykorzystanie Astro View Transitions API dla płynnych przejść

### Zarządzanie Stanem:

- Aktywna zakładka określana na podstawie `Astro.url.pathname`
- Highlight aktywnej sekcji w `MobileNavigation`
- Utrzymanie stanu formularzy przy nawigacji (jeśli dotyczy)

## 7. Responsywność

### Breakpointy Tailwind:

- **Mobile**: < 768px (< md) - dolna nawigacja aktywna
- **Tablet**: >= 768px (>= md) - przejście do desktop layout
- **Desktop**: >= 1024px (>= lg) - pełny desktop experience

### Ukrywanie/Pokazywanie Elementów:

- `MobileNavigation`: `class="md:hidden"` - widoczna tylko < md
- Klasyczna stopka: `class="hidden md:block"` - ukryta < md
- Header desktop elements: warunkowe renderowanie dla mobile/desktop

## 8. Przypadki Użycia

### UC1: Użytkownik przegląda Dashboard na mobile

1. Użytkownik otwiera aplikację na urządzeniu mobilnym
2. Widzi kompaktowy `AppHeader` i listę projektów w układzie pionowym
3. Na dole ekranu widoczna jest `MobileNavigation` z podświetloną zakładką "Dashboard"
4. Klasyczna stopka jest ukryta
5. Użytkownik może scrollować listę projektów bez przeszkód

### UC2: Użytkownik nawiguje do Profilu

1. Użytkownik klika ikonę "Profil" w `MobileNavigation`
2. Następuje smooth transition do strony profilu
3. Zakładka "Profil" w nawigacji zostaje podświetlona
4. `MobileNavigation` pozostaje widoczna i dostępna

### UC3: Użytkownik przełącza się z mobile na desktop

1. Użytkownik obraca urządzenie lub zmienia rozmiar okna
2. Po przekroczeniu breakpoint md (768px):
   - `MobileNavigation` znika
   - Klasyczna stopka pojawia się (jeśli istnieje)
   - Layout przełącza się na widok desktopowy
3. Wszystkie funkcjonalności desktop są dostępne

### UC4: Użytkownik tworzy nowy projekt na mobile

1. Użytkownik klika przycisk "Utwórz nowy projekt" w `ProjectList`
2. Otwiera się `CreateProjectModal` jako pełnoekranowy overlay
3. `MobileNavigation` pozostaje pod modalem (niższy z-index)
4. Po utworzeniu projektu modal zamyka się, nawigacja jest ponownie dostępna

## 9. Metryki Sukcesu

### Wskaźniki UX:

- Poprawa czasu dostępu do głównych sekcji aplikacji na mobile
- Redukcja liczby kliknięć potrzebnych do nawigacji
- Zwiększenie satysfakcji użytkowników mobilnych (survey feedback)

### Wskaźniki Techniczne:

- Zero regresji w funkcjonalności desktop
- 100% zgodność z WCAG 2.1 Level AA
- Lighthouse Mobile Score: >= 90
- Brak błędów accessibility w testach automatycznych

### Wskaźniki Biznesowe:

- Zwiększenie konwersji na urządzeniach mobilnych
- Wzrost czasu spędzonego w aplikacji przez użytkowników mobile
- Redukcja bounce rate na mobile

## 10. Wymagania Niefunkcjonalne

### Wydajność:

- First Contentful Paint < 1.5s na 3G
- Time to Interactive < 3s na mobile
- Layout Shift Score < 0.1

### Zgodność:

- iOS Safari >= 14
- Android Chrome >= 90
- Samsung Internet >= 14
- Graceful degradation dla starszych przeglądarek

### Testowanie:

- Unit testy dla `MobileNavigation` (React Testing Library)
- Integration testy dla przełączania widoków
- E2E testy (Playwright) dla kluczowych user flows
- Visual regression testy dla różnych rozdzielczości

## 11. Harmonogram Implementacji

### Faza 1: Przygotowanie

- Utworzenie komponentu `MobileNavigation`
- Aktualizacja `Layout.astro` dla wsparcia mobilnego
- Implementacja logiki ukrywania stopki

### Faza 2: Integracja

- Integracja z istniejącym routingiem Astro
- Implementacja stylowania Tailwind
- Dodanie animacji i przejść

### Faza 3: Testowanie

- Testy jednostkowe i integracyjne
- Testy E2E dla mobile flows
- Testy accessibility
- User acceptance testing

### Faza 4: Optymalizacja

- Performance optimization
- Accessibility refinements
- Bug fixes i polish

## 12. Ryzyka i Mitygacje

### Ryzyko 1: Konflikt z istniejącym layoutem

- **Mitygacja**: Dokładne testowanie na różnych breakpointach, użycie media queries

### Ryzyko 2: Problemy z accessibility

- **Mitygacja**: Wczesne testy accessibility, konsultacje z guidelines WCAG

### Ryzyko 3: Regresja w funkcjonalności desktop

- **Mitygacja**: Comprehensive regression testing, feature flags dla stopniowego rollout

### Ryzyko 4: Performance overhead

- **Mitygacja**: Code splitting, lazy loading, performance monitoring

## 13. Zależności

- Shadcn/ui komponenty (Button, Icons)
- Tailwind CSS responsive utilities
- Astro View Transitions API
- React hooks dla zarządzania stanem
- lucide-react dla ikon

## 14. Dokumentacja Powiązana

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Astro Documentation](https://docs.astro.build/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React 19 Documentation](https://react.dev/)

## 15. Zatwierdzenia

- **Product Owner**: [Do uzupełnienia]
- **Tech Lead**: [Do uzupełnienia]
- **UX Designer**: [Do uzupełnienia]
- **QA Lead**: [Do uzupełnienia]

---

**Wersja**: 1.0  
**Data utworzenia**: 9 grudnia 2024  
**Autor**: AI Specialist - Frontend, React, Tailwind  
**Status**: Draft - Oczekuje na zatwierdzenie
