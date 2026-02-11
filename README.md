# Expense Sharing Application

A comprehensive expense tracking and management system built with React Native (Expo) frontend and Django REST Framework backend. This application enables groups to track shared expenses efficiently with real-time synchronization capabilities.

## Project Overview

This full-stack application provides a complete solution for managing group expenses with:
- **Frontend**: React Native mobile app with TypeScript
- **Backend**: Django REST Framework API with token-based authentication
- **Features**: User authentication, group management, expense tracking, and real-time data synchronization

---

## Frontend Application

### Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage for local data and token persistence
- **Navigation**: React Navigation (bottom tab navigation)

### Features

#### 1. **Authentication System**
- Login/Register screen with username and password
- Token-based authentication stored securely in AsyncStorage
- Automatic token refresh on app launch
- Logout functionality with complete session cleanup

### API Integration
- Centralized API client with request/response interceptors
- Automatic Authorization header injection (Token-based)
- Error handling and logging
- Base URL: `http://192.168.0.146:8000/api/`

### Project Structure
```
myApp/
├── src/
│   ├── api/
│   │   └── client.ts           # Axios configuration & API functions
│   ├── components/
│   │   └── Card.tsx            # Reusable card component
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Authentication interface
│   │   ├── DashboardScreen.tsx  # Main expense tracking
│   │   ├── CalculatorScreen.tsx # Expense calculator
│   │   └── ArchiveScreen.tsx    # Historical expenses
│   ├── App.tsx                 # Main app entry & navigation
│   └── index.ts                # App exports
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## Backend API

### Base URL
```
http://192.168.0.146:8000/api/
```

### Authentication
All protected endpoints require a token header:
```bash
Authorization: Token <your_token_here>
```

### API Endpoints

#### **User Management**

**Register User**
```http
POST /api/users/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```
**Response (201 Created)**
```json
{
  "id": 1,
  "username": "john_doe"
}
```

**Login**
```http
POST /api/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```
**Response (200 OK)**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

#### **Group Management**

**List User's Groups**
```http
GET /api/groups/
Authorization: Token <token>
```
**Query Parameters**
- `last_sync` (optional): ISO 8601 datetime. Returns only groups modified after this time.

**Response (200 OK)**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Weekend Trip",
    "members": [1, 2, 3],
    "updated_at": "2024-01-15T10:30:00Z",
    "is_deleted": false
  }
]
```

**Create Group**
```http
POST /api/groups/
Authorization: Token <token>
Content-Type: application/json

{
  "name": "Vacation Fund"
}
```
**Response (201 Created)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Vacation Fund",
  "members": [1],
  "updated_at": "2024-01-15T10:35:00Z",
  "is_deleted": false
}
```

**Get Group Details**
```http
GET /api/groups/{group_id}/
Authorization: Token <token>
```

**Update Group**
```http
PUT /api/groups/{group_id}/
PATCH /api/groups/{group_id}/
Authorization: Token <token>
```

**Delete Group (Soft Delete)**
```http
DELETE /api/groups/{group_id}/
Authorization: Token <token>
```

#### **Expense Management**

**List Expenses (with Sync)**
```http
GET /api/expenses/
Authorization: Token <token>
```
**Query Parameters**
- `last_sync` (optional): ISO 8601 timestamp for incremental sync

**Response (200 OK)**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "group": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Pizza",
    "description": "Dinner for team",
    "amount": "45.50",
    "person_paying": 1,
    "date": "2024-01-15T19:00:00Z",
    "updated_at": "2024-01-15T19:05:00Z",
    "is_deleted": false
  }
]
```

**Create Expense**
```http
POST /api/expenses/
Authorization: Token <token>
Content-Type: application/json

{
  "group": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Restaurant",
  "description": "Team lunch",
  "amount": "120.75"
}
```
**Response (201 Created)**
- `person_paying` is automatically set to the authenticated user

**Get Expense Details**
```http
GET /api/expenses/{expense_id}/
Authorization: Token <token>
```

**Update Expense**
```http
PUT /api/expenses/{expense_id}/
PATCH /api/expenses/{expense_id}/
Authorization: Token <token>
```

**Delete Expense (Soft Delete)**
```http
DELETE /api/expenses/{expense_id}/
Authorization: Token <token>
```
- Sets `is_deleted=true` instead of physically deleting the record
- Record remains queryable via sync endpoints

