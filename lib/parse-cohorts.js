ParseAdapter = (function() {
  var Test = Parse.Object.extend("Test");
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
  
  var ParseAdapter = {
    onInitialize: function(inTest, testName, cohort, isNew) {
      // TODO: check format of eventName
      // TODO: check format of cohortName

      // only consider users in a test and is new
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
      // TODO: check format of eventName
      // TODO: check format of cohortName
      
      // only consider unique events per user
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
