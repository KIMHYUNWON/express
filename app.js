let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let session = require('express-session');

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = new Array();
users[0] = {
	"userId" : 0,
	"name" : "jin",
	"password" : "abc",
	"isAdmin" : true
}

app.put('/login', (req, res) => {
	// users 배열에서 찾도록 처리 해야 함
	// admin 여부를 확인하여 체크
	// req.body.id : ID
	// req.body.name : 패스워드
	let value = users.find(element => {
		if(element.userId == req.body.id && element.password == req.body.password){
			req.session.userId = element.userId;
			req.session.isAdmin = element.isAdmin;
			req.session.save(error => {if (error) console.log(error)});
			res.send("LogIn");
		}
	});

	res.end("Login failed");
});

app.put('/logout', (req, res) => {
	// Logout
	// 세션 유효 여부를 체크하고 세션 Delete
	if (req.session.userId != null){
		req.session.userId = null;
		req.session.destroy(error => {if(error) console.log(error)});
	}
	res.send("LogOut");
});

let auth = (req, res, next) => {
	// Session Check
	// 어드민 여부 체크 필요
	if (req.session.userId != null && req.session.isAdmin == true){
		next();
	}
	else
		res.send("Error");
};

app.get('/users/:userId', auth, (req, res) => {
	// get User Information
	res.send(users[req.params.userId]);
});

app.put('/users', auth, (req, res) => {

	users.find(element => {
		if(element.userId == req.body.id){
			element = req.body;
		}
	})

	res.send("OK");
})

app.post('/users', auth, (req, res) => {
	users[users.length] =  req.body;
	res.send("OK");
})
// 사용자 추가 시에 admin 여부도 추가해야 함

app.delete('/users/:userId', auth, (req, res) => {
	users.find((element,index) => {
		if (element.userId == req.params.userId){
			users.splice(index, 1);
		}
	})
	res.send("OK")
})

let server = app.listen(80);
