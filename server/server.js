const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    // Create HTTP server
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.IO server
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Store io instance globally for API routes
    global.io = io;

    // Handle WebSocket connections
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join a room based on user ID if available
        socket.on('joinUserRoom', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`Socket ${socket.id} joined user_${userId} room`);
            }
        });
        
        socket.on('joinBookingRoom', (bookingId) => {
            if (bookingId) {
                socket.join(`booking_${bookingId}`);
                console.log(`Socket ${socket.id} joined booking_${bookingId} room`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    // Start the server
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log('> Socket.IO server is running');
    });
});
