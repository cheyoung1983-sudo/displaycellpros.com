# Zero-Trust Firestore Security Specification
## Phase 0: Payload-First Security TDD

This specification defines the rigorous security invariants, penetration testing vectors ("The Dirty Dozen"), and validation assertions required to secure the Display Cell Pros Triage-AI data tier under NIST SP 800-88 R1 compliance standards.

---

### 1. Data Invariants & Authorization Logic

1. **Strict Ownership Invariant**: No user can read, create, update, or delete any `tickets`, `high-priority-leads`, `s2c-feedback`, `drafts`, or `pos-logs` records unless their authenticated `request.auth.uid` matches the record's `userId` field.
2. **Immutability Invariant**: Core identifiers and temporal anchors (`id`, `userId`, `createdAt`) are completely immutable after initial document creation.
3. **Structural Bounds Invariant**: Every string field must have an explicit `.size()` check to defend against buffer exhaustion and "Denial of Wallet" resource-drain attacks.
4. **Finite State Transitions**: Status fields for Tickets and Leads must match predefined enums. Once a document reaches a terminal state, subsequent updates must be rejected.
5. **No Client Query Trust**: Security is enforced at the rule level. Simple lists queries must confirm ownership via `resource.data.userId == request.auth.uid` or be denied immediately.

---

### 2. The "Dirty Dozen" Security Payloads

Below are the 12 specific payloads crafted by our Red Team to attempt to bypass Identity, Integrity, and State boundaries. Each must result in an immediate `PERMISSION_DENIED` error.

#### Payload 1: Unauthenticated Create Attempt
* **Target Path**: `/tickets/TICKET_001`
* **Vulnerability Target**: Master Gate Authorization Bypass
* **Payload**:
```json
{
  "id": "TICKET_001",
  "customerName": "John Doe",
  "device": "iPhone 13 Pro",
  "issueType": "screen",
  "status": "open",
  "quotedPrice": 150,
  "tax": 12,
  "discount": 0,
  "total": 162,
  "createdAt": "2026-06-28T07:00:00Z",
  "userId": "STOLEN_UID"
}
```
* **Expected Result**: `PERMISSION_DENIED` (No auth token provided)

#### Payload 2: Identity Spoofing (Owner Forgery)
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/tickets/TICKET_002`
* **Vulnerability Target**: Attempting to create a ticket on behalf of another user ID.
* **Payload**:
```json
{
  "id": "TICKET_002",
  "customerName": "Bob Smith",
  "device": "Galaxy S24",
  "issueType": "battery",
  "status": "open",
  "quotedPrice": 99,
  "tax": 8,
  "discount": 0,
  "total": 107,
  "createdAt": "2026-06-28T07:00:00Z",
  "userId": "bob_456" 
}
```
* **Expected Result**: `PERMISSION_DENIED` (Incoming `userId` does not match auth `uid`)

#### Payload 3: Read Escalation (PII Snooping)
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/high-priority-leads/LEAD_BOB`
* **Vulnerability Target**: Direct GET/LIST read of another technician's leads.
* **Database State**: Document `LEAD_BOB` exists with `userId: "bob_456"`.
* **Expected Result**: `PERMISSION_DENIED` (Owner mismatch)

#### Payload 4: Field Injection (Ghost Fields / Privilege Escalation)
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/users/alice_123`
* **Vulnerability Target**: Injecting unsolicited fields (e.g., `isAdmin`, `isVerified`) into user profiles.
* **Payload**:
```json
{
  "uid": "alice_123",
  "displayName": "Alice Cooper",
  "email": "alice@displaycellpros.com",
  "createdAt": "2026-06-28T07:00:00Z",
  "isAdmin": true,
  "isVerified": true
}
```
* **Expected Result**: `PERMISSION_DENIED` (Size limit check and schema validator reject keys not explicitly in the blueprint)

#### Payload 5: Schema Type Poisoning
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/tickets/TICKET_003`
* **Vulnerability Target**: Writing strings into numeric fields to trigger crash vectors in reporting engines.
* **Payload**:
```json
{
  "id": "TICKET_003",
  "customerName": "Test Customer",
  "device": "iPhone 13 Pro",
  "issueType": "screen",
  "status": "open",
  "quotedPrice": "ONE_HUNDRED_DOLLARS",
  "tax": 12,
  "discount": 0,
  "total": 112,
  "createdAt": "2026-06-28T07:00:00Z",
  "userId": "alice_123"
}
```
* **Expected Result**: `PERMISSION_DENIED` (`quotedPrice` is not a number)

