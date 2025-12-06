# Dokument wymagań produktu (PRD) - ProjectFlow

## 1. Przegląd produktu

ProjectFlow to aplikacja internetowa zaprojektowana w celu usprawnienia zarządzania projektami dla małych i średnich zespołów. Produkt ma na celu centralizację planowania pracy poprzez zapewnienie prostego, ale potężnego interfejsu do tworzenia hierarchii zadań, zarządzania kamieniami milowymi (milestones) i wizualnego śledzenia postępów na tablicy Kanban. Celem MVP jest dostarczenie podstawowych funkcjonalności, które pozwolą zespołom odejść od chaotycznych i rozproszonych metod planowania na rzecz jednego, spójnego źródła prawdy o stanie projektu.

## 2. Problem użytkownika

W wielu zespołach planowanie pracy jest chaotyczne i rozproszone. Kluczowe informacje o zadaniach, terminach i celach są rozrzucone po różnych dokumentach, wątkach e-mailowych i komunikatorach. Ten brak centralizacji prowadzi do nieefektywności, nieporozumień i trudności w monitorowaniu rzeczywistego postępu projektu. Członkowie zespołu często nie wiedzą, jakie są priorytety, a menedżerowie mają problem z uzyskaniem jasnego obrazu stanu prac bez ciągłego dopytywania. Brakuje prostego narzędzia, które pozwoliłoby na łatwe tworzenie hierarchii zadań (zadania i podzadania) i powiązanie ich z nadrzędnymi celami (milestones).

## 3. Wymagania funkcjonalne

### 3.1. System Ról i Uprawnień

- Aplikacja będzie obsługiwać trzy role użytkowników:
  - Administrator: Zarządza użytkownikami i ma najwyższe uprawnienia. Może nadawać rolę Menedżera Projektu.
  - Menedżer Projektu: Tworzy projekty, zarządza członkami projektu, tworzy i zarządza kamieniami milowymi oraz ma pełne uprawnienia do zadań w ramach swoich projektów.
  - Członek Zespołu: Może tworzyć zadania i podzadania, zmieniać ich statusy i przeglądać projekty, do których został przypisany.

### 3.2. Zarządzanie Projektami

- Menedżerowie Projektu mogą tworzyć nowe projekty.
- Menedżerowie Projektu mogą dodawać i usuwać członków zespołu z projektu.
- Każdy użytkownik ma dostęp do listy projektów, w których uczestniczy.

### 3.3. Zarządzanie Zadaniami i Hierarchia

- System wspiera dwupoziomową hierarchię: zadania i podzadania.
- Użytkownicy mogą tworzyć zadania z tytułem, opcjonalnym opisem, terminem i przypisaniem do innego członka zespołu.
- Podzadania można tworzyć z poziomu widoku szczegółów zadania nadrzędnego.

### 3.4. Tablica Kanban

- Każdy projekt posiada interaktywną tablicę Kanban.
- Tablica ma cztery stałe, niezmienne kolumny statusów: `To Do`, `In Progress`, `Testing`, `Done`.
- Użytkownicy mogą zmieniać status zadań i podzadań, przeciągając je między kolumnami.
- Użytkownicy mogą ręcznie zmieniać kolejność zadań w obrębie jednej kolumny, aby ustalić ich priorytet.

### 3.5. Kamienie Milowe (Milestones)

- Menedżerowie Projektu mogą tworzyć kamienie milowe (z nazwą, opisem i datą) w ramach projektu.
- Zadania mogą być przypisywane do kamieni milowych, co pozwala na grupowanie pracy i śledzenie postępów w realizacji celów.

### 3.6. Filtrowanie i Widoczność

- Tablica Kanban oferuje możliwość filtrowania zadań według przypisanego użytkownika oraz kamienia milowego.

### 3.7. Historia i Audyt

- System rejestruje prosty log aktywności dla każdego zadania, śledząc kluczowe zmiany, takie jak zmiana statusu czy przypisania, wraz z informacją o autorze i dacie zmiany.

## 4. Granice produktu

Następujące funkcje są świadomie wyłączone z zakresu MVP, aby zapewnić szybkie dostarczenie podstawowej wartości produktu. Mogą zostać rozważone w przyszłych wersjach.

- Zaawansowane powiadomienia i integracje (np. Slack, e-mail).
- Komunikacja wewnętrzna (czat, komentarze pod zadaniami).
- Raporty czasu pracy i timetracking.
- Zaawansowane, konfigurowalne role i uprawnienia w zespole.
- Integracje z zewnętrznymi kalendarzami (Google Calendar, Microsoft Calendar).
- Dedykowane aplikacje mobilne (iOS, Android).
- Import i eksport danych (np. z/do CSV).
- Możliwość dodawania załączników do zadań.

