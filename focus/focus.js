
$(function(){

  var Todo = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "",
        order: Todos.nextOrder(),
        done: false
      };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  var TodoList = Backbone.Collection.extend({

    pad: function(options) {
        // Ensure the list has at least 9 items (1 + 3 + 5)
        while (this.length < 9) {
            var blank = this.create({});
        };
    },

    model: Todo,

    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    comparator: 'order',

    clear: function() {
        for (i=this.length-1; i>=0; i--) this.at(i).destroy();
        this.pad();
    },

  });

  var Todos = new TodoList;


  var TodoView = Backbone.View.extend({

    tagName:  "li",

    template: _.template($('#item-template').html()),

    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "keydown .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    toggleDone: function() {
      this.model.toggle();
    },

    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    close: function() {
      var value = this.input.val();
      if (!value && this.model.get('done')) this.model.toggle();
      this.model.save({title: value});
      this.$el.removeClass("editing");
    },

    reset: function() {
      this.$el.removeClass("editing");
    },

    updateOnEnter: function(e) {
      // Persist the changes on Enter
      if (e.keyCode == 13) this.close();
      // Ignore the changes on ESC
      if (e.keyCode == 27) this.reset();
    },

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click #reset": "reset",
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.listenTo(Todos, 'add', this.render);

      this.main = $('#main');
      this.footer = this.$('footer');

      Todos.fetch();
      Todos.pad();
    },

    render: function() {
      this.main.show();
      this.footer.show();

      this.$('#todo-list').empty()

      Todos.each(function(todo) {
          var view = new TodoView({model: todo});
          this.$('#todo-list').append(view.render().el)
      });
    },

    // Clear all todo items, destroying their models.
    reset: function() {
      Todos.clear();
      this.render();
    },


  });

  var App = new AppView;

});
