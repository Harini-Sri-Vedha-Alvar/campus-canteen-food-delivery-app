# Copy & Paste Commands for Your Operating System

Choose your OS below and copy/paste the commands exactly as shown.

---

## WINDOWS

### 1. After installing Node.js and PostgreSQL, verify installation:
```
node --version
npm --version
psql --version
```

### 2. Extract the ZIP file and navigate to it:
```
cd path\to\food-delivery-app
```
Example:
```
cd C:\Users\YourName\Desktop\food-delivery-app
```

### 3. Create the .env.local file:
In the project folder, create a new file called `.env.local` with this content:
```
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/food_delivery_db
SESSION_SECRET=my_super_secret_key_12345
NODE_ENV=development
```
**Replace `your_postgres_password` with the password you set during PostgreSQL installation!**

### 4. Create the database:
```
psql -U postgres
```
When prompted for password, enter your PostgreSQL password.

Then type:
```sql
CREATE DATABASE food_delivery_db;
\q
```

### 5. Install dependencies:
```
npm install
```

### 6. Set up database tables:
```
npm run db:push
```

### 7. Start the application:
```
npm run dev
```

### 8. Open in browser:
Visit: **http://localhost:5000**

### To stop the app:
Press `Ctrl + C` in the terminal

---

## MAC

### 1. Verify installation:
```bash
node --version
npm --version
psql --version
```

### 2. Navigate to project folder:
```bash
cd ~/Desktop/food-delivery-app
```
Or wherever you extracted it.

### 3. Create the .env.local file:
```bash
cat > .env.local << EOF
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/food_delivery_db
SESSION_SECRET=my_super_secret_key_12345
NODE_ENV=development
EOF
```
**Replace `your_postgres_password` with your PostgreSQL password!**

Or manually: Right-click in Finder → New File → name it `.env.local` → open with TextEdit

### 4. Create the database:
```bash
psql -U postgres
```
Enter your PostgreSQL password when prompted.

Then type:
```sql
CREATE DATABASE food_delivery_db;
\q
```

### 5. Install dependencies:
```bash
npm install
```

### 6. Set up database tables:
```bash
npm run db:push
```

### 7. Start the application:
```bash
npm run dev
```

### 8. Open in browser:
Visit: **http://localhost:5000**

### To stop the app:
Press `Cmd + C` in the terminal

---

## LINUX (Ubuntu/Debian)

### 1. Verify installation:
```bash
node --version
npm --version
psql --version
```

### 2. Start PostgreSQL service:
```bash
sudo systemctl start postgresql
```

### 3. Navigate to project folder:
```bash
cd ~/Desktop/food-delivery-app
```
Or wherever you extracted it.

### 4. Create the .env.local file:
```bash
cat > .env.local << EOF
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/food_delivery_db
SESSION_SECRET=my_super_secret_key_12345
NODE_ENV=development
EOF
```
**Replace `your_postgres_password` with your PostgreSQL password!**

### 5. Create the database:
```bash
psql -U postgres
```
Enter your PostgreSQL password when prompted.

Then type:
```sql
CREATE DATABASE food_delivery_db;
\q
```

### 6. Install dependencies:
```bash
npm install
```

### 7. Set up database tables:
```bash
npm run db:push
```

### 8. Start the application:
```bash
npm run dev
```

### 9. Open in browser:
Visit: **http://localhost:5000**

### To stop the app:
Press `Ctrl + C` in the terminal

### To stop PostgreSQL later:
```bash
sudo systemctl stop postgresql
```

---

## Common Issues & Quick Fixes

### "PostgreSQL password is wrong"
Find out your password:
```
# Windows: Run Services (Win + R, type services.msc) and look for PostgreSQL
# Mac/Linux: Check your installation notes or try default password "postgres"
```

### "psql command not found"
- **Windows**: Add PostgreSQL to PATH or use full path like:
  ```
  "C:\Program Files\PostgreSQL\15\bin\psql" -U postgres
  ```
- **Mac**: PostgreSQL may be in `/Library/PostgreSQL/*/bin/`
- **Linux**: Install PostgreSQL:
  ```
  sudo apt-get install postgresql postgresql-contrib
  ```

### "Port 5000 is already in use"
Use a different port:
```bash
PORT=3000 npm run dev
```
Then visit: **http://localhost:3000**

### "npm install hangs or fails"
Try:
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### "Database connection fails"
Make sure PostgreSQL is running:
- **Windows**: Check Services (postgresql-x64-XX service should be running)
- **Mac**: Check System Preferences or Activity Monitor
- **Linux**: Run `sudo systemctl status postgresql`

---

## Final Checklist

After following your OS-specific commands above:

- [ ] Can you see version numbers for `node`, `npm`, and `psql`?
- [ ] Did `npm install` complete without errors?
- [ ] Did `npm run db:push` say "Changes applied"?
- [ ] Does `npm run dev` say "serving on port 5000"?
- [ ] Can you visit http://localhost:5000 in your browser?
- [ ] Can you login with `user@user.com` / `user123`?

If all checkmarks are ✓, you're ready to go!

---

## Next: Just Run These Commands Every Day

To start the app:
```bash
npm run dev
```

To stop it:
```
Ctrl + C (or Cmd + C on Mac)
```

That's it! Enjoy your food delivery app! 🚀
