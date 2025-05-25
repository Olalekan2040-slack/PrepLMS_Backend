# Prep Platform API Documentation

This documentation describes all REST API endpoints for the Prep Platform backend. All endpoints are prefixed with the local server URL:

```
http://localhost:8000
```

All endpoints requiring authentication expect:
```
Authorization: Bearer <access_token>
```

---

## Authentication & User Endpoints

### Register
- **POST** `http://localhost:8000/api/users/register/`
- Registers a new user with email or phone number.
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "phone_number": "08012345678",
    "password": "Password123",
    "confirm_password": "Password123",
    "avatar": null, // (form-data for file upload)
    "contact_details": "Lagos, Nigeria"
  }
  ```
- **Response:** User created, OTP sent.

### OTP Verification
- **POST** `http://localhost:8000/api/users/verify-otp/`
- Verifies user account with OTP sent to email or phone.
- **Body:**
  ```json
  {
    "email_or_phone": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response:** Account verified.

### Login (JWT)
- **POST** `http://localhost:8000/api/users/login/`
- Authenticates user and returns JWT tokens.
- **Body:**
  ```json
  {
    "email_or_phone": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response:**
  ```json
  {
    "refresh": "<refresh_token>",
    "access": "<access_token>",
    "expires_in": 3600,
    "message": "Login successful. Your access token will expire in 60 minutes."
  }
  ```

### Password Reset Request
- **POST** `http://localhost:8000/api/users/password-reset/request/`
- Sends OTP for password reset.
- **Body:**
  ```json
  {
    "email_or_phone": "user@example.com"
  }
  ```
- **Response:** OTP sent for password reset.

### Password Reset Confirm
- **POST** `http://localhost:8000/api/users/password-reset/confirm/`
- Confirms password reset with OTP.
- **Body:**
  ```json
  {
    "email_or_phone": "user@example.com",
    "otp": "123456",
    "new_password": "NewPassword123",
    "confirm_password": "NewPassword123"
  }
  ```
- **Response:** Password reset successful.

### User Profile
- **GET** `http://localhost:8000/api/users/profile/`
- **PATCH/PUT** `http://localhost:8000/api/users/profile/`
- Gets or updates user profile. Requires authentication.
- **Body (PATCH example):**
  ```json
  {
    "phone_number": "08012345678",
    "avatar": null, // (form-data for file upload)
    "contact_details": "Updated address"
  }
  ```
- **Response:** User profile data.

---

## Dashboard & User Progress

### Dashboard Summary
- **GET** `http://localhost:8000/api/rewards/dashboard/`
- Returns user streak, points, bookmarks, history, and subscription status.
- **Response:**
  ```json
  {
    "streak": {
      "current_streak_days": 3,
      "longest_streak_days": 5,
      "last_activity_date": "2025-05-13"
    },
    "points": {
      "total_points": 120,
      "redeemed_points": 20,
      "available_points": 100
    },
    "bookmarks": [ ... ],
    "history": [ ... ],
    "subscription": {
      "plan": {
        "name": "Standard",
        "plan_type": "standard",
        "description": "...",
        "price": "500.00",
        "duration_days": 30,
        "video_limit": 0
      },
      "start_date": "...",
      "end_date": "...",
      "is_active": true
    }
  }
  ```

---

## JWT Token Endpoints

- **POST** `http://localhost:8000/api/token/`  (username/password, for admin or legacy use)
- **POST** `http://localhost:8000/api/token/refresh/`  (refresh token to get new access token)

---

## Content Endpoints

### Courses
- **GET** `http://localhost:8000/api/content/courses/` (list all courses)
- **GET** `http://localhost:8000/api/content/courses/<id>/` (get course details)
- **GET** `http://localhost:8000/api/content/courses/subject/<subject>/` (get courses by subject)
- **GET** `http://localhost:8000/api/content/courses/class/<class>/` (get courses by class level)
- **GET** `http://localhost:8000/api/content/courses/featured/` (get featured courses)

### Videos
- **GET** `http://localhost:8000/api/content/videos/` (list all videos)
- **GET** `http://localhost:8000/api/content/videos/<id>/` (get video details)
- **GET** `http://localhost:8000/api/content/videos/course/<courseId>/` (get videos in a course)
- **POST** `http://localhost:8000/api/content/videos/progress/` (update video progress)
- **GET** `http://localhost:8000/api/content/videos/progress/<id>/` (get video progress)
- **POST** `http://localhost:8000/api/content/videos/<id>/bookmark/` (bookmark video)
- **DELETE** `http://localhost:8000/api/content/videos/<id>/bookmark/` (remove bookmark)

---

## Progress Endpoints

- **GET** `http://localhost:8000/api/content/progress/dashboard/` (get overall learning progress)
- **GET** `http://localhost:8000/api/content/progress/course/<courseId>/` (get course progress)
- **GET** `http://localhost:8000/api/content/progress/subject/<subjectId>/` (get subject progress)
- **POST** `http://localhost:8000/api/content/progress/track/` (update learning progress)
- **GET** `http://localhost:8000/api/content/progress/recent-activity/` (get recent learning activity)

---

## Analytics Endpoints

- **GET** `http://localhost:8000/api/content/analytics/performance/` (get learning performance)
- **GET** `http://localhost:8000/api/content/analytics/time-spent/` (get time spent learning)
- **GET** `http://localhost:8000/api/content/analytics/subject-strengths/` (get subject performance)
- **GET** `http://localhost:8000/api/content/analytics/recommendations/` (get personalized recommendations)

