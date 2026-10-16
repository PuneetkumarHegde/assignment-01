## Export Software Frontend - Shipping Bill Architecture Refactor

Built on top of [fe-zen-arch](git@github.com:shivamkj/fe-zen-arch.git) — the core shared architecture for high-performance B2B SaaS frontends.

---

### Tech Stack & Libraries
- **React 19** [Docs](https://react.dev/reference/react)
- **Tailwind CSS v4** [Docs](https://tailwindcss.com/docs/installation)
- **React Hook Form & `core/form`** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand Router & App State** [Docs](https://zustand.docs.pmnd.rs/)
- **Vite** [Docs](https://vite.dev/)

---

### Setup & Getting Started

```bash
# 1. Initialize Git submodule (fe-zen-arch)
git submodule update --init --recursive

# 2. Install workspace dependencies
pnpm install

# 3. Start local development server (port 5173)
pnpm dev

# 4. Type check and code linting
npx tsc --noEmit
bash fe-zen-arch/scripts/lint.sh

# 5. Production build
pnpm build
```

---

### Architecture & Engineering Decisions

The Shipping Bill creation and editing system has been refactored from a monolithic implementation into a clean, modular, and maintainable architecture following the `fe-zen-arch` conventions:

```
src/shipping-bills/
├── components/
│   ├── additional-details.tsx   # Containers, packaging ranges, e-Sanchit docs
│   ├── form-state-views.tsx     # Skeleton loaders, async error states
│   ├── invoices-section.tsx     # Invoices, invoice cards, goods line items, auto-calculations
│   ├── party-fields.tsx         # Exporter/consignee fields with auto single-branch selection
│   ├── searchable-select.tsx    # Debounced async popover select with keyboard support
│   ├── shipment-basics.tsx      # Port selectors, weights, package counts, marks & numbers
│   └── workflow-header.tsx      # Step indicators, draft status, action bar
├── services/
│   └── mock-data.ts             # Centralized lookup catalogs, ports, currencies, and test fixtures
├── validation/
│   └── shipping-bill-schema.ts  # Declarative, fluent validation rules via fe-zen-arch validator
├── marks-and-numbers-source.ts  # Exporter-specific async Marks & Numbers lookup
├── model.ts                     # TypeScript data interfaces & defaults
├── party-dialogs.tsx            # Quick-add modal dialogs for Exporters, Consignees, and Branches
├── party-mock-service.ts        # Async party search and mutation service
├── shipping-bill-form.tsx       # Lean root coordinator component with tabs and form state
├── shipping-bill-service.ts     # Asynchronous API/Mock service layer with duplicate prevention
├── types.ts                     # Strong TypeScript contracts for forms, APIs, and options
└── workflow.ts                  # Workflow state machine definitions
```

#### 1. Separation of Concerns
- **Lean Coordinator (`shipping-bill-form.tsx`)**: Manages tab state, form context, initial data loading, submission orchestration, and dialog integration.
- **Dedicated Section Modules (`components/`)**: Each tab and domain entity (Shipment Basics, Invoices & Items, Additional Details) is isolated into focused, reusable components.
- **Reusable Input Controls (`searchable-select.tsx`)**: Debounced async search, popover placement, keyboard navigation, and custom value rendering.

#### 2. Form State & Data Flow
- **Direct React Hook Form Integration**: Uses `useForm` from `core/form` alongside `Form` and `SubmitButton` from `ui/form`.
- **Dynamic Array Handling**: Invoices, line items, containers, packaging lists, and supporting documents use `useFieldArray` for efficient, targeted re-renders.
- **Computed Real-Time Totals**: Goods line totals (`quantity * unitPrice * (unitRate / noOfUnits)`) and invoice values automatically update in real time.
- **Dependent Select Cascading**:
  - Selecting an Exporter triggers async loading of exporter branches and marks & numbers.
  - Selecting a single-branch party automatically populates the branch selector.
  - "Buyer same as consignee" automatically synchronizes consignee details.

#### 3. Asynchronous Mock Service Layer (`shipping-bill-service.ts`)
- Implements asynchronous operations with artificial latency (`200ms - 400ms`) simulating real network conditions.
- **Duplicate Submission Protection**: Tracks in-flight request hashes to prevent duplicate submissions.
- **RESTful Payload Mapping**: Converts frontend form state to and from the ICEGATE-compliant schema defined in `shipping_bill.http`.
- **Offline & Local Storage Persistence**: Supports local persistence in demo mode so created and modified bills survive page refreshes.

#### 4. Validation Architecture (`validation/shipping-bill-schema.ts`)
- Utilizes the fluent validator pattern from `fe-zen-arch`:
  - Required fields: Job number, job date, exporter, consignee, loading port, destination port, gross weight.
  - Numerical constraints: Weights, package counts, invoice amounts, quantities, and unit prices enforce positive or non-negative checks.
  - Conditional checks: Dependent fields like drawback serial numbers when drawback schemes are chosen.

---

### Trade-offs & Future Improvements
1. **Dynamic Schema Extension**: As customs regulations change, schemas can be loaded dynamically per country or port.
2. **Batch Item Upload**: Support Excel/CSV drag-and-drop parsing for bulk invoice line items.
3. **Advanced Offline Sync**: Implement IndexedDB synchronization with background service workers for complete offline-first filing.
