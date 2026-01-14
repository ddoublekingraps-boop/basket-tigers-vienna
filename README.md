# Basket Tigers Vienna Website (Astro + Decap CMS)

## Lokal starten
1) Node.js installieren (LTS)
2) Im Projektordner:
   - `npm install`
   - `npm run dev`
3) Öffne die URL die im Terminal steht.

## Deploy auf Netlify
- Repo zu GitHub hochladen
- In Netlify neues Site-Project erstellen (Build command: `npm run build`, Publish dir: `dist`)
- In Netlify aktivieren:
  1) **Identity**
  2) **Git Gateway**
  3) Registration: **Invite only**
- Admin Panel: `/admin`

## Admins (5 Personen)
In Netlify → Identity → Invite Users → die 5 Admin-Emails einladen.

## Inhalte
Alles wird über `/admin` gepflegt:
- Spieler, Teams, Spielzeiten, Trainingszeiten, News, Sponsoren, Verein/Kontakt Texte.
