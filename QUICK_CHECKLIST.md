# Quick Setup Checklist ✓

Print this out or keep it open while setting up!

---

## Before You Start

- [ ] **Install Node.js** from https://nodejs.org/ (LTS version)
  - Verify: Open terminal, type `node --version`
  
- [ ] **Install PostgreSQL** from https://www.postgresql.org/download/
  - Verify: Open terminal, type `psql --version`
  - **SAVE YOUR PASSWORD** - You'll need it later!

---

## Setup Steps

### Step 1: Extract Project
- [ ] Extract the ZIP file to a folder (e.g., Desktop, Documents, or a code folder)
- [ ] Open Terminal/Command Prompt in that folder
- [ ] Command: `cd path/to/food-delivery-app`

### Step 2: Create Configuration File
- [ ] Copy `.env.example` and rename to `.env.local`
- [ ] Open `.env.local` with a text editor
- [ ] Update this line with your PostgreSQL password:
  ```
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/food_delivery_db
  ```

### Step 3: Create Database
- [ ] Open terminal and type: `psql -U postgres`
- [ ] Enter your PostgreSQL password when prompted
- [ ] Copy & paste: `CREATE DATABASE food_delivery_db;`
- [ ] Type: `\q` to exit
- [ ] ✓ Database created!

### Step 4: Install Dependencies
- [ ] In project folder terminal, type: `npm install`
- [ ] **Wait** - this takes 2-5 minutes
- [ ] ✓ Should say "added XXX packages"

### Step 5: Initialize Database
- [ ] Type: `npm run db:push`
- [ ] ✓ Should say "[✓] Changes applied"

### Step 6: Start Application
- [ ] Type: `npm run dev`
- [ ] ✓ Should say "serving on port 5000"

### Step 7: Open in Browser
- [ ] Open: http://localhost:5000
- [ ] ✓ You should see the app!

---

## Test Login

- [ ] Try User login:
  - Email: `user@user.com`
  - Password: `user123`

- [ ] Try Admin login:
  - Email: `admin@admin.com`
  - Password: `admin123`

- [ ] Browse restaurants, add items to cart

---

## Troubleshooting Quick Links

**Database won't connect?**
- Check PostgreSQL is running
- Verify `.env.local` password matches your PostgreSQL password

**Port 5000 already in use?**
- Run: `PORT=3000 npm run dev`
- Visit: http://localhost:3000

**npm install failed?**
- Run: `npm cache clean --force`
- Delete `node_modules` folder
- Run: `npm install` again

**Still stuck?**
- See detailed help in `SETUP_GUIDE.md`

---

## Daily Usage

To **start** the app:
```
npm run dev
```

To **stop** the app:
```
Press Ctrl + C (Windows/Linux) or Cmd + C (Mac)
```

To **restart** after changes:
```
Stop (Ctrl+C), then npm run dev again
```

---

## Key Passwords & URLs to Remember

| Item | Value |
|------|-------|
| App URL | http://localhost:5000 |
| API URL | http://localhost:5000/api |
| Database Host | localhost:5432 |
| Database Name | food_delivery_db |
| Postgres User | postgres |
| Test User Email | user@user.com |
| Test User Password | user123 |
| Admin Email | admin@admin.com |
| Admin Password | admin123 |

---

**You've got this! 🚀**

If something doesn't work, Google the error message - most issues are common and easily fixed!
