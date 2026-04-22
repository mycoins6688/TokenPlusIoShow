# Security Specification for TokenPlus AI Resource Connector

## Data Invariants
1. Products must have a valid title (max 200 chars), description (max 1000 chars), and correct icon/color types.
2. Settings must have a site title and meta description.
3. Only authenticated admins can modify any data.
4. All writes must include a `updatedAt` server timestamp.

## The "Dirty Dozen" Payloads
1. **Unauthenticated Create**: Attempting to create a product without being logged in.
2. **Title Overload**: Creating a product with a title > 200 characters.
3. **Description Overload**: Creating a product with a description > 1000 characters.
4. **Invalid Icon**: Using an icon name not in the approved enum.
5. **No Timestamp**: Attempting to write without `updatedAt`.
6. **Malicious ID**: Using a 2KB string as a product ID.
7. **Orphaned Write**: Trying to create a product with missing required fields like `image`.
8. **Owner Spoofing**: Trying to set a `userId` field to a different value (if we added such a field).
9. **Settings Wipe**: Overwriting settings with empty fields.
10. **Shadow Update**: Adding a `isAdmin: true` field to a user profile (system-only field).
11. **Type Poisoning**: Sending a boolean for a string field.
12. **Status Shortcutting**: Directly modifying terminal states (not applicable here yet, but a general threat).

## The Test Runner (Plan)
We will verify that:
- `allow read: if true;` works for products and settings.
- `allow write: if isAdmin();` correctly blocks unauthorized users.
- `isValidProduct()` and `isValidSettings()` helpers correctly reject the "Dirty Dozen".

---
## Draft Rules (DRAFT_firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 0. Global Safety Net
    match /{document=**} {
      allow read, write: if false;
    }

    // Phase 3: Primitive Definitions
    function isSignedIn() {
      return request.auth != null && request.auth.token.email_verified == true;
    }
    
    function isAdmin() {
      // Bootstrapped admin: User email from runtime
      return isSignedIn() && request.auth.token.email == 'mycoins6688@gmail.com';
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    function incoming() {
      return request.resource.data;
    }

    function existing() {
      return resource.data;
    }

    // Phase 4: Entity Validators
    function isValidProduct(data) {
      return data.keys().hasAll(['title', 'tagline', 'description', 'iconName', 'image', 'color', 'link', 'sortOrder', 'updatedAt'])
        && data.keys().size() == 9
        && data.title is string && data.title.size() <= 200
        && data.tagline is string && data.tagline.size() <= 100
        && data.description is string && data.description.size() <= 1000
        && data.iconName in ['NewApi', 'Cloud', 'BarChart3', 'Monitor', 'Zap', 'ShieldCheck']
        && data.image is string && data.image.size() <= 1000
        && data.color is string && data.color.size() <= 20
        && data.link is string && data.link.size() <= 1000
        && data.sortOrder is int
        && data.updatedAt == request.time;
    }

    function isValidSettings(data) {
      return data.keys().hasAll(['siteTitle', 'metaDescription', 'metaKeywords', 'updatedAt'])
        && data.keys().size() == 4
        && data.siteTitle is string && data.siteTitle.size() <= 200
        && data.metaDescription is string && data.metaDescription.size() <= 500
        && data.metaKeywords is string && data.metaKeywords.size() <= 500
        && data.updatedAt == request.time;
    }

    // Collection Rules
    match /products/{productId} {
      allow read: if true;
      allow create: if isAdmin() && isValidId(productId) && isValidProduct(incoming());
      allow update: if isAdmin() && isValidId(productId) && isValidProduct(incoming());
      allow delete: if isAdmin() && isValidId(productId);
    }

    match /settings/{settingId} {
      allow read: if true;
      allow create: if isAdmin() && isValidId(settingId) && isValidSettings(incoming());
      allow update: if isAdmin() && isValidId(settingId) && isValidSettings(incoming());
      allow delete: if isAdmin() && isValidId(settingId);
    }
  }
}
```
