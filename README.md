
  # Créer site en français

  This is a code bundle for Tchouk'Leu. The original project is available at https://www.figma.com/design/pRgxB3zu04nNxagXGvXUA5/Cr%C3%A9er-site-en-fran%C3%A7ais.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Admin prive sur Vercel

  Le panel admin (`/admin`) est protege via une API serveur Vercel et un cookie `HttpOnly`.
  Pour l'utiliser en production:

  1. Créez un store Vercel Blob pour le projet.
  2. Ajoutez les variables d'environnement Vercel:
    - `BLOB_READ_WRITE_TOKEN`: token du store Vercel Blob
      - `ADMIN_USERNAME`: identifiant admin (ex: votre pseudo prive)
    - `ADMIN_PASSWORD`: votre mot de passe admin prive
      - `ADMIN_SESSION_SECRET`: secret long et unique pour signer la session
      - `ADMIN_ALLOWED_IPS` (optionnel): liste d'IP autorisees separees par des virgules
  3. Redéployez le projet.

  Notes:
    - Sans `ADMIN_PASSWORD` ou `ADMIN_SESSION_SECRET`, une valeur de secours est utilisee et n'est pas securisee.
  - Le planning public lit les activites depuis `/api/activities`.
  - Le panel admin ajoute/modifie/supprime les activites dans Vercel Blob.
  