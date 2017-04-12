import _ from 'lodash';
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import uiModules from 'ui/modules';
// get the kibana/metric_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/captures_vis', ['kibana']);

// var elasticsearch = require('elasticsearch');
// var client = new elasticsearch.Client({
//   host: 'localhost:9200',
//   log: 'trace'
// });

module.controller('KbnCapturesVisController', function ($scope, $element, Private) {
  const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);

  const captures = $scope.captures = [];

  function isInvalid(val) {
    return _.isUndefined(val) || _.isNull(val) || _.isNaN(val);
  }

  $scope.processTableGroups = function (tableGroups) {
    $.ajax({
      // TODO: add sort timestamp by desc option
      url: "../api/console/proxy?uri=captures/capture/_search/?size=300",
      data: "",
      success: function(resp){
        var width = 1000;
        var svg = d3.select("svg#capture_timeline").attr({width: width, height: 50});
        var current_time = Date.now();
        var xScale = d3.time.scale()
          .domain([
            current_time - 120 * 1000, // 開始日時
            current_time  // 終了日時
          ])
          .range([0, width]); 
        var xAxis = d3.svg.axis()
          .scale(xScale)
          .ticks(d3.time.second, 10)
          .tickFormat(function(d,i){
            var fmtFunc = d3.time.format("%H:%M:%S");//正規表現でどのように表示するかを
            return fmtFunc(d);
          });

        var plotData = [];
        var num_hits = resp.hits.hits.length;
        console.log("num hits: %d", num_hits);
        for(var i = 0; i < num_hits; i += 1){
          var timestamp = resp.hits.hits[i]["_source"]["timestamp"];
          var x = Date.parse(timestamp);
          if(0 <= xScale(x) && xScale(x) <= width){
            plotData.push({timestamp: timestamp, x: x, img_src: resp.hits.hits[i]["_source"]["capture"]})
          }
          else {
            // console.log(resp.hits.hits[i]["_source"]["timestamp"]);
          }
        }
        console.log(plotData);

        svg.selectAll("g").remove();
        svg.append("g").attr({"class": "x axis"}).call(xAxis).selectAll("text").attr({dy: 10}).append("text").attr({x: 10, y: 10, "font-size": 10}).text("time");
        svg.selectAll("circle").remove();
        svg.selectAll("circle").data(plotData).enter().append("circle").attr({
          cx: function (d, i) {
            console.log(d);
            console.log(xScale(d.x));
            return xScale(d.x);
          },
          cy: 35,
          r: 5,
          fill: "red",
          "data-img-src": function(d) {return d.img_src},
        })
        .on("click", function(d) {
          d3.select(this).attr("fill", "blue");
          var src = d3.select(this).attr("data-img-src");
          // FIXME: use Angler, not jQuery
          $("#capture_image").attr("src", src); 
        });
      },
      datatype: "json",
    });
  };

  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      const options = {
        asAggConfigResults: true
      };

      captures.length = 0;
      $scope.processTableGroups(tabifyAggResponse($scope.vis, resp, options));
      $element.trigger('renderComplete');
    }
  });
});