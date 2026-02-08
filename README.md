# Expense Sharing Backend API

A Django REST Framework-based backend for managing shared expenses within groups. This API provides real-time synchronization capabilities for mobile clients, enabling groups to track and split expenses efficiently.

## Overview

This project implements a comprehensive expense management system with features like group management, expense tracking, and mobile-optimized data synchronization. The backend is designed to support multiple clients with consistent state management through soft-delete mechanisms and timestamp-based sync filtering.

## Key Features

### 🔄 Real-Time Synchronization
- **Timestamp-based sync**: Query expenses with `last_sync` parameter to fetch only changed records
- **Soft delete support**: Deleted items remain queryable with `is_deleted=true` status for mobile device consistency
- **Automatic timestamps**: All entities track `updated_at` for data consistency

### 👥 Group Management
- Create and manage expense-sharing groups
- Multiple group members (Many-to-Many relationships)
- Member-based access control (users only see their groups)

### 💰 Expense Tracking
- Track individual expenses within groups
- Record who paid for the expense
- Store descriptions and amounts
- Automatic timestamps on creation and modification

### 🔐 Security & Authentication
- Token-based authentication (Django Token Auth)
- Permission-based access control
- Isolated data views (users see only their own groups and expenses)
- Role validation for API endpoints

## Tech Stack

- **Framework**: Django 5.2.7
- **API**: Django REST Framework (DRF)
- **Database**: SQLite3 (development) / PostgreSQL (production-ready)
- **Authentication**: Django Token Authentication
- **Language**: Python 3.x

## Project Structure

```
Projekt_zespolowy/
├── Backend/                    # Main Django app
│   ├── models.py              # Database models (Group, Expense)
│   ├── views.py               # API ViewSets with sync logic
│   ├── serializers.py         # DRF serializers
│   ├── test_sync.py           # Synchronization test suite
│   ├── test_security.py       # Security validation tests
│   ├── admin.py               # Django admin configuration
│   └── migrations/            # Database migrations
│
├── core/                       # Django project configuration
│   ├── settings.py            # Project settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI configuration
│   └── asgi.py                # ASGI configuration
│
├── manage.py                  # Django management script
└── db.sqlite3                 # Database file

```

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### 1. Clone & Navigate to Project
```bash
cd Projekt_zespolowy
```

### 2. Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On macOS/Linux
```

### 3. Install Dependencies
```bash
pip install django djangorestframework
```

### 4. Run Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser (Optional - for Admin Panel)
```bash
python manage.py createsuperuser
```

### 6. Start Development Server
```bash
python manage.py runserver
```
Server will be available at: `http://127.0.0.1:8000`

## API Documentation

### Base URL
```
http://127.0.0.1:8000/api/
```

### Authentication
All protected endpoints require a token header:
```bash
Authorization: Token <your_token_here>
```

---

### User Management

#### Register User
```http
POST /users/
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

#### Login
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

---

### Group Management

#### List User's Groups
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

#### Create Group
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

#### Get Group Details
```http
GET /api/groups/{group_id}/
Authorization: Token <token>
```

#### Update Group
```http
PUT /api/groups/{group_id}/
PATCH /api/groups/{group_id}/
Authorization: Token <token>
```

#### Delete Group (Soft Delete)
```http
DELETE /api/groups/{group_id}/
Authorization: Token <token>
```

---

### Expense Management

#### List Expenses (with Sync)
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

#### Create Expense
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

#### Get Expense Details
```http
GET /api/expenses/{expense_id}/
Authorization: Token <token>
```

#### Update Expense
```http
PUT /api/expenses/{expense_id}/
PATCH /api/expenses/{expense_id}/
Authorization: Token <token>
```

#### Delete Expense (Soft Delete)
```http
DELETE /api/expenses/{expense_id}/
Authorization: Token <token>
```
- Sets `is_deleted=true` instead of physically deleting the record
- Record remains queryable via sync endpoints

---

## Architecture & Design Patterns

### SyncMixin
A reusable mixin that provides synchronization capabilities:
```python
class SyncMixin:
    def filter_for_sync(self, queryset):
        """Filters queryset based on last_sync timestamp"""
    
    def perform_destroy(self, instance):
        """Implements soft delete instead of hard delete"""
