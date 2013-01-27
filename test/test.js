
Parse.initialize("IGRd8s5bejBMTcgBHZvkzbgRJEFDxxfUEA8sZ2V2", "nfolTMwYqc9p3Zv59Zaxw8g4vP1temqjSAOAp5PX");
Cohorts.Options.debug = true;

var header_test = new Cohorts.Test({
  storageAdapter: ParseAdapter,
  name: 'big_vs_small_header',
  sample: 1, // include all visitors in the test
  cohorts: {
    big: {
      onChosen: function() {
        $('#big').show();
      }
    },
    small: {
      onChosen: function() {
        $('#small').show();
      }
    }
  }
});

$('#big').click(function() {
  header_test.event('clicked_on_header');
});

$('#small').click(function() {
  header_test.event('clicked_on_header');
});

