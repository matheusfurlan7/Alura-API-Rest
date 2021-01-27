const roteador = require('express').Router()
const TabelaFornecedor = require('./TabelaFornecedor')
const Fornecedor = require('./Fornecedor')
const { SerializadorFornecedor } = require('../../Serializador')

roteador.get('/', async (req, res) => {
  const resultados = await TabelaFornecedor.listar()
  const serializador = new SerializadorFornecedor(res.getHeader('Content-Type'))
  res.status(200).send(serializador.serializar(resultados))
})

roteador.post('/', async (req, res, next) => {
  try {
    const dadosRecebidos = req.body
    const fornecedor = new Fornecedor(dadosRecebidos)
    await fornecedor.criar()
    const serializador = new SerializadorFornecedor(res.getHeader('Content-Type'))
    res.status(201).send(serializador.serializar(fornecedor))
  }
  catch (erro) {
    next(erro)
  }
})

roteador.get('/:idFornecedor', async (req, res, next) => {
  try {
    const id = req.params.idFornecedor
    const fornecedor = new Fornecedor({ id: id })
    await fornecedor.carregar()
    const serializador = new SerializadorFornecedor(res.getHeader('Content-Type'), ['email', 'dataCriacao', 'dataAtualizacao', 'versao'])
    res.status(200).send(serializador.serializar(fornecedor))
  }
  catch (erro) {
    next(erro)
  }
})

roteador.put('/:idFornecedor', async (req, res, next) => {
  try {
    const id = req.params.idFornecedor
    const dadosRecebidos = req.body
    console.log("req body is", req.body)

    const dados = Object.assign({}, dadosRecebidos, { id: id })
    
    console.log(dados)

    const fornecedor = new Fornecedor(dados)
    await fornecedor.atualizar()
    res.status(204).end()
  } catch (erro) {
    next(erro)
  }
})

roteador.delete('/:idFornecedor', async (req, res, next) => {
  try {
    const id = req.params.idFornecedor
    const fornecedor = new Fornecedor({ id: id })

    await fornecedor.carregar()
    fornecedor.remover()

    res.status(204).end()
  } catch (erro) {
    next(erro)
  }
})

const roteadorProdutos = require('./produtos')

const verificarFornecedor = async (req, res, next) => {
  try {
    const id = req.params.idFornecedor
    const fornecedor = new Fornecedor({ id: id })
    await fornecedor.carregar()

    next()
  }
  catch (error) {
    next(error)
  }
}

roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos)

module.exports = roteador