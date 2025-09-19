# TODO List for User Authentication and Cart Persistence

## 1. Update Shop Page (shop.html)
- [x] Change logout icon to login button with id="loginLogoutBtn"
- [x] Add logic to update icon based on user login status

## 2. Update Script.js (Main Class)
- [x] Modify addToCart to allow adding without login
- [x] Update handleCheckout to require login before checkout
- [x] Modify loadUserSession to merge guest cart with user cart on login
- [x] Update logout to reset user and keep cart as guest
- [x] Add updateLoginLogoutIcon function
- [x] Save cart as 'guest_cart' when not logged in
- [x] Update saveCartToStorage to handle guest vs user cart

## 3. Update Login.js
- [x] Merge guest cart with user cart on successful login
- [x] Clear guest cart after merging

## 4. Testing
- [ ] Test adding to cart without login
- [ ] Test checkout requiring login
- [ ] Test cart persistence after login
