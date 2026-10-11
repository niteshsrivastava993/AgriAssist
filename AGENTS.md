<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All app data goes through `src/services/store.ts`; mock records live only in `src/data/mockData.ts`. Why: swap to a real API later without touching UI.
- Role access is enforced in layout route guards (e.g. `src/routes/farmer.tsx`), not by hiding links. Why: hidden links don't protect pages.
- UI text goes through `useT().t(key)` with `[en, hi]` pairs in `src/lib/i18n.tsx`; stored notifications keep a key + params, not text. Why: language switch must cover every label, including saved messages.
- Pure business rules (profit, diagnosis matching) live in `src/services/calc.ts` with tests in `src/test/rules.test.ts`. Why: rules stay testable and portable to a real backend.
- Simulated advisory/health/weather come from rule tables in mock data, never presented as real AI or live feeds. Why: honesty about what is connected.
- A listing's `quantityQtl` is the one shared stock for both sale modes; requests keep the buyer's entered mode/unit/quantity/unitPrice plus normalised `quantityQtl`/`offerPerQtl`, and stock changes only in `marketService` (accept deducts, order cancel restores). Why: prevents overselling and keeps farmer/buyer views identical.
- Locations are stored as lat/lng on the user record and only ever shown as approximate distance via `distanceKm` (null when unknown, never guessed). Why: privacy, and the same fields can move to a real backend.
