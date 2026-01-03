# API Contract - Authentication Routes (Postman Guide)

## Setup

### Base URL

```
{{baseUrl}} = http://localhost:3000/api/auth
```

### Environment Variables

Create a Postman environment with the following variables:

| Variable             | Initial Value               | Description                                 |
| -------------------- | --------------------------- | ------------------------------------------- |
| `baseUrl`            | `http://localhost:3000/api` | API base URL                                |
| `token`              | (empty)                     | Firebase ID token (set after login/signup)  |
| `refreshToken`       | (empty)                     | Firebase refresh token                      |
| `platformAdminToken` | (empty)                     | Platform admin token for approval endpoints |

---

## Endpoints

---

## 1. Signup

Creates a new user account with email and password.

### Request

| Field       | Value                            |
| ----------- | -------------------------------- |
| **Method**  | `POST`                           |
| **URL**     | `{{baseUrl}}/auth/signup`        |
| **Headers** | `Content-Type: application/json` |

### Body (raw JSON)

**Teacher Signup:**

```json
{
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher",
  "displayName": "John Doe"
}
```

**School Admin Signup:**

```json
{
  "email": "admin@school.com",
  "password": "password123",
  "role": "school",
  "displayName": "School Admin"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AMf-vBx...",
    "expiresIn": "3600",
    "user": {
      "id": "abc123xyz",
      "email": "teacher@example.com",
      "role": "school_teacher",
      "status": "pending",
      "profileCompleted": false,
      "profile": {}
    }
  }
}
```

> **Note:** Copy the `token` value from the response and save it to your environment variable `{{token}}` for authenticated requests.

### Error Responses

| Status | Description                                                        |
| ------ | ------------------------------------------------------------------ |
| `400`  | Validation error (invalid email, password too short, invalid role) |
| `409`  | Email already in use                                               |

---

## 2. Login

Authenticates an existing user with email and password.

### Request

| Field       | Value                            |
| ----------- | -------------------------------- |
| **Method**  | `POST`                           |
| **URL**     | `{{baseUrl}}/auth/login`         |
| **Headers** | `Content-Type: application/json` |

### Body (raw JSON)

```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "AMf-vBx...",
    "expiresIn": "3600",
    "user": {
      "id": "abc123xyz",
      "email": "teacher@example.com",
      "role": "school_teacher",
      "status": "active",
      "profileCompleted": true,
      "profile": {}
    }
  }
}
```

### Error Responses

| Status | Description         |
| ------ | ------------------- |
| `400`  | Validation error    |
| `401`  | Invalid credentials |
| `403`  | Account suspended   |

---

## 3. Update Profile (Onboarding)

Completes user onboarding by updating profile information.

> **Note:** The `role` field in the request body is used to determine which validation rules apply (teacher vs school). The actual user role is set during signup and cannot be changed here.

### Request

| Field             | Value                            |
| ----------------- | -------------------------------- |
| **Method**        | `PUT`                            |
| **URL**           | `{{baseUrl}}/auth/profile`       |
| **Headers**       | `Content-Type: application/json` |
| **Authorization** | `Bearer {{token}}`               |

### Body (raw JSON) - Teacher Onboarding

```json
{
  "role": "teacher",
  "profile": {
    "firstName": "Priya",
    "lastName": "Sharma",
    "subjects": ["Mathematics", "Physics"],
    "grades": ["9", "10", "11", "12"],
    "gradeLevels": ["Grade 9-10", "Grade 11-12"],
    "phone": "+91 98765 43210",
    "address": "123, Green Park, New Delhi, 110016",
    "country": "India",
    "countryId": "IN",
    "gender": "Female",
    "teachingExperience": "8 years",
    "proficiencyLevel": "Advanced",
    "currentSchool": "Delhi Public School, RK Puram"
  }
}
```

### Body (raw JSON) - School Admin Onboarding