#### Payload 6: Path ID Poisoning (Resource Poisoning)
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/tickets/VERY_LONG_MALFORMED_ID_THAT_EXCEEDS_MAX_32_CHAR_LIMIT_RESOURCES`
* **Vulnerability Target**: Injecting malicious paths or overly long strings to cause memory footprint expansion.
* **Expected Result**: `PERMISSION_DENIED` (Rejected by `isValidId()` and string boundary restrictions)

#### Payload 7: State Shortcutting & Terminal Step Bypass
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/tickets/TICKET_TERMINAL`
* **Database State**: Ticket status is currently `"completed"` (terminal state).
* **Vulnerability Target**: Attempting to alter notes or pricing fields on a finalized, audited ticket.
* **Payload**:
```json
{
  "id": "TICKET_TERMINAL",
  "customerName": "Alice Cooper",
  "device": "iPhone 13 Pro",
  "issueType": "screen",
  "status": "open",
  "quotedPrice": 0,
  "tax": 0,
  "discount": 0,
  "total": 0,
  "createdAt": "2026-06-28T07:00:00Z",
  "userId": "alice_123"
}
```
* **Expected Result**: `PERMISSION_DENIED` (State is terminal; modifications are locked)

#### Payload 8: Immutable Field Overwrite
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/tickets/TICKET_EXISTING`
* **Database State**: Ticket exists with `createdAt: "2026-01-01T00:00:00Z"`.
* **Vulnerability Target**: Overwriting auditing logs to cover SLA violations.
* **Payload**:
```json
{
  "id": "TICKET_EXISTING",
  "customerName": "Alice Cooper",
  "device": "iPhone 13 Pro",
  "issueType": "screen",
  "status": "open",
  "quotedPrice": 150,
  "tax": 12,
  "discount": 0,
  "total": 162,
  "createdAt": "2026-06-28T07:00:00Z", 
  "userId": "alice_123"
}
```
* **Expected Result**: `PERMISSION_DENIED` (Incoming `createdAt` does not match existing `createdAt`)

#### Payload 9: Denial of Wallet (Size Exhaustion)
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/tickets/TICKET_BLOAT`
* **Vulnerability Target**: Storing massive data payloads inside string parameters to swell indexing billing.
* **Payload**:
```json
{
  "id": "TICKET_BLOAT",
  "customerName": "ALICE_COOPER_WITH_AN_EXCESSIVELY_LONG_NAME_FIELD_THAT_STRETCHES_FAR_BEYOND_THE_Standard_128_CHARACTER_BOUNDARY_LIMITS_FOR_HUMAN_IDENTIFIERS_AND_DUMB_INPUTS",
  "device": "iPhone 13 Pro",
  "issueType": "screen",
  "status": "open",
  "quotedPrice": 150,
  "tax": 12,
  "discount": 0,
  "total": 162,
  "createdAt": "2026-06-28T07:00:00Z",
  "userId": "alice_123"
}
```
* **Expected Result**: `PERMISSION_DENIED` (`customerName` size exceeds 128 characters)

#### Payload 10: Unauthorized Document Deletion
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/high-priority-leads/LEAD_BOB`
* **Vulnerability Target**: Dropping database records belonging to another staff member.
* **Expected Result**: `PERMISSION_DENIED` (User is not the owner of the document)

#### Payload 11: PII Blanket Read (No where clause)
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Operation**: List query on `/high-priority-leads` without checking user scope.
* **Vulnerability Target**: Harvesting telemetry or personal telephone numbers of other customers.
* **Expected Result**: `PERMISSION_DENIED` (Rules require matching `userId` on the query filter to authorize the list operation)

#### Payload 12: Invalid Timestamp Forgery
* **Auth State**: Authenticated as `USER_ALICE` (`uid: "alice_123"`)
* **Target Path**: `/pos-logs/LOG_FORGED`
* **Vulnerability Target**: Injecting historical timestamps into active diagnostic telemetry logs.
* **Payload**:
```json
{
  "id": "LOG_FORGED",
  "timestamp": "1999-12-31T23:59:59Z", 
  "level": "info",
  "message": "[Telemetry Sync] FORGED_TIMESTAMP",
  "source": "CellSmart",
  "userId": "alice_123"
}
```
* **Expected Result**: `PERMISSION_DENIED` (Temporal schema validator rejects invalid format or non-compliant auditing inputs)

---

### 3. Red Team Automation Framework

The following is a standard Jest/Vitest automated assertion model for running verification cycles:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

describe("Triage-AI Hardened Security Gate", () => {
  let testEnv: any;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "displaycellpros-com",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8")
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("should fail Payload 1 (Unauthenticated)", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      unauthedDb.doc("tickets/TICKET_001").set({
        id: "TICKET_001",
        customerName: "John Doe",
        device: "iPhone",
        issueType: "screen",
        status: "open",
        total: 100,
        createdAt: "2026-06-28T07:00:00Z",
        userId: "STOLEN_UID"
      })
    );
  });

  it("should fail Payload 2 (Identity Spoofing)", async () => {
    const aliceDb = testEnv.authenticatedContext("alice_123").firestore();
    await assertFails(
      aliceDb.doc("tickets/TICKET_002").set({
        id: "TICKET_002",
        customerName: "Bob Smith",
        device: "Galaxy S24",
        issueType: "battery",
        status: "open",
        total: 100,
        createdAt: "2026-06-28T07:00:00Z",
        userId: "bob_456"
      })
    );
  });
});
```
