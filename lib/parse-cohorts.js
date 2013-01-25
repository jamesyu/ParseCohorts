ParseAdapter = (function() {
  /*var createUnique = function(className, key, value, isNewFunc, ) {
    var klass = Parse.Object.extend(className);
    var query = new Parse.Query(klass);

    query.equalTo(key, value);
    
  }*/
  
  var ParseAdapter = {
    onInitialize: function(inTest, testName, cohort, isNew) {
      if(inTest) {
        var TestClass = Parse.Object.extend("Test");
        var query = new Parse.Query(TestClass);
        
        query.equalTo("name", testName);
        query.find({
          success: function(results) {
            var test;
            
            if (results.length === 0) {
              test = new TestClass();
              test.set("name", testName);
              test.set("total", 1);
              test.save();
            } else {
              if (isNew) {
                test = results[0];
                test.increment("total");
                test.save();
              }
            }

          }
        });
        
        //this.trackEvent(this.nameSpace, testName, cohort + ' | Total');
      }
    },
    onEvent: function(testName, cohort, eventName) {
      //this.trackEvent(this.nameSpace, testName, cohort + ' | ' + eventName);
    }
  };
  
  return ParseAdapter;
})();
