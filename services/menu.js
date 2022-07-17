const Class = require('./class');
const status = require('./status');

class Menu extends Class {
  async getMenus (options) {
    options = Object.assign({
      status: true,
    }, options);
    const { status } = options;
    let queryString = '';
    if (status) queryString = 'WHERE status = 1';
    const query = `SELECT *
    FROM menu
    ${queryString}
    ORDER BY viewOrder ASC, id ASC`;
    const [menuRaws, ] = await this.conn.query(query);
    const menus = menuRaws.filter(menu => menu.menu_parent_ID === null);
    menus.forEach(menu => {
      menu.subMenus = menuRaws.filter(menuRaw => menuRaw.menu_parent_ID === menu.id);
    });
    return menus;
  }
  async get (menuId) {
    const [menus, ] = await this.conn.query(`SELECT * FROM menu WHERE id=?`, [menuId]);
    if (menus.length) {
      const menu = menus[0];
      return menu;
    } else {
      return null;
    }
  }
  async set () {
    status.menus = await this.getMenus();
  }
  async create (data) {
    data = Object.assign({
      parentId: null,
      title: null,
      target: null,
      viewOrder: 100,
    }, data);
    const { parentId, title, target, viewOrder } = data;
    const query = `INSERT INTO menu (menu_parent_ID, title, target, viewOrder) VALUES (?, ?, ?, ?)`;
    const [result, ] = await this.conn.query(query, [parentId, title, target.trim(), viewOrder]);
    await this.set();
  }
  async update (menuId, data) {
    const menu = await this.get(menuId);
    data = Object.assign({
      title: menu.title,
      target: menu.target,
      viewOrder: menu.viewOrder,
      status: menu.status,
    }, data);
    const { title, target, viewOrder, status } = data;
    const query = `UPDATE menu SET title=?, target=?, viewOrder=?, status=? WHERE id=?`;
    const [result, ] = await this.conn.query(query, [title, target, viewOrder, status, menuId]);
    await this.set();
  }
  async remove (menuId) {
    await this.conn.query(`DELETE FROM menu WHERE id=?`, [menuId]);
    await this.set();
  }
  align (menus) {
    let basket = [];
    while (menus.length !== 0) {
      const shift = menus.shift();
      if (!shift.menu_parent_ID) {
        basket.push(shift);
        const children = menus.filter(child => child.menu_parent_ID === shift.id);
        if (children.length) {
          children.forEach(child => {
            basket.push(child);
          });
        }
      }
    }
    return basket;
  }
}

module.exports = Menu;