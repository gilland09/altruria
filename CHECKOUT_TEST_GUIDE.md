# Quick Test Guide - Checkout & Cart Image Fixes

**Last Updated:** November 24, 2025

## What Was Fixed

1. ✅ **Product Fetching in Checkout**
   - Fixed race condition: cart items now loaded before fetching products
   - Products are fetched by ID from `/api/products/{id}/`
   - Fields are mapped correctly (name/title, price/unit_price, image/photo)

2. ✅ **Image File References**
   - All image paths corrected to use `../images/` from pages folder
   - Missing `default-product.png` copied to `/frontend/images/`
   - Fallback images added for missing product data
   - Comments added documenting the path structure

## How to Test

### Test 1: Verify Checkout Summary Displays Products

**Steps:**
1. Open `http://localhost:5500` (frontend)
2. Click a product "Add to Cart"
3. Go to Cart (`http://localhost:5500/pages/cart.html`)
4. Click "Proceed to Checkout"
5. **Expected:** Order summary shows:
   - Product image (or fallback)
   - Product name
   - Quantity
   - Line total (price × qty)
   - Subtotal, shipping, total

**If not working:**
- Open DevTools (F12) → Console tab
- Look for errors like `❌ Product fetch failed`
- Check Network tab for 404 errors on image requests

---

### Test 2: Verify No Broken Images

**Steps:**
1. Open any page: `http://localhost:5500`, `/pages/checkout.html`, `/pages/products.html`
2. Open DevTools (F12) → Network tab
3. Reload page
4. **Expected:** No 404 errors for:
   - `../images/logo.png`
   - `../images/poster.png`
   - `../images/default-product.png`
5. All product images should display or show fallback image

**If images are broken:**
- Check Network tab for 404s (image URL and actual path)
- Verify `/frontend/images/` folder exists
- Verify files listed in IMAGE_FIXES_SUMMARY.md exist

---

### Test 3: Console Logging

Open DevTools Console and verify you see:
```
✅ Products loaded: [array of products]
🛒 Checkout data: {items, user, timestamp, total}
📦 Cart loaded: [array of cart items]
```

If you see `❌ Product fetch failed for ID X: status 404`, it means:
- The product ID exists in cart but not in database
- Fallback image (default-product.png) will be used
- This is normal if seeded data is missing

---

### Test 4: Fallback Testing

To test fallbacks intentionally:
1. In DevTools Console, run:
   ```javascript
   localStorage.setItem('altruria_checkout', JSON.stringify({
     items: [{productId: 99999, quantity: 1}] // Non-existent product
   }));
   location.reload();
   ```
2. Go to `/pages/checkout.html`
3. **Expected:** Shows "Unknown Product" with fallback image and ₱0.00 price

---

## Files Changed

| File | Change | Status |
|------|--------|--------|
| `frontend/js/checkout.js` | Reordered init; added comments; fixed cart loading | ✅ |
| `frontend/js/cart.js` | Added image path documentation | ✅ |
| `frontend/js/script.js` | Added image path documentation | ✅ |
| `frontend/images/default-product.png` | Copied from root | ✅ |
| `IMAGE_FIXES_SUMMARY.md` | Full documentation | ✅ |

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Your cart is empty" on checkout page | Cart data not in localStorage | Add item to cart first, then go to checkout |
| Product showing "Unknown Product" | API fetch failed (status 404/500) | Check backend is running; check if product ID exists |
| Images show broken (red X) | 404 on image file | Verify `/frontend/images/` folder and files exist |
| "Order Summary not showing" | JavaScript error in console | Check DevTools Console for `❌ Error` messages |

---

## Support Commands

**Check if backend is running:**
```bash
curl http://localhost:8000/api/products/1/
```

**Check if frontend images exist:**
```bash
ls -la /c/PROJECTS/altruria_2/frontend/images/
```

**View console logs:**
- Open browser DevTools (F12) → Console tab
- Reload page
- Look for logs starting with `🛒`, `✅`, `❌`, `📦`

---

**Next Step:** Test the checkout page with items in your cart and verify the order summary renders correctly!
