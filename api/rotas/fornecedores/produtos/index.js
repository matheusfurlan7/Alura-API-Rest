const roteador = require('express').Router({ mergeParams: true })
const Tabela = require('./TabelaProduto')
const Produto = require('./Produto')
const { SerializadorProduto } = require('../../../Serializador')

roteador.get('/', async (req, res) => {
  const idFornecedor = req.params.idFornecedor
  const serializador = new SerializadorProduto(
    res.getHeader('Content-Type')
  )
  const produtos = await Tabela.listar(idFornecedor)

  res.send(serializador.serializar(produtos))
})

roteador.post('/', async (req, res, next) => {
  try {
    const idFornecedor = req.params.idFornecedor
    const corpo = req.body;
    const dados = Object.assign({}, corpo, { fornecedor: idFornecedor })
    const produto = new Produto(dados);
    await produto.criar()

    const serializador = new SerializadorProduto(
      res.getHeader('Content-Type')
    )

    let timestamp = produto.dataAtualizacao || produto.dataCriacao
    timestamp = new Date(timestamp).getTime()

    res.set('ETag', produto.versao)
    res.set('Last-Modified', timestamp)
    res.set('Location', req.originalUrl + produto.id)
    res.status(201)
    res.send(serializador.serializar(produto))
  } catch (error) {
    next(error)
  }
})

roteador.delete('/:id', async (req, res) => {
  const dados = {
    id: req.params.id,
    fornecedor: req.params.idFornecedor
  }

  const produto = new Produto(dados)
  await produto.apagar()

  res.status(204);
  res.end();
})

roteador.get('/:idProduto', async (req, res, next) => {
  try {
    const dados = {
      id: req.params.idProduto,
      fornecedor: req.params.idFornecedor
    }

    const produto = new Produto(dados)
    const serializador = new SerializadorProduto(res.getHeader('Content-Type'), ['preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao'])
    await produto.carregar()

    let timestamp = produto.dataAtualizacao || produto.dataCriacao
    timestamp = new Date(timestamp).getTime()
    res.set('ETag', produto.versao)
    res.set('Last-Modified', timestamp)
    res.status(200)
    res.send(serializador.serializar(produto))
  }
  catch (error) {
    next(error)
  }
})

roteador.put('/:id', async (req, res, next) => {
  try {
    const dados = Object.assign({}, req.body, {
      id: req.params.id,
      fornecedor: req.params.idFornecedor
    })

    const produto = new Produto(dados)
    await produto.atualizar()
    await produto.carregar()

    let timestamp = produto.dataAtualizacao || produto.dataCriacao
    timestamp = new Date(timestamp).getTime()
    res.set('ETag', produto.versao)
    res.set('Last-Modified', timestamp)
    res.status(204)
    res.end()
  } catch (error) {
    next(error)
  }
})

roteador.post('/:id/diminuir-estoque', async (req, res, next) => {
  try {
    const serializador = new SerializadorProduto(res.getHeader('Content-Type'), ['preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao'])
    const produto = new Produto({ id: req.params.id, fornecedor: req.params.idFornecedor })

    await produto.carregar()
    produto.estoque = produto.estoque - req.body.quantidade

    await produto.diminuirEstoque()
    await produto.carregar()

    let timestamp = produto.dataAtualizacao || produto.dataCriacao
    timestamp = new Date(timestamp).getTime()
    res.set('ETag', produto.versao)
    res.set('Last-Modified', timestamp)
    res.status(200)
    res.send(serializador.serializar(produto))
  } catch (error) {
    next(error)
  }
})

roteador.head('/:idProduto', async (req, res, next) => {
  try {
    const dados = {
      id: req.params.idProduto,
      fornecedor: req.params.idFornecedor
    }

    const produto = new Produto(dados)
    await produto.carregar()

    let timestamp = produto.dataAtualizacao || produto.dataCriacao
    timestamp = new Date(timestamp).getTime()
    
    res.set('ETag', produto.versao)
    res.set('Last-Modified', timestamp)
    res.status(204).end()
  }
  catch (error) {
    next(error)
  }
})

module.exports = roteador