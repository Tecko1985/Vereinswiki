const APP_VERSION = "1.1";

const APP_CHANGELOG = [
  {
    version: "1.1",
    groups: [
      {
        title: "Oberfläche",
        items: [
          "Die App heißt jetzt „Toolbox Wiki“ – nur die Anzeige, Adresse und Daten bleiben unverändert."
        ]
      }
    ]
  },
  {
    version: "1.0",
    groups: [
      {
        title: "Wissens-Assistent",
        items: [
          "Fragen in normaler Sprache stellen und eine Antwort auf Basis der hinterlegten Vereinsdokumente erhalten (z. B. „Was steht in der Platzordnung zu Hunden?“).",
          "Die Antwort nennt – soweit möglich – aus welchem Dokument die Information stammt.",
          "Steht etwas nicht in den Dokumenten, sagt der Assistent das ehrlich, statt zu raten."
        ]
      },
      {
        title: "Dokumente",
        items: [
          "PDF- und Text-Dokumente hochladen, ansehen und wieder löschen – sie bilden die Wissensbasis, aus der der Assistent antwortet.",
          "Übersicht aller hinterlegten Dokumente mit Größe, Datum und Ersteller."
        ]
      },
      {
        title: "Daten & Datenschutz",
        items: [
          "Bewusst nur für allgemeine Vereinsunterlagen (Satzung, Ordnungen, Konzepte, Leitfäden) – keine personenbezogenen Daten (Mitgliederlisten, Geburtsdaten, Gehälter, Kontodaten).",
          "Dokumente liegen in der Vereins-Nextcloud und sind nur für berechtigte, angemeldete Nutzer zugänglich (Gruppen-Rechte werden serverseitig geprüft).",
          "Automatische Synchronisierung über die zentrale Anmeldung (Tools-Übersicht) – kein WebDAV-Passwort auf dem Gerät; bearbeiten zwei Geräte gleichzeitig, wird der Konflikt erkannt statt still überschrieben."
        ]
      }
    ]
  }
];
