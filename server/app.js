const express = require('express')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const {v4: uuidv4} = require('uuid')

const app = express()
app.use(express.json())
app.use(cors())

const dbPath = path.join(__dirname, 'Tracking.db')

let db = null

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(5000, () => {
            console.log('Server Running at http://localhost:5000/')
        })
    } catch (e) {
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
}

initializeDBAndServer()

const authenticateToken = (request, response, next) => {
    try {
        let jwtToken;
        const authHeader = request.headers['authorization']
        if (authHeader !== undefined) {
            jwtToken = authHeader.split(' ')[1]
        }
        if (jwtToken === undefined) {
            response.status(401)
            response.send('Invalid JWT Token')
        } else {
            jwt.verify(jwtToken, '123456', async (error, payload) => {
                if (error) {
                    throw error;
                } else {
                    request.username = payload.username
                    next()
                }
            })
        }
    } catch (error) {
        console.error(error)
        response.status(500).send('An error occurred during authentication.')
    }
}

// Login API

app.post('/login/', async (request, response) => {
    try {
        const {username, password} = request.body
        const selectUserQuery = `
            SELECT *
            FROM users
            WHERE username = ? AND password = ?;
        `
        const dbUser = await db.get(selectUserQuery, [username, password])
        if (dbUser === undefined) {
            response.status(400).send('Invalid user')
        } else {
            const payload = {username}
            const jwtToken = jwt.sign(payload, '123456')
            response.send({jwtToken, id: dbUser.user_id, admin: dbUser.admin})
        }
    } catch (error) {
        console.error(error)
        response.status(500).send('An error occurred during login.')
    }
})

// Register API

app.post('/register/', async (request, response) => {
    try {
        const {username, password} = request.body
        const selectUserQuery = `
            SELECT *
            FROM users
            WHERE username = ?;
        `
        const userId = uuidv4()
        const dbUser = await db.get(selectUserQuery, [username])
        if (dbUser === undefined) {
            const createUserQuery = `
                INSERT INTO
                users (user_id, username, password, admin)
                VALUES
                    (?, ?, ?, ?);
            `
            await db.run(createUserQuery, [userId, username, password, 1])
            response.send('User created successfully')
        } else {
            response.status(400).send('User already exists')
        }
    } catch (error) {
        console.error(error)
        response.status(500).send('An error occurred during registration.')
    }

})

// Add new package API

app.post('/newpackage/', authenticateToken, async (request, response) => {
    try {
        const {packageName, date, time, place, status, userId} = request.body

        function generateTrackingNumber() {
            const prefix = 'TR';
            const uniqueId = uuidv4().toUpperCase().replace(/-/g, '').substring(0, 6);
            const trackingNumber = `${prefix}-${uniqueId}`;
            return trackingNumber;
        }
          
        const trackingNumber = generateTrackingNumber();
        console.log('Generated Tracking Number:', trackingNumber);

        const addPackageQuery = `
            INSERT INTO
            packageTracker (package_id, package_name, date, time, place, status, user_id)
            VALUES
                (?, ?, ?, ?, ?, ?, ?);
        `
        await db.run(addPackageQuery, [trackingNumber, packageName, date, time, place, status, userId])
        response.send({trackingId: trackingNumber})
    } catch (error) {
        console.error(error)
        response.status(500).send({errorMsg: 'An error occurred while adding the package.'})
    }
})

// Update Tracking Status API

app.post('/tracking/updatestatus/', authenticateToken, async (request, response) => {
    try {
        const {packageId, date, time, place, status, userId} = request.body;
       
        const getPackageQuery = `
            SELECT *
            FROM packageTracker
            WHERE package_id = ? AND user_id = ?;
        `
        const dbPackage = await db.get(getPackageQuery, [packageId, userId])
        if (dbPackage === undefined) {
            response.status(400).send({errorMsg: 'Invalid PackageId'})
        }
        const insertPackageQuery = `
            INSERT INTO
            packageTracker (package_id, package_name, date, time, place, status, user_id)
            VALUES
                (?, ?, ?, ?, ?, ?, ?);
        `
        await db.run(insertPackageQuery, [packageId, dbPackage.package_name, date, time, place, status, userId])
        response.send({success: 'Status Updated'})
    } catch (error) {
        console.error(error)
        response.status(500).send({errorMsg: 'An error occurred while updating the status.'})
    }
})

// Delete Package API

app.delete('/tracking/delete/:packageId/', authenticateToken, async (request, response) => {
    try {
        const {packageId} = request.params
        const deletePackageQuery = `
            DELETE FROM packageTracker
            WHERE package_id = ?;
        `
        const result = await db.run(deletePackageQuery, [packageId])
        if (result.changes === 0) {
            response.status(400).send({errorMsg: 'Invalid PackageId'})
        } else {
            response.send({success: 'Package Deleted'})
        }
    } catch (error) {
        console.error(error)
        response.status(500).send({errorMsg: 'An error occurred while deleting the package.'})
    }
})

// Get package Status API

app.get('/tracking/:packageId/', authenticateToken, async (request, response) => {
    try {
        const {packageId} = request.params
        const getPackageQuery = `
            SELECT *
            FROM packageTracker
            WHERE package_id = ?;
        `
        const dbPackage = await db.all(getPackageQuery, [packageId])
        if (dbPackage.length === 0) {
            response.status(400).send('Invalid PackageId')
        } else {
            response.send(dbPackage)
        }
    } catch (error) {
        console.error(error)
        response.status(500).send('An error occurred while retrieving the package.')
    }
})