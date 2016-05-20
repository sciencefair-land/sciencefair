var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')
var projectManager = require('../lib/projectmanager.js')
var displayController = require('./resultscontroller.js')

inherits(ProjectMenu, EventEmitter)

function ProjectMenu (btn, controller) {
  if (!(this instanceof ProjectMenu)) return new ProjectMenu(btn, controller)
  var self = this

  var btnrect = btn.getBoundingClientRect()
  var y = btnrect.bottom + 60
  var x = btnrect.left

  self.manager = projectManager()

  function button (type) {
    var element = yo`
    <div></div>
    `
    css(element, {
      backgroundColor: 'rgb(178, 180, 184)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      height: 30,
      width: 30,
      padding: 5,
      cursor: 'pointer',
      opacity: 0.85
    })

    return element
  }

  var addbtn = button('plus')

  var addinput = yo`<input placeholder="New collection name"></input>`

  addbtn.onclick = function () {
    var name = addinput.value
    var project = self.manager.get(name)
    render()
  }

  css(addinput, {
    width: '100%',
    height: '100%',
    border: 'none',
    borderBottom: 'dotted 2px rgb(178, 180, 184)',
    fontSize: '130%',
    padding: '5px',
    fontFamily: 'CooperHewitt-Book',
    color: 'rgb(178, 180, 184)',
    background: 'none',
    outline: 'none'
  })

  // addbtn.onclick('') HERE HERE HERE

  self.hidden = true

  function render () {
    var element = yo`
    <div class="col project-selector">
      <div class="row topbar">
        <div class="col add-project-input">${addinput}</div>
        <div class="col">${addbtn}</div>
      </div>
      <div class="row col">
        ${projectList()}
      </div>
    </div>
    `
    css(element, {
      position: 'absolute',
      top: y,
      left: x,
      width: 350,
      height: 350 * 1.618,
      overflowY: 'scroll',
      display: self.hidden ? 'none' : 'flex',
      opacity: 0.85
    })

    if (self.element) {
      yo.update(self.element, element)
    } else {
      self.element = element
    }
  }

  function projectList () {
    var projects = self.manager.projects()
    if (projects && projects.length > 0) {
      return yo`
      ${projects.map(renderProjectEntry)}
      `
    } else {
      return yo`
      <div class="project-entry row">
        <h3>No collections yet.</h3>
      </div>
      `
    }
  }

  function renderProjectEntry (project) {
    var addallbtn = button('add_all')

    css(addallbtn, {
      marginRight: 20
    })

    addallbtn.onlick = function () {
      project.putBatch(controller.display.papers, function (err) {
        if (err) throw err
        console.log('added', controller.display.papers.length, 'to', project.name)
      })
    }

    var element = yo`
    <div class="project-entry row">
      <div>${project.name}</div><div>${addallbtn}</div>
    </div>
    `
    // element.onclick = function () {
    //   selectProject(project)
    // }
    return element
  }

  self.toggle = function () {
    css(self.element, {
      display: self.hidden ? 'block' : 'none'
    })
    self.hidden = !(self.hidden)
  }

  render()
}

module.exports = ProjectMenu