## 5. Historyjki użytkowników

### ID: US-001

- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu mojego adresu e-mail i hasła, aby uzyskać dostęp do systemu.
- Kryteria akceptacji:
  1. Formularz rejestracji zawiera pola na adres e-mail i hasło.
  2. System waliduje, czy podany e-mail nie jest już zarejestrowany.
  3. Po pomyślnej rejestracji na podany adres e-mail wysyłany jest link weryfikacyjny.
  4. Użytkownik widzi komunikat informujący o konieczności weryfikacji adresu e-mail.
  5. Po kliknięciu w link aktywacyjny, konto użytkownika zostaje aktywowane, a on sam jest przekierowany na stronę logowania.
  6. Nowo zarejestrowany użytkownik domyślnie otrzymuje rolę "Członek Zespołu".

### ID: US-002

- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby kontynuować pracę.
- Kryteria akceptacji:
  1. Formularz logowania zawiera pola na adres e-mail i hasło.
  2. System weryfikuje poprawność danych logowania.
  3. W przypadku błędnych danych wyświetlany jest odpowiedni komunikat.
  4. Po pomyślnym zalogowaniu użytkownik jest przekierowany do swojego panelu głównego.

### ID: US-003

- Tytuł: Zarządzanie rolami przez Administratora
- Opis: Jako Administrator, chcę mieć możliwość zmiany roli użytkownika z "Członek Zespołu" na "Menedżer Projektu", aby delegować uprawnienia do tworzenia projektów.
- Kryteria akceptacji:
  1. Administrator ma dostęp do listy wszystkich użytkowników w systemie.
  2. Przy każdym użytkowniku z rolą "Członek Zespołu" widoczna jest opcja "Nadaj rolę Menedżera".
  3. Po zmianie roli użytkownik uzyskuje uprawnienia Menedżera Projektu.

### ID: US-004

- Tytuł: Tworzenie nowego projektu
- Opis: Jako Menedżer Projektu, chcę stworzyć nowy projekt, podając jego nazwę, aby zainicjować przestrzeń roboczą dla mojego zespołu.
- Kryteria akceptacji:
  1. Menedżer Projektu widzi przycisk "Utwórz nowy projekt".
  2. Po kliknięciu pojawia się formularz wymagający podania nazwy projektu.
  3. Po utworzeniu projektu Menedżer jest przekierowywany na stronę ustawień tego projektu, gdzie może dodać członków.
  4. Nowo utworzony projekt ma domyślnie skonfigurowaną tablicę Kanban z kolumnami: "To Do", "In Progress", "Testing", "Done".

### ID: US-005

- Tytuł: Zarządzanie członkami projektu
- Opis: Jako Menedżer Projektu, chcę dodawać lub usuwać członków zespołu z mojego projektu, aby kontrolować dostęp do informacji.
- Kryteria akceptacji:
  1. Na stronie ustawień projektu dostępna jest sekcja "Członkowie".
  2. Menedżer może wyszukać istniejących użytkowników w systemie (np. po adresie e-mail) i dodać ich do projektu.
  3. Menedżer może usunąć członka z projektu.
  4. Usunięty członek traci dostęp do projektu i jego zasobów.

### ID: US-006

- Tytuł: Przeglądanie projektów
- Opis: Jako zalogowany użytkownik, chcę widzieć listę wszystkich projektów, do których zostałem przypisany, aby mieć łatwy dostęp do swoich przestrzeni roboczych.
- Kryteria akceptacji:
  1. Po zalogowaniu użytkownik widzi listę projektów.
  2. Lista zawiera tylko te projekty, do których użytkownik należy.
  3. Kliknięcie na nazwę projektu przenosi użytkownika do tablicy Kanban tego projektu.

### ID: US-007

- Tytuł: Tworzenie nowego zadania
- Opis: Jako członek zespołu, chcę móc dodać nowe zadanie na tablicy Kanban, aby zarejestrować nową pracę do wykonania.
- Kryteria akceptacji:
  1. Na tablicy Kanban znajduje się przycisk "Dodaj zadanie".
  2. Formularz tworzenia zadania wymaga podania tytułu.
  3. Opcjonalnie można dodać opis, termin wykonania, przypisać zadanie do członka zespołu i kamienia milowego.
  4. Nowe zadanie domyślnie pojawia się w kolumnie "To Do".

### ID: US-008

