# Guia de Frontend — Tailwind e Design System

Objetivo: padronizar o uso de Tailwind em um design system compartilhado, permitindo reutilização/extensão de componentes com variantes e merge seguro de classes.

## Stack recomendada
- Next.js em `apps/web`
- Tailwind CSS com tokens centralizados no `tailwind.config.js`
- `class-variance-authority` (CVA) para variantes tipadas
- `tailwind-merge` + `clsx` para merge de classes sem conflitos
- `packages/ui` para componentes reutilizáveis; `apps/web` só monta páginas/flows

## Padrão de utilitário `cn`
Crie um helper único em `packages/ui/src/lib/cn.ts`:
```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```
Use `cn` em todos os componentes para combinar classes e evitar duplicatas.

## Padrão de componente com variantes (ex.: Button)
Em `packages/ui/src/components/button.tsx`:
```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      intent: {
        primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900',
        secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:outline-slate-900',
        ghost: 'bg-transparent text-slate-900 hover:bg-slate-100',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
```

### Como estender
- **Novos estilos**: adicione variantes (`intent`, `size`, `tone`, etc.) em vez de criar vários componentes paralelos.
- **Casos específicos**: use `className` com `cn` para ajustes pontuais, mantendo a base do componente.
- **Composição**: crie wrappers (ex.: `IconButton`) que reutilizam `buttonVariants` e só ajustam props/ícones.

## Convenções de Tailwind
- Tokens (cores, spacing, fonte) definidos no `tailwind.config.js` e usados via classes utilitárias; evite valores mágicos in-line.
- Prefira variantes CVA em vez de listas de classes injetadas diretamente em páginas.
- Use `@apply` apenas em camadas globais (ex.: tipografia base) ou quando necessário; componentes devem usar classes utilitárias + variantes.
- Manter componentes acessíveis (focus states, `aria-*`, `disabled`).
- Evitar duplicar estilos: se notar padrões repetidos em páginas, suba para `packages/ui`.

## Organização sugerida em `packages/ui`
```
packages/ui/
  src/
    lib/cn.ts
    components/
      button.tsx
      input.tsx
      textarea.tsx
      card.tsx
      alert.tsx
    index.ts      # exports públicos
```

## Integração com apps
- `apps/web`: importa somente de `@giftpix/ui`, não define estilos ad-hoc exceto layout de páginas.
- Para novos componentes, primeiro adicionar no `packages/ui` e publicar via barrel export (`index.ts`).
