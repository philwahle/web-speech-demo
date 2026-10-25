# Web Speech Demo

Eine kleine Demo für die [Web Speech API](https://developer.mozilla.org/de/docs/Web/API/Web_Speech_API) im Browser: Sprache erkennen und Text vorlesen – ohne Bibliotheken, nur mit dem, was der Browser mitbringt.

**▶ Live-Demo: <https://philwahle.github.io/web-speech-demo/>**

## Ausprobieren

1. Demo öffnen und den Zugriff aufs Mikrofon erlauben.
2. **Zuhören starten** und sprechen – Zwischenergebnisse erscheinen sofort, fertige Sätze landen im Textfeld.
3. **Vorlesen** liest das Transkript vor (oder nur den markierten Teil).
4. **Text markieren** – irgendwo auf der Seite, z. B. im Beispieltext – liest ihn direkt vor.
5. Unter **Einstellungen** Sprache, Stimme, Geschwindigkeit, Tonhöhe und Lautstärke ändern. Die Einstellungen bleiben im Browser gespeichert.

## Browser-Unterstützung

| | Vorlesen (`speechSynthesis`) | Erkennung (`SpeechRecognition`) |
|---|---|---|
| Chrome / Edge | ✓ | ✓ (online) |
| Safari | ✓ | ✓ |
| Firefox | ✓ | ✗ |

Welche Stimmen zur Auswahl stehen, hängt von Browser und Betriebssystem ab. Stimmen mit dem Zusatz „· online“ werden über einen Server erzeugt.

> **Datenschutz:** Chrome und Edge schicken das Mikrofon-Audio zur Erkennung an Server von Google bzw. Microsoft. Safari erkennt je nach System auf dem Gerät oder über Apple-Server. Für Demos mit sensiblen Inhalten ist das wichtig zu wissen.

Der Mikrofonzugriff funktioniert nur in einem sicheren Kontext – also über `https://` oder `http://localhost`.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org/) ab Version 22.

```sh
npm install
npm run dev
```

Danach die angezeigte Adresse (meist <http://localhost:5173>) in Chrome, Edge oder Safari öffnen.

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver mit Live-Reload |
| `npm run build` | Typprüfung und Build nach `dist/` |
| `npm run preview` | Build lokal ansehen |

## Wie es funktioniert

Der Code steckt in vier kleinen Dateien unter `src/`:

| Datei | Inhalt |
|---|---|
| `recognition.ts` | Spracherkennung starten, stoppen, Ergebnisse auswerten |
| `speak.ts` | Text vorlesen und markierten Text finden |
| `settings.ts` | Sprachen und Stimmen auflisten, Einstellungen speichern |
| `main.ts` | Verbindet alles mit der Oberfläche |

Ein paar Stellen, an denen die API Überraschungen bereithält:

- **Der Browser beendet die Erkennung von selbst** – nach einer Pause, bei Netzwerkproblemen oder nach einer Zeitgrenze. `recognition.ts` merkt sich deshalb, ob weiter zugehört werden soll, und startet nach dem `end`-Event neu. Nur bei Fehlern wie `not-allowed` (Mikrofon verweigert) wird endgültig gestoppt.
- **Zwischen- und Endergebnisse:** Mit `interimResults = true` liefert das `result`-Event laufend vorläufigen Text. Erst Ergebnisse mit `isFinal` kommen ins Textfeld.
- **Stimmen laden asynchron:** `speechSynthesis.getVoices()` ist beim Seitenstart oft noch leer. Die Auswahl wird deshalb beim Event `voiceschanged` neu aufgebaut.
- **Sprachcodes sind nicht einheitlich:** Manche Plattformen (z. B. Android) melden `de_DE` statt `de-DE`. `settings.ts` vereinheitlicht das.
- **Markierungen in Textfeldern** erfasst `window.getSelection()` nicht. `speak.ts` liest sie deshalb über `selectionStart` und `selectionEnd` aus.
- **Typen:** TypeScript kennt die Event-Typen der Erkennung, aber nicht `SpeechRecognition` selbst. Die fehlenden Deklarationen stehen in `speech-recognition.d.ts`.

## Ideen zum Weiterbauen

- Sprachbefehle wie „Stopp“ oder „Leeren“ erkennen
- Wörter beim Vorlesen hervorheben (`boundary`-Event von `SpeechSynthesisUtterance`)
- Mehrere Erkennungsalternativen anzeigen (`maxAlternatives`)
- Transkript als Textdatei herunterladen

## Beispieltext

„Der Nordwind und die Sonne“ ist eine Fabel nach Äsop und gemeinfrei. Sie wird in der Phonetik traditionell als Referenztext verwendet.

## Lizenz

[MIT](LICENSE) – frei verwendbar, auch kommerziell, solange der Lizenzhinweis erhalten bleibt.
