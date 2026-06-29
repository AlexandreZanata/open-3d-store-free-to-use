# Storefront user accounts

> Shoppers can create a lightweight account to persist cart and favorites across sessions.

## Scope

| Feature | Detail |
|---------|--------|
| Registration | Email + password + display name |
| Session | HttpOnly cookie `print3d_store_session`, path `/api/v1` |
| Profile | `GET /me`, `PATCH /me` (display name) |
| Cart sync | `PUT /me/cart` — merged on login/register with local cart |
| Favorites | Logged-in users use server-side `store_user_favorites`; anonymous keeps `X-Visitor-Id` |
| Limits | Max **2** accounts per IP and max **2** per device (`X-Device-Id` UUID required on register) |

## Client headers

| Header | When |
|--------|------|
| `X-Device-Id` | Required on `POST /auth/register` |
| `X-Visitor-Id` | Optional on register/login — visitor favorites merge into the account |
| Cookie | Sent automatically with `credentials: "include"` |

## Storage keys (web)

| Key | Purpose |
|-----|---------|
| `print3d-device-id` | Stable device UUID for registration limits |
| `print3d-visitor-id` | Anonymous favorites before sign-in |
| `print3d-cart` | Local cart; synced to server when authenticated |

## API contract

See [../api/contract.md](../api/contract.md) — section **Storefront accounts**.

## Manual validation

1. `pnpm --filter @print3d/api db:migrate`
2. Start API + web
3. Profile → **Criar conta** → register
4. Add cart items → reload → cart still present
5. Favorite a product → reload → still favorited
6. Try creating a 3rd account on same browser/IP → `403 registrationLimit`

Contract tests: `apps/api/tests/integration/routes/store-auth.routes.test.ts`
