<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./public/brand/anclora-energyscan.png" alt="Anclora EnergyScan" width="132" />

# Anclora EnergyScan

### Pré-diagnóstico energético indicativo para habitações

Wizard residencial guiado que calcula uma pontuação energética rastreável, com cenários de melhoria, integração cadastral e relatórios Premium.

[Español](./README.md) · [Català](./README.ca.md) · [English](./README.en.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Italiano](./README.it.md) · **Português**

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoria](https://img.shields.io/badge/categoria-Premium-C07860)
![Idiomas](https://img.shields.io/badge/idiomas%20produto-7-047857)

</div>

---

> [!IMPORTANT]
> Repositório interno do ecossistema Anclora. O EnergyScan não emite um Certificado de Eficiência Energética oficial nem documentação com validade administrativa — é um pré-diagnóstico indicativo. Não publique detalhes operacionais, credenciais ou lógica sensível fora dos canais autorizados.

## O que é

O Anclora EnergyScan guia o utilizador por um wizard sobre envolvente, sistemas, renováveis, clima e tipologia da habitação, e calcula uma pontuação energética explicável com nível de confiança. A partir do diagnóstico gera cenários de melhoria comparáveis e um relatório desbloqueável em modalidade Premium.

## Categoria no ecossistema

| Campo | Valor |
|---|---|
| Categoria | Premium |
| Destaque da marca | `#00DC82` |
| Tipografia | DM Sans |
| Repositório canónico | `anclora-energyscan` |

## Funcionalidades principais

- Wizard residencial guiado (envolvente, sistemas, renováveis, clima, tipologia)
- Pontuação energética rastreável com nível de confiança
- Cenários de melhoria e poupança indicativa
- Integração cadastral e visualização de parcela (MapLibre)
- OCR sobre documentação fornecida (Tesseract)
- Assistência de IA generativa (Anthropic Claude)
- Relatórios em PDF, desbloqueio Premium via Stripe
- Rede de fornecedores, parceiros e leads

## Stack tecnológico

| Área | Tecnologia |
|---|---|
| Framework | Next.js, React |
| Base de dados | Prisma, PostgreSQL |
| Autenticação | NextAuth |
| IA generativa | Anthropic Claude SDK |
| Mapas cadastrais | MapLibre GL |
| OCR | Tesseract.js |
| PDF | react-pdf, pdf-lib, pdfjs-dist |
| Pagamentos | Stripe |
| Armazenamento | Vercel Blob |

## Início local

```bash
npm install
npm run dev
```

## Idiomas suportados

O produto em produção suporta 7 idiomas: Español (padrão), Català, English, Deutsch, Français, Italiano, Português (`PREMIUM_LOCALES`, `src/lib/anclora-language-toggle.ts`). Esta documentação é mantida nos 7 idiomas do produto.

## Documentação e governança

- Contratos de marca e governança: [`docs/standards/`](./docs/standards/)
- Anclora Vault (fonte da verdade): `contracts/` e `docs/governance/`

---

<div align="center">

### Anclora Group

Uso interno.

</div>
