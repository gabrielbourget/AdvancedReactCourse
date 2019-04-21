const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');
const Query = {
	// async items(parent, args, ctx, info) {
	// 	const items = await ctx.db.query.items();
	// 	return items;
	// }
	items: forwardTo('db'),
	item: forwardTo('db'),
	itemsConnection: forwardTo('db'),
	me(parent, args, ctx, info) {
		// - Check to see if there's a user ID
		if (!ctx.request.userId) {
			return null;
		}
		return ctx.db.query.user({
			where: { id: ctx.request.userId }
		}, info);
	},
	async users(parent, args, ctx, info) {
		// - 1. Is the user logged in?
		if (!ctx.request.userId) throw new Error('You must be logged in.');
		// - 2. Check if the user has the permissions to query the users
		hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
		// - 3. If they do, query all the users
		return ctx.db.query.users({}, info);
	}
};

module.exports = Query;
 
