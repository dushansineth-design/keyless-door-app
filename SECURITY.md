# Security Documentation - SecureLock Application

## Critical Security Architecture

### PIN Code Protection

**CRITICAL**: This application stores lock PIN codes using bcrypt hashing. The following security measures MUST be maintained:

#### Database Layer Security

1. **PIN Storage**
   - PIN codes are stored in the `locks.pin_code` column using bcrypt hashing (10 rounds)
   - The column has NO default value to prevent plain text PINs
   - Direct SELECT access to the `locks` table is BLOCKED via RLS policy

2. **Accessing Lock Data**
   - ✅ **USE**: Query `locks_secure` view for all lock data (excludes `pin_code`)
   - ❌ **NEVER**: Query `locks` table directly with SELECT
   - ❌ **NEVER**: Include `pin_code` in any `.select()` clause

3. **RLS Policies**
   - `locks` table has a DENY policy for SELECT operations
   - Users can only INSERT, UPDATE, DELETE their own locks
   - The `locks_secure` view uses `get_user_locks()` security definer function

#### Application Code Security Rules

1. **Reading Locks**
   ```typescript
   // ✅ CORRECT - Use the secure view
   await supabase.from('locks_secure').select('*')
   
   // ❌ WRONG - Never query locks table directly
   await supabase.from('locks').select('*')
   ```

2. **Updating Locks**
   ```typescript
   // ✅ CORRECT - No .select() to prevent data exposure
   await supabase.from('locks').update({ is_locked: true }).eq('id', lockId)
   
   // ❌ WRONG - Even selecting other columns creates exposure risk
   await supabase.from('locks').update({ is_locked: true }).eq('id', lockId).select('id, name')
   ```

3. **Creating Locks**
   ```typescript
   // ✅ CORRECT - Only return ID
   const { data } = await supabase
     .from('locks')
     .insert({ name, user_id, is_locked: true, battery_level: 100 })
     .select('id')
     .single()
   
   // ❌ WRONG - Requesting multiple columns
   .select('id, name, battery_level')
   ```

#### PIN Management Security

1. **Setting PINs**
   - ONLY via the `set-lock-pin` edge function
   - Edge function calls `hash_pin()` database function
   - Never set PIN directly in application code

2. **Verifying PINs**
   - ONLY via the `verify-lock-pin` edge function
   - Edge function calls `verify_pin()` database function
   - Never implement PIN verification in client code

3. **Edge Function Security**
   ```typescript
   // Both edge functions:
   // 1. Verify user authentication via JWT
   // 2. Validate ownership before operations
   // 3. Use security definer functions for hashing/verification
   // 4. Never expose PIN values in responses
   ```

## Security Functions

### Database Functions (All SECURITY DEFINER)

1. **hash_pin(pin_text text)**
   - Hashes PIN using bcrypt with 10 rounds
   - Called by `set-lock-pin` edge function
   - Uses `search_path = public` to prevent injection

2. **verify_pin(lock_uuid uuid, pin_attempt text)**
   - Verifies PIN against stored hash
   - Returns boolean only (never exposes hash)
   - Validates user ownership before verification

3. **get_user_locks()**
   - Returns all lock columns EXCEPT `pin_code`
   - Filters by `auth.uid()` for security
   - Used by `locks_secure` view

## Threat Model

### Protected Against

✅ **PIN Exposure via SELECT queries** - Blocked by RLS policy  
✅ **PIN Exposure via UPDATE/DELETE** - No .select() in application code  
✅ **Offline Brute Force** - PINs are bcrypt hashed, never returned  
✅ **Unauthorized Access** - RLS policies enforce user ownership  
✅ **SQL Injection** - Security definer functions use parameterized queries  

### Mitigations in Place

- **Plain Text PIN Default**: Removed (no default value on `pin_code` column)
- **Direct Table Access**: Blocked via DENY SELECT policy on `locks` table
- **Response Data Exposure**: Application code never requests `pin_code` in responses
- **Client-Side Hashing**: Prevented (all hashing done server-side in edge function)

## Security Checklist for Developers

When modifying lock-related code, ensure:

- [ ] Never query `locks` table with SELECT
- [ ] Always use `locks_secure` view for reading lock data
- [ ] Never include `.select()` on UPDATE/DELETE operations
- [ ] Never request `pin_code` column in any query
- [ ] PIN setting only via `set-lock-pin` edge function
- [ ] PIN verification only via `verify-lock-pin` edge function
- [ ] All RLS policies remain in place
- [ ] Security definer functions maintain `search_path = public`

## Incident Response

If PIN exposure is suspected:

1. Immediately audit all queries to `locks` table
2. Check application logs for unauthorized access
3. Review edge function logs for suspicious activity
4. Force all users to reset PINs via `set-lock-pin` edge function
5. Verify RLS policies are still in place
6. Run security linter: Review backend security settings

## References

- Database Schema: See `supabase/migrations/`
- Edge Functions: See `supabase/functions/set-lock-pin/` and `verify-lock-pin/`
- Application Code: See `src/hooks/useLocks.ts` and `src/pages/Index.tsx`
- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