### Architecture & Design Patterns

#### SyncMixin
A reusable mixin that provides synchronization capabilities:
```python
class SyncMixin:
    def filter_for_sync(self, queryset):
        """Filters queryset based on last_sync timestamp"""
    
    def perform_destroy(self, instance):
        """Implements soft delete instead of hard delete"""
```

#### ViewSet Architecture
Each resource (User, Group, Expense) uses Django REST Framework ViewSets:
- **UserViewSet**: Full CRUD, AllowAny permission
- **GroupViewSet**: Full CRUD, IsAuthenticated, member-filtered
- **ExpenseViewSet**: Full CRUD, IsAuthenticated, member-group-filtered

### Data Synchronization Strategy

#### Sync Flow for Mobile Clients
1. **First sync**: Client sends initial timestamp
2. **Query**: `GET /api/expenses/?last_sync=2024-01-15T10:00:00Z`
3. **Response**: All items modified after the given timestamp
4. **Deleted items**: Included with `is_deleted=true`
5. **Client action**: Updates or removes local items accordingly

### Security Features

#### ✅ Implemented
- Token-based authentication (stateless)
- Permission-based access control
- User isolation (users see only their own data)
- Soft deletes prevent accidental data loss
- CSRF protection via Django middleware
- Password hashing with Django's auth system

---

## Requirements

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 14.0 or higher
- **NPM/Yarn**: Latest stable version
- **Expo CLI**: Latest version

### Backend Dependencies
```
Django==5.2.7
djangorestframework==3.14.0
python-dotenv==0.21.0
```

### Frontend Dependencies
```
react==18.2.0
react-native==0.72.0
expo==49.0.0
@react-navigation/native==6.1.0
@react-navigation/bottom-tabs==6.5.0
axios==1.4.0
react-native-async-storage==1.17.0
@expo/vector-icons==13.0.0
typescript==5.1.0
```

### Development Tools
- **Backend**: Django Development Server
- **Frontend**: Expo Go (iOS/Android testing)
- **Database**: SQLite3 (development) / PostgreSQL (production)

---

## Installation & Setup

### Backend Installation

#### 1. Navigate to Project
```bash
cd /Users/jakub/zespolowy
```

#### 2. Create & Activate Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate     # On Windows
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Run Migrations
```bash
python manage.py migrate
```

#### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

#### 6. Start Development Server
```bash
python manage.py runserver
```
Server available at: `http://127.0.0.1:8000`

### Frontend Installation

#### 1. Navigate to Frontend Directory
```bash
cd myApp
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

#### 3. Start Expo Development Server
```bash
npm start
# or
expo start
```

#### 4. Run on Device/Emulator
- **iOS**: Press `i` in Expo CLI
- **Android**: Press `a` in Expo CLI
- **Web**: Press `w` in Expo CLI

---

## Testing

### Run Synchronization Tests
```bash
python Backend/test_sync.py
```
Tests the complete sync workflow:
1. User registration and login
2. Group creation
3. Expense tracking
4. Sync with `last_sync` parameter
5. Soft delete verification
6. Deleted item synchronization

### Run Security Tests
```bash
python Backend/test_security.py
```
Validates security implementation:
1. Cross-user data isolation
2. Group visibility restrictions
3. Direct ID access prevention (404 for unauthorized users)

---

## Project Structure

```
/
├── Backend/                    # Django REST API
│   ├── models.py              # Database models
│   ├── views.py               # API ViewSets
│   ├── serializers.py         # DRF serializers
│   ├── test_sync.py           # Sync tests
│   ├── test_security.py       # Security tests
│   ├── admin.py               # Django admin
│   └── migrations/            # Database migrations
│
├── core/                       # Django configuration
│   ├── settings.py            # Settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI config
│   └── asgi.py                # ASGI config
│
├── myApp/                      # React Native Frontend
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable components
│   │   ├── screens/           # App screens
│   │   └── App.tsx            # Main app
│   ├── app.json               # Expo config
│   ├── package.json           # Dependencies
│   └── tsconfig.json          # TypeScript config
│
├── manage.py                  # Django CLI
├── db.sqlite3                 # Database
├── package.json               # Root dependencies
└── README.md                  # This file
```

## Authors

- Jakub Pająk 64814
- Adam Mik
- Mateusz Jachimowski

