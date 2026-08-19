# Bank Integration

Bank aggregation is represented by the `BankDataProvider` interface:

- `createLinkSession()`
- `exchangeToken()`
- `getAccounts()`
- `getBalances()`
- `getTransactions()`
- `refreshAccounts()`
- `revokeConnection()`

Current implementation:

- `MockBankDataProvider`
- Read-only
- Synthetic demo data
- No money movement
- No fake successful real bank connection

Production integration still needs provider selection, OAuth/link-token handling, webhook verification, token encryption, provider error mapping, consent revocation, and synchronization monitoring.
