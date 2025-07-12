# vSharee Backend

Backend for **vSharee** – a platform to watch movies with friends in real-time, featuring group sync, chat, and more. Built with **Node.js**, **Express**, **Prisma**, **PostgreSQL**, **Docker**, and **Socket.io**.

---

## 🔥 Features

- ✅ User authentication with JWT
- ✅ PostgreSQL database via Docker
- ✅ Prisma ORM for clean DB access
- ✅ Swagger API docs for devs
- ✅ Dockerized setup
- ✅ Paginated endpoints using URL parameters (e.g., `/messages/:page/:pageSize`)
- ✅ User search by name/email with pagination
- ✅ Group sync, chat, and real-time video control with Socket.io

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/vsharee-backend.git
cd vsharee-backend
```

### 2. Setup environment

Copy the example env file:

```bash
cp .env.example .env
```

### 3. Run the app with Docker

Make sure Docker is installed and running, then:

```bash
docker-compose up --build
```

Backend will be available at:  
📍 `http://localhost:8000`

### 4. Access Swagger API docs

Visit:  
📄 `http://localhost:8000/api/docs`

---

## 🛠️ Tech Stack

- **Node.js** – JavaScript runtime
- **Express** – Web framework
- **PostgreSQL** – Relational database
- **Prisma** – Type-safe ORM
- **JWT** – Secure authentication
- **Docker** – Containerized environment
- **Socket.io** – Real-time communication (group sync, chat, video control)

---

## 🧪 Development Tools

### Prisma

Generate client (after editing schema):

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev --name your_migration_name
```

Studio (DB UI):

```bash
npx prisma studio
```

### Pagination Routes

Several endpoints now support pagination using route parameters:

- `/api/group/{groupId}/messages/{page}/{pageSize}`
- `/api/group/mine/{page}/{pageSize}`
- `/api/profile/search/{page}/{pageSize}?name=someText`

---

## 🧾 Environment Variables

| Key            | Description                 |
| -------------- | --------------------------- |
| `PORT`         | Port the server runs on     |
| `JWT_SECRET`   | Secret key for JWT          |
| `DATABASE_URL` | Prisma DB connection string |

See `.env.example` for the format.

---

## 📁 Project Structure

```
vsharee-backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── README.md
└── package.json
```

---

## 🤝 Contributions

Pull requests are welcome! If you’d like to suggest a feature or report a bug, feel free to open an issue.

---

## 👨‍💻 Author

**Pooria Parhizkar**  
Frontend Dev turned Fullstack 💥

---

## 📜 License

MIT License

## 📡 WebSocket Events

Socket.io is used for real-time interaction inside groups:

- `joinGroup` — User joins a group room. Emits `joinedGroup` with online members.
- `sendMessage` — Sends a group chat message. Emits `newMessage` to group.
- `videoControl` — Broadcasts video actions like play, pause, or seek. Emits `syncVideo`.
- `disconnect` — Notifies other users when someone leaves a group. Emits `userLeft`.
- `userJoined` — Broadcast when a new member joins the group.