```json
{
  "role": "school",
  "profile": {
    "firstName": "Robert",
    "lastName": "Johnson",
    "schoolName": "Delhi Public School, RK Puram",
    "schoolAdminRole": "Principal",
    "contactName": "Robert Johnson",
    "contactEmail": "admin@dpsrkpuram.edu.in",
    "contactPhone": "+91 11 2614 1234",
    "address": "Sector 12, RK Puram, New Delhi, 110022",
    "establishedYear": 1972,
    "principalName": "Dr. Anjali Verma",
    "totalTeachers": 150,
    "totalStudents": 2500,
    "logo": "/logos/dpsrkpuram.png"
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "abc123xyz",
      "email": "teacher@example.com",
      "role": "school_teacher",
      "status": "active",
      "profileCompleted": true,
      "profile": {
        "firstName": "Priya",
        "lastName": "Sharma",
        "subjects": ["Mathematics", "Physics"],
        "grades": ["9", "10", "11", "12"]
      }
    }
  }
}
```

### Error Responses

| Status | Description                                         |
| ------ | --------------------------------------------------- |
| `400`  | Validation error (missing required fields for role) |
| `401`  | Not authenticated (missing or invalid token)        |
| `403`  | Account suspended                                   |
| `404`  | User not found                                      |

### Required Fields by Role

**Teacher (`role: "teacher"`):**

- `subjects` - array with at least 1 item
- `grades` - array with at least 1 item

**School Admin (`role: "school"`):**

- `schoolName` - minimum 2 characters
- `contactName` - minimum 2 characters
- `contactEmail` - valid email format

---

## 4. Get Current User

Returns the current authenticated user's profile.

### Request

| Field             | Value                 |
| ----------------- | --------------------- |
| **Method**        | `GET`                 |
| **URL**           | `{{baseUrl}}/auth/me` |
| **Authorization** | `Bearer {{token}}`    |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "uid": "abc123xyz",
    "email": "teacher@example.com",
    "displayName": "Priya Sharma",
    "username": null,
    "profile": {
      "firstName": "Priya",
      "lastName": "Sharma",
      "subjects": ["Mathematics", "Physics"],
      "grades": ["9", "10", "11", "12"],
      "approvalStatus": "approved"
    },
    "status": "active",
    "profileCompleted": true,
    "approvalStatus": "approved",
    "tier": "free",
    "role": "school_teacher",
    "suspension": null,
    "usage": {},
    "createdAt": {
      "_seconds": 1702656000,
      "_nanoseconds": 0
    },
    "updatedAt": {
      "_seconds": 1702656000,
      "_nanoseconds": 0
    }
  }
}
```

> **Note:** The `approvalStatus` field shows the current approval state:
>
> - `undefined` - Profile not yet submitted for approval
> - `"pending"` - Profile submitted and awaiting admin review
> - `"approved"` - Profile approved by platform admin
> - `"rejected"` - Profile rejected by platform admin

### Error Responses

| Status | Description       |
| ------ | ----------------- |
| `401`  | Not authenticated |
| `404`  | User not found    |

---

## 10. Check Approval Status

Users can check their current approval status using the existing `/auth/me` endpoint.

### Request

| Field             | Value                 |
| ----------------- | --------------------- |
| **Method**        | `GET`                 |
| **URL**           | `{{baseUrl}}/auth/me` |
| **Authorization** | `Bearer {{token}}`    |

### Response Examples

**Profile Not Yet Submitted:**

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "profileCompleted": true,
    "approvalStatus": null,
    "status": "active"
  }
}
```

**Profile Awaiting Approval:**

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "profileCompleted": true,
    "approvalStatus": "pending",
    "status": "pending"
  }
}
```

**Profile Approved:**

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "profileCompleted": true,
    "approvalStatus": "approved",
    "status": "active"
  }
}
```

**Profile Rejected:**

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "profileCompleted": true,
    "approvalStatus": "rejected",
    "status": "rejected",
    "suspension": null
  }
}
```

**Profile Suspended:**

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "profileCompleted": true,
    "approvalStatus": "approved",
    "status": "suspended",
    "suspension": {
      "reason": "Violation of platform policies",
      "suspendedBy": "admin123",
      "suspendedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

---

## 5. Exchange Token

Exchanges Firebase token for a backend JWT with embedded claims.

### Request

| Field             | Value                    |
| ----------------- | ------------------------ |
| **Method**        | `POST`                   |
| **URL**           | `{{baseUrl}}/auth/token` |
| **Authorization** | `Bearer {{token}}`       |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "firebaseIdToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "school_teacher",
    "schoolId": null,
    "status": "active",
    "claimsUpdatedAt": "2024-12-15T10:30:00.000Z"
  }
}
```

