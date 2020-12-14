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

///////////// 메인 페이지
app.get('/', function(request, response) {
	response.render(__dirname + '/public/main.html', {login:request.session.loggedin, username:request.session.username});
});

app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});


///////////// 로그인
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


///////////// 로그아웃
app.get('/logout', function(request, response) {
	request.session.loggedin = false;
	  response.send('<center><H1>Logged Out.</H1><H1><a href="/">Goto Home</a></H1></center>');
	  response.end();
  });
  


/////////////// 회원가입
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

//////////////////마이페이지
app.get('/mypage', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/my/mypage.html', {
			login:request.session.loggedin, 
			username:request.session.username});
	} else {
		response.redirect('/login');
		response.end();
	}
});



///////////////설문 등록
app.get('/enrollsv', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/my/enrollsv.html',{login:request.session.loggedin, username:request.session.username});		
	} else {
		response.redirect('/login');
		response.end();
	}
});

app.post('/enrollsv', function (request, response) {

	var body = request.body;
	var username = request.session.username;

    connection.query('INSERT INTO surveys (id, title, link, content, photo ,reward) VALUES (?, ?, ?, ?, ?, ?)', [
		username, body.title, body.link, body.content, body.photo, body.reward
	]
	, function () {        
        response.redirect('/joinsv');
    });
});

/////////////////설문 목록

app.get('/joinsv', function (request, response) { 
	
    fs.readFile(__dirname + '/public/joinsv.html', 'utf8', function (error, data) {
        
        connection.query('SELECT * FROM surveys', function (error, results) {        
            response.send(ejs.render(data, {
				data: results,
				login:request.session.loggedin,
				username:request.session.username
            }));
        });
    });
});


////////////////설문 글 페이지
app.get('/svpage/:num', function (request, response) {

    fs.readFile(__dirname + '/public/svpage.html', 'utf8', function (error, data) {
        connection.query('SELECT * FROM surveys WHERE num = ?', [
            request.param('num')
        ], function (error, result) {			
            response.send(ejs.render(data, {			
				data: result[0],
				login:request.session.loggedin,
				username:request.session.username
			}));			
			
		});		
    });
});

//설문 삭제
app.get('/delete/:num', function (request, response) { 
	
	if (request.session.loggedin) {	
		var username = request.session.username;		
		connection.query('DELETE FROM surveys WHERE num=? AND id =?', [ 
			request.param('num'), username
		], function () {		
			response.redirect('/joinsv');
		});
		
	} else {
		response.redirect('/login');
		response.end();
	}    
});



//설문 수정
app.get('/edit/:num', function (request, response) {

	if (request.session.loggedin) {	
		var username = request.session.username;	
		
		console.log(username, request.param('num'));

		fs.readFile(__dirname + '/my/edit.html', 'utf8', function (error, data) {
			connection.query('SELECT * FROM surveys WHERE num = ? AND id=?', [
				request.param('num'), username
			], function (error, result) {
				response.send(ejs.render(data, {				
					data: result[0],
					login:request.session.loggedin,
					username:request.session.username
				}));
			});
		});
	}else{
		response.send(ejs.render(data, {
			data: result[0],
			login:request.session.loggedin,
			username:request.session.username
		}));		
		response.end();
	}
});

app.post('/edit/:num', function (request, response) {
	var body = request.body
	var username = request.session.username;	
	
    connection.query('UPDATE surveys SET title=?, link=?, content=?, photo=?, reward=? WHERE num=? AND id=?', [
		body.title, body.link, body.content, body.photo, body.reward, request.param('num'), username
    ], function () {
        response.redirect('/svpage/'+request.param('num'));
    });
});


app.listen(3000, function () {
    console.log('Server Running at http://127.0.0.1:3000');
});