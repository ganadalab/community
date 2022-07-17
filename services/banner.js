const Class = require('./class');
const status = require('./status');

class Banner extends Class {
  async getBanners (position) {
    let queryString = '';
    const queryArray = [];
    if (position) {
      queryString += `WHERE position = ?`;
      queryArray.push(position);
    }
    const query = `SELECT *
    FROM banner
    ${queryString}
    ORDER BY viewOrder ASC`;
    const [banners, ] = await this.conn.query(query, queryArray);
    return banners;
  }
  async get (bannerId) {
    const [banners, ] = await this.conn.query(`SELECT * FROM banner WHERE id=?`);
    if (banners.length) {
      const banner = banners[0];
      return banner;
    } else {
      return null;
    }
  }
  async getCount (position) {
    const [banners, ] = await this.conn.query(`SELECT count(*) AS count FROM banner WHERE position=?`, [position]);
    return banners[0].count;
  }
  async set () {
    status.banners = await this.getBanners();
  }
  async create (data) {
    await set();
  }
  async update (data) {
    await set();
  }
  async remove (bannerId) {
    await set();
  }
}

module.exports = Banner;