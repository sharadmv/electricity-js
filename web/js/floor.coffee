
$(document).ready () ->
  # Do the floor plans
  {Path, Rectangle} = paper
  
  # Globals
  window.gDevices = []
  window.gCurrDevice = null
    
  createHtml()
  canvas = document.getElementById 'floor-plan'
  paper.setup(canvas)
  createFloor()
  createDevices()
  setupMouseDownEvents()
  paper.view.draw()
  paper.view.onFrame = ->
    for device in gDevices
      if device.state
        device.onFrame()
        
  # Select the first device
  selectDevice gDevices[0]

  # Bridge setup
  bridge = new Bridge {apiKey: "245b536642b8bbe7"}
  bridge.connect()
  bridge.getService "electrify-service", (e) ->
    e.subscribe({ 
      broadcast: (id, data, state) ->
        d id, data, state
        for device in gDevices
          if device.remoteId == parseInt(id)
            device.state = state
    })

SERVER_IP = "192.168.1.179:8080"
createHtml = () ->
  
  # HTML
  htmlStr = thermos.render ->
	  @h1 'Electrify.js'
	  @div "#content", ->
	    @div {'class' : 'btn-group'}, ->
        @button {'class' : 'btn custom-nav'}, 'Dashboard'
        @button {'class' : 'btn custom-nav'}, 'Floor'
	   @div '#bottom-panel', ->
	     @span '#name-label', 'Mac'
	     @span '#id-label', '5'
	     @span '#state-label', 'ON' 
	     @input {'type' : 'button', 'value': 'toggle', 'id' : 'toggle-btn'}
	     @img {'id': 'detail-img', 'src' : 'images/lamp.png'}
	     
	     @input {'type' : 'text', 'value' : '12', 'id' : 'time-val'}
	     @span 'seconds'
	     @input {'type' : 'button', 'value' : 'Schedule', 'id' : 'schedule-btn'}
	     @input {'type' : 'checkbox', 'value' : 'Repeat', 'id' : 'repeat-btn'}
	     @span 'Repeat'
	     
	   @canvas {'id': 'floor-plan', 'resize' : ''}      
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
  myPath.add (new paper.Point(800, 90))
  myPath.add (new paper.Point(800, 390))
  myPath.add (new paper.Point(10, 390))
  myPath.closed = true
  
  # new Rectangle([0, 0], [25, 25])
  room1 = new paper.Path.Rectangle([10, 90], [190, 140])
  room2 = new paper.Path.Rectangle([10, 230], [190, 160])
  room3 = new paper.Path.Rectangle([400, 230], [190, 160])
  room4 = new paper.Path.Rectangle([590, 230], [210, 160])
  room1.strokeColor = 'black'
  room1.fillColor = '#cccccc'
  room2.strokeColor = 'black'
  room3.strokeColor = 'black'
  room4.strokeColor = 'black'

createDevices = () ->
    circleInfo = [
      [[110, 300], 1, "Light"]
      [[300, 200], 2, "Toaster"]
      [[700, 310], 3, "Speakers"]
    ]
    
    window.gDevices = (new Device(info[2], info[0], info[1]) for info in circleInfo)

      
class Device
  
  RADIUS:20
  
  constructor: (@name, @coords, @remoteId) ->
    circle = new paper.Path.Circle @coords, 10
    circle.strokeColor = "blue"
    circle.fillColor = "blue"
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
    $('#detail-img').attr 'src', 'images/' + @name.toLowerCase() + '.png'
    
  select: () ->
    @ui.strokeColor = "black"
    @ui.strokeWidth = 5
  
  deselect: () ->
    @ui.strokeColor = "blue"
      
  
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