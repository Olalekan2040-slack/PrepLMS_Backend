Product Requirements Document (PRD)
Project Name: Prep by Daramola Adesuyi Foundation (DAF)
Phase: Phase 1 – Prep Tutor Module

📌 Overview
Prep is an e-learning platform for primary and secondary students that delivers digital learning through high-quality video lessons and exam preparation tools. Phase 1 will focus on the Prep Tutor feature, including user authentication, video content access, rewards, and subscriptions.

🎯 Goals (Phase 1)
Provide students access to categorized educational video content

Allow user registration, login, and OTP verification

Track user engagement (watch history, streaks, bookmarks)

Implement subscription tiers and payment integration

Create a simple admin interface to manage content and subscriptions

🧱 Functional Modules (Scope)
1. User Authentication System
Sign-Up & OTP Verification: Register with email/phone; verify with OTP (mocked or actual)

Login: Token-based using JWT (via djangorestframework-simplejwt)

Password Reset: Request and complete password reset via email or phone

User Profile: Basic profile with optional avatar, contact details

2. Dashboard
Display user progress: watched videos, streak status, earned points

Show active subscription status

Allow access to bookmarks and history

3. Content Management (Prep Tutor)
Categorized video lessons:

By Education Level (Primary, JSS, SSS)

By Class Level (e.g., JSS1, SS2)

By Subject (e.g., Math, English, Biology)

Each lesson contains title, description, video file or link, thumbnail

4. Bookmarking System
Users can bookmark lessons to watch later

View bookmarks from dashboard

5. Streak Tracker
Tracks consecutive daily logins or video watch days

Visual indicator in dashboard

6. Points and Reward System
Earn points for:

Daily login

Watching videos

Completing playlists

Points can be redeemed (e.g., for mobile data)

7. Subscription Management
Free Preview Plan: Access 5 videos per subject

Standard Plan: Unlimited access (₦500/month)

Scholar Plan: Free access with voucher code

Integration with Paystack for payments

Subscriptions have start/end dates and can be active/inactive

8. Admin Panel
Upload videos with metadata (subject, class, thumbnail)

Manage subjects, class levels, and educational stages

Monitor user engagement (streaks, views, points)

Manage subscriptions, approve redemptions

Basic analytics (e.g., video view count, login streaks)

🔐 Roles
Student User: Register/login, watch lessons, earn rewards, manage profile

Admin: Upload/manage content, manage subscriptions, view analytics

📂 Project Structure
Apps:

users: Authentication, profile, subscriptions

content: Video lessons, subjects, class structure

rewards: Points, streaks, bookmarks

subscription: Payment and access management

core: Common utilities (models, permissions)

💡 Non-Functional Requirements
Mobile-First Design

Low Data Consumption

Adaptive streaming or compressed videos

Secure authentication with JWT

CORS-enabled API for frontend integration

⚙️ Dependencies
Django

Django REST Framework

djangorestframework-simplejwt

django-cors-headers

python-decouple

pillow

dj-database-url

psycopg2-binary (for PostgreSQL)

requests (for OTP, Paystack)

🗓️ Milestones
Milestone	Description
✅ Project Setup	Environment, apps, packages configured
🔄 User Auth Module	Sign-up, login, OTP, JWT, password reset
📺 Content Module	Models & endpoints for lessons, categories
🧠 Rewards & Streaks	Points, bookmarks, view tracking
💳 Subscription + Payment	Plan models, voucher, Paystack integration
🛠️ Admin Panel	Interfaces to upload videos & manage users
🧪 Testing	Unit + integration tests
🚀 Deployment	Staging and production setup
📘 Documentation	API and admin walkthrough