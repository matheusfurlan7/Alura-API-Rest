const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const config = require('config')
const NaoEncontrado = require('./erros/NaoEncontrado')
const CampoInvalido = require('./erros/CampoInvalido')
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos')
const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const { formatosAceitos, SerializadorErro } = require('./Serializador')
const cors = require('cors')

app.use(bodyParser.json())

app.use(cors())

app.use((req, res, next) => {
  let formatoRequisitado = req.header('Accept')

  if (formatoRequisitado === '*/*') {
    formatoRequisitado = 'application/json'
  }

  if (formatosAceitos.indexOf(formatoRequisitado) === -1) {
    res.status(406).end()
    return
  }

  res.setHeader('Content-Type', formatoRequisitado)
  res.set('X-Powered-By', 'Matheus Furlan')
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

const fornecedores = require('./rotas/fornecedores')
app.use('/api/fornecedores', fornecedores)

app.use((erro, req, res, next) => {
  let status = 500
  if (erro instanceof NaoEncontrado) {
    status = 404
  } else if (erro instanceof CampoInvalido || erro instanceof DadosNaoFornecidos) {
    status = 400
  } else if (erro instanceof ValorNaoSuportado) {
    status = 406
  }

  const Serializador = new SerializadorErro(res.getHeader('Content-Type'))

  res.status(status).send(
    Serializador.serializar({
      mensagem: erro.message,
      id: erro.idErro
    }))
})

app.listen(config.get('api.porta'), () => console.log('A API está funcionando!'))