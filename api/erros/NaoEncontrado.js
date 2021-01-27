class NaoEncontrado extends Error {
  constructor(registro) {
    super(`${registro} não foi encontrado!`)
    this.name = 'NaoEncontrado'
    this.idErro = 0
  }
}

module.exports = NaoEncontrado