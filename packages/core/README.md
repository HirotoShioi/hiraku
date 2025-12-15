<p align="center">
  <img src="../../assets/hiraku-logo.svg" alt="hiraku" width="400" />
</p>

<p align="center">
  <b>hiraku core</b> - Shared logic & types for hiraku integrations (no UI primitives included)
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-core"><img src="https://img.shields.io/npm/v/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="npm version" /></a>
  <a href="https://bundlephobia.com/result?p=@hirotoshioi/hiraku-core"><img src="https://img.shields.io/bundlephobia/minzip/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef&label=bundle" alt="bundle size" /></a>
  <a href="https://www.npmjs.com/package/@hirotoshioi/hiraku-core"><img src="https://img.shields.io/npm/dt/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="downloads" /></a>
  <a href="https://github.com/hirotoshioi/hiraku/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirotoshioi/hiraku-core?style=flat&colorA=18181b&colorB=d946ef" alt="license" /></a>
  <a href="https://deepwiki.com/HirotoShioi/hiraku"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#recommended-usage">Recommended usage</a> •
  <a href="#installation">Installation</a> •
  <a href="#exports">Exports</a>
</p>

---

## Features

- ⚡ **Open from anywhere** - Call `modal.open()` from any file, even outside React components
- 🔒 **Type-safe** - Strongly typed props + close results
- 🧩 **Framework-agnostic** - No Radix/Base UI dependency
- 🪶 **Lightweight** - Depends only on zustand
- 🧱 **Integration-first** - This package is typically used via an integration package

## Recommended usage

Most apps should install an integration package:

- **Radix UI**: `@hirotoshioi/hiraku-radix-ui` (see `packages/radix-ui/`)
- **Base UI**: `@hirotoshioi/hiraku-base-ui` (see `packages/base-ui/`)

`@hirotoshioi/hiraku-core` is the shared implementation used by those packages (and for building custom integrations).

## Installation

```bash
npm install @hirotoshioi/hiraku-core
```

## Exports

- Factories: `createDialog`, `createSheet`, `createAlertDialog`
- Hooks: `useModal`, `useModalStore`
- Global: `modalController`
- Types: `ModalRole`, `ModalResult`, `ModalWrapperType`, etc.

If you’re implementing a custom provider, the reference providers live in:

- `packages/radix-ui/src/provider.tsx`
- `packages/base-ui/src/provider.tsx`
