<title>Spux App</title>
<link rel="stylesheet" href="https://spux.org/css/spux.css" />
<script type="application/ld+json" id="data">
  [
    {
      "id": 62605,
      "type": "message",
      "date": "2019-02-03T16:50:09",
      "edited": "1970-01-01T01:00:00",
      "from": "web r3",
      "from_id": 663376464,
      "text": "ping"
    },
    {
      "id": 62606,
      "type": "message",
      "date": "2019-02-03T16:50:14",
      "edited": "1970-01-01T01:00:00",
      "from": "Melvin Carvalho",
      "from_id": 97291900,
      "text": [
        "pong?",
        {
          "type": "link",
          "text": "http://pong.example"
        }
      ]
    },
    {
      "id": 42495,
      "from": "Melvin Carvalho",
      "date": "2020-06-20T13:25:53.389Z",
      "edited": "1970-01-01T01:00:00",
      "from_id": 97291900,
      "text": "test",
      "type": "message"
    },
    {
      "id": 68372,
      "from": "Melvin Carvalho",
      "date": "2020-06-20T13:28:15.071Z",
      "edited": "1970-01-01T01:00:00",
      "from_id": 97291900,
      "text": "test2",
      "type": "message"
    }
  ]
</script>
<script type="module">
  // IMPORTS
  import 'https://unpkg.com/dataisland?module'
  import { h, html, Component, render } from 'https://unpkg.com/spux?module'
  import updateThis from 'https://unpkg.com/spux-modules@0.0.4/updatethis.js'

  // FUNCTIONS
  function subscribe (id) {
    var el = document.getElementById(id)
    var src = el.src || window.location.href
    function fetchSrc () {
      console.log('fetching', src)
      window
        .fetch(el.src, { headers: { Accept: el.type } })
        .then(response => response.json())
        .then(json => {
          if (
            di[id] &&
            json &&
            JSON.stringify(di[id]) !== JSON.stringify(json)
          ) {
            console.log('updating di.' + id)
            di[id] = json
          }
        })
    }

    fetchSrc()
    let uri = el.src
    let wss = uri.replace('http', 'ws')
    let w = new WebSocket(wss)
    w.onmessage = function (m) {
      let data = m.data
      console.log(data)

      if (data.match(/pub .*/) || data.match(/ack .*/)) {
        fetchSrc()
      }
    }
    w.onopen = function () {
      console.log('websocket open')
      w.send('sub ' + src)
    }
    w.onerror = function () {
      console.log('websocket error')
    }
    w.onclose = function () {
      console.log('websocket closed')
    }
  }

  // COMPONENTS
  var Reducer = (a, t) =>
    html`
      ${a} ${' '}
      ${typeof t === 'object'
        ? html`
            <a href="${t.text}">${t.text}</a>
          `
        : t}
    `
  var Message = props =>
    html`
      <div>${props.from}</div>
      <div>
        ${Array.isArray(props.text) ? props.text.reduce(Reducer) : props.text}
        <sub style="color: grey; font-size: 10px; padding-left: 10px">
          ${props.date.substring(11, 16)}</sub
        >
      </div>
    `

  class MessageList extends Component {
    constructor (props) {
      super(props)
      this.handleChange = this.handleChange.bind(this)
      this.setState({ text: '' })
    }

    handleChange (e) {
      let key = e.key
      let text = e.target.value
      if (e.key === 'Enter') {
        console.log(e.key)
        console.log(text)
        this.setState({ text: '' })
        console.log(this.state.text)
        let message = {
          id: Math.floor(Math.random() * 100000),
          from: user,
          date: new Date().toISOString(),
          edited: '1970-01-01T01:00:00',
          from_id: from_id,
          text: text,
          type: 'message'
        }
        console.log(message)
        // di.data.push(message)
        let messages = di.data
        messages.push(message)
        var island = document.getElementById('data')
        document.getElementById('data').text = JSON.stringify(di.data, null, 2)
        updateThis('data')
      }
    }

    render () {
      return html`
        <div class="row">
          <div class="col 2">
            <div class="row bold">
              <input placeholder="search" class="card w-100" />
            </div>
            <div class="row p2">Saved Messages</div>
          </div>
          <div class="col 10 w-100">
            <div class="row card bold">
              ${user}
            </div>
            <div class="row">
              ${di.data.map(Message)}
              <input
                onKeyup="${this.handleChange}"
                class="card w-100"
                value=${this.state.text}
                autofocus
              />
            </div>
          </div>
        </div>
      `
    }
  }

  // INIT
  globalThis.user = di.data[di.data.length - 1].from
  globalThis.from_id = di.data[di.data.length - 1].from_id
  subscribe('data')

  // RENDER
  render(h(MessageList), document.body)
</script>
