$(function() {
  var bridge = new Bridge({
    apiKey: "245b536642b8bbe7"
  });
  bridge.connect();

  bridge.getService("electrify-service", function(e) {
    e.subscribe({ 
      broadcast: function(id, data) {
        console.log("Id: " + id + "Data: " + data);
      }
    });
  });

  var CHART_WIDTH = 450;
  var CHART_HEIGHT = 325;

  var DEFAULT_SERIES = {
    usage: {
      daily: [
        [1, 2, 3, 4, 5, 6, 7],
        [2, 3, 4, 5, 1, 3, 2]
      ],
      hourly: [
        [3, 6, 1, 4, 2, 6, 2, 4],
        [1, 2, 3, 4, 5, 2, 3, 9]
      ],
      realTime: [
        [],
        []
      ]
    }
  };

  var eachDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
  var eachHour = [];
  for (var i = 0; i < 24; i++) {
    var ampm;
    if ((Math.floor(i / 12) == 0 || i == 23 ) && i != 11) {
      ampm = "am";
    } else {
      ampm = "pm";
    }
    eachHour.push((i % 12) + 1 + ampm);
  }

  $("#usage-data").change(function(e) {
    var seriesType = e.target.value;
    var series = DEFAULT_SERIES.usage;
    usageChart.series[0].setData(series[seriesType][0]);
    usageChart.series[1].setData(series[seriesType][1]);
  });

  usageChart = new Highcharts.Chart({
    chart: {
      renderTo: 'usage-chart',
      type: 'line',
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      borderWidth: 1
    },
    title: {
      text: 'Energy Consumption'
    },
    xAxis: {
      categories: eachDay
    }, 
    yAxis: {
      title: {
        text: 'Energy usage'
      }
    },
    series: [{
      name: 'You',
      data: DEFAULT_SERIES.usage.daily[0]
    }, {
      name: 'Others',
      data: DEFAULT_SERIES.usage.daily[1]
    }]
  });

  deviceChart = new Highcharts.Chart({
    chart: {
      renderTo: 'device-chart',
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
