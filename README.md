# JobPilot

JobPilot is a full-stack smart job portal for job seekers, employers, and admins. It combines a modern Next.js frontend with an Express and MongoDB backend, supports CV uploads, stores documents in GridFS, and uses Groq to extract skills from CVs for smarter applications and job recommendations.

## Features

### Job seekers

- Register and log in with JWT-based authentication
- Build and update a professional profile
- Upload a CV in PDF or DOCX format
- Extract skills from a CV using Groq
- Browse jobs with keyword, location, category, and job type filtering
- Get recommended jobs based on saved profile skills
- Apply to jobs with a cover letter and CV
- Track submitted applications and status updates

### Employers

- Create, edit, and delete job posts
- View jobs they have posted
- Review applicants for a specific job
- View applicant profiles
- Download applicant CVs
- Update application status through the hiring pipeline

### Admins

- View platform dashboard statistics
- Manage users
- Activate or deactivate user accounts
- Delete users
- Review all jobs
- Remove jobs from the platform
- Inspect all submitted applications

## Tech stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: Node.js, Express 5, Mongoose, JWT
- Database: MongoDB
- File storage: MongoDB GridFS
- CV parsing: `pdf-parse`, `mammoth`
- AI integration: Groq (`llama-3.3-70b-versatile`)

## Project structure

```text
smart-job-portal/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   `-- server.js
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- hooks/
|   |-- lib/
|   `-- public/
`-- README.md
```

## How it works

### Authentication and access control

- The backend issues JWT tokens on login and registration.
- Protected routes use role-based middleware.
- Supported roles are `jobseeker`, `employer`, and `admin`.

### CV handling

- CV uploads are accepted as PDF or DOCX only.
- Maximum upload size is 2 MB.
- Uploaded CV files are stored in MongoDB GridFS.
- Employers, admins, and the original applicant can download CVs when authorized.

### Recommendations

- Recommended jobs are calculated from the overlap between a job seeker's saved profile skills and a job's listed skills.
- Matches are sorted by descending match percentage.

## API overview

The backend exposes these main route groups:

- `/api/auth` for registration, login, and current-user lookup
- `/api/jobs` for public job browsing, employer job management, and recommended jobs
- `/api/applications` for applying, viewing applications, downloading CVs, and updating statuses
- `/api/profile` for job seeker profile management and CV analysis
- `/api/admin` for admin dashboards and management actions

## Environment variables

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Local setup

### 1. Install dependencies

In one terminal:

```bash
cd backend
npm install
```

In another terminal:

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

## Available scripts

### Backend

- `npm run dev` starts the Express server with `nodemon`
- `npm start` starts the Express server with Node.js

### Frontend

- `npm run dev` starts the Next.js development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs ESLint

## Main user flows

### Job seeker flow

1. Register or log in
2. Complete the profile
3. Upload a CV and analyze it for skills
4. Browse or filter jobs
5. View recommended jobs
6. Apply with a cover letter and CV
7. Track application status

### Employer flow

1. Register as an employer
2. Create and manage job posts
3. Open a job's applicants page
4. Review extracted skills and candidate details
5. Download CVs and update statuses

### Admin flow

1. Access the admin dashboard
2. Monitor users, jobs, and applications
3. Deactivate users or remove content when needed

## Notes

- Full CV analysis features require a valid `GROQ_API_KEY`.
- The frontend expects the backend base URL from `NEXT_PUBLIC_API_URL`.
- The backend CORS configuration expects `CLIENT_URL` to match the frontend origin.

## Future improvements

- Add automated tests for frontend and backend
- Add refresh tokens or secure cookie-based auth
- Add pagination for jobs, users, and applications
- Add richer recommendation logic beyond exact skill overlap
- Add deployment guides for Vercel and MongoDB Atlas
