const ValorNaoSuportado = require('./erros/ValorNaoSuportado')
const jsontoxml = require('jsontoxml')

class Serializador {
  json(dados) {
    return JSON.stringify(dados)
  }

  xml(dados) {
    return XML.stringify(dados)
  }

  serializar(dados) {
    dados = this.filtrar(dados)

    switch (this.contentType) {
      case 'application/json':
        return this.json(dados)
      case 'application/xml':
        let tag = this.tagSingular
        if (Array.isArray(dados)) {
          tag = this.tagPural
          dados = dados.map(item => { return {[this.tagSingular]: item}})
        }

        return jsontoxml({ [tag]: dados })
      default:
        throw new ValorNaoSuportado(this.contentType)
    }
  }

  filtrarObjeto(dados) {
    const novoObjeto = {}

    this.camposPublicos.forEach(campo => {
      if (dados.hasOwnProperty(campo)) {
        novoObjeto[campo] = dados[campo]
      }
    })

    return novoObjeto
  }

  filtrar(dados) {
    if (Array.isArray(dados)) {
      dados = dados.map(item => { return this.filtrarObjeto(item) })
    } else {
      dados = this.filtrarObjeto(dados)
    }

    return dados
  }
}

class SerializadorFornecedor extends Serializador {
  constructor(contentType, camposExtras) {
    super()
    this.contentType = contentType
    this.camposPublicos = ['id', 'empresa', 'categoria'].concat(camposExtras || [])
    this.tagSingular  = 'fornecedor';
    this.tagPural = 'fornecedores';
  }
}

class SerializadorProduto extends Serializador {
  constructor(contentType, camposExtras) {
    super()
    this.contentType = contentType
    this.camposPublicos = ['id', 'titulo'].concat(camposExtras || [])
    this.tagSingular  = 'produto';
    this.tagPural = 'produtos';
  }
}

class SerializadorErro extends Serializador {
  constructor(contentType, camposExtras) {
    super()
    this.contentType = contentType
    this.camposPublicos = ['id', 'mensagem'].concat(camposExtras)
    this.tagSingular  = 'erro';
    this.tagPural = 'erros';
  }
}

module.exports = {
  Serializador: Serializador,
  SerializadorFornecedor: SerializadorFornecedor,
  SerializadorErro: SerializadorErro,
  SerializadorProduto: SerializadorProduto,
  formatosAceitos: ['application/json', 'application/xml']
}