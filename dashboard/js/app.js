// Parse backed class to get the overall test data
var Test = Parse.Object.extend({
  className: "Test",

  // The cohort keys
  cohortKeys: function() {
    return _(this.attributes).keys().filter(function(o) {
      return /^cohort_/.test(o);
    });
  },

  // The event keys
  eventKeys: function() {
    return _(this.attributes).chain().keys().filter(function(o) {
      return /^event_/.test(o);
    }).sortBy(function(key) {
      return key
    }).values();
  },

  // The total number of events in the test
  totalEvents: function() {
    var self = this;
    var total = this.eventKeys().reduce(function(memo, eventKey) {
      return memo + self.get(eventKey);
    }, 0);

    return total.value();
  },

  // Iterates and pulls out all event info into an object
  // format is:
  //    event_EVENTNAME___COHORTNAME
  events: function() {
    var self = this;
    var events = {};

    this.eventKeys().each(function(eventKey) {
      // Populate an object with all event info in an easily
      // traversable structure
      var matches = eventKey.match(/^event_(.*)___(.*)$/);
      if (matches) {
        var eventName = matches[1];
        var cohortName = matches[2];
        events[eventName] = events[eventName] || {};
        events[eventName][cohortName] = self.get(eventKey);
      }
    });

    return events;
  }
});

var AppRouter = Backbone.Router.extend({
  routes: {
    "test/:name": "test"
  },

  initialize: function(options) {
    this.state = options.state;
  },

  test: function(name) {
    var self = this;
    var loadTest = function() {
      var test = self.state.get('tests').find(function(item) { return item.get('name') === name });
      
      if (test) {
        self.state.set('dashboardTest', test);
      }
    };
    
    if (this.state.get('loading')) {
      this.state.on('change:loading', loadTest);
    } else {
      loadTest();
    }
  }
});


// Holds all the state of the app
var AppState = Backbone.Model.extend({
  tests: null,
  dashboardTest: null,
  
  initialize: function() {
    this.set("tests", new Parse.Collection());
    this.set('loading', true);
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
        self.set('loading', false);
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
    this.state.on("change:dashboardTest", this.render);
  },

  render: function() {
    var template = $("#menu_template").html();
    var html = _.template(template)({
      tests: this.state.get('tests'),
      currentTest: this.state.get('dashboardTest')
    });
    
    this.$el.html(html);
  }
});

// Dashboard view (right main view)
var Dashboard = Backbone.View.extend({
  el: "#dashboard",

  initialize: function(options) {
    _.bindAll(this, 'render');
    this.state = options.state;
    this.state.on('change:dashboardTest', this.render);
  },

  render: function() {
    var template = $("#dashboard_template").html();
    var html = _.template(template)({ test: this.state.get('dashboardTest') });
    this.$el.html(html);
  }
});

// The main app entry point
var App = {
  initialize: function() {
    var state = new AppState({
      
    });

    new AppRouter({ state: state });

    new Dashboard({
      state: state
    });

    new Menu({
      state: state
    });

    Backbone.history.start();
  }
}

$(function() {
  App.initialize();
});