---

## 6. Submit Profile for Approval

Teachers submit their completed profile for platform admin approval.

### Request

| Field             | Value                                 |
| ----------------- | ------------------------------------- |
| **Method**        | `POST`                                |
| **URL**           | `{{baseUrl}}/profile/submit-approval` |
| **Authorization** | `Bearer {{token}}`                    |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "status": "pending"
  }
}
```

### Error Responses

| Status | Description                               |
| ------ | ----------------------------------------- |
| `401`  | Not authenticated                         |
| `403`  | Profile not complete or already submitted |

---

## 7. List Pending Approvals (Platform Admin)

Platform admins can view all teacher profiles awaiting approval.

### Request

| Field             | Value                                       |
| ----------------- | ------------------------------------------- |
| **Method**        | `GET`                                       |
| **URL**           | `{{baseUrl}}/admin/approvals/pending`       |
| **Authorization** | `Bearer {{platformAdminToken}}`             |
| **Query Params**  | `limit` (optional), `startAfter` (optional) |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "uid": "teacher123",
      "email": "teacher@example.com",
      "role": "school_teacher",
      "status": "pending",
      "profileCompleted": true,
      "approvalStatus": "pending",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "subjects": ["Mathematics"],
        "grades": ["10"]
      },
      "createdAt": "2024-12-15T10:00:00.000Z"
    }
  ]
}
```

### Error Responses

| Status | Description        |
| ------ | ------------------ |
| `401`  | Not authenticated  |
| `403`  | Not platform admin |

---

## 8. Approve Teacher Profile (Platform Admin)

Platform admins approve a teacher's profile.

### Request

