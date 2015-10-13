Tasks = new Mongo.Collection("tasks");
Replies = new Mongo.Collection("replies");

var imageStore = new FS.Store.GridFS("images");

Images = new FS.Collection("images", {
 stores: [imageStore],
});

function isAdmin() {
  if (Meteor.user()) {
    if (Meteor.user().username !== 'jimmysheds') return;
    return true;
  } else {
    return false;
  }
}

function clueFormatFilter(input) {
  var clue = [];

  input.split('').map((character) => {
    clue.push(`
      <span class="clue__character">${character}</span>
    `);
  });

  var clueChars = $(clue.join(''));

  setTimeout(() => {
    $(`#${this._id}`).find('.clue').html(clueChars);
  }, 0);
}

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      // Show newest tasks at the top
      return Tasks.find({}, {sort: {createdAt: -1}});
    },
    imageExists: function () {
      // possibly not best way of checking if an image exists
      if (Images.findOne()) {
        return Images.findOne().isImage();
      }
    },
    isAdmin: isAdmin
  });

  Template.task.helpers({
    clueFormatFilter,
    isAdmin,
    replies: function (id) {
      return Replies.find({task: id});
    },
  });

  Template.imageView.helpers({
    images: function () {
      return Images.find(); // Where Images is an FS.Collection instance
    },
    isAdmin: isAdmin
  });

  Template.body.events({
    "submit .new-task": function (event) {

      console.log(event)
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;
      var direction = event.target.direction.value;
      var number = event.target.number.value;
      var replies = [];

      // Insert a task into the collection
      Tasks.insert({
        text,
        direction,
        number,
        replies,
        createdAt: new Date(),            // current time
        owner: Meteor.userId(),           // _id of logged in user
        username: Meteor.user().username  // username of logged in user
      });

      // Clear form
      event.target.text.value = "";
      event.target.direction.value = "default";
      event.target.number.value = "";
    },

    "submit .crossword-upload": function (event) {
      event.preventDefault();
      var file = event.target[0].files[0];
      Images.insert(file);
    },

    "click .thumbnail.can-remove": function () {
      Images.remove(this._id);
    },
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },
    "click .delete": function () {
      Tasks.remove(this._id);
    },
    "click .reply": function(event) {
      $(event.target).next('.replies').removeClass('is-hidden');
    },
    "submit .suggestion-reply": function(event) {
      event.preventDefault();

      var text = event.target.text.value;
      var direction = event.target.direction.value;
      var number = event.target.number.value;

      Replies.insert({
        text,
        task: this._id,
        direction,
        number,
        username: Meteor.user().username,
      });

      event.target.text.value = "";
      event.target.direction.value = "default";
      event.target.number.value = "";
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
