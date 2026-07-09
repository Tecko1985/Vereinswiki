# Vereinswiki

KI-Wissens-Assistent (RAG-light) über allgemeine Vereinsunterlagen: Dokumente hinterlegen → Fragen in natürlicher Sprache → Google Gemini antwortet auf Basis der Dokumente. Vanilla-JS-Web-App, Gateway-only (kein lokaler Datei-Modus), Teil des Tools-Übersicht-Verbunds. Live-Ziel: https://tecko1985.github.io/Vereinswiki/.

## Architektur

Zwei Server-Gegenstellen (siehe Kopf von `db.js`):

1. **`admin-worker.js`** (Worker „landingpage", zentrales Gateway) – Login/Sichtbarkeit + Speicherung. Vereinswiki ist als `vereinswiki` in `DAV_APPS` eingetragen. Genutzte Aktionen: `dav-load`/`dav-save` (Dokumentenliste `vereinswiki.json`), `dav-file-put`/`dav-file-get`/`dav-file-delete` (Dokument-Dateien unter `dateien/<uuid>`, ≤ 10 MB), `me`.
2. **`wiki-worker.js`** (eigener Worker „vereinswiki") – der Gemini-Teil. Bekommt vom Browser nur `{ question }` + Bearer-Token, holt die Dokumente **selbst serverseitig** übers Gateway (mit demselben Token → dadurch automatischer Login-/Sichtbarkeits-Check), schickt PDFs als `inline_data` bzw. Text als Text-Part an `gemini-2.5-flash`, mit `system_instruction`. Hält **nur** `GEMINI_API_KEY` als Secret, **keine** Nextcloud-Zugangsdaten.

Der Wiki-Worker braucht keine eigene Token-Verifikation: Wenn `dav-load` 401/403 liefert, reicht er das an den Browser durch.

## Datenmodell

`vereinswiki.json`: `{ dokumente: [ { id, name, groesse, contentType, uploadedAt, uploadedBy } ] }`. Die Bytes liegen separat via `dav-file-put` unter `dateien/<id>`. `mutateAndSave()` in `app.js` ist idempotent (id-Dedup beim Hinzufügen, filter beim Löschen) für den Konflikt-Retry.

## Frontend (Muster aus TrainerCheckliste)

`connect-screen` bis Login, dann `app-shell` mit drei Tabs: **Fragen** (Textarea → `askWiki` → Antwort-Karte, Strg+Enter sendet), **Dokumente** (Upload PDF/TXT + Liste mit Ansehen/Löschen, Warnbox „keine Personendaten"), **Einstellungen** (Versionshistorie). Antworttext wird escaped + `\n`→`<br>` gerendert (kein Markdown, Gemini wird auf Klartext instruiert). Gemeinsame CSS-Basis wie die anderen Tools; Vereinswiki-Klassen (`warn-card`, `upload-row`, `dok-row`, `answer-card`) am Ende von `style.css`.

**Bearbeiten-Recht (seit 1.1):** Hochladen und Löschen dürfen nur Admins sowie Nutzer, deren Gruppe in der Tools-Übersicht für `vereinswiki` Bearbeiten-Rechte (`editGroupIds`) hat — Muster aus [[project-platzbelegung]]/vereinskalender/kadermanager. `fetchMe()` übergibt `app: GATEWAY_APP_ID`, wodurch der Worker `canEdit` bereits in der `me`-Antwort mitliefert (kein Worker-Redeploy nötig). `canEdit()` in `app.js` = `isAdmin || currentUser.canEdit`; gated client-seitig (`upload-card` ein-/ausblenden, Löschen-Button nur rendern, `handleUpload`/`handleDelete` brechen zusätzlich früh ab). **Nicht serverseitig in `dav-file-put`/`dav-save` erzwungen** — wie bei allen Schwester-Apps ist `userMayAccessTool` (Sichtbarkeit) die einzige Worker-seitige Schranke, `editGroupIds` nur client-seitiges UI-Gate (siehe `resolveEditPermission` in `admin-worker.js`).

## Datenschutz / Gemini-Gratis-Tier

Bewusst **nur nicht-personenbezogene** Vereinsunterlagen (im Gratis-Tier nutzt Google Eingaben ggf. zum Training). Sichtbarer Warnhinweis in der Upload-UI + `config.js`-Changelog. Bei künftigem Bedarf an PII-Dokumenten: Gemini bezahlt schalten (kein Training) oder auf Claude wechseln.

## Gotchas

- **Nextcloud-Ordner muss vorab existieren** (`Tools/Vereinswiki/` + `dateien/`): Plain WebDAV `PUT` legt fehlende Parent-Collections nicht an (409). Wie bei den anderen Gateway-Apps.
- **Gemini-Inline-Limit ~20 MB** pro Anfrage – `wiki-worker.js` begrenzt die Dokument-Gesamtgröße auf 18 MB und meldet 413. „Alles in den Prompt", kein RAG (für einige Dutzend Dokumente ausreichend).
- **Cache-Busting:** `index.html` lädt Skripte/CSS mit `?v=X.Y`. Bei jeder sichtbaren Änderung `APP_VERSION` in `config.js` **und** die `?v=`-Strings in `index.html` bumpen (sonst serviert GitHub Pages bis zu 10 min altes JS/CSS).
- **Dev-Port 8784** (`E:\.claude\launch.json`, Eintrag `vereinswiki`). 8799 war belegt (spiele-verify).
- **Zwei Worker-Deploys nötig** bei Änderungen: der eigene `vereinswiki`-Worker und ggf. der zentrale `landingpage`-Worker (bei `DAV_APPS`/`ALLOWED_ORIGINS`-Änderungen).
- **Modellwechsel:** `GEMINI_MODEL` in `wiki-worker.js` (aktuell `gemini-2.5-flash`, im Gratis-Tier). Muster für den Gemini-Call ist aus `beleg-scanner/worker.js` übernommen.
