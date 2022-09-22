const express = require('express');
const app = express();
const path = require('path');
const db = require('./config/database.js');
const Item = require('./models/item')
var exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authSession');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Check DB
db.authenticate()
.then(() => console.log('Database connected'))
.catch(err => console.log(`Error: ${err}`));


// Handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' , runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
},}));
app.set('view engine', 'handlebars');

// Route /
app.get('*', checkUser);
app.post('*', checkUser);

app.get('/', (req, res) => {
    Item.findAll()
    .then(items => {
        res.render('index', {
            items
        });
    })
    .catch(err => console.log("Error: " + err));
});


app.use('/about', require('./routes/about'));

// Routes for the Items
app.use('/items',require('./routes/items'));

app.use('/connect', require('./routes/connect'));



const port = process.env.PORT || 3000; 

app.listen(port, () => {
    console.log(`Server open on port: ${port}`);
});