```

### ViewSet Architecture
Each resource (User, Group, Expense) uses Django REST Framework ViewSets:
- **UserViewSet**: Full CRUD, AllowAny permission
- **GroupViewSet**: Full CRUD, IsAuthenticated, member-filtered
- **ExpenseViewSet**: Full CRUD, IsAuthenticated, member-group-filtered

### Authentication Flow
1. User registers via `/users/` endpoint
2. User logs in via `/api/login/` to receive token
3. Token included in subsequent requests via `Authorization` header
4. Django Token Auth validates all protected endpoints

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

## Data Synchronization Strategy

### Sync Flow for Mobile Clients
1. **First sync**: Client sends initial timestamp
2. **Query**: `GET /api/expenses/?last_sync=2024-01-15T10:00:00Z`
3. **Response**: All items modified after the given timestamp
4. **Deleted items**: Included with `is_deleted=true`
5. **Client action**: Updates or removes local items accordingly

### Example Sync Response
```json
[
  {
    "id": "uuid-1",
    "name": "Pizza",
    "updated_at": "2024-01-15T10:05:00Z",
    "is_deleted": false
  },
  {
    "id": "uuid-2",
    "name": "Old Expense",
    "updated_at": "2024-01-15T10:10:00Z",
    "is_deleted": true
  }
]
```
Mobile client:
- Updates or inserts item 1
- Deletes item 2 locally

## Security Features

### ✅ Implemented
- Token-based authentication (stateless)
- Permission-based access control
- User isolation (users see only their own data)
- Soft deletes prevent accidental data loss
- CSRF protection via Django middleware
- Password hashing with Django's auth system

### Query Filtering
- Groups: Filtered by `members=current_user`
- Expenses: Filtered by `group__members=current_user`
- Direct ID access returns 404 if user not in group

## Development Guidelines

### Adding New Endpoints
```python
class NewViewSet(SyncMixin, viewsets.ModelViewSet):
    serializer_class = YourSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filter data specific to current user
        queryset = YourModel.objects.filter(owner=self.request.user)
        return self.filter_for_sync(queryset)
```

### Database Query Examples
```python
# Get user's groups
user.my_groups.all()

# Get expenses in a specific group
group.expenses.all()

# Get items modified after timestamp
Group.objects.filter(updated_at__gt=datetime_object)
```

## Configuration

### Settings File (`core/settings.py`)
Key configurations:
```python
INSTALLED_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'Backend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}
```

## Troubleshooting

### 401 Unauthorized
- Missing or invalid token in request header
- **Solution**: Ensure `Authorization: Token <token>` header is present

### 404 Not Found
- Accessing resource you don't have permission for
- Resource doesn't exist
- **Solution**: Verify group/expense ownership

### 400 Bad Request
- Invalid JSON payload
- Missing required fields
- **Solution**: Check request body format and required fields

### Sync not returning changes
- Ensure timestamp format is ISO 8601: `2024-01-15T10:30:00Z`
- Check that items have `updated_at` after `last_sync` time
- **Solution**: Verify timestamp comparison in filters

## Production Considerations

1. **Database**: Switch from SQLite to PostgreSQL
2. **Debug Mode**: Set `DEBUG=False` in settings
3. **Secret Key**: Use environment variable for Django SECRET_KEY
4. **ALLOWED_HOSTS**: Configure allowed domains
5. **CORS**: Install and configure django-cors-headers if needed
6. **SSL**: Enable HTTPS in production
7. **Logging**: Configure proper logging
8. **Backups**: Implement database backup strategy

## License

[Specify your license here]

## Contributing

[Add contribution guidelines if applicable]

## Support

For issues or questions, please refer to the test files for usage examples:
- `Backend/test_sync.py` - Synchronization examples
- `Backend/test_security.py` - Security validation examples
