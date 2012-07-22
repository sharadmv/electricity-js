$(function() {
 
 var bridge = new Bridge({
    apiKey: "245b536642b8bbe7"
  });
  bridge.connect();

  numPoints = [0, 0, 0];
  var watts = [0, 0, 0];
  lastPoint = [];
  var cost = 0;
  var idToSeries = {
    "1": 0,
    "2": 1,
    "3": 2
  }

  bridge.getService("electrify-service", function(e) {
    setInterval(pushRealTimePoints, 2000);
    e.subscribe({ 
      broadcast: function(id, data, state, timestamp) {
        //console.log("Id: " + id + " Data: " + data + " State: " + state + " Timestamp: " + timestamp);
        if (!idToSeries.hasOwnProperty(id)) {
          console.log("Unexpected id: " + id);
          return;
        }
        if (data == null) {
          console.log("Data is null");
          data = 0;
        }
        if (!state) {
          data = 0;
        }
        var seriesNum = idToSeries[id]; 
        watts[seriesNum] = data;
        if (watts[seriesNum] < 0) {
          watts[seriesNum] = 0;
        }
        updateCost();
        numPoints[seriesNum]++;
        var x = new Date().getTime();
        var shouldCutOff = numPoints[seriesNum] > 14;
        if (seriesNum == 2 && numPoints[seriesNum] < 40) {
          shouldCutOff = false;
        }
        lastPoint[seriesNum] = [timestamp, data];
      }
    });
  });

  

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  var CHART_WIDTH = 450;
  var CHART_HEIGHT = 325;
  var COST_PER_WATT_PER_HOUR = 0.00015;

  function updateCost() {
    cost = (watts[0] + watts[1] + watts[2]) * COST_PER_WATT_PER_HOUR;
    $("#cost").html(cost.toFixed(4));
  }

  var pointsCount = 0;

  function pushRealTimePoints() {
    pointsCount++;
    for(var i = 0; i < 3; i++) {
      realTimeChart.series[i].addPoint(lastPoint[i], true, pointsCount>20);
    }
  }

  setInterval(updateSpent, 1000);

  var spent = 0;
  function updateSpent() {
    spent += cost / 60 / 60;
    console.log(cost);
    $("#spent").html(spent.toFixed(6));
  }


  var DEFAULT_SERIES = {
    usage: {
      daily: {
        axis: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        data: [
          [1, 2, 3, 4, 5, 6, 7],
          [2, 3, 4, 5, 1, 3, 2]
        ]
      },
      hourly: {
        axis: ["1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm", "12am"],
        data: [
          [3, 6, 1, 4, 2, 6, 2, 4, 3, 4, 5],
          [1, 2, 3, 4, 5, 2, 3, 9, 3, 1, 6]
        ]
      }
    }
  };

  $("#usage-data").change(function(e) {
    var seriesType = e.target.value;
    var series = DEFAULT_SERIES.usage[seriesType];
    usageChart.series[0].setData(series.data[0]);
    usageChart.series[1].setData(series.data[1]);
    usageChart.xAxis[0].setCategories(series.axis);
  });

  usageChart = new Highcharts.Chart({
    chart: {
      renderTo: 'usage-chart',
      type: 'spline',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1
    },
    title: {
      text: 'Energy Consumption'
    },
    xAxis: {
      categories: DEFAULT_SERIES.usage.daily.axis
    }, 
    yAxis: {
      title: {
        text: 'Energy usage'
      }
    },
    series: [{
      name: 'You',
      data: DEFAULT_SERIES.usage.daily.data[0]
    }, {
      name: 'Others',
      data: DEFAULT_SERIES.usage.daily.data[1]
    }]
  });

  realTimeChart = new Highcharts.Chart({
    chart: {
      renderTo: 'real-time-chart',
      type: 'areaspline',
      width: 930,
      height: 275,
      borderWidth: 1
    },
    title: {
      text: 'Real Time Energy Consumption'
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.5
      }
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150
    }, 
    tooltip: {
      formatter: function() {
        return '<b>'+ this.series.name +'</b><br/>'+
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
          Highcharts.numberFormat(this.y, 2);
      }
    },
    yAxis: {
      title: {
        text: 'Energy usage'
      },
      min: 0,
      plotLines: [{
        value: 0,
        width: 2,
        color: '#808080'
      }]
    },
    legend: {
      enabled: false
    },
    series: [{
      name: 'Lamp',
      data: []
    }, {
      name: 'Toaster',
      data: []
    }, {
      name: 'Speaker',
      data: []
    }]
  });

  deviceChart = new Highcharts.Chart({
    chart: {
      renderTo: 'device-chart',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1
    },
    title: {
      text: 'Energy Consumption Per Device'
    },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    }, 
    yAxis: {
      title: {
        text: 'Energy usage'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          color: '#000000',
          connectorColor: '#000000',
          formatter: function() {
            return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(1) +' %';
          }
        }
      }
    },
    series: [{
      type: 'pie',
      name: 'Energy Used',
      data: [
        ['Lamp', 45.0],
        {
          name: 'Toaster',
          y: 11,
          sliced: true,
          selected: true
        },
        ['Speakers', 20.0]
      ]
    }]
  });

  costChart = new Highcharts.Chart({
    chart: {
      renderTo: 'cost-chart',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1,
      type: 'column'
    },
    title: {
      text: 'Cost By Device'
    },
    xAxis: {
      categories: ['7/17', '7/18', '7/19', '7/20', '7/21']
    }, 
    yAxis: {
      min: 0,
      title: {
        text: 'Energy usage'
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
        }
      }
    },
    tooltip: {
      formatter: function() {
        return '<b>' + this.x + '</b><br/>' +
          this.series.name + ': ' + this.y + '<br/>' + 
          'Total: ' + this.point.stackTotal;
      }
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: 'white'
        }
      }
    },
    series: [{
      name: 'Speaker',
      data: [3, 4, 6, 1, 3]
    }, {
      name: 'Lamp',
      data: [4, 5, 1, 3, 2]
    }, {
      name: 'Toaster',
      data: [1, 2, 1, 2, 1]
    }]
  });

  plantChart = new Highcharts.Chart({
    chart: {
      renderTo: 'plant-chart',
      type: 'bar',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1
    },
    title: {
      text: 'Breakdown of Cost Sources'
    },
    xAxis: {
      categories: ['12pm', '1am', '2am', '3am', '4am', '5am']
    }, 
    yAxis: {
      min: 0,
      title: {
        text: 'Energy usage'
      }
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [{
      name: 'Renewable',
      data: [.5, .7, .4, .6, .4, .5]
    }, {
      name: 'Non-Renewable',
      data: [4, 5, 3, 6, 4, 5]
    }]
  });
});
