var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'web2020',
	password : 'web2020',
	database : 'web'
});

var app = express();
var express = require('express');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use('/css', express.static('./css'));
app.use('/script', express.static('./script'));
app.use('/img', express.static('./img'));

app.set('view engine','ejs'); 
app.engine('html', require('ejs').renderFile);

function restrict(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.sendFile(path.join(__dirname + '/login.html'));
  }
}

app.get('/', function(request, response) {
	response.render(__dirname + '/public/main.html', {login:request.session.loggedin, username:request.session.username});
});

app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/');
				response.end();
			} else {
				//response.send('Incorrect Username and/or Password!');
				response.sendFile(path.join(__dirname + '/my/loginerror.html'));
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/my/register.html'));
});

app.post('/register', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var password2 = request.body.password2;
	var email = request.body.email;
	console.log(username, password, email);
	if (username && password && email) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ? AND email = ?', [username, password, email], function(error, results, fields) {
			if (error) throw error;
			if (results.length <= 0) {
        connection.query('INSERT INTO user (username, password, email) VALUES(?,?,?)', [username, password, email],
            function (error, data) {
                if (error)
                  console.log(error);
                else
                  console.log(data);
        });
			  response.send(username + ' Registered Successfully!<br><a href="/">Home</a>');
			} else {
				response.send(username + ' Already exists!<br><a href="/">Home</a>');
			}			
			response.end();
		});
	} else {
		response.send('Please enter User Information!');
		response.end();
	}
});

app.get('/logout', function(request, response) {
  request.session.loggedin = false;
	response.send('<center><H1>Logged Out.</H1><H1><a href="/">Goto Home</a></H1></center>');
	response.end();
});

app.get('/joinsv', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/joinsv.html'));
	
});

app.get('/enrollsv', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/my/enrollsv.html'));
	} else {
		response.send('Please login to view this page!');
		response.end();
	}
});

app.get('/mypage', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/my/mypage.html'));
	} else {
		response.send('Please login to view this page!');
		response.end();
	}
});

app.get('/test2', function(request, response) {
	if (request.session.loggedin) {
		response.sendFile(path.join(__dirname + '/my/test2.html'));
	} else {
		response.send('Please login to view this page!');
		response.end();
	}
});



// Board
app.get('/board', function (request, response) { 
    
    fs.readFile(__dirname + '/board/list.html', 'utf8', function (error, data) {
        
        connection.query('SELECT * FROM surveys', function (error, results) {
        
            response.send(ejs.render(data, {
                data: results
            }));
        });
    });
});
app.get('/delete/:id', function (request, response) { 
    
    connection.query('DELETE FROM surveys WHERE num=?', [request.param('num')], function () {
    
        response.redirect('/board');
    });
});
app.get('/insert', function (request, response) {	
    
    fs.readFile(__dirname + '/board/insert.html', 'utf8', function (error, data) {
        
        response.send(data);
    });
});

///////////////글 업로드

app.post('/insert', function (request, response) {

	var body = request.body;
	var username = request.body.username;

    connection.query('INSERT INTO survey (id, title, content, photo ,reward) VALUES (?, ?, ?, ?, ?)', [
        username, body.table, body.content, body.photo, body.reward
    ], function () {
        
        response.redirect('/board');
    });
});
app.get('/edit/:id', function (request, response) {

    fs.readFile(__dirname + '/board/edit.html', 'utf8', function (error, data) {

        connection.query('SELECT * FROM surveys WHERE id = ?', [
            request.param('id')
        ], function (error, result) {
            response.send(ejs.render(data, {
                data: result[0]
            }));
        });
    });
});
app.post('/edit/:id', function (request, response) {
    var body = request.body
    connection.query('UPDATE surveys SET title=?, content=?, photo=?, reward=? WHERE id=?', [
        body.name, body.modelnumber, body.series, request.param('id')
    ], function () {
        response.redirect('/board');
    });
});


app.listen(3000, function () {
    console.log('Server Running at http://127.0.0.1:3000');
});