---

## Rewards Endpoints

- **GET** `http://localhost:8000/api/rewards/points/` (get user points)
- **GET** `http://localhost:8000/api/rewards/streak/` (get current streak)
- **POST** `http://localhost:8000/api/rewards/redeem/` (redeem points for rewards)
- **GET** `http://localhost:8000/api/rewards/achievements/` (get user achievements)
- **GET** `http://localhost:8000/api/rewards/leaderboard/` (get points leaderboard)
- **GET** `http://localhost:8000/api/rewards/available-rewards/` (list available rewards)

---

## Subscription Endpoints

- **GET** `http://localhost:8000/api/subscription/plans/` (list subscription plans)
- **GET** `http://localhost:8000/api/subscription/current/` (get current subscription)
- **POST** `http://localhost:8000/api/subscription/subscribe/` (subscribe to a plan)
- **POST** `http://localhost:8000/api/subscription/cancel/` (cancel subscription)
- **POST** `http://localhost:8000/api/subscription/apply-voucher/` (apply voucher)

---

## Search Endpoints

- **GET** `http://localhost:8000/api/search/videos/` (search videos)
- **GET** `http://localhost:8000/api/search/courses/` (search courses)
- **GET** `http://localhost:8000/api/search/suggestions/` (get search suggestions)
- **GET** `http://localhost:8000/api/search/filters/` (get available filters)

---

## User Content History

- **GET** `http://localhost:8000/api/user/bookmarks/` (get bookmarked content)
- **GET** `http://localhost:8000/api/user/history/` (get watch history)
- **POST** `http://localhost:8000/api/user/history/` (add to watch history)
- **DELETE** `http://localhost:8000/api/user/history/<id>/` (remove from history)

---

## Support & Feedback

- **POST** `http://localhost:8000/api/support/contact/` (submit contact form)
- **POST** `http://localhost:8000/api/support/feedback/` (submit feedback)
- **GET** `http://localhost:8000/api/support/faqs/` (get FAQs)

---

## Donations

- **POST** `http://localhost:8000/api/donations/one-time/` (process one-time donation)
- **POST** `http://localhost:8000/api/donations/recurring/` (setup recurring donation)
- **GET** `http://localhost:8000/api/donations/plans/` (get donation plans)
- **GET** `http://localhost:8000/api/donations/history/` (get donation history)

---

## Admin Endpoints

### Admin Management (Super Admin)
- **GET** `http://localhost:8000/api/users/admins/` (list all admins)
- **POST** `http://localhost:8000/api/users/admins/create-content-admin/` (create content admin)
- **PATCH** `http://localhost:8000/api/users/admins/<id>/status/` (activate/deactivate admin)
- **GET** `http://localhost:8000/api/users/admins/roles/` (list admin roles)

### User Management (Super Admin)
- **GET** `http://localhost:8000/api/users/admins/users/` (list users)
- **GET** `http://localhost:8000/api/users/admins/users/<id>/` (get user details)
- **PATCH** `http://localhost:8000/api/users/admins/users/<id>/` (update user)
- **DELETE** `http://localhost:8000/api/users/admins/users/<id>/` (delete user)
- **GET** `http://localhost:8000/api/users/admins/users/search/?q=...` (search users)

### Content Management (Super & Content Admin)
- **GET|POST** `http://localhost:8000/api/content/admin/courses/` (list/create courses)
- **GET|PATCH|DELETE** `http://localhost:8000/api/content/admin/courses/<id>/` (get/update/delete course)
- **GET|POST** `http://localhost:8000/api/content/admin/videos/` (list/create videos)
- **GET|PATCH|DELETE** `http://localhost:8000/api/content/admin/videos/<id>/` (get/update/delete video)
- **GET|POST** `http://localhost:8000/api/content/admin/subjects/` (list/create subjects)
- **GET|PATCH|DELETE** `http://localhost:8000/api/content/admin/subjects/<id>/` (get/update/delete subject)
- **GET** `http://localhost:8000/api/content/admin/class-levels/` (list class levels)

### Analytics (Super & Content Admin)
- **GET** `http://localhost:8000/api/content/analytics/performance/`
- **GET** `http://localhost:8000/api/content/analytics/time-spent/`
- **GET** `http://localhost:8000/api/content/analytics/subject-strengths/`
- **GET** `http://localhost:8000/api/content/analytics/recommendations/`

### Subscription Management (Super Admin)
- **GET|POST** `http://localhost:8000/api/subscription/admin/plans/` (list/create plans)
- **GET|PATCH|DELETE** `http://localhost:8000/api/subscription/admin/plans/<id>/` (get/update/delete plan)
- **GET** `http://localhost:8000/api/subscription/admin/user-subscriptions/` (list user subscriptions)

### Rewards Management (Super Admin)
- **GET|POST** `http://localhost:8000/api/rewards/admin/available-rewards/` (list/create rewards)
- **GET|PATCH|DELETE** `http://localhost:8000/api/rewards/admin/available-rewards/<id>/` (get/update/delete reward)
- **GET** `http://localhost:8000/api/rewards/admin/redemptions/` (list reward redemptions)

### Platform Settings (Super Admin)
- **GET|PATCH** `http://localhost:8000/api/core/admin/settings/` (get/update platform settings)

---

For any questions or to expand this documentation, contact the backend team.