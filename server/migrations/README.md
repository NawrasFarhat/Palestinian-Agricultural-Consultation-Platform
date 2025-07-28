# Database Migrations

This directory contains Sequelize migration scripts for the Palestinian Agricultural Research and Smart Advisory Platform.

## Migration Files

1. **001-create-users.js** - Creates the users table with authentication fields
2. **002-create-diseases.js** - Creates the diseases table with foreign key to users
3. **003-create-questions.js** - Creates the questions table with foreign key to diseases
4. **004-create-answers.js** - Creates the answers table (expected answers) with foreign key to questions
5. **005-create-consultations.js** - Creates the consultations table with foreign key to users
6. **006-create-farmer-answers.js** - Creates the farmer_answers table with foreign keys to users and questions
7. **007-create-diagnosis-history.js** - Creates the diagnosis_history table with foreign keys to users and diseases
8. **008-create-diagnosis-answers.js** - Creates the diagnosis_answers table with foreign keys to diagnosis_history and questions
9. **009-create-feedback.js** - Creates the feedback table with foreign key to users
10. **010-create-support-requests.js** - Creates the support_requests table with foreign key to users
11. **011-create-logs.js** - Creates the logs table with foreign key to users
12. **012-create-pending-changes.js** - Creates the pending_changes table with foreign keys to diseases and users
13. **013-create-role-change-requests.js** - Creates the role_change_requests table with foreign key to users
14. **014-seed-initial-data.js** - Seeds initial data including admin user and sample diseases

## Database Schema Overview

### Core Tables
- **users** - User accounts with roles (farmer, engineer, manager, it)
- **diseases** - Disease information with symptoms and solutions
- **questions** - Diagnostic questions linked to diseases
- **answers** - Expected answers for questions
- **consultations** - Farmer consultation records
- **farmer_answers** - Actual answers provided by farmers
- **diagnosis_history** - Diagnosis records with results
- **diagnosis_answers** - Answers linked to specific diagnoses

### Support Tables
- **feedback** - User feedback submissions
- **support_requests** - Technical support requests
- **logs** - System activity logs
- **pending_changes** - Engineer submissions awaiting approval
- **role_change_requests** - User role change requests

## Usage

### Prerequisites
1. Install sequelize-cli: `npm install -g sequelize-cli`
2. Configure database connection in `.env` file
3. Create database: `CREATE DATABASE senior;`

### Running Migrations

```bash
# Run all migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Undo all migrations
npm run migrate:undo:all

# Run seed data
npm run seed

# Reset database (drop, create, migrate, seed)
npm run db:reset
```

### Manual Commands

```bash
# Run specific migration
npx sequelize-cli db:migrate --to 005-create-consultations.js

# Run migrations up to specific file
npx sequelize-cli db:migrate --to 014-seed-initial-data.js

# Check migration status
npx sequelize-cli db:migrate:status
```

## Initial Data

The seed file creates:
- **Admin user**: username: `admin`, password: `admin123`, role: `it`
- **Engineer user**: username: `engineer1`, password: `engineer123`, role: `engineer`
- **Manager user**: username: `manager1`, password: `manager123`, role: `manager`
- **Farmer user**: username: `farmer1`, password: `farmer123`, role: `farmer`
- **Sample diseases**: Yellow Leaf Disease, Brown Spot Disease, Root Rot
- **Sample questions**: Diagnostic questions for each disease
- **Sample answers**: Expected answers in English and Arabic

## Database Constraints

### Foreign Key Relationships
- All foreign keys have CASCADE on UPDATE
- Most foreign keys have CASCADE on DELETE (except user references which use RESTRICT/SET NULL)
- Unique constraints on usernames and disease names
- Proper indexing on frequently queried columns

### Data Types
- **INTEGER** for IDs and foreign keys
- **STRING** for short text (usernames, names, subjects)
- **TEXT** for long text (symptoms, solutions, messages)
- **ENUM** for status fields and roles
- **FLOAT** for confidence scores
- **DATE** for timestamps

### Indexes
- Primary keys on all tables
- Indexes on foreign keys for performance
- Indexes on frequently queried columns (status, createdAt, etc.)
- Unique indexes on usernames and disease names

## Troubleshooting

### Common Issues
1. **Migration fails**: Check database connection and permissions
2. **Foreign key constraint fails**: Ensure referenced tables exist
3. **Duplicate key error**: Check for existing data in tables
4. **Permission denied**: Ensure MySQL user has proper privileges

### Reset Database
If you need to completely reset the database:
```bash
npm run db:reset
```

This will:
1. Drop the existing database
2. Create a new database
3. Run all migrations
4. Seed initial data 