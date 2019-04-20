const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
		const item = await ctx.db.query.item({ where }, `{ id title }`);

		// - Check user permissions 
		// -> TODO 
		// - Delete Item
		return ctx.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, ctx, info) {
		// - Lower case email address 
		args.email = args.email.toLowerCase();
		// - Hash their password
		const password = await bcrypt.hash(args.password, 10);
		// - Create user in database 
		const user = await ctx.db.mutation.createUser({
			data: {
				...args,
				password,
				permissions: { set: ['USER'] }
			}
		}, info);
		// Create the JWT Token for them.
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		console.log(token);
		// - Set JWT as a cookie on the response.
		ctx.response.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365
		});
		// - Return user to the browser
		return user; 
	}
};

module.exports = Mutations;
