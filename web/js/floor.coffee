
$(document).ready () ->
  # Do the floor plans
  {Path, Rectangle} = paper
    
  createHtml()
  canvas = document.getElementById 'floor-plan'
  paper.setup(canvas)
  createFloor()
  createDevices()
  setupMouseDownEvents()
  paper.view.draw()
  
createHtml = () ->
  
  # HTML
  htmlStr = thermos.render ->
	  @h1 'Electricity.js'
	  @div "#content", ->
	   #@h2 'floor plan'
	   @div '#bottom-panel', ->
	     @span '#id-label', '5'
	     @span '#name-label', 'Mac'
	     @span '#type-label', 'Computer' 
	     @input {'type' : 'button', 'value': 'toggle', 'id' : 'toggle-btn'}
	   @canvas {'id': 'floor-plan', 'resize' : ''}      
  $('#main').html(htmlStr)
  
  # Events
  
  $('#toggle-btn').click () ->
    #alert 'clicked! ' + window.gCurrId
    $.post 'http://192.168.1.179:8080/api/1', {'method':'toggle'}, (data) ->
      console.log 'crap'
      console.log data
  
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
    circles = [
      [200, 300]
      [400, 200]
      [700, 340]
    ]

    for circle in circles
      aCircle = new paper.Path.Circle(circle, 20)
      aCircle.strokeColor = "blue"
      aCircle.fillColor = "blue"
      aCircle.name = "circle"
      console.log aCircle._id


      i = 0

      originalRadius = (aCircle.bounds.width / 2)
      scale = 1.01

      do (aCircle) ->
        paper.view.onFrame = () ->
          radius = (aCircle.bounds.width / 2)
          if (radius / originalRadius) > 2 then scale = 0.99
          if (radius / originalRadius) < 1 then scale = 1.01
          #path.fillColor.hue += 1;
          # Numbers, icons
          aCircle.scale scale

      #test aCircle, originalRadius
  
setupMouseDownEvents = () ->
  hitOptions =
    segments: true
    stroke: true
    fill: true
    tolerance: 5
  
  hitTool = new paper.Tool()
  hitTool.activate()
  hitTool.onMouseDown = (event) ->
    console.log 'mouse down'
    hitResult = paper.project.hitTest event.point, hitOptions
    if hitResult
      path = hitResult.item
      console.log path._id
      $('#bottom-panel-id').text(path._id)
      window.gCurrId = path._id