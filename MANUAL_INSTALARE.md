# Manual de Instalare - CTSKudos

Acest ghid detaliază pașii necesari pentru instalarea și configurarea aplicației **CTSKudos** utilizând Docker și Docker Compose.

---

## 1. Cerințe de Sistem

Înainte de a începe, asigurați-vă că aveți instalate următoarele pe serverul sau calculatorul dumneavoastră:
*   **Docker** (v20.10 vagy mai nou)
*   **Docker Compose** (v2.0 vagy mai nou, de funcționează și cu v1.29+)

---

## 2. Configurarea Mediului (.env)

În rădăcina proiectului, trebuie să existe un fișier numit `.env`. Acesta conține variabilele critice pentru funcționarea aplicației.

Exemplu de conținut pentru `.env`:

```env
# URL-urile aplicației (înlocuiți cu IP-ul serverului)
APP_BASE_URL=http://192.168.88.175:9005
VITE_API_URL=http://192.168.88.175:8005

# Configurare Email (SMTP)
SEND_EMAILS=true
SMTP_HOST=mail.cargotrack.ro
SMTP_PORT=587
SMTP_EMAIL=kudos@cargotrack.ro
SMTP_PASSWORD=parola_ta_aici
FROM_EMAIL=kudos@cargotrack.ro

# Configurare Bază de Date (MariaDB)
DB_HOST=mariadb
DB_NAME=kudos_db
DB_USER=kudos_user
DB_PASSWORD=kudos_pass
DB_ROOT_PASSWORD=root_pass
```

---

## 3. Instalare și Lansare

Urmați acești pași în terminal (PowerShell sau Bash) din interiorul folderului proiectului:

1.  **Construirea și lansarea containerelor:**
    ```bash
    docker-compose up --build -d
    ```
    Această comandă va descărca imaginile necesare, va compila codul sursă și va porni serviciile în fundal.

2.  **Verificarea stării containerelor:**
    ```bash
    docker-compose ps
    ```
    Toate serviciile (`kudos_frontend`, `kudos_backend`, `kudos_db`) ar trebui să aibă starea `Up`.

---

## 4. Accesarea Aplicației

După ce containerele au pornit, aplicația poate fi accesată la:
*   **Frontend (Interfața utilizator):** `http://[IP-SERVER]:9005`
*   **Backend (API + API Docs):** `http://[IP-SERVER]:8005/docs`

### Date de autentificare implicite (Admin):
*   **Utilizator:** `admin@cargotrack.ro`
*   **Parolă:** `Cargo2025!@#`

*Notă: Se recomandă schimbarea parolei imediat după prima autentificare din panoul de administrare.*

---

## 5. Depanare (Troubleshooting)

### Eroarea 'ContainerConfig' sau erori de bază de date
Dacă întâmpinați erori la pornire sau baza de date nu este accesibilă, rulați următoarea procedură de resetare:

```bash
# 1. Opriți containerele și ștergeți-le pe cele vechi
docker-compose down
docker rm -f kudos_frontend kudos_backend kudos_db mariadb

# 2. Ștergeți volumul de date (ATENȚIE: Șterge toate datele din DB!)
# docker volume rm ctskudos_kudos_data

# 3. Reporniți build-ul
docker-compose up --build -d
```

### Probleme cu afișarea (Front-end neactualizat)
Dacă ați făcut modificări de cod, dar nu se văd în browser:
1.  Asigurați-vă că ați rulat build-ul cu flag-ul `--build`.
2.  Folosiți **Ctrl + F5** în browser pentru a șterge memoria cache.

---

## 6. Mentenanță

*   **Vizualizare Log-uri:** `docker-compose logs -f [nume_serviciu]`
*   **Oprire aplicație:** `docker-compose down`
