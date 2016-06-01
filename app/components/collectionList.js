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

  self.manager = projectManager(controller.opts)

  function button (type) {
    var element = yo`
    <div class="clickable"></div>
    `
    css(element, {
      backgroundColor: 'rgb(178, 180, 184)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      height: 15,
      width: 15,
      padding: 5,
      cursor: 'pointer',
      opacity: 0.85
    })

    return element
  }

  var addbtn = button('plus')

  var addinput = yo`<form><input class="add-project-input" placeholder="New collection name"></input></form>`

  function addAndClear () {
    var input = addinput.getElementsByClassName('add-project-input')[0]
    var name = input.value
    self.manager.get(name)
    render()
    input.value = ''
  }

  addinput.onsubmit = addAndClear
  addbtn.onclick = addAndClear

  css(addinput, {
    width: '90%',
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

  function select (col) {
    self.selected = col
    render()
    controller.clear()
    controller.opts.message.hide()
    col.getAll(controller.update)
    controller.opts.search.clear()
    controller.opts.statbar.updateResultStats()
  }

  function clear () {
    self.selected = null
    render()
    controller.clear()
    controller.opts.message.show()
    controller.opts.search.clear()
  }

  function render () {
    var element = yo`
    <div class="col project-selector">
      <div class="row sidebar-section-title">Collections</div>
      <div class="row topbar">
        <div class="col add-project-input-wrapper" placeholder="new collection">${addinput}</div>
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
    var addallbtn = button('add_docs')
    var deletebtn = button('delete')

    css(addallbtn, {
      marginRight: 20
    })

    var name = yo`<a href="#">${project.name}</a>`

    var element = yo`
    <div class="project-entry row">
      <div class="row">${name}<div class="project-count"></div></div>
      <div class="row">${addallbtn}${deletebtn}</div>
    </div>
    `

    if (self.selected === project) {
      css(element, {
        transition: 'all 0.5s',
        borderRight: 'solid rgb(202, 172, 77) 8px'
      })
    }

    element.onclick = function () {
      if (self.selected === project) {
        clear()
      } else {
        select(project)
      }
    }

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

    deletebtn.onclick = function () {
      project.delete()
    }

    project.getSize(function (size) {
      var el = `<div class="badge">${size}</div>`
      element.getElementsByClassName('project-count')[0].innerHTML = el
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
