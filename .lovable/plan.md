
## Make User Admin

**User Details:**
- **Name:** Rishav Jaiswal
- **Email:** rishavjaiswal111120@gmail.com
- **User ID:** 98a5f168-1a34-4ce9-a9c1-7138c687db20

**Action Required:**
Insert a record into the `user_roles` table to grant admin privileges to this user.

---

### Technical Details

**Database Change:**
```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('98a5f168-1a34-4ce9-a9c1-7138c687db20', 'admin');
```

This will allow the user to:
- Access the admin dashboard at `/admin`
- Manage orders, products, coupons, and users
- View all customer data and order details
