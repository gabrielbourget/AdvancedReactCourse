const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');
const Query = {
	// async items(parent, args, ctx, info) {
	// 	const items = await ctx.db.query.items();
	// 	return items;
	// }
	
	/*************/
	/* - ITEMS - */
	/*************/
	items: forwardTo('db'),
	
	/************/
	/* - ITEM - */
	/************/
	item: forwardTo('db'),

	/************************/
	/* - ITEMS CONNECTION - */
	/************************/
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

	/*************/
	/* - USERS - */
	/*************/
	async users(parent, args, ctx, info) {
		// - 1. Is the user logged in?
		if (!ctx.request.userId) throw new Error('You must be logged in.');
		// - 2. Check if the user has the permissions to query the users
		hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
		// - 3. If they do, query all the users
		return ctx.db.query.users({}, info);
	},

	/*************/
	/* - ORDER - */
	/*************/
	async order(parent, args, ctx, info) {
		// 1. - Make sure they are logged in.
		if (!ctx.request.userId) throw new Error('You must log in first.');
		// 2. - Query the current order 
		const order = await ctx.db.query.order({
			where: { id: args.id }
		}, info);
		// 3. - Check if they have the permissions to see this order
		const ownsOrder = order.user.id === ctx.request.userId;
		const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
		if (!ownsOrder || !hasPermissionToSeeOrder) {
			throw new Error('You don\'t have permission to see this order.');
		}
		// 4. - Return the order
		return order;
	},

	/**************/
	/* - ORDERS - */
	/**************/
	async orders(parent, args, ctx, info) {
		// 1. - Get the user's id.
		const { userId } = ctx.request;
		if (!userId) throw new Error('You must be logged in for this.');
		// 2. - Grab orders
		return ctx.db.query.orders({
			where: {
				user: { id : userId },
			}
		}, info);
	}
};

module.exports = Query;
 
