const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose"); 
const _ = require("lodash");
const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
let port = process.env.PORT;
if(port == null || port == ""){
  port == 4000;
}
app.listen(port,function(){
  console.log("Server is running succesfully"+port);
});
const uri = "mongodb+srv://chiemgiabaost:<password>@cluster0.txhp9g3.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect('mongodb+srv://chiemgiabaost:Baomap123@cluster0.txhp9g3.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your Todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List",listSchema);
      


app.get("/", function (req, res) {
  
  Item.find({},function(err, foundItem){
    
      res.render("list", {kindOfDate: "Today",newListItem: foundItem});
    })
    
    
});

app.get("/:customListName",function(req,res){
  const customListName = (_.capitalize(req.params.customListName));
  List.findOne({name: customListName}, function(err,foundList){
    if (!err){
      if (!foundList ){
        console.log("Does not exist");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        console.log("Exist");
        res.render("list", {kindOfDate: foundList.name, newListItem: foundList.items});        
        
      }
    }else{

    }
  })
  
})



app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  let item = new Item({
    name: itemName
  })
  
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
    
  }
  
});
app.post("/delete",function(req,res){
  let value = (req.body.checkbox);
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findById(value , function(err,item){
      if (err) {
        console.log("Error finding item:", err);
      } else {
        console.log("Succesfully Remove");
      }
    });
    Item.findByIdAndRemove(value, function(err){
    })
    res.redirect("/");
  } else{
    List.findOneAndUpdate({name:listName }, {$pull: {items: {_id: value}}},
      function(err, foundList){
        if(!err){
          res.redirect("/"+listName);
        }        
    })
  }
})

