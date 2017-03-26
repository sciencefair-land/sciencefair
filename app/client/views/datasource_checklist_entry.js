const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const numeral = require('numeral')
const stat = require('./datasource_stat')
const chunk = require('lodash/chunk')

const style = css`

.entry {
  flex-direction: row;
  font-size: 1.3em;
  align-items: center;
  align-content: center;
  justify-content: space-between;
  font-family: CooperHewitt-Light;
  padding: 20px;
  border-bottom: 1px dotted ${C.BLUE};
}

.left {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  padding-top: 10px;
}

.checkbox {
  width: 40px;
  height: 40px;
}

.checked {
  background-color: ${C.MIDBLUE};
  -webkit-mask: url(./images/check.svg) center / contain no-repeat;
}

.unchecked {
  background-color: ${C.MIDBLUEFADE};
  -webkit-mask: url(./images/uncheck.svg) center / contain no-repeat;
}

.onoff {
  align-items: center;
  justify-items: center;
}

.mid {
  flex-direction: column;
  flex-grow: 2;
  padding-left: 26px;
}

.description {
  flex-direction: row;
  padding-top: 3px;
  font-size: 1.3em;
}

.name {
  font-family: CooperHewitt-Medium;
  margin-right: 10px;
}

.size {
  align-content: flex-end;
  padding-top: 3px;
}

.loading {
  margin-left: 10px;
  flex-grow: 2;
  font-family: CooperHewitt-LightItalic;
  padding-top: 3px;
}

.shimmy {
  margin: 1px;
}

.shortkey {
  font-family: CooperHewitt-MediumItalic;
  padding: 0 10px;
}

.tick {
  width: 30px;
  height: 30px;
  background-color: ${C.MIDBLUEFADE};
  -webkit-mask: url(./images/tick.svg) center / contain no-repeat;
}

.cross {
  width: 30px;
  height: 30px;
  background-color: ${C.MIDBLUEFADE};
  -webkit-mask: url(./images/cross.svg) center / contain no-repeat;
}

.deleteouter {
  display: none;
  border: 1px solid ${C.MIDBLUE};
  border-radius: 3px;
  padding: 4px;
}

.entry:hover .deleteouter {
  display: flex;
}

.deleteinner {
  background-color: ${C.MIDBLUE};
  -webkit-mask: url(./images/bin.svg) center / contain no-repeat;
  width: 30px;
  height: 30px;
}

.right {
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 100%;
}

.chunk {
  margin-right: 5px;
}

`

const chunkwords = desc => chunk(
  desc.split(' ').reverse(), 3
).map(
  c => c.reverse().join('\u00A0')
).reverse().join(' ')

module.exports = (datasource, state, prev, send) => {
  const checkbox = datasource => {
    const imgstyle = datasource.active ? style.checked : style.unchecked
    const el = html`

    <div class="${style.left}">
      <div class="${style.checkbox} ${imgstyle} clickable"></div>
      <div class="${style.onoff}">${datasource.active ? 'on' : 'off'}</div>
    </div>

    `

    el.onclick = (e) => {
      e.preventDefault()
      send('datasource_toggleactive', datasource)
    }
    return el
  }

  const entry = datasource => {
    // console.log(datasource)
    if (datasource.loading) {
      const shortkey = html`

      <span class="${style.shortkey}">${datasource.key.slice(0, 6)}...</span>

      `

      return html`

      <div class="${style.entry}">
        <div class="spinner ${style.checkbox} ${style.shimmy}">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <div class=${style.loading}>loading datasource ${shortkey} from p2p network</div>
      </div>

      `
    } else {
      const metastat = datasource.stats.metadataSync

      const papercount = metastat.total
      const papercounttxt = papercount
        ? (papercount < 1000
          ? numeral(papercount).format('0,0')
          : numeral(papercount).format('0.0a'))
        : '?'

      const syncdone = metastat.done / papercount
      const synced = metastat.finished
        ? '100%'
        : numeral(`${syncdone}`).format('0%')
      const peers = numeral(datasource.stats.peers).format('0a')

      const deletebtn = html`

      <div class="${style.deleteouter}">
        <div class="${style.deleteinner}" />
      </div>

      `

      deletebtn.onclick = e => {
        e.preventDefault()
        require('./overlay_confirm')(
          `Really delete datasource ${datasource.name} and all its data?`,
          really => {
            if (really) send('datasource_remove', datasource)
          }
        )
      }

      return html`

      <div class="${style.entry}">
        ${checkbox(datasource)}
        <div class="${style.mid}">
          <div class=${style.description}>
              <span class="${style.name}">${datasource.name}</span>
              ${chunkwords(datasource.description || '')}
          </div>
          <div class="${style.stats}">
            ${stat(datasource.live ? 'live' : 'static', datasource.live)}
            ${stat((syncdone > 0 && syncdone < 1) ? 'syncing' : 'synced', synced)}
            ${stat('peers', peers)}
            ${stat('papers', papercounttxt)}
          </div>
        </div>
        <div class=${style.right}>
          ${state.datasources.length > 1 ? deletebtn : null}
        </div>
      </div>

      `
    }
  }

  return entry(datasource)
}
