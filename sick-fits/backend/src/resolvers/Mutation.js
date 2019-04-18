const Mutations = {
	async createItem(parent, args, ctx, info) {
		// -> TODO: Check if logged in.
		const item = await ctx.db.mutation.createItem({
			data: { ...args }
		}, info);

		return item;
	},
	updateItem(parent, args, ctx, info) {
		// - Take a copy of the updates
		const updates = { ...args };
		// - Remove the ID from the updates
		delete updates.id;
		// - Run the update method
		return ctx.db.mutation.updateItem({
			data: updates,
			where: {
				id: args.id
			}
		}, info);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// - Find Item 
		debugger;
		const item = await ctx.db.query.item({ where }, `{ id title }`);

		// - Check user permissions 
		// -> TODO 
		// - Delete Item
		return ctx.db.mutation.deleteItem({ where }, info);
	}
};

module.exports = Mutations;
