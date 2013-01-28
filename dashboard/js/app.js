// Parse backed class to get test data
var Test = Parse.Object.extend("Test");

// Holds all the state of the app
var AppState = Backbone.Model.extend({
  tests: null,
  dashboardTest: null,
  
  initialize: function() {
    this.set("tests", new Backbone.Collection());
    this.fetchTests();
  },

  fetchTests: function() {
    var self = this;
    
    // Fetch all test names
    var query = new Parse.Query(Test);
    query.ascending("name");
    query.find({
      success: function(results) {
        self.get('tests').reset(results);
      }
    });
  },

  fetchDashboard: function() {

  }
});

// Menu view (left column)
var Menu = Backbone.View.extend({
  el: "#menu",

  initialize: function(options) {
    _.bindAll(this, 'render');
    this.state = options.state;
    this.state.get("tests").on("all", this.render);
  },

  render: function() {
    console.log(this.state.get('tests'));
  }
});

// Dashboard view (right main view)
var Dashboard = Backbone.View.extend({
  el: "#dashboard"
});

// The main app entry point
var App = {
  initialize: function() {
    window.state = state = new AppState({
      
    });

    new Dashboard({
      state: state
    });

    new Menu({
      state: state
    });
  }
}

$(function() {
  App.initialize();
});