| Field             | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Method**        | `PUT`                                          |
| **URL**           | `{{baseUrl}}/admin/approvals/{userId}/approve` |
| **Authorization** | `Bearer {{platformAdminToken}}`                |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "status": "approved"
  }
}
```

### Error Responses

| Status | Description        |
| ------ | ------------------ |
| `400`  | Invalid user ID    |
| `401`  | Not authenticated  |
| `403`  | Not platform admin |
| `404`  | User not found     |

---

## 9. Reject Teacher Profile (Platform Admin)

Platform admins reject a teacher's profile with optional reason.

### Request

| Field             | Value                                         |
| ----------------- | --------------------------------------------- |
| **Method**        | `PUT`                                         |
| **URL**           | `{{baseUrl}}/admin/approvals/{userId}/reject` |
| **Authorization** | `Bearer {{platformAdminToken}}`               |
| **Headers**       | `Content-Type: application/json`              |

### Body (raw JSON)

```json
{
  "reason": "Missing required teaching credentials"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "status": "rejected"
  }
}
```

### Error Responses

| Status | Description        |
| ------ | ------------------ |
| `400`  | Invalid user ID    |
| `401`  | Not authenticated  |
| `403`  | Not platform admin |
| `404`  | User not found     |

---

## 11. Suspend Teacher (Platform Admin)

Platform admins can suspend a teacher's account.

### Request

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Method**        | `POST`                                              |
| **URL**           | `{{baseUrl}}/platform-admin/users/{userId}/suspend` |
| **Authorization** | `Bearer {{platformAdminToken}}`                     |
| **Headers**       | `Content-Type: application/json`                    |

### Body (raw JSON)

```json
{
  "reason": "Violation of platform policies"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "status": "suspended",
    "profileCompleted": true,
    "suspension": {
      "reason": "Violation of platform policies",
      "suspendedBy": "admin123",
      "suspendedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Description                       |
| ------ | --------------------------------- |
| `400`  | Invalid user ID or missing reason |
| `401`  | Not authenticated                 |
| `403`  | Not platform admin                |
| `404`  | User not found                    |

---

## 12. Unsuspend Teacher (Platform Admin)

Platform admins can lift suspension from a teacher's account.

### Request

| Field             | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| **Method**        | `POST`                                                |
| **URL**           | `{{baseUrl}}/platform-admin/users/{userId}/unsuspend` |
| **Authorization** | `Bearer {{platformAdminToken}}`                       |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "email": "teacher@example.com",
    "status": "active",
    "profileCompleted": true,
    "suspension": null
  }
}
```

### Error Responses

| Status | Description        |
| ------ | ------------------ |
| `400`  | Invalid user ID    |
| `401`  | Not authenticated  |
| `403`  | Not platform admin |
| `404`  | User not found     |

---

## 13. Suspend School (Platform Admin)

Platform admins can suspend a school's account.

### Request

| Field             | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| **Method**        | `POST`                                                  |
| **URL**           | `{{baseUrl}}/platform-admin/schools/{schoolId}/suspend` |
| **Authorization** | `Bearer {{platformAdminToken}}`                         |
| **Headers**       | `Content-Type: application/json`                        |

### Body (raw JSON)

```json
{
  "reason": "Failed compliance audit"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "school123",
    "name": "Sample School",
    "status": "suspended",
    "suspension": {
      "reason": "Failed compliance audit",
      "suspendedBy": "admin123",
      "suspendedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

| Status | Description                         |
| ------ | ----------------------------------- |
| `400`  | Invalid school ID or missing reason |
| `401`  | Not authenticated                   |
| `403`  | Not platform admin                  |
| `404`  | School not found                    |

---

## 14. Unsuspend School (Platform Admin)

Platform admins can lift suspension from a school's account.

### Request

| Field             | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| **Method**        | `POST`                                                    |
| **URL**           | `{{baseUrl}}/platform-admin/schools/{schoolId}/unsuspend` |
| **Authorization** | `Bearer {{platformAdminToken}}`                           |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "school123",
    "name": "Sample School",
    "status": "active",
    "suspension": null
  }
}
```

### Error Responses

| Status | Description        |
| ------ | ------------------ |
| `400`  | Invalid school ID  |
| `401`  | Not authenticated  |
| `403`  | Not platform admin |
| `404`  | School not found   |

---

## Complete Testing Flows

### Flow 1: Teacher Signup and Onboarding

**Step 1: Create Teacher Account**

| Field  | Value                     |
| ------ | ------------------------- |
| Method | `POST`                    |
| URL    | `{{baseUrl}}/auth/signup` |

Body:

```json
{
  "email": "priya.sharma@school.edu",
  "password": "Teacher@123",
  "role": "teacher",
  "displayName": "Priya Sharma"
}
```

> Save `token` from response to environment

---

**Step 2: Complete Teacher Onboarding**

| Field         | Value                      |
| ------------- | -------------------------- |
| Method        | `PUT`                      |
| URL           | `{{baseUrl}}/auth/profile` |
| Authorization | `Bearer {{token}}`         |

Body:

```json
{
  "role": "teacher",
  "profile": {
    "firstName": "Priya",
    "lastName": "Sharma",
    "subjects": ["Mathematics", "Physics"],
    "grades": ["9", "10", "11", "12"],
    "gradeLevels": ["Grade 9-10", "Grade 11-12"],
    "phone": "+91 98765 43210",
    "address": "123, Green Park, New Delhi, 110016",
    "country": "India",
    "countryId": "IN",
    "gender": "Female",
    "teachingExperience": "8 years",
    "proficiencyLevel": "Advanced",
    "currentSchool": "Delhi Public School, RK Puram"
  }
}
```

---

**Step 3: Verify Profile**

| Field         | Value                 |
| ------------- | --------------------- |
| Method        | `GET`                 |
| URL           | `{{baseUrl}}/auth/me` |
| Authorization | `Bearer {{token}}`    |

Expected: `profileCompleted: true`, `status: "active"`

---

### Flow 2: School Admin Signup and Onboarding

**Step 1: Create School Admin Account**

| Field  | Value                     |
| ------ | ------------------------- |
| Method | `POST`                    |
| URL    | `{{baseUrl}}/auth/signup` |

Body:

```json
{
  "email": "admin@dpsrkpuram.edu.in",
  "password": "Admin@123",
  "role": "school",
  "displayName": "School Admin"
}
```

> Save `token` from response to environment

---

**Step 2: Complete School Admin Onboarding**

| Field         | Value                      |
| ------------- | -------------------------- |
| Method        | `PUT`                      |
| URL           | `{{baseUrl}}/auth/profile` |
| Authorization | `Bearer {{token}}`         |

Body:

```json
{
  "role": "school",
  "profile": {
    "firstName": "Robert",
    "lastName": "Johnson",
    "schoolName": "Delhi Public School, RK Puram",
    "schoolAdminRole": "Principal",
    "contactName": "Robert Johnson",
    "contactEmail": "admin@dpsrkpuram.edu.in",
    "contactPhone": "+91 11 2614 1234",
    "address": "Sector 12, RK Puram, New Delhi, 110022",
    "establishedYear": 1972,
    "principalName": "Dr. Anjali Verma",
    "totalTeachers": 150,
    "totalStudents": 2500
  }
}
```

---

**Step 3: Verify Profile**

| Field         | Value                 |
| ------------- | --------------------- |
| Method        | `GET`                 |
| URL           | `{{baseUrl}}/auth/me` |
| Authorization | `Bearer {{token}}`    |

Expected: `profileCompleted: true`, `status: "active"`, `role: "school_admin"`

---

### Flow 3: Teacher Approval Workflow

**Step 1: Create and Complete Teacher Profile**
Follow Flow 1 (Teacher Signup and Onboarding) to create a complete teacher profile.

---

**Step 2: Submit Profile for Approval**

| Field         | Value                                 |
| ------------- | ------------------------------------- |
| Method        | `POST`                                |
| URL           | `{{baseUrl}}/profile/submit-approval` |
| Authorization | `Bearer {{token}}`                    |

Expected Response:

```json
{
  "success": true,
  "data": {
    "status": "pending"
  }
}
```

---

**Step 3: Platform Admin - View Pending Approvals**

| Field         | Value                                 |
| ------------- | ------------------------------------- |
| Method        | `GET`                                 |
| URL           | `{{baseUrl}}/admin/approvals/pending` |
| Authorization | `Bearer {{platformAdminToken}}`       |

Expected: List of teachers with `approvalStatus: "pending"`

---

**Step 4: Platform Admin - Approve Teacher**

| Field         | Value                                                 |
| ------------- | ----------------------------------------------------- |
| Method        | `PUT`                                                 |
| URL           | `{{baseUrl}}/admin/approvals/{teacherUserId}/approve` |
| Authorization | `Bearer {{platformAdminToken}}`                       |

Expected Response:

```json
{
  "success": true,
  "data": {
    "status": "approved"
  }
}
```

---

**Step 5: Verify Teacher Approval Status**

| Field         | Value                     |
| ------------- | ------------------------- |
| Method        | `GET`                     |
| URL           | `{{baseUrl}}/auth/me`     |
| Authorization | `Bearer {{teacherToken}}` |

Expected: `approvalStatus: "approved"`

---

### Flow 4: Teacher Rejection Workflow

**Step 1-2: Same as Flow 3** (Create teacher and submit for approval)

---

**Step 3: Platform Admin - Reject Teacher**

| Field         | Value                                                |
| ------------- | ---------------------------------------------------- |
| Method        | `PUT`                                                |
| URL           | `{{baseUrl}}/admin/approvals/{teacherUserId}/reject` |
| Authorization | `Bearer {{platformAdminToken}}`                      |

Body:

```json
{
  "reason": "Insufficient teaching experience documentation"
}
```

Expected Response:

```json
{
  "success": true,
  "data": {
    "status": "rejected"
  }
}
```

---

**Step 4: Verify Teacher Rejection Status**

| Field         | Value                     |
| ------------- | ------------------------- |
| Method        | `GET`                     |
| URL           | `{{baseUrl}}/auth/me`     |
| Authorization | `Bearer {{teacherToken}}` |

Expected: `approvalStatus: "rejected"`

---

### Flow 5: Teacher Suspension Workflow

**Step 1: Create and Approve Teacher**
Follow Flow 3 (Teacher Approval Workflow) to create and approve a teacher.

---

**Step 2: Platform Admin - Suspend Teacher**

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Method        | `POST`                                                     |
| URL           | `{{baseUrl}}/platform-admin/users/{teacherUserId}/suspend` |
| Authorization | `Bearer {{platformAdminToken}}`                            |

Body:

```json
{
  "reason": "Violation of platform policies"
}
```

Expected Response:

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "status": "suspended",
    "suspension": {
      "reason": "Violation of platform policies",
      "suspendedBy": "admin123",
      "suspendedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

---

**Step 3: Verify Teacher Cannot Access Protected Endpoints**

| Field         | Value                                 |
| ------------- | ------------------------------------- |
| Method        | `POST`                                |
| URL           | `{{baseUrl}}/profile/submit-approval` |
| Authorization | `Bearer {{teacherToken}}`             |

Expected Response: `403 Forbidden` - "Account suspended"

---

**Step 4: Verify Suspended Status**

| Field         | Value                     |
| ------------- | ------------------------- |
| Method        | `GET`                     |
| URL           | `{{baseUrl}}/auth/me`     |
| Authorization | `Bearer {{teacherToken}}` |

Expected: `status: "suspended"`, `suspension` object with reason and timestamp

---

**Step 5: Platform Admin - Unsuspend Teacher**

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| Method        | `POST`                                                       |
| URL           | `{{baseUrl}}/platform-admin/users/{teacherUserId}/unsuspend` |
| Authorization | `Bearer {{platformAdminToken}}`                              |

Expected Response:

```json
{
  "success": true,
  "data": {
    "uid": "teacher123",
    "status": "active",
    "suspension": null
  }
}
```

---

**Step 6: Verify Teacher Can Access Endpoints Again**

| Field         | Value                     |
| ------------- | ------------------------- |
| Method        | `GET`                     |
| URL           | `{{baseUrl}}/auth/me`     |
| Authorization | `Bearer {{teacherToken}}` |

Expected: `status: "active"`, `suspension: null`

---

### Flow 6: School Suspension Workflow

**Step 1: Create School Admin Account**
Follow Flow 2 (School Admin Signup and Onboarding) to create a school admin.

---

**Step 2: Platform Admin - Suspend School**

| Field         | Value                                                   |
| ------------- | ------------------------------------------------------- |
| Method        | `POST`                                                  |
| URL           | `{{baseUrl}}/platform-admin/schools/{schoolId}/suspend` |
| Authorization | `Bearer {{platformAdminToken}}`                         |

Body:

```json
{
  "reason": "Failed compliance audit"
}
```

Expected Response:

```json
{
  "success": true,
  "data": {
    "id": "school123",
    "status": "suspended",
    "suspension": {
      "reason": "Failed compliance audit",
      "suspendedBy": "admin123",
      "suspendedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

---

**Step 3: Verify School Admin Cannot Access School Functions**

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Method        | `GET`                              |
| URL           | `{{baseUrl}}/admin/school/profile` |
| Authorization | `Bearer {{schoolAdminToken}}`      |

Expected Response: `403 Forbidden` - School suspended

---

**Step 4: Platform Admin - Unsuspend School**

| Field         | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Method        | `POST`                                                    |
| URL           | `{{baseUrl}}/platform-admin/schools/{schoolId}/unsuspend` |
| Authorization | `Bearer {{platformAdminToken}}`                           |

Expected Response:

```json
{
  "success": true,
  "data": {
    "id": "school123",
    "status": "active",
    "suspension": null
  }
}
```

---

**Step 5: Verify School Admin Can Access Functions Again**

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Method        | `GET`                              |
| URL           | `{{baseUrl}}/admin/school/profile` |
| Authorization | `Bearer {{schoolAdminToken}}`      |

Expected: `200 OK` - School functions accessible

---

## Reference Tables

### User Roles

| API Role  | Internal Role    | Description                                        |
| --------- | ---------------- | -------------------------------------------------- |
| `teacher` | `school_teacher` | Teacher registered under a school                  |
| `school`  | `school_admin`   | School administrator                               |
| -         | `individual`     | Default role for individual users                  |
| -         | `platform_admin` | Platform administrator (cannot be created via API) |

### User Status

| Status      | Description                              |
| ----------- | ---------------------------------------- |
| `pending`   | User registered but profile not complete |
| `active`    | User profile complete and active         |
| `suspended` | User account suspended                   |

### Approval Status

| Status      | Description                                 |
| ----------- | ------------------------------------------- |
| `undefined` | Profile not yet submitted for approval      |
| `pending`   | Profile submitted and awaiting admin review |
| `approved`  | Profile approved by platform admin          |
| `rejected`  | Profile rejected by platform admin          |

### Proficiency Levels

| Value          |
| -------------- |
| `Beginner`     |
| `Intermediate` |
| `Advanced`     |

### Grade Levels (Allowed Values)

| Value         |
| ------------- |
| `KG`          |
| `Grade 1-5`   |
| `Grade 6-8`   |
| `Grade 9-10`  |
| `Grade 11-12` |
| `College`     |
| `Other`       |

### Subjects (Allowed Values)

| Value                |
| -------------------- |
| `Mathematics`        |
| `Science`            |
| `English`            |
| `History`            |
| `Geography`          |
| `Physics`            |
| `Chemistry`          |
| `Biology`            |
| `Computer Science`   |
| `Art`                |
| `Music`              |
| `Physical Education` |

### School Admin Roles (Allowed Values)

| Value                 |
| --------------------- |
| `Principal`           |
| `Vice Principal`      |
| `Head of Department`  |
| `HR / PD Coordinator` |
| `Other Admin`         |

### Status Codes

| Code  | Description                          |
| ----- | ------------------------------------ |
| `200` | Success                              |
| `201` | Created                              |
| `400` | Bad Request (validation error)       |
| `401` | Unauthorized (invalid/missing token) |
| `403` | Forbidden (account suspended)        |
| `404` | Not Found                            |
| `409` | Conflict (email already exists)      |
| `500` | Internal Server Error                |

---

## Profile Fields Reference

### Common Fields (All Roles)

| Field          | Type   | Required | Description                          |
| -------------- | ------ | -------- | ------------------------------------ |
| `firstName`    | string | No       | User's first name                    |
| `lastName`     | string | No       | User's last name                     |
| `phone`        | string | No       | Phone number                         |
| `address`      | string | No       | Address                              |
| `profilePhoto` | string | No       | URL to profile photo                 |
| `country`      | string | No       | Country name                         |
| `countryId`    | string | No       | ISO 3166-1 alpha-2 code (e.g., "IN") |
| `gender`       | string | No       | Gender                               |

### Teacher-Specific Fields

| Field                | Type     | Required | Description                                                   |
| -------------------- | -------- | -------- | ------------------------------------------------------------- |
| `subjects`           | string[] | **Yes**  | Teaching subjects (min 1). Must be from allowed subjects list |
| `grades`             | string[] | **Yes**  | Grade levels (min 1)                                          |
| `gradeLevels`        | string[] | No       | Must be from allowed grade levels list                        |
| `yearsExperience`    | number   | No       | Years of experience (integer >= 0)                            |
| `teachingExperience` | string   | No       | Experience description                                        |
| `competencyFocus`    | string[] | No       | Areas of focus                                                |
| `proficiencyLevel`   | string   | No       | "Beginner", "Intermediate", or "Advanced"                     |
| `currentSchool`      | string   | No       | Current school name                                           |

### School Admin-Specific Fields

| Field             | Type   | Required | Description                                  |
| ----------------- | ------ | -------- | -------------------------------------------- |
| `schoolName`      | string | **Yes**  | School name (min 2 chars)                    |
| `schoolAdminRole` | string | No       | Must be from allowed school admin roles list |
| `contactName`     | string | **Yes**  | Contact person name (min 2 chars)            |
| `contactEmail`    | string | **Yes**  | Contact email (valid format)                 |
| `contactPhone`    | string | No       | Contact phone number                         |
| `schoolSize`      | string | No       | School size description                      |
| `establishedYear` | number | No       | Year established (integer)                   |
| `principalName`   | string | No       | Principal's name                             |
| `totalTeachers`   | number | No       | Total number of teachers (integer)           |
| `totalStudents`   | number | No       | Total number of students (integer)           |
| `logo`            | string | No       | URL to school logo                           |
