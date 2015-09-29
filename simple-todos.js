Tasks = new Mongo.Collection("tasks");

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
    isAdmin: isAdmin
  });

  Template.imageView.helpers({
    images: function () {
      return Images.find(); // Where Images is an FS.Collection instance
    },
    isAdmin: isAdmin
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;
      var replies = [];

      // Insert a task into the collection
      Tasks.insert({
        text: text,
        replies: replies,
        createdAt: new Date(),            // current time
        owner: Meteor.userId(),           // _id of logged in user
        username: Meteor.user().username  // username of logged in user
      });

      // Clear form
      event.target.text.value = "";
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
      this.replies.push(event.target.reply.value);
      Tasks.update(this._id, {
        $set: {replies: this.replies}
      });
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
