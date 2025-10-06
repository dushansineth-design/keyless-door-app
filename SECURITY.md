# Security Guidelines for Smart Lock Application

## Critical Security Rules for PIN Code Handling

### ⚠️ NEVER expose `pin_code` column

The `pin_code` column in the `locks` table stores bcrypt-hashed PINs and **MUST NEVER** be returned to clients under any circumstances.

### Database Security Architecture

1. **Direct SELECT is BLOCKED**: The `locks` table has a DENY policy for SELECT operations to prevent any direct queries that could expose `pin_code`.

2. **Use `locks_secure` view**: All read operations MUST use the `locks_secure` view, which calls the `get_user_locks()` security definer function that excludes `pin_code`.

3. **Column Exclusion in Mutations**: All INSERT/UPDATE operations MUST explicitly exclude `pin_code` from `.select()` responses:

```typescript
// ✅ CORRECT: Explicitly exclude pin_code
await supabase
  .from('locks')
  .update({ is_locked: false })
  .eq('id', lockId)
  .select('id'); // Only return what you need, never pin_code

// ✅ CORRECT: Explicit column list for INSERT
await supabase
  .from('locks')
  .insert({ name: 'Lock 1', user_id: userId })
  .select('id, name, user_id, is_locked, battery_level, created_at, updated_at');

// ❌ WRONG: Never use .select() or .select('*')
await supabase
  .from('locks')
  .update({ is_locked: false })
  .select(); // Could expose pin_code!
```

### PIN Management Workflow

1. **Setting PINs**: ONLY via the `set-lock-pin` edge function, which:
   - Accepts plain-text PIN from authenticated user
   - Hashes it using `hash_pin()` database function (bcrypt, 10 rounds)
   - Stores only the hash in `pin_code` column

2. **Verifying PINs**: ONLY via the `verify_pin()` database function:
   - Called by `verify-lock-pin` edge function
   - Accepts lock UUID and PIN attempt
   - Returns boolean (valid/invalid)
   - Uses secure bcrypt comparison

3. **Never retrieve PINs**: There is NO legitimate use case for retrieving a PIN, even in hashed form:
   - PINs cannot be "viewed" or "recovered"
   - Users can only set new PINs or verify existing ones
   - Offline brute-force attacks are prevented by never exposing hashes

### Code Review Checklist

Before deploying any changes that interact with the `locks` table:

- [ ] Does the code query `locks` directly for SELECT? ❌ Use `locks_secure` instead
- [ ] Does any UPDATE/DELETE include `.select()` or `.select('*')`? ❌ Explicitly list columns or select only `id`
- [ ] Does any INSERT include `.select('*')`? ❌ Explicitly exclude `pin_code`
- [ ] Are PIN operations going through edge functions? ✅ Required
- [ ] Is `hash_pin()` used for all PIN storage? ✅ Required
- [ ] Is `verify_pin()` used for all PIN verification? ✅ Required

### Security Principles

1. **Defense in Depth**: Multiple layers prevent PIN exposure:
   - RLS policies block direct SELECT
   - Secure view excludes pin_code column
   - Application code explicitly excludes pin_code
   - Edge functions handle sensitive operations

2. **Principle of Least Privilege**: 
   - No code path should have access to PIN data
   - Even authenticated users cannot retrieve their own PINs

3. **Secure by Default**:
   - The `pin_code` column has no default value
   - Empty PINs are not allowed in production use
   - All security controls are enforced at database level

### Incident Response

If a PIN exposure is suspected:

1. Immediately rotate all affected PINs via `set-lock-pin` edge function
2. Review database logs for unauthorized access attempts
3. Audit all code paths that interact with `locks` table
4. Run security linter: Check the Security tab in your dashboard
5. Consider forcing all users to reset their PINs

### Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [bcrypt Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- Project Security Tab: Monitor for security findings
