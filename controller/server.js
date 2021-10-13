var http=require('http');
var express=require('express');
var mysql=require('mysql');
var name='REGISTER', name1='register1', app=express(), message='', image, dec, messagelogin='', ph, si, ordermessage='', id, name2;
var multer=require('multer');
var url=require('url');
const e = require('express');


// Port 5000
app.listen(5000, ()=>{
    console.log('listening...');
});


// Middlewares
app.use(express.static('views/static'));
app.set('view engine', 'ejs');
app.set('views', 'views/layouts');
app.use(multer().single('images'));
app.use((req, res, next)=>{
    ordermessage='';
    next();
});


// Database Connection
var co=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"farmer_portal"
});
co.connect((err)=>{
    if(err) console.log(err);
});


// Home page
app.get('/', (req, res)=>{
    co.query("SELECT * FROM products", (err, rows)=>{
        res.render('index', { name, name1, rows });
    });
});


// Register
app.get('/register1', (req, res)=>{
    res.render('register', { message });
});


// User Profile
app.get('/user_profile', (req,res)=>{
    co.query("SELECT sell_id FROM user WHERE phone='"+ph+"'", (err, result)=>{
        co.query("SELECT * FROM products WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, rows)=>{
            co.query("SELECT * FROM buy WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, row1)=>{
                res.render('user_profile', { name, name1, filetype: 'image/jpg', dec, rows, row1 });
            });
        });
    });
});


// login
app.get('/login', (req, res)=>{
    res.render('login', { messagelogin });
});


// selling
app.get('/sell', (req,res)=>{
    if(name=='REGISTER'){
        res.render('register', { message });
    }
    else{
        res.render('sell', { name, name1 });
    }
});


//logout
app.get('/logout', (req, res)=>{
    name='REGISTER', name1='register1';
    co.query("SELECT * FROM products", (err, rows)=>{
        res.render('index', { name, name1, rows });
    });
});


// Product Page or Buying Page
app.get('/product', (req,res)=>{
    if(name=='REGISTER') res.render('register', { message });
    else{
        let query=url.parse(req.url, true);
        query=query.query;
        id=query.id, name2=query.name2;
        co.query("SELECT * FROM products WHERE sell_id='"+id+"' AND productname='"+name2+"'", (err, rows)=>{
            res.render('product', {  id, name, name1, rows, ordermessage });
        });
    }
});


// order placement information
app.get('/placed', (req, res)=>{
    ordermessage='Your order get Placed!!!';
    console.log(name2);
    co.query("SELECT * FROM products WHERE sell_id='"+id+"' AND productname='"+name2+"'", (err, rows)=>{
        co.query("SELECT sell_id FROM user WHERE phone='"+ph+"'", (err, row1)=>{
            co.query("INSERT INTO buy VALUES('"+name2+"', '"+Number(rows[0].quantitty)+"', '"+Number(row1[0].sell_id)+"')");
        });
        co.query("DELETE FROM products WHERE sell_id='"+id+"' AND productname='"+name2+"'");
        res.render('product', {  id, name, name1, rows, ordermessage });
    });
});


// About us
app.get('/aboutus', (req, res)=>{
    res.render('aboutus', { name,name1 });
});


// Removing from selling list
app.get('/remove', (req,res)=>{
    let u=url.parse(req.url, true);
    u=u.query;
    co.query("DELETE FROM products WHERE sell_id='"+u.id+"' AND productname='"+u.nam+"'");
    co.query("SELECT sell_id FROM user WHERE phone='"+ph+"'", (err, result)=>{
        co.query("SELECT * FROM products WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, rows)=>{
            co.query("SELECT * FROM buy WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, row1)=>{
                res.render('user_profile', { name, name1, filetype: 'image/jpg', dec, rows, row1 });
            });
        });
    });
});


// User Details Registration
app.post('/register1', (req,res)=>{
    dec=req.file.buffer.toString('base64');
    if(req.body.password!=req.body.cpassword){
        message='Password Don\'t Match';
        res.render('register', { message });
    }
    else{
        co.query("SELECT * FROM user WHERE phone='"+req.body.phone+"'", (err, results, fields)=>{
            if(results.length) message='Number Already Exists, Please login', res.render('register', { message });
            else{
                co.query("INSERT INTO user (name,phone,password,photo) VALUES ('"+req.body.name1+"', '"+req.body.phone+"', '"+req.body.password+"', '"+dec+"')");
                name=req.body.name1, name1='user_profile';
                ph=Number(req.body.phone);
                co.query("SELECT sell_id FROM user WHERE phone='"+ph+"'", (err, result)=>{
                    co.query("SELECT * FROM products WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, rows)=>{
                        co.query("SELECT * FROM buy WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, row1)=>{
                            res.render('user_profile', { name, name1, filetype: 'image/jpg', dec, rows, row1 });
                        });
                    });
                });        
            }
        });
    }
});


// User login checking
app.post('/login', (req,res)=>{
    let num=Number(req.body.phone), pass=req.body.password;
    co.query("SELECT * FROM user WHERE phone='"+num+"' AND password='"+pass+"'", (err, results, fields)=>{
        if(results.length){
            name=results[0].name, name1='user_profile', dec=results[0].photo, ph=num;
            co.query("SELECT sell_id FROM user WHERE phone='"+ph+"'", (err, result)=>{
                co.query("SELECT * FROM products WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, rows)=>{
                    co.query("SELECT * FROM buy WHERE sell_id='"+Number(result[0].sell_id)+"'", (err, row1)=>{
                        res.render('user_profile', { name, name1, filetype: 'image/jpg', dec, rows, row1 });
                    });
                });
            });
        }
        else{
            messagelogin='Phone Number or Password are incorrect';
            res.render('login', { messagelogin });
        }
    });
});


// Product Details
app.post('/sell', (req, res)=>{
    let photo=req.file.buffer.toString('base64'), flag=0, a, b;
    co.query("SELECT * FROM user WHERE phone='"+ph+"'", (err, results, fields)=>{
        co.query("SELECT * FROM products WHERE sell_id='"+Number(results[0].sell_id)+"'", (err, rows)=>{
            a=Number(req.body.quantity);
            for(var i=0;i<rows.length;i++){
                if(rows[i].productname==JSON.parse(JSON.stringify(req.body.productname).toUpperCase())){
                    b=Number(rows[i].quantitty);
                    flag=a+b;
                    co.query("UPDATE products SET quantitty='"+flag+"' WHERE productname='"+JSON.parse(JSON.stringify(req.body.productname).toUpperCase())+"' AND sell_id='"+Number(results[0].sell_id)+"'");
                    break;
                }
            }
            if(!flag){
                co.query("INSERT INTO products VALUES('"+JSON.parse(JSON.stringify(req.body.productname).toUpperCase())+"', '"+req.body.price+"', '"+photo+"', '"+Number(results[0].sell_id)+"', '1', '"+req.body.category+"', '"+req.body.quantity+"')");
            }
        });
    });
    res.render('sell', { name, name1 });
});
