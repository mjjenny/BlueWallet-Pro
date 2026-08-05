# Blue Wallet Offshore v0.2.1

## PIN unlock fix

- Correctly supports 4-, 5-, and 6-digit PINs.
- A wrong 4-digit or 5-digit prefix no longer triggers a failed attempt or lockout.
- A failed attempt is counted only after all 6 digits are entered.
- Correct 4- or 5-digit PINs still unlock immediately.
- Offline cache version updated so installed iPhone apps receive the fix.