- Tytuł: Tworzenie podzadania
- Opis: Jako członek zespołu, chcę móc dodać podzadanie do istniejącego zadania, aby rozbić większą pracę na mniejsze, zarządzalne części.
- Kryteria akceptacji:
  1. W widoku szczegółów zadania dostępny jest przycisk "Dodaj podzadanie".
  2. Formularz tworzenia podzadania jest analogiczny do formularza zadania.
  3. Utworzone podzadanie jest wizualnie powiązane z zadaniem nadrzędnym.
  4. Podzadanie pojawia się na tablicy Kanban jako osobna, mniejsza karta.

### ID: US-009

- Tytuł: Edycja zadania
- Opis: Jako członek zespołu, chcę edytować istniejące zadanie, aby zaktualizować jego szczegóły, takie jak opis, termin czy przypisana osoba.
- Kryteria akceptacji:
  1. Po otwarciu szczegółów zadania, jego pola są edytowalne.
  2. Użytkownik może zmienić tytuł, opis, termin, przypisaną osobę i kamień milowy.
  3. Zmiany są zapisywane i odzwierciedlane w całym systemie.

### ID: US-010

- Tytuł: Zmiana statusu zadania
- Opis: Jako członek zespołu, chcę przeciągnąć kartę zadania do innej kolumny na tablicy Kanban, aby zaktualizować jego status.
- Kryteria akceptacji:
  1. Karty zadań i podzadań można przeciągać i upuszczać między kolumnami "To Do", "In Progress", "Testing", "Done".
  2. Zmiana statusu jest natychmiast zapisywana i widoczna dla innych członków zespołu.
  3. Próba przeniesienia zadania nadrzędnego do "Done", gdy jego podzadania nie są ukończone, jest blokowana i wyświetlany jest komunikat.

### ID: US-011

- Tytuł: Priorytetyzacja zadań w kolumnie
- Opis: Jako członek zespołu, chcę móc zmieniać kolejność zadań w obrębie jednej kolumny, aby wizualnie określić ich priorytet.
- Kryteria akceptacji:
  1. Użytkownik może przeciągać i upuszczać zadania wertykalnie w tej samej kolumnie.
  2. Nowa kolejność jest zapisywana i widoczna dla wszystkich członków projektu.

### ID: US-012

- Tytuł: Zarządzanie kamieniami milowymi (Milestones)
- Opis: Jako Menedżer Projektu, chcę tworzyć i zarządzać kamieniami milowymi, aby grupować zadania wokół kluczowych celów i terminów.
- Kryteria akceptacji:
  1. Menedżer Projektu ma dostęp do sekcji "Milestones" w ustawieniach projektu.
  2. Może tworzyć nowy kamień milowy, podając jego nazwę, opis i datę docelową.
  3. Może edytować i usuwać istniejące kamienie milowe.
  4. Podczas tworzenia lub edycji zadania można je przypisać do istniejącego kamienia milowego.

### ID: US-013

- Tytuł: Filtrowanie tablicy Kanban
- Opis: Jako członek zespołu, chcę filtrować zadania na tablicy, aby skupić się na pracy przypisanej do mnie lub związanej z konkretnym kamieniem milowym.
- Kryteria akceptacji:
  1. Na tablicy Kanban dostępne są kontrolki filtrów.
  2. Użytkownik może wybrać członka zespołu, aby zobaczyć tylko zadania do niego przypisane.
  3. Użytkownik może wybrać kamień milowy, aby zobaczyć tylko zadania z nim związane.
  4. Filtry można łączyć.

### ID: US-014

- Tytuł: Przeglądanie historii zmian zadania
- Opis: Jako członek zespołu, chcę widzieć historię zmian dla danego zadania, aby zrozumieć jego cykl życia i kto dokonywał modyfikacji.
- Kryteria akceptacji:
  1. W widoku szczegółów zadania dostępna jest zakładka "Historia".
  2. Wyświetlana jest chronologiczna lista zdarzeń, takich jak zmiana statusu czy przypisania.
  3. Każdy wpis w historii zawiera informację o autorze zmiany i dacie jej dokonania.

## 6. Metryki sukcesu

Sukces MVP będzie mierzony za pomocą następujących kluczowych wskaźników, które odzwierciedlają adopcję produktu i realizację jego głównego celu.

- Wykorzystanie kamieni milowych:
  - Cel: Co najmniej 80% zadań w aktywnych projektach jest przypisanych do konkretnych kamieni milowych. Będzie to mierzone przez regularne analizy danych w bazie.
- Aktywność na tablicy Kanban:
  - Mierzone poprzez liczbę operacji zmiany statusu zadań (przeciąganie między kolumnami). Wysoka aktywność świadczy o tym, że zespoły używają tablicy jako dynamicznego narzędzia pracy.
