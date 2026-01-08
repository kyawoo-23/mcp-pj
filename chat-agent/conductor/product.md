# Product Guide - Uni-Chat Agent

## Initial Concept
A student-focused chat agent that provides a Gemini-like natural language interface for university tasks, specifically utility booking and course registration. It serves as a modern alternative to traditional web portals while sharing the same Supabase backend infrastructure.

## Target Users
*   **University Students:** To book resources and register for classes.
*   **Administrators:** To oversee system usage and manage resources (inferred from `user_role`).

## Goals
*   **Frictionless Interaction:** Enable students to book utilities and register for courses through simple chat commands.
*   **Gemini-like Experience:** Provide a high-quality, conversational interface that understands student intent.
*   **Seamless Integration:** Operate on the shared `public` schema, syncing real-time with `@uni-booking` and `@uni-registration`.

## Key Features
*   **Smart Facility Booking:**
    *   Book specific resources: Study rooms, labs, meeting rooms, lecture halls, and computer labs.
    *   Handle booking lifecycles: Create bookings, check status (pending/confirmed), and cancel reservations.
*   **Course Registration Management:**
    *   Search and register for course sections based on time, room, and instructor.
    *   Manage enrollment status: Register (active), drop courses, or join waitlists.
*   **Data-Driven Context:** Utilize the `profiles` table to provide personalized responses based on the student's department and ID.
*   **Secure Authentication:** Leverage the existing authentication flow to map users to their `profiles` for secure access.
