var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')
var projectManager = require('../lib/projectmanager.js')

inherits(CollectionList, EventEmitter)

function CollectionList (controller, sidebar) {
  if (!(this instanceof CollectionList)) {
    return new CollectionList(controller, sidebar)
  }
  var self = this

  self.manager = projectManager()

  function button (type) {
    var element = yo`
    <div class="clickable"></div>
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
    self.manager.get(name)
    render()
  }

  css(addinput, {
    width: '100%',
    height: '100%',
    border: 'none',
    borderBottom: 'dotted 2px rgba(178, 180, 184, 0.3)',
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
      <div class="row sidebar-section-title">Collections</div>
      <div class="row topbar">
        <div class="col add-project-input" placeholder="new collection">${addinput}</div>
        <div class="col">${addbtn}</div>
      </div>
      ${projectList()}
    </div>
    `
    css(element, {
      width: '100%',
      display: 'flex',
      justifyContent: 'initial'
    })

    if (self.element) {
      yo.update(self.element, element)
    } else {
      self.element = element
    }
  }

  function projectList () {
    var projects = self.manager.projects()
    var element
    if (projects && projects.length > 0) {
      element = yo`
      <div class="row col">
        ${projects.map(renderProjectEntry)}
      </div>`
    } else {
      element = yo`
      <div class="project-entry row">
        <h3>No collections yet.</h3>
      </div>
      `
    }
    if (self.projectListElement) {
      yo.update(self.projectListElement, element)
    } else {
      self.projectListElement = element
    }

    return self.projectListElement
  }

  function renderProjectEntry (project) {
    var addallbtn = button('add_all')

    css(addallbtn, {
      marginRight: 20
    })

    var element = yo`
    <div class="project-entry row">
      <div class="row">${project.name}<div class="project-count"></div></div>
      <div>${addallbtn}</div>
    </div>
    `

    addallbtn.onclick = function () {
      try {
        project.putBatch(controller.display.papers, function (err) {
          if (err) throw err
          render()
          project.getSize(function (size) {
            element.getElementsByClassName('project-count')[0].innerHTML = `[${size}]`
          })
        })
      } catch (err) {
        console.trace(err)
      }
    }

    project.getSize(function (size) {
      element.getElementsByClassName('project-count')[0].innerHTML = `[${size}]`
    })
    // element.onclick = function () {
    //   selectProject(project)
    // }
    return element
  }

  render()

  sidebar.addSection(self.element)
}

module.exports = CollectionList
