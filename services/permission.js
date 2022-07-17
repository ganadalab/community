const Class = require('./class');
const status = require('./status');

class Permission extends Class {
  async getPermissions () {
    const [permissions, ] = await this.conn.query(`SELECT * FROM permission ORDER BY permission ASC`);
    return permissions;
  }
  async get (permissionId) {
    const [permissions, ] = await this.conn.query(`SELECT * FROM permission WHERE id=?`, [permissionId]);
    if (permissions.length) {
      return permissions[0];
    } else {
      return null;
    }
  }
  async set () {
    status.permissions = await this.getPermissions();
  }
  async create (data) {
    data = Object.assign({
      permission: null,
      title: null,
    }, data);
    const { permission, title } = data;
    const [result, ] = await this.conn.query(`INSERT INTO permission (permission, title) VALUES (?, ?)`, [permission, title]);
    if (result.insertId) {
      await this.set();
      return true;
    } else {
      throw new Error('등록 실패');
    }
  }
  async update (permissionId, data) {
    const permission = await this.get(permissionId);
    data = Object.assign({
      title: permission.title,
      pointBaseline: permission.pointBaseline,
      isAdmin: permission.isAdmin,
    }, data);
    const { title, pointBaseline, isAdmin } = data;
    const query = `UPDATE permission
    SET title=?, pointBaseline=?, isAdmin=?
    WHERE id=?`;
    await this.conn.query(query, [title, pointBaseline, isAdmin, permissionId]);
    await this.set();
  }
  async remove (permissionId) {
    await this.conn.query(`DELETE FROM permission WHERE id=?`, [permissionId]);
    await this.set();
  }
  async check () {
    const user = this.user;
    const permissions = this.res.locals.permissions;
    if (!user.isAdmin && user.permission !== 0 && user.permission !== null && !user.workingUser) {
      const currentPermission = this.getCurrentPermission(user, permissions);
      if (user.permission !== currentPermission) {
        await this.conn.query(`UPDATE user SET permission=? WHERE id=?`, [currentPermission, user.id]);
      }
    }
  }
  getCurrentPermission (user, permissions) {
    let currentPermission = 1;
    for (let i = 0; i < permissions.length; i ++) {
      if (user.point >= permissions[i].pointBaseline && permissions[i].pointBaseline !== 0 && !permissions[i].isAdmin) {
        currentPermission = permissions[i].permission;
      }
    }
    return currentPermission;
  }
}

module.exports = Permission;