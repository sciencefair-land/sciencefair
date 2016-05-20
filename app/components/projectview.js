var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var selection = require('d3-selection')
var yo = require('yo-yo')
var projectManager = require('../lib/projectmanager.js')
var displayController = require('./resultscontroller.js')

inherits(ProjectView, EventEmitter)

function ProjectView (opts) {
  if (!(this instanceof ProjectView)) return new ProjectView(opts)
  var self = this

  // components
  var search = require('./search.js')(
    opts.containers.main
  )
  var displayController = require('./resultscontroller.js')(
    opts.containers.main,
    opts
  )
  var statbar = require('./statbar.js')(
    opts.containers.footer
  )

  self.manager = projectManager()

  opts.message.update('Choose or create a project.')
  opts.message.show()

  var addicon = yo`
  <svg viewBox="0 0 100 100">
    <path d="M89.465,45.868H54.132V10.535c0-2.282-1.85-4.132-4.132-4.132s-4.132,1.85-4.132,4.132v35.333H10.535  c-2.282,0-4.132,1.85-4.132,4.132s1.85,4.132,4.132,4.132h35.333v35.333c0,2.282,1.85,4.132,4.132,4.132s4.132-1.85,4.132-4.132  V54.132h35.333c2.282,0,4.132-1.85,4.132-4.132S91.748,45.868,89.465,45.868z"/>
  </svg>
  `
  var addbtn = yo`
  <div class="col add-project-btn clickable">
    ${addicon}
  </div>
  `
  // addbtn.onclick('') HERE HERE HERE

  function render () {
    self.body = yo`
    <div class="row project-body">
    </div>
    `
    self.element = yo`
    <div class="project-overview">
      <div class="row project-header">
      <div class="col project-selector">
        <div class="row topbar">
          <div class="col"><h1>Projects</h1></div>
          ${addbtn}
        </div>
        <div class="row">
          ${self.manager.projects().map(renderProjectEntry)}
        </div>
      </div>
      </div>
      ${self.body}
    </div>
    `
    css(self.element,{
      position: 'absolute',
      top: 'calc(4% + 100px)',
      left: '5%',
      width: '90%',
      height: 'calc(96% - 140px)',
      overflowY: 'scroll'
    })
    opts.containers.main.appendChild(self.element)
  }

  function renderProjectEntry(project) {
    var element = yo`
    <div class="project-entry row">
      ${project}
    </div>
    `
    element.onclick(function() {
      selectProject(project)
    })
    return element
  }

  function selectProject (project) {
    self.selectedProject = project
    self.renderProject()
  }

  function renderProject () {
    if (self.selectedProject) {
      self.projectElement = yo`
      <div class="project">
      </div>
      `
      self.controller = displaycontroller(self.body, opts)
      project.forEach(function(entry) {
        var p = paper(entry)
        self.controller.update([p])
      })
    }
  }

  self.metadataReady = function(metadataDB) {
    self.metadataDB = metadataDB
    statbar.setdb(metadataDB)
    search.showSearch()
  }

  render()
}

module.exports = ProjectView
