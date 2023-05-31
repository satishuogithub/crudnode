const http = require('http');
const url = require('url');
const fs = require('fs');

// In-memory storage for users
let users = [];

// Creating HTTP server
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (req.method === 'GET' && pathname === '/users') {
    // Handle GET request for fetching users
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } else if (req.method === 'POST' && pathname === '/users') {
    // Handle POST request for adding a user
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const newUser = JSON.parse(body);
      users.push(newUser);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
    });
  } else if (req.method === 'DELETE' && pathname.startsWith('/users/')) {
    // Handle DELETE request for deleting a user
    const userId = parseInt(pathname.split('/')[2]);

    if (isNaN(userId)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid user ID');
    } else {
      const deletedUser = users.find(user => user.id === userId);

      if (!deletedUser) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('User not found');
      } else {
        users = users.filter(user => user.id !== userId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(deletedUser));
      }
    }
  } else if (req.method === 'PUT' && pathname.startsWith('/users/')) {
    // Handle PUT request for updating a user
    const userId = parseInt(pathname.split('/')[2]);

    if (isNaN(userId)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid user ID');
    } else {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        const updatedUser = JSON.parse(body);
        const index = users.findIndex(user => user.id === userId);

        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('User not found');
        } else {
          users[index] = { id: userId, ...updatedUser };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(users[index]));
        }
      });
    }
  } else {
    // Serve static files
    let filePath = '.' + pathname;
    if (filePath === './') {
      filePath = './index.html';
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(content);
      }
    });
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);}
