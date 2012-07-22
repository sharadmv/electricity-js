
SERVER_IP = "192.168.1.179:8080"

$(document).ready () ->
  # Do the floor plans
  {Path, Rectangle} = paper
  
  # Globals
  window.gDevices = []
  window.gCurrDevice = null
    
  createHtml()
  canvas = document.getElementById 'floor-plan'
  canvas.width = 700
  #canvas.style.width = 500
  paper.setup(canvas)
  createFloor()
  createDevices()
  setupMouseDownEvents()
  paper.view.draw()
  canvas.width = 620
  canvas.height = 500
    
  paper.view.onFrame = ->
    for device in gDevices
      if device.state
        device.onFrame()
  
  # Initial
  # Select the first device
  selectDevice gDevices[0]
  setTimeout (() -> selectDevice gDevices[0]), 2000 

  # Bridge setup
  bridge = new Bridge {apiKey: "245b536642b8bbe7"}
  bridge.connect()
  bridge.getService "electrify-service", (e) ->
    e.subscribe({ 
      broadcast: (id, data, state) ->
        #d id, data, state
        for device in gDevices
          if device.remoteId == parseInt(id)
            if state isnt device.state
              device.updateState()
            if gCurrDevice.remoteId == parseInt(id)
              device.updateDetailPanel()
            device.state = state
    })
    
createHtml = () ->
  
  # HTML
  htmlStr = thermos.render ->
    @div "#content", ->
      @div '#bottom-panel', ->
        @span '#name-label', 'Mac'
        @div ->
          @div ->
            @span '#id-label', '5'
            @span '#state-label', 'ON'
          @div { style : 'margin: auto;'}, -> @img {'id': 'detail-img', 'src' : 'images/lamp.png'}

          @div -> @input {'type' : 'button', 'value': 'toggle', 'id' : 'toggle-btn'}
          @div {'style' : 'border-top:1px solid black;margin-top: 30px; padding-top: 20px;'}, ->
            @span {'id' : 'scheduler-label', 'style' : 'font-size:24px;font-weight:bold;padding-bottom:20px;display:block;'}, 'Schedule it!'
            @div ->
              @div {'style' : 'float:right;margin-bottom: 10px;'}, ->
                @input {'type' : 'text', 'value' : '12', 'id' : 'time-val'}
                @span 'seconds'
              @div {'style' : 'float:right;clear:both;'}, ->
                @div  ->
                  @input {'type' : 'checkbox', 'value' : 'Repeat', 'id' : 'repeat-btn'}
                  @span 'Repeat'
                @input {'type' : 'button', 'value' : 'Schedule', 'id' : 'schedule-btn'}
      @canvas {'id': 'floor-plan'} #, 'resize' : ''}      
  $('#main').html(htmlStr)
  
  # Events
  
  $('#toggle-btn').click ->
    d gCurrDevice.remoteId
    if gCurrDevice
      $.post 'http://' + SERVER_IP + '/api/' + gCurrDevice.remoteId, {'method':'toggle'}, (data) ->
        console.log 'crap'
        console.log data
        
  $('#schedule-btn').click ->
    d parseInt($('#time-val').val())
    if $('#repeat-btn').attr('checked') then repeat = yes else repeat = no
    
    timeoutFn = () ->
      $.post 'http://' + SERVER_IP + '/api/' + gCurrDevice.remoteId, {'method':'toggle'}, (data) ->
    
    time = parseInt($('#time-val').val()) * 1000
    d repeat
    if repeat
      setInterval timeoutFn, time
    else
      setTimeout timeoutFn, time
      

  
createFloor = () ->
  myPath = new paper.Path()
  myPath.strokeColor = 'black'
  myPath.add (new paper.Point(10, 90))
  myPath.add (new paper.Point(200, 90))
  myPath.add (new paper.Point(200, 20))
  myPath.add (new paper.Point(250, 0))
  myPath.add (new paper.Point(300, 20))
  myPath.add (new paper.Point(300, 90))
  myPath.add (new paper.Point(400, 90))
  # myPath.add (new paper.Point(400, 50))
  # myPath.add (new paper.Point(450, 50))
  myPath.add (new paper.Point(450, 90))
  myPath.add (new paper.Point(600, 90))
  myPath.add (new paper.Point(600, 390))
  myPath.add (new paper.Point(10, 390))
  myPath.closed = true
  
  # new Rectangle([0, 0], [25, 25])
  room1 = new paper.Path.Rectangle([10, 90], [190, 140])
  room2 = new paper.Path.Rectangle([10, 230], [190, 160])
  room3 = new paper.Path.Rectangle([410, 230], [190, 160])
  #room4 = new paper.Path.Rectangle([590, 230], [210, 160])
  room1.strokeColor = 'black'
  room1.fillColor = '#cccccc'
  room2.strokeColor = 'black'
  room3.strokeColor = 'black'
  #room4.strokeColor = 'black'

createDevices = () ->
    circleInfo = [
      [[110, 300], 1, "Lamp"]
      [[300, 200], 2, "Refrigerator"]
      [[480, 310], 3, "Speakers"]
    ]
    
    window.gDevices = (new Device(info[2], info[0], info[1]) for info in circleInfo)

      
class Device
  
  RADIUS    :     10
  ON_COLOR  :     "#DDD" 
  OFF_COLOR :     "#001e5d"
    
  constructor: (@name, @coords, @remoteId) ->
    circle = new paper.Path.Circle @coords, @RADIUS
    circle.strokeColor = @OFF_COLOR
    circle.fillColor = @OFF_COLOR
    circle.name = @name
        
    @originalRadius = circle.bounds.width / 2
    @ui = circle
    @scale = 1.01
    @state = false
    
  onFrame: () ->
    radius = @ui.bounds.width / 2
    if (radius / @originalRadius) > 2 then @scale = 0.99
    if (radius / @originalRadius) < 1 then @scale = 1.01
    #path.fillColor.hue += 1;
    # Numbers, icons
    @ui.scale @scale
    
  updateDetailPanel: () ->
    $('#id-label').text 'ID: ' + @remoteId
    $('#name-label').text @name
    $('#type-label').text 'Computer'
    $('#state-label').text (if @state then 'ON' else 'OFF')
    
    # $('#state-label').removeClass 'state-off'
    # $('#state-label').removeClass 'state-on'
    # $('#state-label').addClass 'state-on'
    
    d @state
    if @state
      $('#state-label').css('backgroundColor', '#66FF66')
    else
      $('#state-label').css('backgroundColor', '#DDD')
    
    $('#detail-img').attr 'src', 'images/' + @name.toLowerCase() + '.png'
    
  select: () ->
    @ui.strokeColor = "black"
    @ui.strokeWidth = 5
  
  deselect: () ->
    @ui.strokeColor = "blue"
    
  updateState: () ->
    if not @state
      @ui.fillColor = @ON_COLOR
    else
      @ui.fillColor = @OFF_COLOR
      
  
selectDevice = (device) ->
  device.updateDetailPanel()
  if window.gCurrDevice
    window.gCurrDevice.deselect()
  window.gCurrDevice = device
  device.select()
      
setupMouseDownEvents = () ->
  hitOptions =
    segments: true
    stroke: true
    fill: true
    tolerance: 5
  
  hitTool = new paper.Tool()
  hitTool.activate()
  hitTool.onMouseDown = (event) ->
    hitResult = paper.project.hitTest event.point, hitOptions
    if hitResult
      for device in gDevices
        if hitResult.item._id is device.ui._id
          selectDevice device
          

# Debugging
d = (args...) ->
  console.log.apply console, args