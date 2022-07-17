const Class = require('./class');
const status = require('./status');

class Plugin extends Class {
  async getPlugins () {
    const [plugins, ] = await this.conn.query(`SELECT * FROM plugin ORDER BY id ASC`);
    return plugins;
  }
  async get () {

  }
  async set () {
    status.plugins = await this.getPlugins();
  }
  async create () {
    await this.set();
  }
  async update () {
    await this.set();
  }
  async remove () {
    await this.set();
  }
}

module.exports = Plugin;