# Complete Step-by-Step Setup Guide for Local Development

Follow these exact steps to get the food delivery app running on your laptop.

---

## STEP 1: Install Prerequisites (Do This First)

### Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version
3. Run the installer and follow the prompts
4. Verify installation by opening terminal/command prompt and typing:
   ```
   node --version
   npm --version
   ```
   You should see version numbers like `v18.x.x` and `9.x.x`

### Install PostgreSQL
1. Go to https://www.postgresql.org/download/
2. Choose your operating system and download PostgreSQL 14 or higher
3. Run the installer:
   - **Windows/Mac**: Follow the installer wizard
   - **Linux**: Follow platform-specific instructions
4. **Important**: Remember the password you set for the `postgres` user
5. Verify installation by opening terminal and typing:
   ```
   psql --version
   ```
   You should see a version number

---

## STEP 2: Download the Project

1. **If you have a ZIP file:**
   - Right-click the `food-delivery-app.zip` file
   - Select "Extract All" (Windows) or double-click (Mac/Linux)
   - Choose where to extract it (e.g., Desktop, Documents, or a code folder)

2. **Open Terminal/Command Prompt:**
   - Navigate to the extracted folder:
   ```
   cd path/to/food-delivery-app
   ```
   - For example on Windows: `cd C:\Users\YourName\Desktop\food-delivery-app`
   - For example on Mac/Linux: `cd ~/Desktop/food-delivery-app`

---

## STEP 3: Create Environment Configuration File

1. In the project folder, you'll see a file named `.env.example`
2. **Create a copy of it:**
   - Windows: Right-click `.env.example` → Copy → Paste → Rename to `.env.local`
   - Mac/Linux: Open terminal in the project folder and run:
     ```
     cp .env.example .env.local
     ```

3. **Open `.env.local` file with any text editor** (Notepad, VSCode, etc.) and update it:
   ```
   DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/food_delivery_db
   SESSION_SECRET=my_super_secret_key_12345
   NODE_ENV=development
   ```
   
   Replace `your_password_here` with the PostgreSQL password you set during installation.

---

## STEP 4: Create the Database

### On Windows:

1. Open Command Prompt
2. Type: `psql -U postgres`
3. Enter your PostgreSQL password
4. You should see `postgres=#` prompt
5. Copy and paste this command:
   ```sql
   CREATE DATABASE food_delivery_db;
   ```
6. You should see: `CREATE DATABASE`
7. Type: `\q` to exit

### On Mac/Linux:

1. Open Terminal
2. Type: `psql -U postgres`
3. Enter your PostgreSQL password
4. Copy and paste:
   ```sql
   CREATE DATABASE food_delivery_db;
   ```
5. Type: `\q` to exit

---

## STEP 5: Install Project Dependencies

1. **Open Terminal/Command Prompt** in the project folder
2. Run this command:
   ```
   npm install
   ```
3. **Wait for it to finish** (this might take 2-5 minutes)
4. You should see a message like `added 500 packages` with no errors

---

## STEP 6: Set Up Database Tables

Still in the project folder terminal, run:
```
npm run db:push
```

This command:
- Creates all database tables automatically
- Seeds the database with sample data:
  - Admin account: `admin@admin.com` / `admin123`
  - User account: `user@user.com` / `user123`
  - 2 sample restaurants with menu items

You should see output like `[✓] Changes applied`

---

## STEP 7: Start the Application

In the terminal, run:
```
npm run dev
```

You should see output like:
```
1:11:38 PM [express] serving on port 5000
```

This means the backend is running! 

---

## STEP 8: Open in Browser

1. Open your web browser (Chrome, Firefox, Safari, Edge, etc.)
2. Go to: **http://localhost:5000**
3. You should see the food delivery app!

---

## STEP 9: Test the App

### Try as a Regular User:
1. Click "Login" 
2. Email: `user@user.com`
3. Password: `user123`
4. Browse restaurants, add items to cart, place order

### Try as Admin:
1. Click "Logout"
2. Click "Login"
3. Email: `admin@admin.com`
4. Password: `admin123`
5. Visit the Admin Dashboard to manage restaurants, menus, and orders

---

## Troubleshooting

### Error: "Cannot connect to database"
- **Check PostgreSQL is running**: 
  - Windows: Look for PostgreSQL in Services
  - Mac: Check System Preferences → App Store apps for Postgres
  - Linux: Run `sudo systemctl status postgresql`
- **Check `.env.local` password**: Make sure it matches your PostgreSQL password
- **Restart everything**: Close terminal, restart PostgreSQL, try again

### Error: "Port 5000 already in use"
- Run the app on a different port:
  ```
  PORT=3000 npm run dev
  ```
  Then visit: **http://localhost:3000**

### Error: "Module not found"
- The `npm install` didn't complete. Try again:
  ```
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

### Database commands aren't working
- Make sure PostgreSQL service is running:
  - **Windows**: Press `Win + R`, type `services.msc`, find "PostgreSQL"
  - **Mac**: Open System Preferences
  - **Linux**: Run `sudo systemctl start postgresql`

### Still stuck?
- Check that all prerequisites are installed:
  ```
  node --version
  npm --version
  psql --version
  ```
  All three should show version numbers.

---

## What If You Want to Stop the App?

In the terminal where `npm run dev` is running:
- Press `Ctrl + C` (or `Cmd + C` on Mac)

To start it again: `npm run dev`

---

## Summary of Key Commands

```bash
# Install dependencies (run once)
npm install

# Set up database (run once)
npm run db:push

# Start the app
npm run dev

# Stop the app
Ctrl + C (or Cmd + C on Mac)
```

---

## Project Access Points

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/*
- **Database**: PostgreSQL on localhost:5432

---

You're all set! Follow these steps in order and you'll have the app running. Let me know if you get stuck on any step!
