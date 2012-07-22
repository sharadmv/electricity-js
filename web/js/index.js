$(function() {
 
 var bridge = new Bridge({
    apiKey: "245b536642b8bbe7"
  });
  bridge.connect();

  var numPoints = 0;
  var watts = [0, 0];
  bridge.getService("electrify-service", function(e) {
    e.subscribe({ 
      broadcast: function(id, data, state) {
        var seriesNum; 
        if (id == "1") {
          seriesNum = 0;
          watts[0] = data;
          updateCost();
        }
        if(id == "2") {
          seriesNum = 1;
          watts[1] = data;
          updateCost();
        }
        if(id == "3") {
          seriesNum = 2;
          watts[2] = data;
          updateCost();
        }
        if( data == null) {
          return;
        }
        console.log(data);
        console.log("Id: " + id + " Data: " + data + " State: " + state);
        var x = new Date().getTime();
        numPoints++;
        realTimeChart.series[seriesNum].addPoint([x, data], true, numPoints>10);
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
  var COST_PER_WATT_SECOND = 0.0000000416666667;

  function updateCost() {
    var cost = (watts[0] + watts[1]) * COST_PER_WATT_SECOND;
    $("#cost").html(cost);
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
      type: 'spline',
      width: 930,
      height: 275,
      borderWidth: 1
    },
    title: {
      text: 'Real Time Energy Consumption'
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
      type: 'pie',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1
    },
    title: {
      text: 'Energy Consumption'
    },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    }, 
    yAxis: {
      title: {
        text: 'Energy usage'
      }
    },
    series: [{
      name: 'You',
      data: [4, 6, 7, 8, 1]
    }, {
      name: 'Others',
      data: [1, 2, 3, 4, 5]
    }]
  });

  plantChart = new Highcharts.Chart({
    chart: {
      renderTo: 'plant-chart',
      type: 'pie',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1
    },
    title: {
      text: 'Energy Consumption'
    },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    }, 
    yAxis: {
      title: {
        text: 'Energy usage'
      }
    },
    series: [{
      name: 'You',
      data: [4, 6, 7, 8, 1]
    }, {
      name: 'Others',
      data: [1, 2, 3, 4, 5]
    }]
  });
});
