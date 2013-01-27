ParseAdapter = (function() {
  var Test = Parse.Object.extend("Test");

  // Finds the test object. Accepts an options object:
  //   name: Name of the test
  //   notExisting: Called if the test doesn't exist
  //   existing: Called if the test exists. Passes in the test object.
  var findTest = function(options) {
    var query = new Parse.Query(Test);
    query.equalTo("name", options.testName);

    query.find({
      success: function(results) {
        if (results.length === 0) {
          options.notExisting();
        } else {
          options.existing(results[0]);
        }
      }
    });
  };

  // Checks for the format of names across tests, cohorts, and events
  var validName = function(name) {
    if (name === null) return false;
    if (!(/^[0-9a-zA-Z_-]*$/.test(name))) return false;
    return true;
  };
  
  var ParseAdapter = {
    onInitialize: function(inTest, testName, cohort, isNew) {
      // Check valid names
      if (!validName(testName)) throw "Invalid test name: " + testName;
      if (!validName(cohort)) throw "Invalid cohort name: " + cohort;

      // Only consider users in a test and is new
      if(inTest && isNew) {
        var cohortKey = "cohort_" + cohort;

        findTest({
          name: testName,
          notExisting: function() {
            test = new Test();
            test.set("name", testName);
            test.set("total", 1);
            test.set(cohortKey, 1);
            test.save();
          },
          existing: function(test) {
            test.increment("total");
            test.increment(cohortKey);
            test.save();
          }
        });
      }
    },
    onEvent: function(testName, cohort, eventName, isNew) {
      // Check valid names
      if (!validName(testName)) throw "Invalid cohort name: " + testName;
      if (!validName(cohort)) throw "Invalid cohort name: " + cohort;
      if (!validName(eventName)) throw "Invalid cohort name: " + eventName;
      
      // Only consider unique events per user
      if (isNew) {
        var cohortKey = "cohort_" + cohort;
        var eventKey = cohortKey + "_event_" + eventName;
          
        findTest({
          name: testName,
          notExisting: function() {
            test = new Test();
            test.set("name", testName);
            test.set("total", 1);
            test.set(cohortKey, 1);
            test.set(eventKey, 1);
            test.save();
          },
          existing: function(test) {
            test.increment(eventKey);
            test.save();
          }
        });
      }
    }
  };
  
  return ParseAdapter;
})();
