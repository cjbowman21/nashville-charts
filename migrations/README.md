# Database Migrations

This directory contains SQL migration scripts for the Nashville Charts database.

## How to Apply Migrations to Railway PostgreSQL

### Option 1: Using Railway CLI (Recommended)

1. Install Railway CLI if you haven't already:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Connect to the PostgreSQL database:
   ```bash
   railway run psql $DATABASE_URL
   ```

5. Run the migration script:
   ```sql
   \i /path/to/add-feedbacks-table.sql
   ```

### Option 2: Using Railway Web Interface

1. Go to your Railway dashboard: https://railway.app/
2. Navigate to your Nashville Charts project
3. Click on your PostgreSQL service
4. Go to the "Data" tab
5. Click "Query" or "psql" to open the database console
6. Copy and paste the contents of `add-feedbacks-table.sql`
7. Execute the script

### Option 3: Copy/Paste Method

1. Open `add-feedbacks-table.sql` in this directory
2. Copy the entire contents
3. In Railway dashboard → PostgreSQL service → Query tab
4. Paste and execute

## Migration Files

- `add-feedbacks-table.sql` - Creates the Feedbacks table for the user feedback system

## Verifying Migration Success

After running the migration, verify it worked by running:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'Feedbacks';
```

You should see "Feedbacks" in the results.

## Rollback

To rollback the Feedbacks table migration:

```sql
DROP TABLE IF EXISTS "Feedbacks";
```

**Warning**: This will delete all feedback data!
