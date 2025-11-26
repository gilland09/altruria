# 🚨 QUICK FIX: Products Not Displaying

## The Problem
Your product section isn't showing products on the frontend.

## The Root Cause
**Backend server is not running** + `.env` has `DEBUG=False` (production mode) while testing locally.

## ⚡ 2-Minute Fix

### Step 1: Fix Environment Settings
```bash
# Navigate to backend folder
cd c:\PROJECTS\altruria_2\backend

# Open .env file and change line 7:
# FROM: DEBUG=False
# TO:   DEBUG=True
```

**Quick edit in VS Code:**
```
DEBUG=True
```
Save the file.

**Why?** DEBUG=False enables strict HTTPS/production security that breaks localhost testing.

---

### Step 2: Start Backend Server
```bash
# Make sure you're in backend folder
cd c:\PROJECTS\altruria_2\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Django server
python manage.py runserver
```

**Expected output:**
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
November 25, 2025 - 14:30:00
Django version 4.2.7, using settings 'altruria_project.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Keep this terminal open!** Backend needs to stay running.

---

### Step 3: Start Frontend Server (New Terminal)
```bash
# Open NEW PowerShell terminal
cd c:\PROJECTS\altruria_2\frontend

# Start simple HTTP server
python -m http.server 5500
```

**Expected output:**
```
Serving HTTP on :: port 5500 (http://[::]:5500/) ...
```

**Keep this terminal open too!**

---

### Step 4: Test in Browser
1. Open browser
2. Go to: **http://localhost:5500**
3. Click "Products" or go to: **http://localhost:5500/pages/products.html**

**Expected result:** You should see 11 products in a grid layout!

---

## 🔍 Still Not Working? Debug Steps

### Check 1: Backend API Working
Open new terminal:
```bash
curl http://localhost:8000/api/products/
```

**Should see:** JSON response with product data like:
```json
{
  "count": 11,
  "results": [
    {
      "id": 1,
      "name": "Organic Chicken Breast",
      "category": "meats",
      "price": "280.00",
      ...
    }
  ]
}
```

**If you see this:** Backend is working! ✅

**If you see nothing/error:** Backend not running. Go back to Step 2.

---

### Check 2: Products in Database
```bash
cd c:\PROJECTS\altruria_2\backend
python manage.py shell -c "from core.models import Product; print(f'Products: {Product.objects.count()}')"
```

**Should see:** `Products: 11`

**If 0 products:** Run seed command:
```bash
python manage.py seed_data
```

---

### Check 3: Frontend Console Errors
1. Open browser to http://localhost:5500
2. Press **F12** (open Developer Tools)
3. Click **Console** tab
4. Look for errors (red text)

**Common errors and fixes:**

#### Error: "CORS policy" or "blocked by CORS"
**Fix:** Check backend `.env` has:
```env
CORS_ALLOWED=http://localhost:5500,http://127.0.0.1:5500
```

#### Error: "Failed to fetch" or "ERR_CONNECTION_REFUSED"
**Fix:** Backend not running. Start backend server (Step 2).

#### Error: "404 Not Found" on API call
**Fix:** Wrong API URL. Check frontend is using `http://localhost:8000/api/products/`

---

### Check 4: Frontend Loading Config
In browser console (F12), type:
```javascript
console.log(window.API_BASE_URL)
```

**Should see:** `http://localhost:8000/api`

**If undefined:** Config.js not loading. Check HTML includes:
```html
<script src="../js/config.js"></script>
```

---

## 🎯 What Should Happen After Fix

1. **Homepage** (http://localhost:5500):
   - Hero section
   - Promotion cards
   - Featured products grid (should show products with images/prices)

2. **Products Page** (http://localhost:5500/pages/products.html):
   - Category filters (All, Meats, Vegetables)
   - Product grid with 11 products
   - Each card shows: image, name, description, price, stock, "Add to Cart" button

3. **Cart Page** (http://localhost:5500/pages/cart.html):
   - Shows added items
   - Can adjust quantities
   - Shows total price

4. **Admin Panel** (http://localhost:8000/admin):
   - Login: admin@altruria.local / AdminPass123
   - Can manage products, orders, users

---

## 📱 Testing Checklist

Once fixed, test these:

- [ ] Homepage loads and shows products
- [ ] Products page shows all 11 products
- [ ] Can filter by category (Meats/Vegetables)
- [ ] Can click "Add to Cart" (should see success message)
- [ ] Cart page shows added items
- [ ] Can login/signup
- [ ] Admin panel accessible

---

## 🚀 After Local Testing Works

Once everything works locally, you're ready to deploy!

**For deployment:**
1. Keep local `.env` with `DEBUG=True`
2. Create production `.env` with `DEBUG=False` and production domains
3. Follow `PHASE_2_FREE_DEMO.md` for hosting instructions

**Remember:** After deployment, you can still edit code locally, test, and push updates!

---

## 💡 Pro Tips

### Running Both Servers Easily
Create a start script! In project root, create `START_SERVERS.ps1`:
```powershell
# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\PROJECTS\altruria_2\backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\PROJECTS\altruria_2\frontend'; python -m http.server 5500"

Write-Host "✅ Both servers starting..."
Write-Host "Frontend: http://localhost:5500"
Write-Host "Backend:  http://localhost:8000"
Write-Host "Admin:    http://localhost:8000/admin"
```

Then just run: `.\START_SERVERS.ps1`

### Stop Servers
- Press **Ctrl+C** in each terminal
- Or close the terminal windows

---

## ❓ Common Questions

**Q: Why do I need two terminals?**  
A: One for backend (Django), one for frontend (static file server). Both need to run simultaneously.

**Q: Can I use different ports?**  
A: Yes, but update `CORS_ALLOWED` in backend `.env` and frontend API config.

**Q: Do I need to restart servers after code changes?**  
A: 
- Backend: Auto-reloads (Django hot reload)
- Frontend: Just refresh browser (F5)
- Database changes: Need restart + migrate

**Q: Why DEBUG=True for local, DEBUG=False for production?**  
A: DEBUG=True shows helpful errors for development. DEBUG=False enables security features (HTTPS redirect, secure cookies) needed for production.

---

**Status:** Quick fix guide complete. Follow steps in order for fastest resolution!
