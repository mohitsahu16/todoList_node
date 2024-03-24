const express = require("express");
const bodyParser = require("body-parser");
var _ = require('lodash');

// getting-started.js
const mongoose = require('mongoose');

main().catch(err => console.log(err));

const date = require(__dirname + "/date.js");

const app = express();

// const items = ["cook", "run", "sleep"];
// const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));


async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Wlecome to your todolist!!"
});

const item2 = new Item({
  name: "Hit the + button to add anew item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema =new mongoose.Schema ({
  name:String,
  items:[itemsSchema]
});

const List= mongoose.model('List',listSchema);



// Item.deleteMany({}).then(function () {
//        console.log("Successfully deleted");
//      }).catch(function (err) {
//        console.log(err);
//      });


app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({}).then((item) => {

    if (item.length === 0) {

      Item.insertMany(defaultItems).then(function() {
        console.log("Successfully saved default itmes to DB");
      }).catch(function(err) {
        console.log(err);
      });

      res.redirect("/");
    } else {
      res.render('list', {
        listTitle: day,
        newListItems: item
      });
    }
  });


  // .then((item) => {
  //   // mongoose.connection.close();
  //   item.forEach(function(todo) {
  //     console.log(todo.name);
  //   });
  // });



});

app.post("/", function(req, res) {

  const day = date.getDate();

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new Item({
    name: itemName
  });

  if(listName === day){

    item4.save();
    res.redirect("/");

  }
  else{
    List.findOne({name:listName}).then((item) => {
      if(item){
        item.items.push(item4);

    item.save();
    res.redirect("/"+listName);

  }
});
}
});
  //
  // if (req.body.list === "Work List") {
  //   workItems.push(item);
  //   console.log(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   console.log(item);
  //   res.redirect("/");
  // }





app.post("/delete", function(req, res) {

  const day = _.lowerCase(date.getDate());
  const checkedId = req.body.checkbox;
  const listName = _.lowerCase(req.body.listName);

// listName=(_.lowerCase(listName));
// day=(_.lowerCase(day));


    if(listName === day){

      Item.findByIdAndRemove(checkedId).then(function() {
        console.log("Successfully deleted");
      }).catch(function(err) {
        console.log(err);
      });
      res.redirect("/");

    }
    else{
      //   const checkName = List.findOne({name:listName});
      // List.findByIdAndRemove(checkedId).then(function() {
      //   console.log("Successfully deleted custom");
      //   console.log(checkedId);
      // }).catch(function(err) {
      //   console.log(err);
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}).then(function() {
        console.log("Successfully deleted custom");
        res.redirect("/"+listName);
      }).catch(function(err) {
        console.log(err);
      });

    }

});

app.get("/:customListName", function(req, res) {
  const customListName=req.params.customListName;
List.findOne({name:customListName}).then((item) => {
  if(!item){
    const list = new List({
      name:customListName,
      items:defaultItems
    });

    list.save();

    res.redirect("/"+customListName);
  }
  else{

    res.render('list', {
      listTitle: item.name,
      newListItems: item.items
    });

  }
});


});


app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
