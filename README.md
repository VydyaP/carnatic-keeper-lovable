# Carnatic Keeper

Build a web app called "Keerthana Collection" — a personal archive for managing Carnatic (South Indian classical) music keerthanas (devotional songs), for personal use and sharing with a few trusted friends.

Data model — each Keerthana has:

- Name

- Raga, Tala, Composer, Deity (each a searchable/creatable field — pick from a preset list of common values or type a custom one)

rics (plain text)

aning/translation (plain text)

tation files: three separate upload slots — Telugu, Tamil, English — each can hold zero, one, or multiple files (PDF or e). Multiple files per language matter: if a corrected notation comes in later, the old one should stay, not get written.

 features:

owse the full collection as a card grid; search by name/raga/tala/composer/deity

- Filter/group the collection by raga, tala, composer, or deity

- Add, edit, and delete keerthanas — but these actions should be gated behind a simple shared security code prompt (not full multi-user permissions, just a lightweight "are you allowed to edit" gate)

- Bulk actions: select multiple keerthanas at once to bulk-delete or bulk-reassign raga/tala/composer/deity across all of them in one action

- Sign-in via Google (single account or a small trusted group, not public signup)

- Track and display storage usage for uploaded notation files against a free-tier storage budget

- An account/profile area with a dark mode toggle, storage usage display, and log out

- Must be fully responsive and usable well on mobile — this will primarily be used as an installable web app (PWA) on phones

- Backend: Firebase (Firestore for data, Firebase Storage for files, Firebase Auth for Google sign-in)

Design direction: please propose a completely original visual identity — don't default to a generic dashboard look. Consider the cultural context (Carnatic music, South Indian classical tradition) for inspiration, but interpret it however feels fresh and modern to you — I'm specifically looking for a different aesthetic than a typical warm-earthtone/serif "traditional" treatment, so feel free to experiment with a distinct color system, typography, and layout personality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f7a2d230-3ff3-424d-98d2-97409ba1b049).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
