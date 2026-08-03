<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Prediagnòstic energètic orientatiu per a habitatges

Assistent residencial guiat que calcula una puntuació energètica traçable, amb escenaris de millora, integració cadastral i informes Premium.

[Español](./README.md) · **Català** · [English](./README.en.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Italiano](./README.it.md) · [Português](./README.pt.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoria](https://img.shields.io/badge/categoria-Premium-C07860)
![Idiomes](https://img.shields.io/badge/idiomes%20producte-7-047857)

</div>

---

> [!IMPORTANT]
> Repositori intern de l'ecosistema Anclora. EnergyScan no genera un Certificat d'Eficiència Energètica oficial ni documentació amb validesa administrativa — és un prediagnòstic orientatiu. No publiqueu detalls operatius, credencials ni lògica sensible fora de canals autoritzats.

## Què és

Anclora EnergyScan guia l'usuari per un assistent sobre envolupant, sistemes, renovables, clima i tipologia de l'habitatge, i calcula una puntuació energètica explicable amb nivell de confiança. A partir del diagnòstic genera escenaris de millora comparables i un informe desbloquejable en modalitat Premium.

## Categoria a l'ecosistema

| Camp | Valor |
|---|---|
| Categoria | Premium |
| Accent de marca | `#00DC82` |
| Tipografia | DM Sans |
| Repositori canònic | `anclora-energyscan` |

## Funcionalitats principals

- Assistent residencial guiat (envolupant, sistemes, renovables, clima, tipologia)
- Puntuació energètica traçable amb nivell de confiança
- Escenaris de millora i estalvi orientatiu
- Integració cadastral i visualització de parcel·la (MapLibre)
- OCR sobre documentació aportada (Tesseract)
- Assistència d'IA generativa (Anthropic Claude)
- Informes en PDF, desbloqueig Premium via Stripe
- Xarxa de proveïdors, partners i leads

## Stack tecnològic

| Àrea | Tecnologia |
|---|---|
| Framework | Next.js, React |
| Base de dades | Prisma, PostgreSQL |
| Autenticació | NextAuth |
| IA generativa | Anthropic Claude SDK |
| Mapes cadastrals | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Pagaments | Stripe |
| Emmagatzematge | Vercel Blob |

## Inici local

```bash
npm install
npm run dev
```

## Idiomes suportats

El producte en producció admet 7 idiomes: Español (predeterminat), Català, English, Deutsch, Français, Italiano, Português (`PREMIUM_LOCALES`, `src/lib/anclora-language-toggle.ts`). Aquesta documentació es manté en els 7 idiomes del producte.

## Documentació i governança

- Contractes de marca i governança: [`docs/standards/`](./docs/standards/)
- Bóveda Anclora (font de veritat): `contracts/` i `docs/governance/`

---

<div align="center">

### Anclora Group

Ús intern.

</div>
