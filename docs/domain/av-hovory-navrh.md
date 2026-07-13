# Audio/Video hovory dítě ↔ oprávněná osoba — NÁVRH (neimplementovat)

Stav: **jen návrh k zamyšlení** (zadání 2026-07-06). Nic se zatím nekóduje. Chová se jako
chat (úřední, auditovaný, uložitelný pro soud), ale je technicky náročnější.

## Cíle
- Hovor smí zahájit jen ten, kdo má **aktivní grant `VideoCalls`** k dítěti a je v **časovém
  okně** (stejný engine jako chat s dítětem — §externí-ucastnici §1).
- **Auditovatelnost**: kdo, s kým, kdy, jak dlouho, kdo se připojil/odpojil — neměnný záznam.
- **Uložitelnost pro soud**: nahrávka (audio/video) v úložišti s retencí (Coldline, WF-10),
  hash souboru, odkaz do spisu (časová osa).
- **Přepis (transcription)**: text hovoru použitelný pro reporty/exporty OSPOD/soud.
- **Souhlas**: obě strany (resp. zákonný zástupce dítěte) informovány a souhlas zaznamenán
  před zahájením — bez souhlasu se nenahrává (právní režim).

## Varianty realizace (doporučení: řízená služba, ne self-host)

| Varianta | Klady | Zápory |
|---|---|---|
| **Daily.co** (doporučeno) | hotové nahrávání do cloudu, webhooky, jednoduché SDK, EU regiony, levné | závislost na 3. straně |
| **Twilio Video / LiveKit Cloud** | robustní, škálovatelné, nahrávání | dražší / více integrace |
| **LiveKit self-host (WebRTC + SFU)** | data u nás, plná kontrola | provoz SFU, nahrávání/transkripce si řešíme, náročné |

Návrh: **Daily.co** pro MVP (rychlé, nahrávání + přepis lze doplnit), s abstrakcí
`callProvider` seam, aby šlo později přejít na self-host LiveKit bez změny UI/domény.

## Datový model (návrh)
```
external_participants/{epId}/calls/{callId}
  { childId, permissionGrantId, startedBy, participants:[uid…],
    scheduledFrom, startedAt, endedAt, durationSeconds,
    provider:'daily', roomUrl, recordingStoragePath, recordingHash,
    transcriptStoragePath, transcriptText, consent:{ byUid, at, method },
    status:'scheduled'|'active'|'ended'|'failed', createdAt }
  events/{id}   # neměnný audit hovoru: joined/left/recording_started/ended…
```

## Přepis (transcription)
- **Vertex AI Speech-to-Text** (EU) nad nahrávkou → `transcriptText` + časové značky.
- Přepis se vloží do **časové osy** dítěte (data v čase pro AI reporty) a jde exportovat do
  PDF „pro soud" spolu s metadaty hovoru (kdo/kdy/délka/účastníci/hash nahrávky).
- Fallback bez cloudu: ruční poznámka z hovoru (jako u chatu), přepis se doplní později.

## Bezpečnost / audit
- Zahájení hovoru = kontrola grantu `VideoCalls` + okna + souhlasu (jinak zamítnuto + audit).
- Vstup do roomu jen přes krátkodobý token (server-issued), nikdy trvalý odkaz.
- Každá událost hovoru neměnně do `calls/{id}/events` a do EP auditu.
- Nahrávka + přepis: Storage s rules zděděnými z rodiny, retence a anonymizace dle WF-10.

## Co je potřeba doplnit před realizací
- Účet u poskytovatele (Daily) + EU region + zpracovatelská smlouva (GDPR).
- Cloud Functions: issue room token, přijímat webhooky (recording ready), spustit přepis.
- Storage + Coldline retence, Vertex Speech-to-Text napojení.
- Právní rámec souhlasu s nahráváním nezletilého (konzultace).

DOTÁHNOUT až po EP-2..EP-4; zapsáno v docs/INVENTAR.md.
