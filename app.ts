import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Application } from "express"
import { createServer } from "http"
import morgan from 'morgan'
import DB_Connection from './Config/database_config'
import managerRouter from './Routes/manager_routes'
import userRoutes from './Routes/user_routes'
import adminRouter from './Routes/admin_routes'
dotenv.config();

const app: Application = express()
const server = createServer(app)

DB_Connection()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({
    origin: ["http://localhost:5173","http://localhost:3000"],
    credentials: true
}))
app.use('/admin',adminRouter);
app.use('/',userRoutes);
app.use('/manager',managerRouter);


server.listen(process.env.PORT, (): void => {
    console.log(`Server is running on port ${process.env.PORT}`);
    
})