const html = require('choo/html')
const css = require('csjs-inject')

const C = require('../../constants')
const mainwrapper = require('./mainwrapper')

const numeral = require('numeral')

const style = css`

.main {
  position: absolute;
  top: 30px;
  width: 100%;
  bottom: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  background: ${C.BLUE};
  -webkit-app-region: no-drag;
}

.initialising {
  position: absolute;
  bottom: 400px;
  left: 50px;
  font-size: 1,2em;
  font-family: Aleo-Regular;
  color: ${C.MIDBLUE};
  pointer-events: none;
  flex-direction: column;
}

.remaining {
  height: 30px;
}

.outerbar {
  width: 600px;
  height: 50px;
  position: relative;
  justify-content: flex-start;
  background: RGBA(49, 95, 105, 1.00);
}

.innerbar {
  height: 100%;
  background: RGBA(72, 132, 145, 1.00);
}

`

module.exports = (state, emit) => {
  const metastat = state.datasources.list.length > 0
    ? state.datasources.list[0].stats.metadataSync
    : {
      done: 0,
      total: 100,
      finished: false
    }

  const synced = metastat.finished
    ? '100%'
    : numeral(`${metastat.done / metastat.total}`).format('0%')

  const remaining = html`

  <div class="${style.remaining}">
    ${synced} done
  </div>

  `

  const bar = html`

  <div class="${style.outerbar}">
    <div class="${style.innerbar}" style="width: ${synced};" />
  </div>

  `

  const initialview = html`

  <div class="${style.main}">
    <div class="${style.initialising}">
      ${remaining}
      ${bar}
    </div>
    ${require('./message')(state, emit)}
  </div>

  `

  return mainwrapper(state, emit, initialview)
}
