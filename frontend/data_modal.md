## Onboarding Data Model

This project collects specific data for user onboarding, depending on the user’s role. Below are the required and optional fields for each onboarding flow.

---

### User Data Model Reference

All users share a base set of fields, with additional fields collected during onboarding depending on their role.

#### Common User Fields

| Field            | Type   | Description                                    |
| ---------------- | ------ | ---------------------------------------------- |
| id               | string | Unique user identifier                         |
| email            | string | User’s email address                           |
| role             | string | User role: `teacher`, `school`, `master-admin` |
| profileCompleted | bool   | Whether onboarding is complete                 |
| createdAt        | string | Account creation timestamp                     |
| updatedAt        | string | Last update timestamp                          |

#### Role-Specific Fields

- **Teacher:** See [Teacher Onboarding](#teacher-onboarding) below
- **School Admin:** See [School Admin Onboarding](#school-admin-onboarding) below
- **Master Admin:** See [Master Admin User](#master-admin-user) below

---

### Teacher Onboarding

| Field              | Type     | Required?   | Description                                                        |
| ------------------ | -------- | ----------- | ------------------------------------------------------------------ |
| firstName          | string   | Yes         | Teacher’s first name                                               |
| lastName           | string   | Yes         | Teacher’s last name                                                |
| schoolEmail        | string   | Yes         | Official school email (must be valid)                              |
| schoolId           | string   | Yes         | Selected school (from list or dynamically added)                   |
| teachingExperience | string   | Yes         | Experience range (e.g., "0-2", "3-5" years)                        |
| subjects           | string[] | Yes (1–5)   | Subjects taught (select 1–5)                                       |
| gradeLevels        | string[] | Yes (1+)    | Grade levels taught (select at least 1)                            |
| proficiencyLevel   | string   | Yes         | Proficiency level                                                  |
| staffId            | string   | Conditional | Staff ID or employment proof (required for pending/dynamic school) |
| certificates       | string   | Optional    | S3 link or file name for uploaded certificates                     |
| countryId          | string   | Optional    | Country                                                            |
| gender             | string   | Optional    | Gender                                                             |
| aspiration         | string   | Optional    | Career aspiration                                                  |

**Note:**

- `staffId` is required if the selected school is pending or dynamically added by the user.
- `certificates` should be an S3 link or file name after upload.

---

### School Admin Onboarding

| Field               | Type   | Required? | Description                            |
| ------------------- | ------ | --------- | -------------------------------------- |
| schoolName          | string | Yes       | Name of the school                     |
| officialSchoolEmail | string | Yes       | Official school email (must be valid)  |
| adminRole           | string | Yes       | Role of the admin (Principal, etc.)    |
| countryId           | string | Yes       | Country                                |
| phone               | string | Yes       | Phone number (min 10 digits)           |
| schoolAddress       | string | Yes       | School address                         |
| logo                | string | Optional  | School logo (image, base64 or S3 link) |

---

### Master Admin User

Master Admins do not require additional onboarding fields beyond the common user fields.

| Field            | Type   | Required? | Description                    |
| ---------------- | ------ | --------- | ------------------------------ |
| id               | string | Yes       | Unique user identifier         |
| email            | string | Yes       | User’s email address           |
| role             | string | Yes       | Must be `master-admin`         |
| profileCompleted | bool   | Yes       | Whether onboarding is complete |
| createdAt        | string | Yes       | Account creation timestamp     |
| updatedAt        | string | Yes       | Last update timestamp          |

---

### Example Payloads

#### Teacher

```json
{
  "id": "user-123",
  "email": "john.doe@school.edu",
  "role": "teacher",
  "profileCompleted": true,
  "createdAt": "2025-12-16T10:00:00Z",
  "updatedAt": "2025-12-16T10:05:00Z",
  "firstName": "John",
  "lastName": "Doe",
  "schoolEmail": "john.doe@school.edu",
  "schoolId": "school-123",
  "teachingExperience": "3-5",
  "subjects": ["Mathematics", "Science"],
  "gradeLevels": ["Grade 6-8"],
  "proficiencyLevel": "Advanced",
  "staffId": "s3://bucket/staff-id.pdf",
  "certificates": "s3://bucket/certificate.pdf",
  "countryId": "IN",
  "gender": "male",
  "aspiration": "Become a principal"
}
```

#### School Admin

```json
{
  "id": "user-456",
  "email": "admin@springfield.edu",
  "role": "school",
  "profileCompleted": true,
  "createdAt": "2025-12-16T10:00:00Z",
  "updatedAt": "2025-12-16T10:05:00Z",
  "schoolName": "Springfield Elementary",
  "officialSchoolEmail": "admin@springfield.edu",
  "adminRole": "Principal",
  "countryId": "IN",
  "phone": "+91 9876543210",
  "schoolAddress": "123 Main St, Springfield, IL 62701",
  "logo": "s3://bucket/logo.png"
}
```

#### Master Admin

```json
{
  "id": "user-789",
  "email": "admin@gurucoolai.com",
  "role": "master-admin",
  "profileCompleted": true,
  "createdAt": "2025-12-16T10:00:00Z",
  "updatedAt": "2025-12-16T10:05:00Z"
}
```

---

For more details, see the onboarding form implementations in:

- [components/onboarding-components/teacher-onboarding.tsx](components/onboarding-components/teacher-onboarding.tsx)
- [components/onboarding-components/school-admin-onboarding.tsx](components/onboarding-components/school-admin-onboarding.tsx)
